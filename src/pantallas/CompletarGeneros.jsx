import { useEffect, useMemo, useRef, useState } from 'react'
import { EditorGeneros } from '../componentes/Generos.jsx'
import { Boton, Encabezado, Vacio } from '../componentes/ui.jsx'
import { useCatalogo } from '../lib/catalogoContexto.jsx'
import { elegirArtista, elegirGeneros } from '../lib/discografia.js'
import { mensajeError } from '../lib/errores.js'
import { generosDelCatalogo, resolverGenero } from '../lib/generos.js'
import { musicbrainz } from '../lib/musicbrainz.js'
import { volver } from '../lib/router.js'
import { useConsultaMb } from '../lib/useConsultaMb.js'

const comparar = (a, b) => a.localeCompare(b, 'es', { sensitivity: 'base', numeric: true })

// "AR" → "Argentina". Un código que el navegador no conoce queda como está.
const regiones = typeof Intl.DisplayNames === 'function' ? new Intl.DisplayNames(['es'], { type: 'region' }) : null
function nombrePais(codigo) {
  if (!codigo) return null
  try {
    return regiones?.of(codigo) ?? codigo
  } catch {
    return codigo
  }
}
const detalleArtista = (a) => [nombrePais(a.pais), a.desambiguacion].filter(Boolean).join(' · ')

// Recorre las bandas con los géneros sin revisar, en orden alfabético. Una banda sin enlazar primero
// elige su artista de MusicBrainz; después, los géneros.
export default function CompletarGeneros() {
  const { bandas, bandasPorId, online, sincronizar } = useCatalogo()
  const [cola] = useState(() =>
    bandas
      .filter((b) => b.generos_estado === 'pendiente')
      .sort((a, b) => comparar(a.nombre, b.nombre))
      .map((b) => b.id),
  )
  const [indice, setIndice] = useState(0)
  const cambios = useRef(false)

  // No se recarga el catálogo después de cada banda: se hace al salir.
  useEffect(() => () => void (cambios.current && sincronizar()), [sincronizar])

  // Pide los géneros de la siguiente (si está enlazada) mientras se decide la actual.
  useEffect(() => {
    const siguiente = bandasPorId.get(cola[indice + 1])
    if (!siguiente?.mbid || !online) return
    musicbrainz.generosDeArtista(siguiente.mbid).catch(() => {})
  }, [indice]) // eslint-disable-line react-hooks/exhaustive-deps

  const banda = bandasPorId.get(cola[indice])

  // Una banda borrada o unida con otra mientras tanto se saltea.
  const borrada = indice < cola.length && !banda
  useEffect(() => {
    if (borrada) setIndice((i) => i + 1)
  }, [borrada])

  const siguiente = (resultado) => {
    if (resultado !== 'salteada') cambios.current = true
    setIndice((i) => i + 1)
  }

  if (!online) {
    return (
      <>
        <Encabezado titulo="Géneros" atras="ajustes" />
        <Vacio titulo="Sin conexión">Para buscar en MusicBrainz hace falta señal.</Vacio>
      </>
    )
  }
  if (indice >= cola.length) {
    return (
      <>
        <Encabezado titulo="Géneros" atras="ajustes" />
        <Vacio titulo={cola.length ? 'Listo' : 'No hay pendientes'}>
          {cola.length ? 'Recorriste todas las bandas pendientes.' : 'Todas las bandas ya tienen sus géneros revisados.'}
          <Boton className="mt-6" onClick={() => volver('ajustes')}>
            Volver
          </Boton>
        </Vacio>
      </>
    )
  }
  if (borrada) return null

  return (
    <>
      <Encabezado titulo="Géneros" atras="ajustes" subtitulo={`${indice + 1} de ${cola.length}`} />
      <PasoBanda key={banda.id} banda={banda} onEnlazada={() => (cambios.current = true)} onListo={siguiente} />
    </>
  )
}

