import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useCatalogo } from '../lib/catalogoContexto.jsx'
import { normalizar } from '../lib/texto.js'
import { IconoCamara, IconoGaleria } from './Iconos.jsx'
import { Boton } from './ui.jsx'

// Banda con sugerencias de las existentes; si no coincide ninguna, se creará al guardar.
export function CampoBanda({ valor, onChange, error, autoFocus }) {
  const { bandas } = useCatalogo()
  const id = useId()
  const [abierto, setAbierto] = useState(false)
  const q = normalizar(valor)
  const exacta = bandas.find((b) => b.nombre_norm === q)
  const sugerencias = useMemo(
    () => (q ? bandas.filter((b) => b.nombre_norm.includes(q) && b.nombre_norm !== q).slice(0, 6) : []),
    [bandas, q],
  )

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
        aria-expanded={abierto && sugerencias.length > 0}
        aria-controls={`${id}-lista`}
        onChange={(e) => {
          onChange(e.target.value)
          setAbierto(true)
        }}
        onFocus={() => setAbierto(true)}
        onBlur={() => setTimeout(() => setAbierto(false), 150)}
        className="mt-1 block min-h-11 w-full border-0 border-b border-metal bg-transparent px-0 text-lg outline-none focus:border-acento focus-visible:outline-none"
      />
      {error ? (
        <p className="mt-1 text-sm text-acento-texto">{error}</p>
      ) : (
        q && <p className="mt-1 text-sm font-light text-suave">{exacta ? `Ya la tenés: ${exacta.nombre}` : 'Banda nueva: se agrega al guardar'}</p>
      )}
      {abierto && sugerencias.length > 0 && (
        <ul id={`${id}-lista`} role="listbox" className="absolute inset-x-0 top-full z-30 mt-1 border border-metal bg-superficie-solida">
          {sugerencias.map((b) => (
            <li key={b.id} role="option" aria-selected="false">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(b.nombre)
                  setAbierto(false)
                }}
                className="flex min-h-12 w-full items-center border-b border-metal/40 px-3 text-left last:border-0"
              >
                {b.nombre}
              </button>
            </li>
          ))}
        </ul>
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
