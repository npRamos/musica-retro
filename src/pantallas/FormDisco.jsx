import { useEffect, useMemo, useState } from 'react'
import { CampoBanda, CampoDisco, Copias, SelectorImagen } from '../componentes/Formulario.jsx'
import { IconoCd, IconoVinilo } from '../componentes/Iconos.jsx'
import { Imagen } from '../componentes/Portadas.jsx'
import { TemasPlegables } from '../componentes/Temas.jsx'
import { Boton, Campo, Dialogo, Encabezado, Hoja, Segmentado } from '../componentes/ui.jsx'
import { NOMBRE_FORMATO_SINGULAR, esLinkSpotifyValido, leerAnio } from '../lib/catalogo.js'
import { useCatalogo } from '../lib/catalogoContexto.jsx'
import { coincideFormato, describirEdicion, elegirEdicion } from '../lib/discografia.js'
import { mensajeError } from '../lib/errores.js'
import { OPCIONES_CONTRATAPA, imagenesDeMusicbrainz } from '../lib/imagen.js'
import { datosParaGuardar, musicbrainz } from '../lib/musicbrainz.js'
import { navegar } from '../lib/router.js'
import { formatearTitulo, normalizar } from '../lib/texto.js'
import { useConsultaMb } from '../lib/useConsultaMb.js'

const OPCIONES_FORMATO = [
  { valor: 'vinilo', texto: 'Vinilo', icono: <IconoVinilo /> },
  { valor: 'cd', texto: 'CD', icono: <IconoCd /> },
]