function PasoBanda({ banda, onEnlazada, onListo }) {
  const { enlazarBanda, cambiarGenerosBanda } = useCatalogo()
  // undefined: falta elegir el artista; null: no está en MusicBrainz; id: enlazada.
  const [mbid, setMbid] = useState(banda.mbid ?? undefined)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)

  const actuar = async (accion) => {
    setGuardando(true)
    setError(null)
    try {
      await accion()
    } catch (e) {
      setError(mensajeError(e))
    } finally {
      setGuardando(false)
    }
  }

  // Enlazar solo escribe el mbid de la banda; también busca su logo si no tiene.
  const enlazar = (artista) =>
    actuar(async () => {
      await enlazarBanda(banda, artista.id, { recargar: false })
      onEnlazada()
      setMbid(artista.id)
    })

  const guardar = (generos) =>
    actuar(async () => {
      await cambiarGenerosBanda(banda, generos, { recargar: false })
      onListo('guardada')
    })

  return (
    <main className="mx-auto max-w-md px-5 pt-5 pb-16">
      <p className="etiqueta text-xs text-suave">En tu catálogo</p>
      <p className="mt-1 text-xl font-semibold">{banda.nombre}</p>

      <section className="mt-6 border-t border-metal/40 pt-5">
        {mbid === undefined ? (
          <PasoArtista banda={banda} ocupado={guardando} onElegir={enlazar} onNoEsta={() => setMbid(null)} onSaltar={() => onListo('salteada')} />
        ) : (
          <PasoGeneros banda={banda} mbid={mbid} ocupado={guardando} onGuardar={guardar} onSaltar={() => onListo('salteada')} />
        )}
      </section>

      {error && <p className="mt-4 text-sm text-acento-texto">{error}</p>}
    </main>
  )
}

// "¿Es esta?" con el artista de nombre igual y buen puntaje. "Otra" (o sin candidato) muestra la lista
// de resultados, con un campo para buscar con otro nombre.
function PasoArtista({ banda, ocupado, onElegir, onNoEsta, onSaltar }) {
  const [texto, setTexto] = useState(banda.nombre)
  const [eligiendo, setEligiendo] = useState(false)
  const [intento, setIntento] = useState(0)
  const q = texto.trim()
  const busqueda = useConsultaMb(q ? `${q}:${intento}` : null, (signal) => musicbrainz.buscarArtistas(q, { signal }), {
    pausa: eligiendo ? 500 : 0,
  })
  const candidato = !eligiendo && busqueda.datos ? elegirArtista(busqueda.datos, banda.nombre) : null

  // Sin candidato, directo a la lista.
  const sinCandidato = !eligiendo && Boolean(busqueda.datos) && !candidato
  useEffect(() => {
    if (sinCandidato) setEligiendo(true)
  }, [sinCandidato])

  const saltar = (
    <Boton variante="fantasma" className="w-full" disabled={ocupado} onClick={onSaltar}>
      Saltar
    </Boton>
  )

  if (!eligiendo) {
    return (
      <>
        <p className="etiqueta text-xs text-suave">En MusicBrainz</p>
        {busqueda.error ? (
          <div className="mt-3">
            <p className="font-light text-suave">MusicBrainz no responde.</p>
            <Boton variante="secundario" className="mt-3" onClick={() => setIntento((n) => n + 1)}>
              Reintentar
            </Boton>
          </div>
        ) : !candidato ? (
          <p className="mt-3 font-light text-suave">Buscando…</p>
        ) : (
          <>
            <p className="mt-3 font-light text-suave">¿Es esta?</p>
            <p className="mt-1 text-xl font-semibold">{candidato.nombre}</p>
            {detalleArtista(candidato) && <p className="font-light text-suave">{detalleArtista(candidato)}</p>}
          </>
        )}
        <div className="mt-6 space-y-3">
          {candidato && (
            <div className="grid grid-cols-3 gap-2">
              <Boton variante="peligro" disabled={ocupado} onClick={onNoEsta}>
                No está
              </Boton>
              <Boton variante="secundario" disabled={ocupado} onClick={() => setEligiendo(true)}>
                Otra
              </Boton>
              <Boton disabled={ocupado} onClick={() => onElegir(candidato)}>
                {ocupado ? '…' : 'Sí'}
              </Boton>
            </div>
          )}
          {busqueda.error && (
            <Boton variante="peligro" className="w-full" disabled={ocupado} onClick={onNoEsta}>
              No está
            </Boton>
          )}
          {saltar}
        </div>
      </>
    )
  }

  const artistas = busqueda.datos ?? busqueda.ultimos ?? []
  return (
    <>
      <label htmlFor="buscar-artista" className="etiqueta text-xs text-suave">
        Buscar en MusicBrainz
      </label>
      <input
        id="buscar-artista"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Nombre de la banda"
        autoComplete="off"
        className="mt-1 block min-h-11 w-full border-0 border-b border-metal bg-transparent px-0 text-lg outline-none placeholder:text-suave/60 focus:border-acento focus-visible:outline-none"
      />
      <ul className="mt-2">
        {artistas.map((a) => (
          <li key={a.id}>
            <button
              type="button"
              disabled={ocupado}
              onClick={() => onElegir(a)}
              className="flex min-h-12 w-full items-center gap-3 border-b border-metal/40 py-2 text-left disabled:opacity-40"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate">{a.nombre}</span>
                {detalleArtista(a) && <span className="block truncate text-sm font-light text-suave">{detalleArtista(a)}</span>}
              </span>
            </button>
          </li>
        ))}
      </ul>
      {busqueda.cargando && !artistas.length && <p className="mt-3 font-light text-suave">Buscando…</p>}
      {busqueda.error && <p className="mt-3 font-light text-suave">MusicBrainz no responde.</p>}
      {busqueda.datos && !artistas.length && <p className="mt-3 font-light text-suave">No aparece en MusicBrainz.</p>}
      <div className="mt-6 space-y-3">
        <Boton variante="peligro" className="w-full" disabled={ocupado} onClick={onNoEsta}>
          No está
        </Boton>
        {saltar}
      </div>
    </>
  )
}

