import { useState } from 'react'
import { tonoDe } from '../lib/catalogo.js'
import { useCatalogo } from '../lib/catalogoContexto.jsx'
import { IconoFormato } from './Iconos.jsx'

// Tonos sobrios para las tarjetas sin imagen: acero, óxido, musgo, ciruela, ceniza.
const TONOS = ['#8a8f98', '#9c5b3a', '#5c6b5a', '#6b5a7a', '#7d7470']

export function Imagen({ ruta, alt = '', className = '' }) {
  const { urls } = useCatalogo()
  const [fallo, setFallo] = useState(false)
  const url = ruta && urls[ruta]
  if (!url || fallo) return null
  return (
    <img
      src={url}
      alt={alt}
      crossOrigin="anonymous"
      loading="lazy"
      decoding="async"
      onError={() => setFallo(true)}
      className={`absolute inset-0 size-full object-cover ${className}`}
    />
  )
}

// Tapa de un disco o, si no tiene, el ícono de su formato.
export function Tapa({ disco, className = '' }) {
  return (
    <div className={`relative aspect-square overflow-hidden border border-metal/50 bg-superficie-solida ${className}`}>
      <div className="absolute inset-0 grid place-items-center text-metal">
        <IconoFormato formato={disco.formato} className="size-1/2" />
      </div>
      <Imagen ruta={disco.tapa_path} alt={`Tapa de ${disco.titulo}`} />
    </div>
  )
}

// El tamaño baja con la palabra más larga, para no cortar nombres a mitad de palabra.
function tamanoNombre(nombre) {
  const larga = Math.max(...nombre.split(/\s+/).map((p) => p.length))
  if (larga <= 7) return 'text-[1.6rem]'
  if (larga <= 9) return 'text-[1.3rem]'
  if (larga <= 12) return 'text-[1.05rem]'
  return 'text-[0.9rem] break-words'
}

// Disposición del mosaico según cuántas tapas hay: 2 mitades, 1 grande + 2, o 2×2.
const MOSAICO = {
  2: { grilla: 'grid-cols-2', celdas: ['', ''] },
  3: { grilla: 'grid-cols-2 grid-rows-2', celdas: ['row-span-2', '', ''] },
  4: { grilla: 'grid-cols-2 grid-rows-2', celdas: ['', '', '', ''] },
}

// Imagen de banda → mosaico de tapas → tarjeta tipográfica.
export function PortadaBanda({ banda, tapas = [], formato, chica = false }) {
  const tono = TONOS[tonoDe(banda.nombre, TONOS.length)]
  const fondoTipografico = { background: `color-mix(in srgb, var(--superficie-solida) 72%, ${tono})` }
  const mosaico = MOSAICO[tapas.length]

  return (
    <div className="relative aspect-square overflow-hidden border border-metal/50" style={fondoTipografico}>
      {!chica && (
        <>
          <IconoFormato formato={formato} className="absolute -right-[22%] -bottom-[22%] size-[85%] text-texto opacity-[0.07]" />
          <div className="absolute inset-0 flex flex-col justify-between p-3">
            <IconoFormato formato={formato} className="size-5 self-end text-suave/70" />
            <p className={`etiqueta line-clamp-4 leading-[0.98] tracking-[0.04em] hyphens-auto ${tamanoNombre(banda.nombre)}`} lang="es">
              {banda.nombre}
            </p>
          </div>
        </>
      )}
      {chica && <p className="etiqueta absolute inset-0 grid place-items-center text-lg">{banda.nombre.slice(0, 1)}</p>}
      {tapas.length === 1 && <Imagen ruta={tapas[0]} />}
      {mosaico && (
        <div className={`absolute inset-0 grid gap-px bg-fondo ${mosaico.grilla}`}>
          {mosaico.celdas.map((clase, i) => (
            <div key={i} className={`relative bg-superficie-solida ${clase}`}>
              <Imagen ruta={tapas[i]} />
            </div>
          ))}
        </div>
      )}
      <Imagen ruta={banda.imagen_path} alt={banda.nombre} />
    </div>
  )
}
