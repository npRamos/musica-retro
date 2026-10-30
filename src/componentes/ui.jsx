import { useId, useLayoutEffect, useRef } from 'react'
import { volver } from '../lib/router.js'
import { IconoAtras, IconoGrilla, IconoLista, IconoSiguiente } from './Iconos.jsx'

const VARIANTES = {
  primario: 'bg-acento text-sobre-acento shadow-[3px_3px_0_0_var(--metal)] active:translate-x-px active:translate-y-px active:shadow-[2px_2px_0_0_var(--metal)]',
  secundario: 'border border-metal text-texto active:bg-superficie',
  fantasma: 'text-suave active:text-texto',
  peligro: 'border border-[var(--rojo-texto)] text-[var(--rojo-texto)] active:bg-[var(--rojo)] active:text-sobre-acento',
}

export function Boton({ variante = 'primario', className = '', children, ...props }) {
  return (
    <button
      type="button"
      className={`etiqueta inline-flex min-h-11 items-center justify-center gap-2 rounded-[2px] px-5 text-sm transition-colors disabled:pointer-events-none disabled:opacity-40 ${VARIANTES[variante]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

// Botón circular delineado, como los controles de un reproductor.
export function BotonCirculo({ etiqueta, activo = false, className = '', children, ...props }) {
  return (
    <button
      type="button"
      aria-label={etiqueta}
      title={etiqueta}
      className={`grid size-11 shrink-0 place-items-center rounded-full border transition-colors disabled:opacity-40 ${
        activo ? 'border-acento text-acento-texto' : 'border-metal/70 text-texto active:border-acento'
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function Fab({ etiqueta, children, ...props }) {
  return (
    <button
      type="button"
      aria-label={etiqueta}
      title={etiqueta}
      className="fixed right-5 bottom-[calc(1.25rem+env(safe-area-inset-bottom))] z-30 grid size-16 place-items-center rounded-full border-2 border-acento bg-fondo/85 text-acento-texto transition-colors active:bg-acento active:text-sobre-acento disabled:border-metal disabled:text-suave"
      {...props}
    >
      {children}
    </button>
  )
}

// Encabezado de pantalla interna: atrás + título en blackletter o en condensada.
export function Encabezado({ titulo, subtitulo, atras, display = true, acciones }) {
  return (
    <header className="sticky top-0 z-20 border-b border-metal/50 bg-fondo/92 px-2 pt-[env(safe-area-inset-top)]">
      <div className="flex min-h-16 items-center gap-2">
        <BotonCirculo etiqueta="Volver" className="border-transparent" onClick={() => volver(atras)}>
          <IconoAtras />
        </BotonCirculo>
        <div className="min-w-0 flex-1">
          <h1 className={display ? 'font-display text-3xl leading-none' : 'etiqueta truncate text-xl leading-tight tracking-[0.08em]'}>{titulo}</h1>
          {subtitulo && <p className="mt-0.5 truncate text-sm font-light text-suave">{subtitulo}</p>}
        </div>
        {acciones}
      </div>
    </header>
  )
}

// Controles de la lista, al principio de la lista y sin quedar fijos: el encabezado es para las acciones de la pantalla.
// A la izquierda, cuánto se ve y el orden actual (abre sus opciones); a la derecha, cuadrícula o lista.
export function BarraLista({ cantidad, orden, onOrden, vista, onVista }) {
  return (
    <div className="flex min-h-12 items-center gap-2 border-b border-metal/40 pr-2 pl-4">
      <button type="button" onClick={onOrden} className="flex min-h-11 min-w-0 flex-1 items-center gap-1.5 text-left">
        <span className="etiqueta truncate text-xs">
          <span className="text-suave">{cantidad} ·</span> {orden}
        </span>
        <IconoSiguiente className="size-4 shrink-0 rotate-90 text-suave" />
      </button>
      <BotonCirculo etiqueta={vista === 'grilla' ? 'Ver como lista' : 'Ver como cuadrícula'} className="border-transparent" onClick={onVista}>
        {vista === 'grilla' ? <IconoLista /> : <IconoGrilla />}
      </BotonCirculo>
    </div>
  )
}

export function Campo({ etiqueta, ayuda, error, className = '', ...props }) {
  const id = useId()
  return (
    <div className={className}>
      <label htmlFor={id} className="etiqueta text-xs text-suave">
        {etiqueta}
      </label>
      <input
        id={id}
        className="mt-1 block min-h-11 w-full border-0 border-b border-metal bg-transparent px-0 text-lg outline-none placeholder:text-suave/60 focus:border-acento focus-visible:outline-none"
        {...props}
      />
      {error ? <p className="mt-1 text-sm text-acento-texto">{error}</p> : ayuda && <p className="mt-1 text-sm font-light text-suave">{ayuda}</p>}
    </div>
  )
}

// Selector segmentado (formato, tema, acento…)
export function Segmentado({ etiqueta, opciones, valor, onChange }) {
  return (
    <fieldset>
      <legend className="etiqueta text-xs text-suave">{etiqueta}</legend>
      <div className="mt-2 flex border border-metal">
        {opciones.map((o) => (
          <button
            key={o.valor}
            type="button"
            aria-pressed={valor === o.valor}
            onClick={() => onChange(o.valor)}
            className={`etiqueta flex min-h-11 flex-1 items-center justify-center gap-2 text-sm transition-colors not-last:border-r not-last:border-metal ${
              valor === o.valor ? 'bg-acento text-sobre-acento' : 'text-suave'
            }`}
          >
            {o.icono}
            {o.texto}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

export function Banner({ children, tono = 'suave' }) {
  return (
    <div role="status" className={`border-b border-metal/50 px-4 py-2 text-center text-sm ${tono === 'acento' ? 'text-acento-texto' : 'text-suave'}`}>
      {children}
    </div>
  )
}

// Capa modal sobre <dialog>: Escape y el atrás de Android la cierran sin tocar el historial.
// La pantalla decide si está abierta (la monta o la desmonta); el <dialog> solo avisa cuando se cierra solo.
// Si alCerrar no la cierra (por ejemplo, mientras se borra), la capa sigue abierta.
export function Capa({ etiqueta, alCerrar, className = '', children }) {
  const ref = useRef(null)
  useLayoutEffect(() => {
    // Sin close() en la limpieza: en StrictMode dispararía un close que cerraría la capa recién montada.
    if (!ref.current.open) ref.current.showModal()
  }, [])
  return (
    <dialog
      ref={ref}
      aria-label={etiqueta}
      onCancel={(e) => {
        e.preventDefault()
        alCerrar?.()
      }}
      onClose={() => alCerrar?.()}
      // Tocar el propio <dialog> (y no su contenido) es tocar fuera.
      onClick={(e) => e.target === e.currentTarget && alCerrar?.()}
      className={className}
    >
      {children}
    </dialog>
  )
}

export function Dialogo({ titulo, children, acciones, alCerrar }) {
  return (
    <Capa etiqueta={titulo} alCerrar={alCerrar} className="place-items-center p-4 backdrop:bg-black/70 open:grid">
      <div className="w-full max-w-sm border border-metal bg-superficie-solida p-5">
        <h2 className="etiqueta text-lg tracking-[0.08em]">{titulo}</h2>
        <div className="mt-2 font-light text-suave">{children}</div>
        <div className="mt-5 flex flex-wrap justify-end gap-2">{acciones}</div>
      </div>
    </Capa>
  )
}

// Hoja inferior con opciones (por ejemplo, el orden). Con grupos, varias listas con su título: [{ titulo, opciones, valor, onElegir }].
export function Hoja({ titulo, opciones, valor, onElegir, alCerrar, grupos }) {
  const listas = grupos ?? [{ titulo, opciones, valor, onElegir }]
  return (
    <Capa etiqueta={titulo} alCerrar={alCerrar} className="flex-col justify-end backdrop:bg-black/60 open:flex">
      <div className="max-h-[85vh] w-full overflow-y-auto border-t border-metal bg-superficie-solida pb-[env(safe-area-inset-bottom)]">
        {listas.map((lista) => (
          <div key={lista.titulo}>
            <p className="etiqueta px-5 pt-4 pb-2 text-xs text-suave">{lista.titulo}</p>
            {lista.opciones.map((o) => (
              <button
                key={o.valor}
                type="button"
                onClick={() => lista.onElegir(o.valor)}
                className={`flex min-h-14 w-full items-center justify-between border-t border-metal/40 px-5 text-left text-lg ${
                  lista.valor === o.valor ? 'text-acento-texto' : ''
                }`}
              >
                {o.texto}
                {lista.valor === o.valor && <span className="size-2.5 rounded-full bg-acento" aria-label="elegido" />}
              </button>
            ))}
          </div>
        ))}
      </div>
    </Capa>
  )
}

export function Vacio({ titulo, children }) {
  return (
    <div className="px-6 py-16 text-center">
      <p className="etiqueta text-lg tracking-[0.08em]">{titulo}</p>
      <div className="mt-2 font-light text-suave">{children}</div>
    </div>
  )
}
