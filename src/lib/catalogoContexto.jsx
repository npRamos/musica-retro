import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { borrar, borrarImagenesCacheadas, guardar, leer, pedirAlmacenamientoPersistente, precargarImagenes } from './almacen.js'
import { esErrorDeRed } from './errores.js'
import { borrarImagenes, firmarImagenes, procesarImagen, subirImagen } from './imagen.js'
import { supabase } from './supabase.js'
import { formatearTitulo, normalizar } from './texto.js'

const Contexto = createContext(null)
const CLAVE_CACHE = 'catalogo'
const VACIO = { bandas: [], discos: [], urls: {}, actualizadoEn: null }

export function CatalogoProvider({ sesion, children }) {
  const uid = sesion.user.id
  const [datos, setDatos] = useState(() => leer(CLAVE_CACHE) ?? VACIO)
  const [online, setOnline] = useState(navigator.onLine)
  const [sincronizando, setSincronizando] = useState(false)
  const [error, setError] = useState(null)
  const [miembro, setMiembro] = useState(null)
  const enCurso = useRef(null)

  const sincronizar = useCallback(async () => {
    if (enCurso.current) return enCurso.current
    enCurso.current = (async () => {
      setSincronizando(true)
      try {
        const [bandasRes, discosRes, miembroRes] = await Promise.all([
          supabase.from('bandas').select('id, nombre, nombre_norm, imagen_path, creado_en'),
          supabase.from('discos').select('id, banda_id, titulo, titulo_norm, formato, copias, fecha_carga, spotify_url, tapa_path'),
          supabase.rpc('es_miembro'),
        ])
        if (bandasRes.error) throw bandasRes.error
        if (discosRes.error) throw discosRes.error
        if (!miembroRes.error) setMiembro(miembroRes.data === true)
        const rutas = [...bandasRes.data.map((b) => b.imagen_path), ...discosRes.data.map((d) => d.tapa_path)].filter(Boolean)
        const urls = await firmarImagenes(rutas)
        const nuevos = { bandas: bandasRes.data, discos: discosRes.data, urls, actualizadoEn: new Date().toISOString() }
        setDatos(nuevos)
        guardar(CLAVE_CACHE, nuevos)
        setOnline(true)
        setError(null)
        const precargar = () => precargarImagenes(Object.values(urls))
        if ('requestIdleCallback' in window) requestIdleCallback(precargar)
        else setTimeout(precargar, 500)
      } catch (e) {
        if (esErrorDeRed(e)) setOnline(false)
        else setError(e.message)
      } finally {
        setSincronizando(false)
        enCurso.current = null
      }
    })()
    return enCurso.current
  }, [])

  useEffect(() => {
    pedirAlmacenamientoPersistente()
    sincronizar()
    const conectar = () => {
      setOnline(true)
      sincronizar()
    }
    const desconectar = () => setOnline(false)
    addEventListener('online', conectar)
    addEventListener('offline', desconectar)
    return () => {
      removeEventListener('online', conectar)
      removeEventListener('offline', desconectar)
    }
  }, [sincronizar])

  const bandasPorId = useMemo(() => new Map(datos.bandas.map((b) => [b.id, b])), [datos.bandas])
  const discosPorId = useMemo(() => new Map(datos.discos.map((d) => [d.id, d])), [datos.discos])

  // ─── Escrituras ────────────────────────────────────────────────────────
  const rpc = async (nombre, args) => {
    const { data, error: err } = await supabase.rpc(nombre, args)
    if (err) throw err
    return data
  }

  const ponerTapa = async (disco, imagen) => {
    if (imagen === undefined) return
    const anterior = disco.tapa_path
    const ruta = imagen ? await subirImagen(uid, 'discos', disco.id, imagen) : null
    const { error: err } = await supabase.from('discos').update({ tapa_path: ruta }).eq('id', disco.id)
    if (err) throw err
    if (anterior) await borrarImagenes([anterior]).catch(() => {})
  }

  const agregarDisco = async ({ banda, titulo, formato, copias, imagen }) => {
    const resultado = await rpc('agregar_disco', {
      p_banda: formatearTitulo(banda),
      p_titulo: formatearTitulo(titulo),
      p_formato: formato,
      p_copias: copias,
    })
    if (resultado.estado === 'creado' && imagen) await ponerTapa(resultado.disco, imagen)
    if (resultado.estado === 'creado') await sincronizar()
    return resultado
  }

  const sumarCopia = async (disco, cantidad = 1, imagen) => {
    await rpc('sumar_copia', { p_disco: disco.id, p_cantidad: cantidad })
    if (imagen && !disco.tapa_path) await ponerTapa(disco, imagen)
    await sincronizar()
  }

  // Busca la banda por nombre normalizado o la crea (con formato tipo título).
  const bandaPorNombre = async (nombre) => {
    const existente = datos.bandas.find((b) => b.nombre_norm === normalizar(nombre))
    if (existente) return existente
    const { data, error: err } = await supabase.from('bandas').insert({ nombre: formatearTitulo(nombre) }).select().single()
    if (err) throw err
    return data
  }

  // Devuelve { estado: 'ok' } o { estado: 'conflicto', existente } si choca con otro disco.
  const actualizarDisco = async (disco, { banda, titulo, formato, copias, spotify_url, imagen }) => {
    const bandaDestino = await bandaPorNombre(banda)
    const { error: err } = await supabase
      .from('discos')
      .update({ banda_id: bandaDestino.id, titulo: titulo.trim(), formato, copias, spotify_url: spotify_url || null })
      .eq('id', disco.id)
    if (err?.code === '23505') {
      const existente = datos.discos.find(
        (d) => d.id !== disco.id && d.banda_id === bandaDestino.id && d.formato === formato && d.titulo_norm === normalizar(titulo),
      )
      return { estado: 'conflicto', existente }
    }
    if (err) throw err
    await ponerTapa(disco, imagen)
    await sincronizar()
    return { estado: 'ok' }
  }

  const borrarDisco = async (disco) => {
    const { error: err } = await supabase.from('discos').delete().eq('id', disco.id)
    if (err) throw err
    await borrarImagenes([disco.tapa_path]).catch(() => {})
    // Una banda sin discos ya no aparece en ninguna pestaña: se limpia.
    if (!datos.discos.some((d) => d.id !== disco.id && d.banda_id === disco.banda_id)) {
      const banda = bandasPorId.get(disco.banda_id)
      const { error: errBanda } = await supabase.from('bandas').delete().eq('id', disco.banda_id)
      if (!errBanda) await borrarImagenes([banda?.imagen_path]).catch(() => {})
    }
    await sincronizar()
  }

  const renombrarBanda = async (banda, nombre) => {
    const resultado = await rpc('renombrar_banda', { p_banda: banda.id, p_nombre: nombre.trim() })
    if (resultado.estado === 'ok') await sincronizar()
    return resultado
  }

  const fusionarBandas = async (origen, destino) => {
    const resultado = await rpc('fusionar_bandas', { p_origen: origen.id, p_destino: destino.id })
    await borrarImagenes(resultado.huerfanas ?? []).catch(() => {})
    await sincronizar()
    return resultado
  }

  const cambiarImagenBanda = async (banda, imagen) => {
    const anterior = banda.imagen_path
    const ruta = imagen ? await subirImagen(uid, 'bandas', banda.id, imagen) : null
    const { error: err } = await supabase.from('bandas').update({ imagen_path: ruta }).eq('id', banda.id)
    if (err) throw err
    if (anterior) await borrarImagenes([anterior]).catch(() => {})
    await sincronizar()
  }

  const importar = async (items, duplicados) => {
    const resumen = await rpc('importar_discos', {
      p_items: items.map(({ banda, titulo, formato, copias }) => ({ banda, titulo, formato, copias })),
      p_duplicados: duplicados,
    })
    await sincronizar()
    return resumen
  }

  const cerrarSesion = async () => {
    borrar(CLAVE_CACHE)
    await borrarImagenesCacheadas()
    await supabase.auth.signOut()
  }

  const valor = {
    ...datos,
    bandasPorId,
    discosPorId,
    online,
    miembro,
    sincronizando,
    error,
    sincronizar,
    procesarImagen,
    agregarDisco,
    sumarCopia,
    actualizarDisco,
    borrarDisco,
    renombrarBanda,
    fusionarBandas,
    cambiarImagenBanda,
    importar,
    cerrarSesion,
  }
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

export const useCatalogo = () => useContext(Contexto)
