import { useEffect, useMemo, useRef, useState } from 'react'
import { TemasPlegables } from '../componentes/Temas.jsx'
import { Boton, Encabezado, Hoja, Vacio } from '../componentes/ui.jsx'
import { NOMBRE_FORMATO_SINGULAR } from '../lib/catalogo.js'
import { useCatalogo } from '../lib/catalogoContexto.jsx'
import { agruparDiscos, coincideFormato, describirEdicion } from '../lib/discografia.js'
import { mensajeError } from '../lib/errores.js'
import { imagenesDeMusicbrainz } from '../lib/imagen.js'
import { datosParaGuardar, musicbrainz } from '../lib/musicbrainz.js'
import { subir, volver } from '../lib/router.js'
import { useConsultaMb } from '../lib/useConsultaMb.js'

// Imágenes ya bajadas y procesadas por edición: el disco siguiente se prepara mientras se decide el actual.
const imagenes = new Map()
function imagenesDe(edicion) {
  if (!imagenes.has(edicion)) {
    const promesa = imagenesDeMusicbrainz(edicion)
    imagenes.set(edicion, promesa)
    promesa.catch(() => imagenes.delete(edicion))
  }
  return imagenes.get(edicion)
}

const consultaDe = (disco, banda) => ({ banda: banda?.nombre ?? '', titulo: disco.titulo, formato: disco.formato, bandaMbid: banda?.mbid ?? null })

const comparar = (a, b) => a.localeCompare(b, 'es', { sensitivity: 'base', numeric: true })

// Sin id: recorre los pendientes. Con id: completa ese disco y vuelve a su detalle.
export default function Completar({ id }) {
  const { discos, discosPorId, bandasPorId, online, sincronizar } = useCatalogo()
  const [cola] = useState(() =>
    id
      ? [id]
      : discos
          .filter((d) => d.mb_estado === 'pendiente')
          .sort((a, b) => comparar(bandasPorId.get(a.banda_id)?.nombre ?? '', bandasPorId.get(b.banda_id)?.nombre ?? '') || comparar(a.titulo, b.titulo))
          .map((d) => d.id),
  )
  const [indice, setIndice] = useState(0)
  const cambios = useRef(false)

  // En la cola no se recarga el catálogo después de cada disco: se hace al salir.
  useEffect(() => () => void (cambios.current && !id && sincronizar()), [id, sincronizar])

  // Prepara el siguiente (datos de MusicBrainz e imágenes) mientras se decide el actual.
  useEffect(() => {
    const siguiente = discosPorId.get(cola[indice + 1])
    if (!siguiente || !online) return
    musicbrainz
      .buscarCandidato(consultaDe(siguiente, bandasPorId.get(siguiente.banda_id)))
      .then((c) => c?.edicion && imagenesDe(c.edicion.id))
      .catch(() => {})
  }, [indice]) // eslint-disable-line react-hooks/exhaustive-deps

  const disco = discosPorId.get(cola[indice])
  const banda = disco && bandasPorId.get(disco.banda_id)

  // Un pendiente que se borró mientras tanto se saltea.
  const borrado = !id && indice < cola.length && !disco
  useEffect(() => {
    if (borrado) setIndice((i) => i + 1)
  }, [borrado])

  const siguiente = (resultado) => {
    if (resultado !== 'salteado') cambios.current = true
    if (id) subir(`disco/${id}`)
    else setIndice((i) => i + 1)
  }

  const titulo = id ? 'Completar' : 'Pendientes'
  const atras = id ? `disco/${id}` : 'ajustes'

  if (!online) {
    return (
      <>
        <Encabezado titulo={titulo} atras={atras} />
        <Vacio titulo="Sin conexión">Para buscar en MusicBrainz hace falta señal.</Vacio>
      </>
    )
  }
  if (!id && indice >= cola.length) {
    return (
      <>
        <Encabezado titulo={titulo} atras={atras} />
        <Vacio titulo={cola.length ? 'Listo' : 'No hay pendientes'}>
          {cola.length ? 'Recorriste todos los discos pendientes.' : 'Todos los discos ya tienen sus datos o están marcados sin datos.'}
          <Boton className="mt-6" onClick={() => volver('ajustes')}>
            Volver
          </Boton>
        </Vacio>
      </>
    )
  }
  if (borrado) return null
  if (!disco) {
    return (
      <>
        <Encabezado titulo={titulo} atras="" />
        <Vacio titulo="No encontramos ese disco" />
      </>
    )
  }

  return (
    <>
      <Encabezado titulo={titulo} atras={atras} subtitulo={id ? undefined : `${indice + 1} de ${cola.length}`} />
      <Candidato key={disco.id} disco={disco} banda={banda} enCola={!id} onListo={siguiente} />
    </>
  )
}

