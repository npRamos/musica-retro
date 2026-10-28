import { NOMBRE_FORMATO_SINGULAR } from '../lib/catalogo.js'
import { IconoFormato, IconoSiguiente } from './Iconos.jsx'
import { PortadaBanda, Tapa } from './Portadas.jsx'

const textoDiscos = (n) => `${n} ${n === 1 ? 'disco' : 'discos'}`

export function Grilla({ children }) {
  return <ul className="grid grid-cols-2 gap-x-3 gap-y-5 px-4 py-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">{children}</ul>
}

export function Lista({ children }) {
  return <ul className="px-4 py-2">{children}</ul>
}

export function TarjetaBanda({ item, formato, vista, onClick }) {
  const { banda, cantidad, tapas } = item
  if (vista === 'lista') {
    return (
      <li>
        <button type="button" onClick={onClick} className="flex min-h-16 w-full items-center gap-3 border-b border-metal/40 py-2 text-left">
          <div className="w-12 shrink-0">
            <PortadaBanda banda={banda} tapas={tapas.slice(0, 1)} formato={formato} chica />
          </div>
          <span className="etiqueta min-w-0 flex-1 truncate text-lg tracking-[0.06em]">{banda.nombre}</span>
          <span className="text-sm font-light text-suave">{textoDiscos(cantidad)}</span>
          <IconoSiguiente className="size-4 text-suave" />
        </button>
      </li>
    )
  }
  return (
    <li>
      <button type="button" onClick={onClick} className="block w-full text-left">
        <PortadaBanda banda={banda} tapas={tapas} formato={formato} />
        <p className="etiqueta mt-2 truncate text-base tracking-[0.06em]">{banda.nombre}</p>
        <p className="text-sm font-light text-suave">{textoDiscos(cantidad)}</p>
      </button>
    </li>
  )
}

function Copias({ copias }) {
  return <span className={copias > 1 ? 'text-acento-texto' : 'text-suave'}>×{copias}</span>
}

export function TarjetaDisco({ disco, banda, vista, mostrarBanda = false, onClick }) {
  if (vista === 'lista') {
    return (
      <li>
        <button type="button" onClick={onClick} className="flex min-h-16 w-full items-center gap-3 border-b border-metal/40 py-2 text-left">
          <Tapa disco={disco} className="w-12 shrink-0" />
          <span className="min-w-0 flex-1">
            <span className="block truncate font-medium">{disco.titulo}</span>
            {mostrarBanda && <span className="etiqueta block truncate text-xs text-suave">{banda?.nombre}</span>}
          </span>
          <span className="text-sm font-light">
            <Copias copias={disco.copias} />
          </span>
          <IconoSiguiente className="size-4 text-suave" />
        </button>
      </li>
    )
  }
  return (
    <li>
      <button type="button" onClick={onClick} className="block w-full text-left">
        <Tapa disco={disco} />
        <p className="mt-2 line-clamp-2 leading-tight font-medium">{disco.titulo}</p>
        <p className="mt-0.5 flex items-center gap-1.5 text-sm font-light">
          {mostrarBanda ? <span className="etiqueta min-w-0 truncate text-xs text-suave">{banda?.nombre}</span> : null}
          <Copias copias={disco.copias} />
        </p>
      </button>
    </li>
  )
}

export function BadgeFormato({ formato }) {
  return (
    <span className="etiqueta inline-flex items-center gap-1.5 border border-metal px-2 py-1 text-xs">
      <IconoFormato formato={formato} className="size-4" />
      {NOMBRE_FORMATO_SINGULAR[formato]}
    </span>
  )
}
