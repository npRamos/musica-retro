import { useState } from 'react'
import { CampoBanda, Copias, SelectorImagen } from '../componentes/Formulario.jsx'
import { IconoCd, IconoVinilo } from '../componentes/Iconos.jsx'
import { Imagen } from '../componentes/Portadas.jsx'
import { Boton, Campo, Dialogo, Encabezado, Segmentado } from '../componentes/ui.jsx'
import { esLinkSpotifyValido } from '../lib/catalogo.js'
import { useCatalogo } from '../lib/catalogoContexto.jsx'
import { navegar } from '../lib/router.js'

const OPCIONES_FORMATO = [
  { valor: 'vinilo', texto: 'Vinilo', icono: <IconoVinilo /> },
  { valor: 'cd', texto: 'CD', icono: <IconoCd /> },
]

// Alta (sin disco) o edición (con disco). En la edición se guarda tal cual lo escrito.
export default function FormDisco({ disco, inicial = {} }) {
  const catalogo = useCatalogo()
  const { bandasPorId, online } = catalogo
  const editando = Boolean(disco)
  const [banda, setBanda] = useState(editando ? (bandasPorId.get(disco.banda_id)?.nombre ?? '') : (inicial.banda ?? ''))
  const [titulo, setTitulo] = useState(editando ? disco.titulo : (inicial.titulo ?? ''))
  const [formato, setFormato] = useState(editando ? disco.formato : (inicial.formato ?? null))
  const [copias, setCopias] = useState(editando ? disco.copias : 1)
  const [spotify, setSpotify] = useState(editando ? (disco.spotify_url ?? '') : '')
  const [imagen, setImagen] = useState(undefined)
  const [errores, setErrores] = useState({})
  const [guardando, setGuardando] = useState(false)
  const [errorGeneral, setErrorGeneral] = useState(null)
  const [duplicado, setDuplicado] = useState(null)
  const [conflicto, setConflicto] = useState(null)

  const validar = () => {
    const e = {}
    if (!banda.trim()) e.banda = 'Falta la banda'
    if (!titulo.trim()) e.titulo = 'Falta el título'
    if (!formato) e.formato = 'Elegí vinilo o CD'
    if (!Number.isInteger(copias) || copias < 1) e.copias = 'El mínimo es 1 copia'
    if (spotify.trim() && !esLinkSpotifyValido(spotify.trim())) e.spotify = 'Tiene que ser un link de open.spotify.com'
    setErrores(e)
    return Object.keys(e).length === 0
  }

  const guardar = async (ev) => {
    ev.preventDefault()
    if (!validar()) return
    setGuardando(true)
    setErrorGeneral(null)
    try {
      if (editando) {
        const r = await catalogo.actualizarDisco(disco, { banda, titulo, formato, copias, spotify_url: spotify.trim(), imagen })
        if (r.estado === 'conflicto') setConflicto(r.existente)
        else navegar(`disco/${disco.id}`, { reemplazar: true })
      } else {
        const r = await catalogo.agregarDisco({ banda, titulo, formato, copias, imagen })
        if (r.estado === 'duplicado') setDuplicado(r.disco)
        else navegar(`disco/${r.disco.id}`, { reemplazar: true })
      }
    } catch {
      setErrorGeneral('No se pudo guardar. Revisá la conexión y probá de nuevo.')
    } finally {
      setGuardando(false)
    }
  }

  const sumarCopia = async () => {
    setGuardando(true)
    try {
      await catalogo.sumarCopia(duplicado, copias, imagen ?? undefined)
      navegar(`disco/${duplicado.id}`, { reemplazar: true })
    } catch {
      setErrorGeneral('No se pudo sumar la copia.')
      setDuplicado(null)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <>
      <Encabezado titulo={editando ? 'Editar disco' : 'Agregar disco'} atras={editando ? `disco/${disco.id}` : ''} />
      <form onSubmit={guardar} className="mx-auto max-w-md space-y-7 px-5 pt-6 pb-16" noValidate>
        <CampoBanda valor={banda} onChange={setBanda} error={errores.banda} autoFocus={!editando && !inicial.banda} />
        <Campo etiqueta="Disco" value={titulo} onChange={(e) => setTitulo(e.target.value)} error={errores.titulo} autoComplete="off" autoCapitalize="words" />
        <div>
          <Segmentado etiqueta="Formato" opciones={OPCIONES_FORMATO} valor={formato} onChange={setFormato} />
          {errores.formato && <p className="mt-1 text-sm text-acento-texto">{errores.formato}</p>}
        </div>
        <Copias valor={copias} onChange={setCopias} />
        <SelectorImagen
          etiqueta="Tapa"
          actual={editando && disco.tapa_path ? <Imagen ruta={disco.tapa_path} /> : null}
          valor={imagen}
          onChange={setImagen}
          deshabilitado={guardando}
        />
        {editando && (
          <Campo
            etiqueta="Link de Spotify (opcional)"
            type="url"
            inputMode="url"
            placeholder="https://open.spotify.com/album/…"
            value={spotify}
            onChange={(e) => setSpotify(e.target.value)}
            error={errores.spotify}
            ayuda="Si lo dejás vacío, se busca por banda y título."
          />
        )}
        {!editando && <p className="text-sm font-light text-suave">La fecha de carga se guarda sola.</p>}
        {errorGeneral && <p className="text-sm text-acento-texto">{errorGeneral}</p>}
        <Boton type="submit" className="w-full" disabled={guardando || !online}>
          {!online ? 'Sin conexión' : guardando ? 'Guardando…' : 'Guardar'}
        </Boton>
      </form>

      {duplicado && (
        <Dialogo
          titulo="Ya lo tenés"
          alCerrar={() => setDuplicado(null)}
          acciones={
            <>
              <Boton variante="fantasma" disabled={guardando} onClick={() => setDuplicado(null)}>
                Cancelar
              </Boton>
              <Boton disabled={guardando} onClick={sumarCopia}>
                {copias > 1 ? `Sumar ${copias} copias` : 'Sumar copia'}
              </Boton>
            </>
          }
        >
          “{duplicado.titulo}” en {formato === 'vinilo' ? 'vinilo' : 'CD'} ya está en tu colección ({duplicado.copias}{' '}
          {duplicado.copias === 1 ? 'copia' : 'copias'}).
        </Dialogo>
      )}

      {conflicto !== null && (
        <Dialogo
          titulo="Ya tenés ese disco"
          alCerrar={() => setConflicto(null)}
          acciones={
            <>
              <Boton variante="fantasma" onClick={() => setConflicto(null)}>
                Seguir editando
              </Boton>
              {conflicto && <Boton onClick={() => navegar(`disco/${conflicto.id}`)}>Ir al existente</Boton>}
            </>
          }
        >
          Con esa banda, título y formato ya hay otro disco. Si es el mismo, sumale copias allí y borrá este.
        </Dialogo>
      )}
    </>
  )
}