function Candidato({ disco, banda, enCola, onListo }) {
  const { completarDisco, marcarSinCoincidencia } = useCatalogo()
  const [eleccion, setEleccion] = useState(null) // disco elegido con "Otro"
  const [buscando, setBuscando] = useState(false)
  const [edicionManual, setEdicionManual] = useState(null)
  const [eligiendoEdicion, setEligiendoEdicion] = useState(false)
  const [reemplazar, setReemplazar] = useState({ tapa: false, contratapa: false })
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)
  const [intento, setIntento] = useState(0)

  const candidato = useConsultaMb(`${eleccion ? `otro:${eleccion.disco.id}` : 'auto'}:${intento}`, (signal) =>
    eleccion
      ? musicbrainz.detalleDeDisco(eleccion.disco, disco.formato, { signal }).then((d) => ({ ...eleccion, ...d }))
      : musicbrainz.buscarCandidato(consultaDe(disco, banda), { signal }),
  )
  const c = candidato.datos
  const edicion = c ? (edicionManual ? (c.ediciones.find((e) => e.id === edicionManual) ?? null) : c.edicion) : null
  const temas = useConsultaMb(edicion ? edicion.id : null, (signal) => musicbrainz.temasDeEdicion(edicion.id, { signal }))
  const fotos = useConsultaMb(edicion ? edicion.id : null, () => imagenesDe(edicion.id))

  const actuar = async (accion, resultado) => {
    setGuardando(true)
    setError(null)
    try {
      await accion()
      onListo(resultado)
    } catch (e) {
      setError(mensajeError(e))
      setGuardando(false)
    }
  }

  const confirmar = () =>
    actuar(async () => {
      const img = edicion ? await imagenesDe(edicion.id).catch(() => ({})) : {}
      const tems = edicion ? await musicbrainz.temasDeEdicion(edicion.id) : null
      await completarDisco(disco, datosParaGuardar({ artista: c.artista, disco: c.disco, edicion, temas: tems }), {
        imagen: img.tapa ?? undefined,
        contratapa: img.contratapa ?? undefined,
        reemplazar,
        sincronizar: !enCola,
      })
      if (edicion) imagenes.delete(edicion.id)
    }, 'completado')

  const noEs = () => actuar(() => marcarSinCoincidencia(disco, { sincronizar: !enCola }), 'sin_coincidencia')

  const elegirOtro = (d) => {
    setBuscando(false)
    setEdicionManual(null)
    setEleccion({ artista: c?.artista ?? banda?.mbid ?? d.artista?.id ?? null, disco: d })
  }

  const vistaPrevia = (blob) => (blob ? URL.createObjectURL(blob) : null)
  const urls = useMemo(() => ({ tapa: vistaPrevia(fotos.datos?.tapa), contratapa: vistaPrevia(fotos.datos?.contratapa) }), [fotos.datos])
  useEffect(() => () => Object.values(urls).forEach((u) => u && URL.revokeObjectURL(u)), [urls])

  return (
    <main className="mx-auto max-w-md px-5 pt-5 pb-16">
      <p className="etiqueta text-xs text-suave">En tu catálogo</p>
      <p className="mt-1 text-lg font-medium">{disco.titulo}</p>
      <p className="etiqueta text-sm tracking-[0.06em] text-acento-texto">
        {banda?.nombre} · {NOMBRE_FORMATO_SINGULAR[disco.formato]}
      </p>

      <section className="mt-6 border-t border-metal/40 pt-5">
        <p className="etiqueta text-xs text-suave">En MusicBrainz</p>

        {buscando ? (
          <ElegirDisco banda={banda} artista={c?.artista ?? banda?.mbid ?? null} titulo={disco.titulo} onElegir={elegirOtro} onCancelar={() => setBuscando(false)} />
        ) : candidato.cargando ? (
          <p className="mt-3 font-light text-suave">Buscando…</p>
        ) : candidato.error ? (
          <div className="mt-3">
            <p className="font-light text-suave">MusicBrainz no responde.</p>
            <Boton variante="secundario" className="mt-3" onClick={() => setIntento((n) => n + 1)}>
              Reintentar
            </Boton>
          </div>
        ) : !c ? (
          <p className="mt-3 font-light text-suave">No lo encontramos.</p>
        ) : (
          <>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Foto url={urls.tapa} cargando={fotos.cargando} etiqueta="Tapa" />
              <Foto url={urls.contratapa} cargando={fotos.cargando} etiqueta="Contratapa" contener />
            </div>
            <p className="mt-4 text-xl font-semibold">{c.disco.titulo}</p>
            <p className="font-light text-suave">{[c.disco.anio, temas.datos && `${temas.datos.reduce((n, m) => n + m.temas.length, 0)} temas`].filter(Boolean).join(' · ')}</p>

            <button
              type="button"
              disabled={!c.ediciones.length}
              onClick={() => setEligiendoEdicion(true)}
              className="mt-3 flex min-h-11 w-full items-center border-b border-metal text-left disabled:opacity-60"
            >
              <span className="etiqueta mr-3 text-xs text-suave">Edición</span>
              <span className="min-w-0 flex-1 truncate">{edicion ? describirEdicion(edicion) : 'Ninguna'}</span>
              <span className="text-acento-texto">▾</span>
            </button>
            {edicion && !coincideFormato(edicion, disco.formato) && (
              <p className="mt-1 text-sm text-acento-texto">No encontramos la edición en {NOMBRE_FORMATO_SINGULAR[disco.formato]}.</p>
            )}

            {(disco.tapa_path && fotos.datos?.tapa) || (disco.contratapa_path && fotos.datos?.contratapa) ? (
              <div className="mt-4 space-y-2">
                {disco.tapa_path && fotos.datos?.tapa && (
                  <Marca valor={reemplazar.tapa} onChange={(v) => setReemplazar((r) => ({ ...r, tapa: v }))}>
                    Reemplazar mi foto de tapa
                  </Marca>
                )}
                {disco.contratapa_path && fotos.datos?.contratapa && (
                  <Marca valor={reemplazar.contratapa} onChange={(v) => setReemplazar((r) => ({ ...r, contratapa: v }))}>
                    Reemplazar mi foto de contratapa
                  </Marca>
                )}
              </div>
            ) : null}

            <div className="mt-4">
              <TemasPlegables temas={temas.datos} />
            </div>
          </>
        )}
      </section>

      {error && <p className="mt-4 text-sm text-acento-texto">{error}</p>}

      {!buscando && (
        <div className="mt-6 space-y-3">
          {c ? (
            <div className="grid grid-cols-3 gap-2">
              <Boton variante="peligro" disabled={guardando} onClick={noEs}>
                No es
              </Boton>
              <Boton variante="secundario" disabled={guardando} onClick={() => setBuscando(true)}>
                Otro
              </Boton>
              <Boton disabled={guardando || temas.cargando} onClick={confirmar}>
                {guardando ? '…' : 'Sí'}
              </Boton>
            </div>
          ) : (
            !candidato.cargando && (
              <div className="grid grid-cols-2 gap-2">
                <Boton variante="secundario" disabled={guardando} onClick={() => setBuscando(true)}>
                  Buscar a mano
                </Boton>
                <Boton variante="peligro" disabled={guardando} onClick={noEs}>
                  Marcar sin datos
                </Boton>
              </div>
            )
          )}
          {enCola && (
            <Boton variante="fantasma" className="w-full" disabled={guardando} onClick={() => onListo('salteado')}>
              Saltar
            </Boton>
          )}
        </div>
      )}

      {eligiendoEdicion && c && (
        <Hoja
          titulo="Edición"
          valor={edicion?.id ?? 'ninguna'}
          opciones={[
            ...c.ediciones.map((e) => ({ valor: e.id, texto: `${describirEdicion(e)}${e.tapa ? '' : ' · sin tapa'}` })),
            { valor: 'ninguna', texto: 'Ninguna (solo año)' },
          ]}
          onElegir={(v) => {
            setEdicionManual(v)
            setEligiendoEdicion(false)
          }}
          alCerrar={() => setEligiendoEdicion(false)}
        />
      )}
    </main>
  )
}

