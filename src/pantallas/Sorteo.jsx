import { useEffect, useMemo, useReducer, useState } from 'react'
import { FilaGeneros } from '../componentes/Generos.jsx'
import { IconoDado, IconoSiguiente, IconoSpotify } from '../componentes/Iconos.jsx'
import { Tapa } from '../componentes/Portadas.jsx'
import { BadgeFormato } from '../componentes/Tarjetas.jsx'
import { Boton, Encabezado, Segmentado } from '../componentes/ui.jsx'
import { linkSpotify } from '../lib/catalogo.js'
import { useCatalogo } from '../lib/catalogoContexto.jsx'
import { mismoGenero } from '../lib/generos.js'
import { usePreferencias } from '../lib/preferencias.js'
import { navegar } from '../lib/router.js'
import { FORMATOS_SORTEO, armarBombo, claveFiltros, contarGeneros, empezarDeNuevo, rondaDe, sacar } from '../lib/sorteo.js'

// Chips de género visibles antes de "Ver todos".
const CHIPS = 8

const contarDiscos = (n) => `${n} ${n === 1 ? 'disco' : 'discos'}`

export default function Sorteo() {
  const { discos, bandasPorId } = useCatalogo()
  const [{ sorteoFormato: formato, sorteoGeneros }, cambiar] = usePreferencias()
  const [, refrescar] = useReducer((n) => n + 1, 0)
  const [revelando, setRevelando] = useState(false)
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false)
  const [todosLosGeneros, setTodosLosGeneros] = useState(false)

  const { generos: disponibles, sinGenero } = useMemo(() => contarGeneros(discos, bandasPorId, formato), [discos, bandasPorId, formato])
  // Un género elegido que ya no está en este formato se descarta.
  const elegidos = sorteoGeneros.filter((g) => disponibles.some((d) => mismoGenero(d.nombre, g)))
  const bombo = useMemo(() => armarBombo(discos, bandasPorId, { formato, generos: elegidos }), [discos, bandasPorId, formato, elegidos.join('|')]) // eslint-disable-line react-hooks/exhaustive-deps
  const filtros = claveFiltros(formato, elegidos)
  const ronda = rondaDe(filtros)
  const actual = bombo.find((b) => b.clave === ronda.actual) ?? null

  const sortear = () => {
    if (sacar(bombo, filtros)) setRevelando(true)
    setFiltrosAbiertos(false)
    refrescar()
  }
  const deNuevo = () => {
    empezarDeNuevo(filtros)
    sortear()
  }
  const alternarGenero = (g) => cambiar('sorteoGeneros', elegidos.some((e) => mismoGenero(e, g)) ? elegidos.filter((e) => !mismoGenero(e, g)) : [...elegidos, g])

  const conResultado = Boolean(actual) || ronda.agotada
  const verFiltros = !conResultado || filtrosAbiertos
  const chips = todosLosGeneros ? disponibles : disponibles.slice(0, CHIPS)
  const resumen = [FORMATOS_SORTEO[formato], elegidos.length ? elegidos.join(', ') : 'todos los géneros', contarDiscos(bombo.length)].join(' · ')

  return (
    <>
      <Encabezado titulo="Sorteo" subtitulo="¿Qué escuchamos hoy?" atras="" />
      <main className="mx-auto max-w-md px-5 pt-5 pb-16">
        {verFiltros ? (
          <section className="space-y-5">
            <Segmentado
              etiqueta="Formato"
              valor={formato}
              onChange={(v) => cambiar('sorteoFormato', v)}
              opciones={Object.entries(FORMATOS_SORTEO).map(([valor, texto]) => ({ valor, texto }))}
            />
            {disponibles.length > 0 && (
              <fieldset>
                <legend className="etiqueta text-xs text-suave">Género</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {chips.map((g) => {
                    const activo = elegidos.some((e) => mismoGenero(e, g.nombre))
                    return (
                      <button
                        key={g.nombre}
                        type="button"
                        aria-pressed={activo}
                        onClick={() => alternarGenero(g.nombre)}
                        className={`etiqueta min-h-11 rounded-full border px-4 text-xs transition-colors ${activo ? 'border-acento text-acento-texto' : 'border-metal/70 text-suave'}`}
                      >
                        {g.nombre} <span className="font-light opacity-70">{g.cantidad}</span>
                      </button>
                    )
                  })}
                  {disponibles.length > CHIPS && (
                    <button type="button" onClick={() => setTodosLosGeneros((v) => !v)} className="etiqueta min-h-11 px-2 text-xs text-suave underline-offset-4 active:underline">
                      {todosLosGeneros ? 'Ver menos' : `Ver todos (${disponibles.length})`}
                    </button>
                  )}
                </div>
                <p className="mt-2 text-sm font-light text-suave">{elegidos.length ? 'Entran los discos de bandas con alguno de estos géneros.' : 'Sin elegir, entran todos.'}</p>
              </fieldset>
            )}
            {elegidos.length > 0 && sinGenero > 0 && (
              <button type="button" onClick={() => navegar('generos')} className="flex min-h-11 w-full items-center gap-2 text-left text-sm text-acento-texto">
                <span className="flex-1">
                  {contarDiscos(sinGenero)} sin género no {sinGenero === 1 ? 'entra' : 'entran'} · Completar géneros
                </span>
                <IconoSiguiente className="size-4" />
              </button>
            )}
            <p className="etiqueta text-sm">{bombo.length ? `Entran ${contarDiscos(bombo.length)}` : 'No hay discos con esos filtros'}</p>
          </section>
        ) : (
          <button type="button" onClick={() => setFiltrosAbiertos(true)} className="flex min-h-11 w-full items-center gap-2 border-b border-metal/40 text-left">
            <span className="etiqueta min-w-0 flex-1 truncate text-xs text-suave">{resumen}</span>
            <IconoSiguiente className="size-4 shrink-0 rotate-90 text-suave" />
          </button>
        )}

        <section className="mt-6">
          {ronda.agotada ? (
            <div className="py-6 text-center">
              <p className="etiqueta text-lg">{bombo.length === 1 ? 'Ya salió el único disco' : `Ya salieron los ${bombo.length}`}</p>
              <Boton className="mt-5" onClick={deNuevo}>
                <IconoDado /> Empezar de nuevo
              </Boton>
            </div>
          ) : actual ? (
            <Revelacion bombo={bombo} elegida={actual} activa={revelando} alTerminar={() => setRevelando(false)}>
              <Resultado bola={actual} banda={bandasPorId.get(actual.banda_id)} ocupado={revelando} onOtro={sortear} />
            </Revelacion>
          ) : (
            <Boton className="min-h-14 w-full text-base" disabled={!bombo.length} onClick={sortear}>
              <IconoDado /> Sortear
            </Boton>
          )}
        </section>
      </main>
    </>
  )
}

