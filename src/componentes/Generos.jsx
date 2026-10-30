import { useId, useMemo, useState } from 'react'
import { useCatalogo } from '../lib/catalogoContexto.jsx'
import {
  MAXIMO_GENEROS,
  agregarGenero,
  generosDelCatalogo,
  limpiarGenero,
  mismoGenero,
  quitarGenero,
  resolverGenero,
  sugerirGeneros,
} from '../lib/generos.js'
import { normalizar } from '../lib/texto.js'
import { Desplegable, Grupo, Opcion } from './Formulario.jsx'
import { IconoCerrar, IconoMas } from './Iconos.jsx'

// Géneros de solo lectura (pantalla de banda). Sin géneros no muestra nada.
export function FilaGeneros({ generos, className = '' }) {
  if (!generos?.length) return null
  return (
    <ul aria-label="Géneros" className={`flex flex-wrap gap-2 ${className}`}>
      {generos.map((g) => (
        <li key={g} className="etiqueta rounded-full border border-metal/70 px-3 py-1 text-xs text-suave">
          {g}
        </li>
      ))}
    </ul>
  )
}

// Editor compartido por "Completar géneros" y Editar banda. valor: los géneros marcados.
// deMusicbrainz: los de MusicBrainz para esta banda, si se trajeron; los no marcados se pueden activar.
// El campo sugiere primero los del catálogo (con cuántas bandas los usan), después los de MusicBrainz,
// y siempre el texto escrito. Todo lo que se agrega toma la forma que ya usa el catálogo.
export function EditorGeneros({ valor, onChange, deMusicbrainz, deshabilitado = false, etiqueta = 'Géneros' }) {
  const { bandas } = useCatalogo()
  const id = useId()
  const [texto, setTexto] = useState('')
  const [abierto, setAbierto] = useState(false)
  const catalogo = useMemo(() => generosDelCatalogo(bandas), [bandas])
  const lleno = valor.length >= MAXIMO_GENEROS

  const marcado = (g) => valor.some((m) => mismoGenero(m, g))
  const activables = (deMusicbrainz ?? []).map((g) => resolverGenero(g, catalogo)).filter((g) => !marcado(g))
  const delCatalogo = sugerirGeneros(catalogo, texto, valor)
  const q = normalizar(texto)
  const deMb = activables.filter((g) => normalizar(g).includes(q) && !delCatalogo.some((c) => mismoGenero(c.nombre, g)))
  const escrito = limpiarGenero(texto)
  const nuevo = escrito && !marcado(escrito) ? escrito : ''

  const agregar = (genero) => {
    onChange(agregarGenero(valor, resolverGenero(genero, catalogo)))
    setTexto('')
    setAbierto(false)
  }

  const hayLista = abierto && !lleno && (delCatalogo.length > 0 || deMb.length > 0 || Boolean(nuevo))

  return (
    <div>
      <p className="etiqueta text-xs text-suave">{etiqueta}</p>
      {valor.length ? (
        <ul className="mt-2 flex flex-wrap gap-2">
          {valor.map((g) => (
            <li key={g} className="etiqueta inline-flex min-h-11 items-center rounded-full border border-acento pl-4 text-sm text-acento-texto">
              {g}
              <button
                type="button"
                aria-label={`Quitar ${g}`}
                disabled={deshabilitado}
                onClick={() => onChange(quitarGenero(valor, g))}
                className="grid size-11 place-items-center disabled:opacity-40"
              >
                <IconoCerrar className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 font-light text-suave">Sin géneros</p>
      )}

      {activables.length > 0 && (
        <>
          <p className="etiqueta mt-4 text-xs text-suave">De MusicBrainz</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {activables.map((g) => (
              <li key={g}>
                <button
                  type="button"
                  disabled={deshabilitado || lleno}
                  onClick={() => agregar(g)}
                  className="etiqueta inline-flex min-h-11 items-center gap-1.5 rounded-full border border-metal/70 px-4 text-sm text-suave active:border-acento disabled:opacity-40"
                >
                  <IconoMas className="size-4" />
                  {g}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="relative mt-4">
        <label htmlFor={id} className="etiqueta text-xs text-suave">
          Agregar género
        </label>
        <input
          id={id}
          value={texto}
          disabled={deshabilitado || lleno}
          placeholder={lleno ? 'Máximo 3' : undefined}
          autoComplete="off"
          role="combobox"
          aria-expanded={hayLista}
          aria-controls={`${id}-lista`}
          onChange={(e) => {
            setTexto(e.target.value)
            setAbierto(true)
          }}
          onFocus={() => setAbierto(true)}
          onBlur={() => setTimeout(() => setAbierto(false), 150)}
          // Enter agrega lo escrito, sin mandar el formulario de Editar banda.
          onKeyDown={(e) => {
            if (e.key !== 'Enter') return
            e.preventDefault()
            if (nuevo) agregar(nuevo)
          }}
          className="mt-1 block min-h-11 w-full border-0 border-b border-metal bg-transparent px-0 text-lg outline-none placeholder:text-suave/60 focus:border-acento focus-visible:outline-none disabled:opacity-60"
        />
        {lleno && <p className="mt-1 text-sm font-light text-suave">Máximo 3. Quitá uno para agregar otro.</p>}
        {hayLista && (
          <Desplegable id={`${id}-lista`}>
            {delCatalogo.length > 0 && <Grupo>En tu catálogo</Grupo>}
            {delCatalogo.map((g) => (
              <Opcion key={g.nombre} onClick={() => agregar(g.nombre)}>
                <span className="min-w-0 flex-1 truncate">{g.nombre}</span>
                <span className="text-sm font-light text-suave">({g.bandas})</span>
              </Opcion>
            ))}
            {deMb.length > 0 && <Grupo>De MusicBrainz</Grupo>}
            {deMb.map((g) => (
              <Opcion key={g} onClick={() => agregar(g)}>
                {g}
              </Opcion>
            ))}
            {nuevo && (
              <Opcion nueva onClick={() => agregar(nuevo)}>
                + Agregar «{nuevo}»
              </Opcion>
            )}
          </Desplegable>
        )}
      </div>
    </div>
  )
}