function Foto({ url, cargando, etiqueta, contener = false }) {
  return (
    <div>
      <p className="etiqueta text-xs text-suave">{etiqueta}</p>
      <div className="relative mt-1 aspect-square overflow-hidden border border-metal/60 bg-superficie-solida">
        {url ? (
          <img src={url} alt={etiqueta} className={`absolute inset-0 size-full ${contener ? 'object-contain' : 'object-cover'}`} />
        ) : (
          <p className="absolute inset-0 grid place-items-center text-xs font-light text-suave">{cargando ? 'Bajando…' : 'No hay'}</p>
        )}
      </div>
    </div>
  )
}

function Marca({ valor, onChange, children }) {
  return (
    <label className="flex min-h-11 items-center gap-3">
      <input type="checkbox" checked={valor} onChange={(e) => onChange(e.target.checked)} className="size-5 accent-[var(--acento)]" />
      <span>{children}</span>
    </label>
  )
}

// "Otro" / "Buscar a mano": discos del artista (filtrables) o, sin artista, búsqueda por banda y título.
function ElegirDisco({ banda, artista, titulo, onElegir, onCancelar }) {
  const [texto, setTexto] = useState(artista ? '' : titulo)
  const delArtista = useConsultaMb(artista, (signal) => musicbrainz.discosDeArtista(artista, { signal }))
  const busqueda = useConsultaMb(!artista && texto.trim().length >= 2 ? texto.trim() : null, (signal) => musicbrainz.buscarDiscos(banda?.nombre ?? '', texto, { signal }), {
    pausa: 500,
  })
  const fuente = artista ? delArtista : busqueda
  const grupos = artista ? agruparDiscos(delArtista.datos ?? [], texto) : agruparDiscos(busqueda.datos ?? busqueda.ultimos ?? [])

  return (
    <div className="mt-3">
      <input
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder={artista ? 'Filtrar por título' : 'Título del disco'}
        autoComplete="off"
        className="block min-h-11 w-full border-0 border-b border-metal bg-transparent px-0 text-lg outline-none placeholder:text-suave/60 focus:border-acento"
      />
      <ul className="mt-2">
        {grupos.map((g) => (
          <li key={g.clave}>
            <p className="etiqueta pt-3 pb-1 text-xs text-acento-texto">{g.titulo}</p>
            <ul>
              {g.discos.map((d) => (
                <li key={d.id}>
                  <button type="button" onClick={() => onElegir(d)} className="flex min-h-12 w-full items-center gap-3 border-b border-metal/40 text-left">
                    <span className="min-w-0 flex-1">{d.titulo}</span>
                    {d.anio && <span className="text-sm font-light text-suave">{d.anio}</span>}
                  </button>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      {fuente.cargando && !grupos.length && <p className="mt-3 font-light text-suave">Buscando…</p>}
      {fuente.error && <p className="mt-3 font-light text-suave">MusicBrainz no responde.</p>}
      {fuente.datos && !grupos.length && <p className="mt-3 font-light text-suave">No aparece en MusicBrainz.</p>}
      <Boton variante="fantasma" className="mt-4 w-full" onClick={onCancelar}>
        Cancelar
      </Boton>
    </div>
  )
}