function Resultado({ bola, banda, ocupado, onOtro }) {
  const [disco] = bola.discos
  return (
    <article>
      <Tapa disco={disco} className="mx-auto w-full max-w-72" />
      <p className="etiqueta mt-4 text-sm tracking-[0.08em] text-suave">{banda?.nombre}</p>
      <h2 className="mt-1 text-2xl leading-tight font-semibold">{disco.titulo}</h2>
      {disco.anio && <p className="mt-1 font-light text-suave">{disco.anio}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        {bola.discos.map((d) => (
          <BadgeFormato key={d.id} formato={d.formato} />
        ))}
      </div>
      <FilaGeneros generos={banda?.generos} className="mt-2" />

      <a
        href={linkSpotify(disco, banda)}
        target="_blank"
        rel="noopener noreferrer"
        aria-disabled={ocupado}
        className={`etiqueta mt-6 flex min-h-12 items-center justify-center gap-2 rounded-full border border-acento text-sm text-acento-texto active:bg-acento active:text-sobre-acento ${ocupado ? 'pointer-events-none opacity-40' : ''}`}
      >
        <IconoSpotify /> Escuchar en Spotify
      </a>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Boton variante="secundario" disabled={ocupado} onClick={() => navegar(`disco/${disco.id}`)}>
          Ver disco
        </Boton>
        <Boton variante="secundario" disabled={ocupado} onClick={onOtro}>
          <IconoDado /> Otro
        </Boton>
      </div>
    </article>
  )
}

const reducirMovimiento = () => matchMedia('(prefers-reduced-motion: reduce)').matches

// Transición del resultado. El contrato (bombo y bola elegida de antemano, alTerminar cuando se ve la elegida)
// es el que va a usar la batea; por ahora es un fundido breve, y sin transición si se pide reducir el movimiento.
function Revelacion({ elegida, activa, alTerminar, children }) {
  const sinMovimiento = activa && reducirMovimiento()
  useEffect(() => {
    if (sinMovimiento) alTerminar()
  }, [sinMovimiento, elegida.clave]) // eslint-disable-line react-hooks/exhaustive-deps
  // El envoltorio queda siempre, para que el resultado no se vuelva a montar al terminar.
  return (
    <div key={elegida.clave} className={activa && !sinMovimiento ? 'animate-[aparecer_250ms_ease-out]' : ''} onAnimationEnd={alTerminar}>
      {children}
    </div>
  )
}
