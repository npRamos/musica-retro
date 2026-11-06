import { ESTADOS_POR_FORMATO, ETIQUETAS, alternarEstado } from '../lib/estado.js'
import { Campo } from './ui.jsx'

// Etiquetas de solo lectura (detalle del disco y "Discos con estado"). Sin etiquetas no muestra nada.
export function FilaEstado({ estado, className = '' }) {
  if (!estado.length) return null
  return (
    <ul aria-label="Estado" className={`flex flex-wrap gap-2 ${className}`}>
      {estado.map((e) => (
        <li key={e} className="etiqueta rounded-full border border-metal/70 px-3 py-1 text-xs text-suave">
          {ETIQUETAS[e]}
        </li>
      ))}
    </ul>
  )
}

// Chip que se activa o desactiva.
export function ChipAlternable({ activo, onClick, children }) {
  return (
    <button
      type="button"
      aria-pressed={activo}
      onClick={onClick}
      className={`etiqueta min-h-11 rounded-full border px-4 text-xs transition-colors ${activo ? 'border-acento text-acento-texto' : 'border-metal/70 text-suave'}`}
    >
      {children}
    </button>
  )
}

// Editor del formulario de un disco: las etiquetas dependen del formato, que puede no estar elegido todavía.
export function EditorEstado({ formato, estado, onEstado, observacion, onObservacion }) {
  return (
    <>
      <fieldset>
        <legend className="etiqueta text-xs text-suave">Estado</legend>
        {formato ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {ESTADOS_POR_FORMATO[formato].map((e) => (
              <ChipAlternable key={e} activo={estado.includes(e)} onClick={() => onEstado(alternarEstado(estado, e))}>
                {ETIQUETAS[e]}
              </ChipAlternable>
            ))}
          </div>
        ) : (
          <p className="mt-1 text-sm font-light text-suave">Elegí vinilo o CD para ver las opciones.</p>
        )}
      </fieldset>
      <Campo etiqueta="Observación (opcional)" maxLength={300} placeholder="Una de las dos copias está rayada" value={observacion} onChange={(e) => onObservacion(e.target.value)} autoComplete="off" />
    </>
  )
}