// Alta (sin disco) o edición (con disco). En la edición se guarda tal cual lo escrito.
export default function FormDisco({ disco, inicial = {} }) {
  const catalogo = useCatalogo()
  const { bandas, bandasPorId, online } = catalogo
  const editando = Boolean(disco)
  const conMusicbrainz = !editando && online
  const [banda, setBanda] = useState(editando ? (bandasPorId.get(disco.banda_id)?.nombre ?? '') : (inicial.banda ?? ''))
  const [titulo, setTitulo] = useState(editando ? disco.titulo : (inicial.titulo ?? ''))
  const [formato, setFormato] = useState(editando ? disco.formato : (inicial.formato ?? null))
  const [copias, setCopias] = useState(editando ? disco.copias : 1)
  const [anioTexto, setAnioTexto] = useState(editando ? String(disco.anio ?? '') : '')
  const [spotify, setSpotify] = useState(editando ? (disco.spotify_url ?? '') : '')
  const [imagen, setImagen] = useState(undefined)
  const [contratapa, setContratapa] = useState(undefined)
  // Si la usuaria eligió o quitó una imagen, MusicBrainz ya no la pisa.
  const [propias, setPropias] = useState({ tapa: false, contratapa: false })
  const [errores, setErrores] = useState({})
  const [guardando, setGuardando] = useState(false)
  const [errorGeneral, setErrorGeneral] = useState(null)
  const [duplicado, setDuplicado] = useState(null)
  const [conflicto, setConflicto] = useState(null)

  // ─── MusicBrainz ──────────────────────────────────────────────────────
  const [artistaMb, setArtistaMb] = useState(null) // artista elegido para una banda que no está en el catálogo
  const [discoMb, setDiscoMb] = useState(null)
  const [edicionManual, setEdicionManual] = useState(null) // id elegido a mano, 'ninguna' o null (automática)
  const [eligiendoEdicion, setEligiendoEdicion] = useState(false)

  const bandaLocal = bandas.find((b) => b.nombre_norm === normalizar(banda))
  const artistaElegido = artistaMb && normalizar(artistaMb.nombre) === normalizar(banda) ? artistaMb : null
  const artista = bandaLocal?.mbid ?? artistaElegido?.id ?? null

  const ediciones = useConsultaMb(conMusicbrainz && discoMb ? discoMb.id : null, (signal) => musicbrainz.edicionesDeDisco(discoMb.id, { signal }))
  const automatica = useMemo(() => (ediciones.datos ? elegirEdicion(ediciones.datos, formato) : null), [ediciones.datos, formato])
  const edicion =
    !discoMb || edicionManual === 'ninguna'
      ? null
      : edicionManual
        ? (ediciones.datos?.find((e) => e.id === edicionManual) ?? null)
        : (automatica?.edicion ?? null)
  const temas = useConsultaMb(edicion ? edicion.id : null, (signal) => musicbrainz.temasDeEdicion(edicion.id, { signal }))
  const imagenesMb = useConsultaMb(edicion ? edicion.id : null, (signal) => imagenesDeMusicbrainz(edicion.id, signal))
  const errorMb = ediciones.error || temas.error || imagenesMb.error

  // Las imágenes de la edición llenan los lugares que la usuaria no tocó; sin edición, se sacan.
  useEffect(() => {
    if (!propias.tapa) setImagen(imagenesMb.datos?.tapa ?? undefined)
    if (!propias.contratapa) setContratapa(imagenesMb.datos?.contratapa ?? undefined)
  }, [imagenesMb.datos]) // eslint-disable-line react-hooks/exhaustive-deps

  const elegirDisco = (d) => {
    setEdicionManual(null)
    setDiscoMb(d)
    if (!d) return
    setTitulo(formatearTitulo(d.titulo))
    if (d.anio) setAnioTexto(String(d.anio))
  }

  const cambiarBanda = (texto) => {
    setBanda(texto)
    if (discoMb) elegirDisco(null)
  }

  // Escribir otro título suelta el disco elegido.
  const cambiarTitulo = (texto) => {
    setTitulo(texto)
    if (discoMb && normalizar(texto) !== normalizar(formatearTitulo(discoMb.titulo))) elegirDisco(null)
  }

  const datosMb = () => {
    const base = discoMb
      ? datosParaGuardar({ artista: artista ?? discoMb.artista?.id, disco: discoMb, edicion, temas: temas.datos })
      : artista
        ? { banda_mbid: artista }
        : {}
    return { ...base, anio: leerAnio(anioTexto).anio }
  }

  const validar = () => {
    const e = {}
    if (!banda.trim()) e.banda = 'Falta la banda'
    if (!titulo.trim()) e.titulo = 'Falta el título'
    if (!formato) e.formato = 'Elegí vinilo o CD'
    if (!Number.isInteger(copias) || copias < 1) e.copias = 'El mínimo es 1 copia'
    const { error: errorAnio } = leerAnio(anioTexto)
    if (errorAnio) e.anio = errorAnio
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
        const r = await catalogo.actualizarDisco(disco, {
          banda,
          titulo,
          formato,
          copias,
          anio: leerAnio(anioTexto).anio,
          spotify_url: spotify.trim(),
          imagen,
          contratapa,
        })
        if (r.estado === 'conflicto') setConflicto(r.existente)
        else navegar(`disco/${disco.id}`, { reemplazar: true })
      } else {
        const r = await catalogo.agregarDisco({
          banda,
          titulo,
          formato,
          copias,
          imagen,
          contratapa,
          datos: datosMb(),
          bandaTalCual: Boolean(artistaElegido && !bandaLocal),
        })
        if (r.estado === 'duplicado') setDuplicado(r.disco)
        else navegar(`disco/${r.disco.id}`, { reemplazar: true })
      }
    } catch (e) {
      setErrorGeneral(mensajeError(e))
    } finally {
      setGuardando(false)
    }
  }

  const sumarCopia = async () => {
    setGuardando(true)
    try {
      await catalogo.sumarCopia(duplicado, copias, imagen ?? undefined, contratapa ?? undefined, datosMb())
      navegar(`disco/${duplicado.id}`, { reemplazar: true })
    } catch (e) {
      setErrorGeneral(mensajeError(e, 'sumar la copia'))
      setDuplicado(null)
    } finally {
      setGuardando(false)
    }
  }

  const cargandoTemas = Boolean(edicion) && temas.cargando

  return (
    <>
      <Encabezado titulo={editando ? 'Editar disco' : 'Agregar disco'} atras={editando ? `disco/${disco.id}` : ''} />
      <form onSubmit={guardar} className="mx-auto max-w-md space-y-7 px-5 pt-6 pb-16" noValidate>
        <CampoBanda
          valor={banda}
          onChange={cambiarBanda}
          onElegirMb={setArtistaMb}
          enlazada={Boolean(artistaElegido)}
          conMusicbrainz={conMusicbrainz}
          error={errores.banda}
          autoFocus={!editando && !inicial.banda}
        />
        <div>
          <Segmentado etiqueta="Formato" opciones={OPCIONES_FORMATO} valor={formato} onChange={setFormato} />
          {errores.formato && <p className="mt-1 text-sm text-acento-texto">{errores.formato}</p>}
        </div>
        {conMusicbrainz ? (
          <CampoDisco
            valor={titulo}
            onChange={cambiarTitulo}
            onElegir={elegirDisco}
            banda={banda}
            artista={artista}
            conMusicbrainz={conMusicbrainz}
            error={errores.titulo}
          />
        ) : (
          <Campo etiqueta="Disco" value={titulo} onChange={(e) => setTitulo(e.target.value)} error={errores.titulo} autoComplete="off" autoCapitalize="words" />
        )}

        {discoMb && (
          <div>
            <p className="etiqueta text-xs text-suave">Edición</p>
            <button
              type="button"
              disabled={!ediciones.datos?.length}
              onClick={() => setEligiendoEdicion(true)}
              className="mt-1 flex min-h-11 w-full items-center border-b border-metal text-left text-lg disabled:opacity-60"
            >
              <span className="min-w-0 flex-1 truncate">
                {ediciones.cargando ? 'Buscando ediciones…' : edicion ? describirEdicion(edicion) : 'Ninguna'}
              </span>
              <span className="text-acento-texto">▾</span>
            </button>
            {edicion && formato && !coincideFormato(edicion, formato) && (
              <p className="mt-1 text-sm text-acento-texto">No encontramos la edición en {NOMBRE_FORMATO_SINGULAR[formato]}.</p>
            )}
            {ediciones.datos && !ediciones.datos.length && <p className="mt-1 text-sm font-light text-suave">MusicBrainz no tiene ediciones de este disco.</p>}
            {errorMb && <p className="mt-1 text-sm font-light text-suave">MusicBrainz no responde: podés guardar igual, sin esos datos.</p>}
          </div>
        )}

        <Campo
          etiqueta="Año (opcional)"
          inputMode="numeric"
          maxLength={4}
          placeholder="1986"
          value={anioTexto}
          onChange={(e) => setAnioTexto(e.target.value)}
          error={errores.anio}
          autoComplete="off"
        />
        <Copias valor={copias} onChange={setCopias} />
        <SelectorImagen
          etiqueta="Tapa"
          actual={editando && disco.tapa_path ? <Imagen ruta={disco.tapa_path} /> : null}
          valor={imagen}
          onChange={(v) => {
            setImagen(v)
            setPropias((p) => ({ ...p, tapa: true }))
          }}
          deshabilitado={guardando}
        />
        <SelectorImagen
          etiqueta="Contratapa (lista de temas)"
          actual={editando && disco.contratapa_path ? <Imagen ruta={disco.contratapa_path} ajuste="contain" /> : null}
          valor={contratapa}
          onChange={(v) => {
            setContratapa(v)
            setPropias((p) => ({ ...p, contratapa: true }))
          }}
          deshabilitado={guardando}
          opciones={OPCIONES_CONTRATAPA}
          ajuste="contain"
        />
        {edicion && imagenesMb.cargando && <p className="text-sm font-light text-suave">Bajando tapa y contratapa…</p>}
        {edicion && <TemasPlegables temas={temas.datos} />}
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
        {editando && online && (
          <Boton variante="secundario" className="w-full" onClick={() => navegar(`disco/${disco.id}/completar`)}>
            Completar desde MusicBrainz
          </Boton>
        )}
        {!editando && <p className="text-sm font-light text-suave">La fecha de carga se guarda sola.</p>}
        {errorGeneral && <p className="text-sm text-acento-texto">{errorGeneral}</p>}
        <Boton type="submit" className="w-full" disabled={guardando || !online || cargandoTemas}>
          {!online ? 'Sin conexión' : guardando ? 'Guardando…' : cargandoTemas ? 'Buscando los temas…' : 'Guardar'}
        </Boton>
      </form>

      {eligiendoEdicion && (
        <Hoja
          titulo="Edición"
          valor={edicion?.id ?? 'ninguna'}
          opciones={[
            ...(ediciones.datos ?? []).map((e) => ({ valor: e.id, texto: `${describirEdicion(e)}${e.tapa ? '' : ' · sin tapa'}` })),
            { valor: 'ninguna', texto: 'Ninguna (solo banda y título)' },
          ]}
          onElegir={(v) => {
            setEdicionManual(v)
            setEligiendoEdicion(false)
          }}
          alCerrar={() => setEligiendoEdicion(false)}
        />
      )}

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
