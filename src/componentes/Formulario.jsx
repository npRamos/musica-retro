import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useCatalogo } from '../lib/catalogoContexto.jsx'
import { agruparDiscos } from '../lib/discografia.js'
import { musicbrainz } from '../lib/musicbrainz.js'
import { normalizar } from '../lib/texto.js'
import { useConsultaMb } from '../lib/useConsultaMb.js'
import { IconoCamara, IconoGaleria } from './Iconos.jsx'
import { Boton } from './ui.jsx'

const ESTILO_INPUT =
  'mt-1 block min-h-11 w-full border-0 border-b border-metal bg-transparent px-0 text-lg outline-none focus:border-acento focus-visible:outline-none'

// Lista desplegable bajo un campo. Los botones no roban el foco (mousedown) para que el blur no la cierre antes del clic.
function Desplegable({ id, children }) {
  return (
    <ul id={id} role="listbox" className="absolute inset-x-0 top-full z-30 mt-1 max-h-80 overflow-y-auto border border-metal bg-superficie-solida">
      {children}
    </ul>
  )
}

function Grupo({ children }) {
  return <li className="etiqueta border-b border-metal/40 px-3 pt-3 pb-1 text-xs text-acento-texto">{children}</li>
}

function Opcion({ onClick, children, nueva = false }) {
  return (
    <li role="option" aria-selected="false">
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={onClick}
        className={`flex min-h-12 w-full items-center gap-3 border-b border-metal/40 px-3 text-left ${nueva ? 'text-acento-texto' : ''}`}
      >
        {children}
      </button>
    </li>
  )
}

function Aviso({ children }) {
  return <li className="border-b border-metal/40 px-3 py-3 text-sm font-light text-suave">{children}</li>
}

const detalleArtista = (a) => [a.pais, a.desambiguacion].filter(Boolean).join(' · ')

// Banda: primero las del catálogo; después, si conMusicbrainz, artistas de MusicBrainz (con pausa al escribir).
// Si no coincide ninguna, se creará al guardar. onElegirMb recibe el artista elegido, o null para "usar tal cual".
export function CampoBanda({ valor, onChange, onElegirMb, enlazada = false, conMusicbrainz = false, error, autoFocus }) {
  const { bandas } = useCatalogo()
  const id = useId()
  const [abierto, setAbierto] = useState(false)
  const q = normalizar(valor)
  const exacta = bandas.find((b) => b.nombre_norm === q)
  const sugerencias = useMemo(
    () => (q ? bandas.filter((b) => b.nombre_norm.includes(q) && b.nombre_norm !== q).slice(0, 6) : []),
    [bandas, q],
  )

  const buscarMb = conMusicbrainz && abierto && q.length >= 2 && !exacta
  const mb = useConsultaMb(buscarMb ? q : null, (signal) => musicbrainz.buscarArtistas(valor, { signal }), { pausa: 500 })
  // Un artista ya enlazado a una banda del catálogo se muestra solo como esa banda.
  const enlazados = useMemo(() => new Set(bandas.map((b) => b.mbid).filter(Boolean)), [bandas])
  const artistas = (mb.datos ?? mb.ultimos ?? []).filter((a) => !enlazados.has(a.id)).slice(0, 5)

  const cerrar = () => setAbierto(false)
  const hayLista = abierto && (sugerencias.length > 0 || buscarMb)

  return (
    <div className="relative">
      <label htmlFor={id} className="etiqueta text-xs text-suave">
        Banda
      </label>
      <input
        id={id}
        value={valor}
        autoFocus={autoFocus}
        autoComplete="off"
        autoCapitalize="words"
        role="combobox"
        aria-expanded={hayLista}
        aria-controls={`${id}-lista`}
        onChange={(e) => {
          onChange(e.target.value)
          setAbierto(true)
        }}
        onFocus={() => setAbierto(true)}
        onBlur={() => setTimeout(cerrar, 150)}
        className={ESTILO_INPUT}
      />
      {error ? (
        <p className="mt-1 text-sm text-acento-texto">{error}</p>
      ) : (
        q && (
          <p className="mt-1 text-sm font-light text-suave">
            {exacta ? `Ya la tenés: ${exacta.nombre}` : enlazada ? 'Banda nueva, de MusicBrainz: se agrega al guardar' : 'Banda nueva: se agrega al guardar'}
          </p>
        )
      )}
      {hayLista && (
        <Desplegable id={`${id}-lista`}>
          {sugerencias.length > 0 && buscarMb && <Grupo>En tu catálogo</Grupo>}
          {sugerencias.map((b) => (
            <Opcion
              key={b.id}
              onClick={() => {
                onChange(b.nombre)
                cerrar()
              }}
            >
              {b.nombre}
            </Opcion>
          ))}
          {buscarMb && (
            <>
              <Grupo>En MusicBrainz</Grupo>
              {artistas.map((a) => (
                <Opcion
                  key={a.id}
                  onClick={() => {
                    onChange(a.nombre)
                    onElegirMb?.(a)
                    cerrar()
                  }}
                >
                  <span className="min-w-0 flex-1 truncate">{a.nombre}</span>
                  <span className="max-w-[45%] truncate text-sm font-light text-suave">{detalleArtista(a)}</span>
                </Opcion>
              ))}
              {mb.cargando && !artistas.length && <Aviso>Buscando…</Aviso>}
              {mb.error && <Aviso>MusicBrainz no responde. Podés escribirla igual.</Aviso>}
              {mb.datos && !artistas.length && <Aviso>No aparece en MusicBrainz.</Aviso>}
              <Opcion
                nueva
                onClick={() => {
                  onElegirMb?.(null)
                  cerrar()
                }}
              >
                + Usar «{valor.trim()}» tal cual
              </Opcion>
            </>
          )}
        </Desplegable>
      )}
    </div>
  )
}

