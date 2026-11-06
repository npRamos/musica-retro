import { useMemo } from 'react'
import { ChipAlternable, FilaEstado } from '../componentes/Estado.jsx'
import { IconoSiguiente } from '../componentes/Iconos.jsx'
import { Tapa } from '../componentes/Portadas.jsx'
import { Encabezado, Vacio } from '../componentes/ui.jsx'
import { NOMBRE_FORMATO_SINGULAR, ordenarDiscos } from '../lib/catalogo.js'
import { useCatalogo } from '../lib/catalogoContexto.jsx'
import { discosConEstado, estadoDe, filtrarPorEstado, filtrosDeEstado } from '../lib/estado.js'
import { navegar } from '../lib/router.js'

// Los discos con algún problema, de los dos formatos. El filtro vive en la ruta, para que siga igual al volver de un disco.
export default function Estados({ consulta }) {
  const { discos, bandasPorId } = useCatalogo()
  const conEstado = useMemo(() => ordenarDiscos(discosConEstado(discos), 'az', bandasPorId), [discos, bandasPorId])
  const chips = useMemo(() => filtrosDeEstado(conEstado), [conEstado])
  const pedidos = consulta.get('filtro')?.split(',') ?? []
  const elegidos = pedidos.filter((e) => chips.some((c) => c.valor === e))
  const visibles = filtrarPorEstado(conEstado, elegidos)

  const alternar = (valor) => {
    const nuevos = elegidos.includes(valor) ? elegidos.filter((e) => e !== valor) : [...elegidos, valor]
    navegar(nuevos.length ? `estados?filtro=${nuevos.join(',')}` : 'estados', { reemplazar: true })
  }

  return (
    <>
      <Encabezado titulo="Discos con estado" display={false} atras="ajustes" />
      <main className="mx-auto max-w-md px-4 pt-4 pb-16">
        {conEstado.length ? (
          <>
            <div role="group" aria-label="Filtrar por estado" className="flex flex-wrap gap-2">
              {chips.map((c) => (
                <ChipAlternable key={c.valor} activo={elegidos.includes(c.valor)} onClick={() => alternar(c.valor)}>
                  {c.texto} <span className="font-light opacity-70">{c.cantidad}</span>
                </ChipAlternable>
              ))}
            </div>
            <ul className="mt-3">
              {visibles.map((d) => (
                <li key={d.id}>
                  <button type="button" onClick={() => navegar(`disco/${d.id}`)} className="flex min-h-16 w-full items-center gap-3 border-b border-metal/40 py-3 text-left">
                    <Tapa disco={d} className="w-12 shrink-0" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{d.titulo}</span>
                      <span className="etiqueta block truncate text-xs text-suave">
                        {bandasPorId.get(d.banda_id)?.nombre} · {NOMBRE_FORMATO_SINGULAR[d.formato]}
                      </span>
                      <FilaEstado estado={estadoDe(d)} className="mt-1.5" />
                      {d.observacion && <span className="mt-1.5 block text-sm font-light text-suave">{d.observacion}</span>}
                    </span>
                    <IconoSiguiente className="size-4 shrink-0 text-suave" />
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <Vacio titulo="Ningún disco con estado">Se marca al editar un disco, en “Más datos”.</Vacio>
        )}
      </main>
    </>
  )
}
