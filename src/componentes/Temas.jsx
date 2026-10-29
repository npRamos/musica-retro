import { contarTemas, duracion, tituloMedio } from '../lib/discografia.js'

// Lista de temas por medio: número, título y duración. Con varios medios, un subtítulo por cada uno.
export function ListaTemas({ temas }) {
  return (
    <div className="space-y-4">
      {temas.map((medio) => (
        <section key={medio.medio}>
          {tituloMedio(medio, temas.length) && <p className="etiqueta mb-1 text-xs text-suave">{tituloMedio(medio, temas.length)}</p>}
          <ol className="divide-y divide-metal/30">
            {medio.temas.map((t, i) => (
              <li key={`${t.n}-${i}`} className="flex min-h-10 items-baseline gap-3 py-2">
                <span className="etiqueta w-7 shrink-0 text-right text-sm text-suave">{t.n}</span>
                <span className="min-w-0 flex-1">{t.titulo}</span>
                <span className="text-sm font-light text-suave tabular-nums">{duracion(t.ms)}</span>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  )
}

// Plegable "Temas (8)" para los formularios.
export function TemasPlegables({ temas }) {
  if (!temas?.length) return null
  return (
    <details className="border-y border-metal/40">
      <summary className="etiqueta flex min-h-12 cursor-pointer items-center text-sm">Temas ({contarTemas(temas)})</summary>
      <div className="pb-3">
        <ListaTemas temas={temas} />
      </div>
    </details>
  )
}
