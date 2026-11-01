import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ralear } from '../lib/indice.js'

// Índice al costado de la lista, como el de Google Fotos: aparece al desplazarse, se esconde solo, tiene una
// manija que se arrastra (con una burbuja de dónde se está) y marcas que se tocan para saltar.
// Las marcas son los elementos con data-marca dentro de `contenido`: se miden en la pantalla, así sirve igual
// en grilla o lista y con cualquier ancho. La barra mapea todo el scroll de la página.

const PANTALLAS = 3 // solo con listas de más de tantas pantallas de alto
const ESCONDER = 1500
const MANIJA = 44 // alto de la manija (y de su zona táctil)
const SEPARACION = 26 // mínimo entre marcas visibles

const recortar = (n) => Math.min(1, Math.max(0, n))

export default function Indice({ contenido, encabezado, version }) {
  const barra = useRef(null)
  const [medidas, setMedidas] = useState(null) // { marcas: [{ texto, top }], arriba, maximo, alto }
  const [scroll, setScroll] = useState(0)
  const [visible, setVisible] = useState(false)
  const [arrastrando, setArrastrando] = useState(false)
  const reloj = useRef(null)
  const agarre = useRef(0)

  // ─── Medir ────────────────────────────────────────────────────────────
  useLayoutEffect(() => {
    const medir = () => {
      const arriba = encabezado.current?.getBoundingClientRect().bottom ?? 0
      const maximo = document.documentElement.scrollHeight - innerHeight
      const marcas = [...(contenido.current?.querySelectorAll('[data-marca]') ?? [])].map((el) => ({
        texto: el.dataset.marca,
        top: el.getBoundingClientRect().top + scrollY - arriba,
      }))
      const largo = document.documentElement.scrollHeight > PANTALLAS * innerHeight && new Set(marcas.map((m) => m.texto)).size >= 2
      // El fondo de la barra lo fija el CSS (arriba del botón +); el tope, el encabezado.
      const alto = (barra.current?.getBoundingClientRect().bottom ?? 0) - (arriba + 12)
      setMedidas(largo ? { marcas, arriba, maximo, alto } : null)
    }
    medir()
    const observador = new ResizeObserver(medir)
    if (contenido.current) observador.observe(contenido.current)
    if (encabezado.current) observador.observe(encabezado.current)
    addEventListener('resize', medir)
    return () => {
      observador.disconnect()
      removeEventListener('resize', medir)
    }
  }, [contenido, encabezado, version])

  // ─── Mostrar al desplazarse ───────────────────────────────────────────
  const programarEscondida = () => {
    clearTimeout(reloj.current)
    reloj.current = setTimeout(() => setVisible(false), ESCONDER)
  }

  useEffect(() => {
    let cuadro = 0
    const alDesplazar = () => {
      cancelAnimationFrame(cuadro)
      cuadro = requestAnimationFrame(() => setScroll(scrollY))
      setVisible(true)
      programarEscondida()
    }
    addEventListener('scroll', alDesplazar, { passive: true })
    return () => {
      removeEventListener('scroll', alDesplazar)
      cancelAnimationFrame(cuadro)
      clearTimeout(reloj.current)
    }
  }, [])

  const clasesBarra = 'pointer-events-none fixed right-2 bottom-[calc(6.5rem+env(safe-area-inset-bottom))] z-10 w-48'
  if (!medidas) return <div ref={barra} aria-hidden="true" className={`${clasesBarra} top-0`} />

  const { marcas, arriba, maximo, alto } = medidas
  const recorrido = Math.max(0, alto - MANIJA)
  const posicion = (top) => recortar(maximo > 0 ? top / maximo : 0) * recorrido
  const actual = marcas.findLast((m) => m.top <= scroll + 1) ?? marcas[0]
  const visibles = ralear(
    marcas.map((m) => ({ ...m, y: posicion(m.top) })),
    SEPARACION,
  )
  const mostrar = visible || arrastrando
  // Escondido no captura toques: el borde derecho queda libre para el gesto de atrás.
  const tocable = mostrar ? 'pointer-events-auto' : ''

  // ─── Arrastrar la manija ──────────────────────────────────────────────
  const irA = (clientY) => {
    const desde = barra.current.getBoundingClientRect().top + agarre.current
    const fraccion = recorrido > 0 ? recortar((clientY - desde) / recorrido) : 0
    scrollTo({ top: fraccion * maximo })
  }
  const empezar = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    agarre.current = e.clientY - e.currentTarget.getBoundingClientRect().top
    clearTimeout(reloj.current)
    setArrastrando(true)
  }
  const mover = (e) => arrastrando && irA(e.clientY)
  const soltar = () => {
    setArrastrando(false)
    programarEscondida()
  }

  const saltar = (top) => {
    scrollTo({ top: Math.min(top, maximo) })
    programarEscondida()
  }

  return (
    <div
      ref={barra}
      aria-hidden={!mostrar}
      style={{ top: arriba + 12 }}
      className={`${clasesBarra} transition-opacity duration-200 motion-reduce:transition-none ${mostrar ? 'opacity-100' : 'opacity-0'}`}
    >
      <nav aria-label="Índice de la lista">
        {visibles.map((m) => (
          <button
            key={`${m.texto}-${m.top}`}
            type="button"
            tabIndex={mostrar ? 0 : -1}
            aria-label={`Ir a ${m.texto}`}
            onClick={() => saltar(m.top)}
            style={{ top: m.y + MANIJA / 2 - 12 }}
            className={`etiqueta ${tocable} absolute right-12 block h-6 min-w-6 max-w-32 truncate text-center border border-metal/60 bg-fondo/85 px-1.5 text-[0.7rem] leading-[1.4rem] ${
              m.texto === actual?.texto ? 'text-acento-texto' : 'text-suave'
            }`}
          >
            {m.texto}
          </button>
        ))}
      </nav>

      <div
        role="slider"
        aria-label="Desplazar la lista"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(recortar(maximo > 0 ? scroll / maximo : 0) * 100)}
        aria-valuetext={actual?.texto}
        tabIndex={-1}
        onPointerDown={empezar}
        onPointerMove={mover}
        onPointerUp={soltar}
        onPointerCancel={soltar}
        style={{ top: posicion(scroll), height: MANIJA }}
        className={`${tocable} absolute right-0 flex w-11 touch-none items-center justify-end pr-1`}
      >
        <span className={`h-10 w-1.5 rounded-full ${arrastrando ? 'bg-acento' : 'bg-acento/80'}`} />
      </div>

      {arrastrando && actual && (
        <p
          style={{ top: posicion(scroll) + MANIJA / 2 }}
          className={`absolute right-24 -translate-y-1/2 border border-acento bg-superficie-solida px-4 py-1.5 whitespace-nowrap ${
            actual.texto.length <= 2 ? 'font-display text-4xl leading-none' : 'etiqueta text-lg'
          }`}
        >
          {actual.texto}
        </p>
      )}
    </div>
  )
}
