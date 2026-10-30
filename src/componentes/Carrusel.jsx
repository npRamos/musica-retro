import { useRef, useState } from 'react'
import { useCatalogo } from '../lib/catalogoContexto.jsx'
import { IconoCerrar } from './Iconos.jsx'
import { Imagen, Tapa } from './Portadas.jsx'
import { Capa } from './ui.jsx'

// Tapa y contratapa deslizables; al tocar una imagen se abre en una capa sobre el detalle.
export default function Carrusel({ disco }) {
  const pista = useRef(null)
  const [actual, setActual] = useState(0)
  const [ampliada, setAmpliada] = useState(null)
  const caras = [
    { ruta: disco.tapa_path, nombre: 'Tapa' },
    disco.contratapa_path && { ruta: disco.contratapa_path, nombre: 'Contratapa' },
  ].filter(Boolean)

  const irA = (i) => pista.current?.scrollTo({ left: i * pista.current.clientWidth, behavior: 'smooth' })
  const alDeslizar = () => {
    const el = pista.current
    if (el) setActual(Math.round(el.scrollLeft / el.clientWidth))
  }

  return (
    <div>
      <div
        ref={pista}
        onScroll={alDeslizar}
        className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {caras.map((cara, i) => (
          <button
            key={cara.nombre}
            type="button"
            aria-label={cara.ruta ? `Ampliar ${cara.nombre.toLowerCase()}` : cara.nombre}
            disabled={!cara.ruta}
            onClick={() => setAmpliada(cara)}
            className="w-full shrink-0 snap-center"
          >
            {i === 0 ? (
              <Tapa disco={disco} />
            ) : (
              <div className="relative aspect-square overflow-hidden border border-metal/50 bg-superficie-solida">
                <Imagen ruta={cara.ruta} alt={`Contratapa de ${disco.titulo}`} ajuste="contain" />
              </div>
            )}
          </button>
        ))}
      </div>

      {caras.length > 1 && (
        <div className="mt-3 flex items-center justify-center gap-1">
          {caras.map((cara, i) => (
            <button
              key={cara.nombre}
              type="button"
              aria-label={`Ver ${cara.nombre.toLowerCase()}`}
              aria-current={actual === i}
              onClick={() => irA(i)}
              className="grid size-8 place-items-center"
            >
              <span className={`block size-2.5 rounded-full transition-colors ${actual === i ? 'bg-acento' : 'bg-metal'}`} />
            </button>
          ))}
          <span className="etiqueta ml-2 text-xs text-suave">{caras[actual]?.nombre}</span>
        </div>
      )}

      {ampliada && <Visor cara={ampliada} titulo={disco.titulo} alCerrar={() => setAmpliada(null)} />}
    </div>
  )
}

// Capa sobre el detalle: la imagen entera, y al tocarla, al doble con scroll. Tocar fuera, la ✕ o atrás la cierran.
function Visor({ cara, titulo, alCerrar }) {
  const { urls } = useCatalogo()
  const [ampliada, setAmpliada] = useState(false)
  const nombre = `${cara.nombre} de ${titulo}`

  return (
    <Capa
      etiqueta={nombre}
      alCerrar={alCerrar}
      className={`px-3 pt-[calc(4.5rem+env(safe-area-inset-top))] pb-[calc(3rem+env(safe-area-inset-bottom))] backdrop:bg-black/85 open:flex ${
        ampliada ? 'items-start justify-start' : 'items-center justify-center'
      }`}
    >
      <button
        type="button"
        aria-label="Cerrar"
        onClick={alCerrar}
        className="fixed top-[calc(0.75rem+env(safe-area-inset-top))] right-3 grid size-11 place-items-center rounded-full border border-white/40 bg-black/60 text-white"
      >
        <IconoCerrar />
      </button>
      <img
        src={urls[cara.ruta]}
        alt={nombre}
        crossOrigin="anonymous"
        onClick={() => setAmpliada(!ampliada)}
        className={ampliada ? 'w-[200%] max-w-none shrink-0 cursor-zoom-out' : 'max-h-full max-w-full cursor-zoom-in'}
      />
      <p className="pointer-events-none fixed inset-x-0 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] text-center text-sm font-light text-white/60">
        {ampliada ? 'Tocá la imagen para verla entera' : 'Tocá la imagen para ampliar'}
      </p>
    </Capa>
  )
}