// Géneros de MusicBrainz: los propuestos ya marcados y el resto para activar. Sin enlace, solo a mano.
function PasoGeneros({ banda, mbid, ocupado, onGuardar, onSaltar }) {
  const { bandas } = useCatalogo()
  const [intento, setIntento] = useState(0)
  const [marcados, setMarcados] = useState(null) // null: todavía no se tocó
  const consulta = useConsultaMb(mbid ? `${mbid}:${intento}` : null, (signal) => musicbrainz.generosDeArtista(mbid, { signal }))
  const catalogo = useMemo(() => generosDelCatalogo(bandas), [bandas])
  const mb = useMemo(() => {
    const { propuestos, todos } = elegirGeneros(consulta.datos ?? [])
    const resolver = (g) => resolverGenero(g, catalogo)
    return { propuestos: propuestos.map(resolver), todos: todos.map(resolver) }
  }, [consulta.datos, catalogo])
  const valor = marcados ?? (banda.generos?.length ? banda.generos : mb.propuestos)

  return (
    <>
      {!mbid ? (
        <p className="font-light text-suave">No está en MusicBrainz: cargá los géneros a mano.</p>
      ) : consulta.cargando ? (
        <p className="font-light text-suave">Buscando géneros…</p>
      ) : consulta.error ? (
        <div>
          <p className="font-light text-suave">MusicBrainz no responde.</p>
          <Boton variante="secundario" className="mt-3" onClick={() => setIntento((n) => n + 1)}>
            Reintentar
          </Boton>
        </div>
      ) : (
        !mb.todos.length && <p className="font-light text-suave">MusicBrainz no tiene géneros para esta banda: cargalos a mano.</p>
      )}

      <div className="mt-5">
        <EditorGeneros valor={valor} onChange={setMarcados} deMusicbrainz={mb.todos} deshabilitado={ocupado} />
      </div>

      <div className="mt-8 space-y-3">
        <Boton className="w-full" disabled={ocupado || consulta.cargando} onClick={() => onGuardar(valor)}>
          {ocupado ? 'Guardando…' : 'Guardar'}
        </Boton>
        <Boton variante="fantasma" className="w-full" disabled={ocupado} onClick={onSaltar}>
          Saltar
        </Boton>
      </div>
    </>
  )
}