// Disco: con banda enlazada (artista), lista sus discos agrupados y filtra por lo escrito; si no, busca por banda y título.
// onElegir recibe el disco de MusicBrainz, o null para "usar lo que escribí".
export function CampoDisco({ valor, onChange, onElegir, banda, artista, conMusicbrainz = false, error }) {
  const id = useId()
  const [abierto, setAbierto] = useState(false)
  const q = normalizar(valor)

  const delArtista = useConsultaMb(conMusicbrainz && artista ? artista : null, (signal) => musicbrainz.discosDeArtista(artista, { signal }))
  const buscar = conMusicbrainz && !artista && abierto && normalizar(banda).length >= 2 && q.length >= 2
  const busqueda = useConsultaMb(buscar ? `${normalizar(banda)}|${q}` : null, (signal) => musicbrainz.buscarDiscos(banda, valor, { signal }), {
    pausa: 500,
  })

  const fuente = artista ? delArtista : busqueda
  const grupos = useMemo(
    () => (artista ? agruparDiscos(delArtista.datos ?? [], valor) : agruparDiscos(busqueda.datos ?? busqueda.ultimos ?? [])),
    [artista, delArtista.datos, busqueda.datos, busqueda.ultimos, valor],
  )

  const cerrar = () => setAbierto(false)
  const conLista = conMusicbrainz && (artista || buscar)
  const hayLista = abierto && conLista

  return (
    <div className="relative">
      <label htmlFor={id} className="etiqueta text-xs text-suave">
        Disco
      </label>
      <input
        id={id}
        value={valor}
        autoComplete="off"
        autoCapitalize="words"
        role="combobox"
        aria-expanded={hayLista}
        aria-controls={`${id}-lista`}
        onChange={(e) => {
          onChange(e.target.value)
          setAbierto(true)
        }}
        onFocus={() => setAbierto(true)}
        onBlur={() => setTimeout(cerrar, 150)}
        className={ESTILO_INPUT}
      />
      {error && <p className="mt-1 text-sm text-acento-texto">{error}</p>}
      {hayLista && (
        <Desplegable id={`${id}-lista`}>
          {grupos.map((g) => (
            <li key={g.clave}>
              <ul>
                <Grupo>{g.titulo}</Grupo>
                {g.discos.map((d) => (
                  <Opcion
                    key={d.id}
                    onClick={() => {
                      onElegir(d)
                      cerrar()
                    }}
                  >
                    <span className="min-w-0 flex-1">{d.titulo}</span>
                    {d.anio && <span className="text-sm font-light text-suave">{d.anio}</span>}
                  </Opcion>
                ))}
              </ul>
            </li>
          ))}
          {fuente.cargando && !grupos.length && <Aviso>Buscando en MusicBrainz…</Aviso>}
          {fuente.error && <Aviso>MusicBrainz no responde. Podés escribirlo igual.</Aviso>}
          {fuente.datos && !grupos.length && <Aviso>{q ? 'No aparece en MusicBrainz.' : 'MusicBrainz no tiene discos de esta banda.'}</Aviso>}
          {valor.trim() && (
            <Opcion
              nueva
              onClick={() => {
                onElegir(null)
                cerrar()
              }}
            >
              + Usar lo que escribí
            </Opcion>
          )}
        </Desplegable>
      )}
    </div>
  )
}

