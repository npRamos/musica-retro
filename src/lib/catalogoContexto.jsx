import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { borrar, borrarImagenesCacheadas, guardar, leer, pedirAlmacenamientoPersistente, precargarImagenes } from './almacen.js'
import { esErrorDeRed } from './errores.js'
import { borrarImagenes, firmarImagenes, procesarImagen, procesarLogo, subirImagen } from './imagen.js'
import { musicbrainz } from './musicbrainz.js'
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
  const logosVistos = useRef(new Set()) // bandas cuyo logo ya se buscó en esta sesión

  const sincronizar = useCallback(async () => {
    if (enCurso.current) return enCurso.current
    enCurso.current = (async () => {
      setSincronizando(true)
      try {
        const [bandasRes, discosRes, miembroRes] = await Promise.all([
          supabase.from('bandas').select('id, nombre, nombre_norm, imagen_path, creado_en, mbid, logo_path, logo_invertir, logo_buscado_en'),
          supabase
            .from('discos')
            .select(
              'id, banda_id, titulo, titulo_norm, formato, copias, fecha_carga, spotify_url, tapa_path, contratapa_path, anio, temas, mb_estado, mb_release_group, mb_release',
            ),
          supabase.rpc('es_miembro'),
        ])
        if (bandasRes.error) throw bandasRes.error
        if (discosRes.error) throw discosRes.error
        if (!miembroRes.error) setMiembro(miembroRes.data === true)
        const rutas = [...bandasRes.data.flatMap((b) => [b.imagen_path, b.logo_path]), ...discosRes.data.flatMap((d) => [d.tapa_path, d.contratapa_path])].filter(Boolean)
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

  // campo: 'tapa_path' | 'contratapa_path'. imagen: Blob nuevo | null (quitar) | undefined (sin cambios)
  const ponerImagen = async (disco, campo, imagen) => {
    if (imagen === undefined) return
    const anterior = disco[campo]
    const nombre = campo === 'contratapa_path' ? `${disco.id}-contratapa` : disco.id
    const ruta = imagen ? await subirImagen(uid, 'discos', nombre, imagen) : null
    const { error: err } = await supabase.from('discos').update({ [campo]: ruta }).eq('id', disco.id)
    if (err) throw err
    if (anterior) await borrarImagenes([anterior]).catch(() => {})
  }

  // datos: año y datos de MusicBrainz (p_datos). bandaTalCual: el nombre viene de MusicBrainz y no se formatea.
  const agregarDisco = async ({ banda, titulo, formato, copias, imagen, contratapa, datos = null, bandaTalCual = false }) => {
    const resultado = await rpc('agregar_disco', {
      p_banda: bandaTalCual ? banda.trim() : formatearTitulo(banda),
      p_titulo: formatearTitulo(titulo),
      p_formato: formato,
      p_copias: copias,
      p_datos: datos,
    })
    if (resultado.estado === 'creado' && imagen) await ponerImagen(resultado.disco, 'tapa_path', imagen)
    if (resultado.estado === 'creado' && contratapa) await ponerImagen(resultado.disco, 'contratapa_path', contratapa)
    if (resultado.estado === 'creado') await sincronizar()
    buscarLogoSiFalta(resultado.banda, resultado.banda?.mbid)
    return resultado
  }

  // Si el disco existente todavía no tenía datos de MusicBrainz, se completa con los elegidos en el alta.
  const sumarCopia = async (disco, cantidad = 1, imagen, contratapa, datos) => {
    await rpc('sumar_copia', { p_disco: disco.id, p_cantidad: cantidad })
    if (datos?.mb_release && disco.mb_estado !== 'enlazado') {
      await rpc('completar_disco', { p_disco: disco.id, p_datos: datos })
      const banda = bandasPorId.get(disco.banda_id)
      buscarLogoSiFalta(banda, banda?.mbid ?? datos.banda_mbid)
    }
    if (imagen && !disco.tapa_path) await ponerImagen(disco, 'tapa_path', imagen)
    if (contratapa && !disco.contratapa_path) await ponerImagen(disco, 'contratapa_path', contratapa)
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
  // fecha_carga: solo si cambió (undefined = no se toca).
  const actualizarDisco = async (disco, { banda, titulo, formato, copias, anio = null, fecha_carga, spotify_url, imagen, contratapa }) => {
    const bandaDestino = await bandaPorNombre(banda)
    const { error: err } = await supabase
      .from('discos')
      .update({ banda_id: bandaDestino.id, titulo: titulo.trim(), formato, copias, anio, spotify_url: spotify_url || null, ...(fecha_carga && { fecha_carga }) })
      .eq('id', disco.id)
    if (err?.code === '23505') {
      const existente = datos.discos.find(
        (d) => d.id !== disco.id && d.banda_id === bandaDestino.id && d.formato === formato && d.titulo_norm === normalizar(titulo),
      )
      return { estado: 'conflicto', existente }
    }
    if (err) throw err
    await ponerImagen(disco, 'tapa_path', imagen)
    await ponerImagen(disco, 'contratapa_path', contratapa)
    await sincronizar()
    return { estado: 'ok' }
  }

  // Suma año, temas y enlaces sin tocar banda ni título. Las imágenes solo llenan lugares vacíos,
  // salvo que se pida reemplazarlas. sincronizar = false deja la recarga para después (modo pendientes).
  const completarDisco = async (disco, datos, { imagen, contratapa, reemplazar = {}, sincronizar: recargar = true } = {}) => {
    await rpc('completar_disco', { p_disco: disco.id, p_datos: datos })
    const banda = bandasPorId.get(disco.banda_id)
    buscarLogoSiFalta(banda, banda?.mbid ?? datos.banda_mbid)
    if (imagen && (!disco.tapa_path || reemplazar.tapa)) await ponerImagen(disco, 'tapa_path', imagen)
    if (contratapa && (!disco.contratapa_path || reemplazar.contratapa)) await ponerImagen(disco, 'contratapa_path', contratapa)
    if (recargar) await sincronizar()
  }

  const marcarSinCoincidencia = async (disco, { sincronizar: recargar = true } = {}) => {
    const { error: err } = await supabase.from('discos').update({ mb_estado: 'sin_coincidencia' }).eq('id', disco.id)
    if (err) throw err
    if (recargar) await sincronizar()
  }

  const borrarDisco = async (disco) => {
    const { error: err } = await supabase.from('discos').delete().eq('id', disco.id)
    if (err) throw err
    await borrarImagenes([disco.tapa_path, disco.contratapa_path]).catch(() => {})
    // Una banda sin discos ya no aparece en ninguna pestaña: se limpia.
    if (!datos.discos.some((d) => d.id !== disco.id && d.banda_id === disco.banda_id)) {
      const banda = bandasPorId.get(disco.banda_id)
      const { error: errBanda } = await supabase.from('bandas').delete().eq('id', disco.banda_id)
      if (!errBanda) await borrarImagenes([banda?.imagen_path, banda?.logo_path]).catch(() => {})
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

  // logo: { blob, invertir } para poner o reemplazar, null para quitar. Siempre marca que ya se buscó,
  // así un logo quitado no vuelve solo.
  const cambiarLogoBanda = async (banda, logo, { recargar = true } = {}) => {
    const anterior = banda.logo_path
    const ruta = logo ? await subirImagen(uid, 'bandas', `${banda.id}-logo`, logo.blob) : null
    const { error: err } = await supabase
      .from('bandas')
      .update({ logo_path: ruta, logo_invertir: logo?.invertir ?? false, logo_buscado_en: new Date().toISOString() })
      .eq('id', banda.id)
    if (err) throw err
    if (anterior) await borrarImagenes([anterior]).catch(() => {})
    if (recargar) await sincronizar()
  }

  // Logo de Wikidata para el artista, procesado (o null si no tiene).
  const buscarLogo = async (mbid, opciones) => {
    const blob = await musicbrainz.logoDeArtista(mbid, opciones)
    return blob ? procesarLogo(blob) : null
  }

  // Al quedar enlazada, una banda que nunca buscó su logo lo busca una vez, en segundo plano.
  // Una falla de red no marca nada: se reintenta en otra oportunidad.
  const buscarLogoSiFalta = (banda, mbid) => {
    if (!banda || !mbid || banda.logo_path || banda.logo_buscado_en || logosVistos.current.has(banda.id)) return
    logosVistos.current.add(banda.id)
    ;(async () => {
      try {
        const logo = await buscarLogo(mbid)
        if (logo) await cambiarLogoBanda(banda, logo)
        else await supabase.from('bandas').update({ logo_buscado_en: new Date().toISOString() }).eq('id', banda.id)
      } catch {
        logosVistos.current.delete(banda.id)
      }
    })()
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
    completarDisco,
    marcarSinCoincidencia,
    borrarDisco,
    renombrarBanda,
    fusionarBandas,
    cambiarImagenBanda,
    cambiarLogoBanda,
    buscarLogo,
    importar,
    cerrarSesion,
  }
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

export const useCatalogo = () => useContext(Contexto)