// Foto desde la cámara o la galería, con vista previa. valor: Blob nuevo | null (quitar) | undefined (sin cambios)
export function SelectorImagen({ etiqueta = 'Tapa', actual, valor, onChange, deshabilitado, opciones, ajuste = 'cover' }) {
  const { procesarImagen } = useCatalogo()
  const camara = useRef(null)
  const galeria = useRef(null)
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState(null)
  const vistaPrevia = useMemo(() => (valor ? URL.createObjectURL(valor) : null), [valor])
  useEffect(() => () => vistaPrevia && URL.revokeObjectURL(vistaPrevia), [vistaPrevia])

  const elegir = async (e) => {
    const archivo = e.target.files?.[0]
    e.target.value = ''
    if (!archivo) return
    setProcesando(true)
    setError(null)
    try {
      onChange(await procesarImagen(archivo, opciones))
    } catch {
      setError('No se pudo leer esa imagen. Probá con otra.')
    } finally {
      setProcesando(false)
    }
  }

  const muestraActual = valor === undefined && actual
  const hayImagen = Boolean(vistaPrevia || muestraActual)

  return (
    <div>
      <p className="etiqueta text-xs text-suave">{etiqueta}</p>
      <div className="mt-2 flex items-start gap-4">
        <div className="relative size-28 shrink-0 overflow-hidden border border-metal/60 bg-superficie-solida">
          {vistaPrevia && (
            <img src={vistaPrevia} alt="Vista previa" className={`absolute inset-0 size-full ${ajuste === 'contain' ? 'object-contain' : 'object-cover'}`} />
          )}
          {muestraActual}
          {!hayImagen && <p className="absolute inset-0 grid place-items-center text-xs font-light text-suave">Sin imagen</p>}
          {procesando && <p className="absolute inset-0 grid place-items-center bg-fondo/80 text-xs">Procesando…</p>}
        </div>
        <div className="flex flex-col gap-2">
          <Boton variante="secundario" disabled={deshabilitado || procesando} onClick={() => camara.current.click()}>
            <IconoCamara /> {hayImagen ? 'Otra foto' : 'Sacar foto'}
          </Boton>
          <Boton variante="secundario" disabled={deshabilitado || procesando} onClick={() => galeria.current.click()}>
            <IconoGaleria /> Galería
          </Boton>
          {hayImagen && (
            <Boton variante="fantasma" disabled={deshabilitado} onClick={() => onChange(actual ? null : undefined)}>
              Quitar
            </Boton>
          )}
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-acento-texto">{error}</p>}
      <input ref={camara} type="file" accept="image/*" capture="environment" hidden onChange={elegir} />
      <input ref={galeria} type="file" accept="image/*" hidden onChange={elegir} />
    </div>
  )
}

export function Copias({ valor, onChange }) {
  return (
    <div>
      <p className="etiqueta text-xs text-suave">Copias</p>
      <div className="mt-2 flex items-center gap-4">
        <button
          type="button"
          aria-label="Una copia menos"
          disabled={valor <= 1}
          onClick={() => onChange(valor - 1)}
          className="grid size-11 place-items-center rounded-full border border-metal text-xl disabled:opacity-30"
        >
          −
        </button>
        <output className="etiqueta min-w-8 text-center text-2xl">{valor}</output>
        <button
          type="button"
          aria-label="Una copia más"
          onClick={() => onChange(valor + 1)}
          className="grid size-11 place-items-center rounded-full border border-metal text-xl"
        >
          +
        </button>
      </div>
    </div>
  )
}
