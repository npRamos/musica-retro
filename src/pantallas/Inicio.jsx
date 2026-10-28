import { useMemo, useState } from 'react'
import { BotonCirculo, Boton, Fab, Hoja, Vacio } from '../componentes/ui.jsx'
import { IconoAjustes, IconoBuscar, IconoCerrar, IconoGrilla, IconoLista, IconoMas, IconoOrden, IconoSiguiente } from '../componentes/Iconos.jsx'
import { Grilla, Lista, TarjetaBanda, TarjetaDisco } from '../componentes/Tarjetas.jsx'
import { FORMATOS, NOMBRE_FORMATO, NOMBRE_FORMATO_SINGULAR, ORDENES, bandasDeFormato, buscar, contarPorFormato, ordenarBandas, ordenarDiscos, otroFormato } from '../lib/catalogo.js'
import { useCatalogo } from '../lib/catalogoContexto.jsx'
import { usePreferencias } from '../lib/preferencias.js'
import { SLUG_FORMATO, navegar } from '../lib/router.js'

export default function Inicio({ formato, busqueda, setBusqueda }) {
  const { bandas, discos, bandasPorId, online, actualizadoEn } = useCatalogo()
  const [prefs, cambiar] = usePreferencias()
  const [eligiendoOrden, setEligiendoOrden] = useState(false)
  const { vista, orden } = prefs

  const cuenta = useMemo(() => contarPorFormato(discos), [discos])
  const items = useMemo(() => ordenarBandas(bandasDeFormato(bandas, discos, formato), orden), [bandas, discos, formato, orden])
  const resultados = useMemo(() => {
    const r = buscar(discos, bandasPorId, busqueda, formato)
    return { ...r, enFormato: ordenarDiscos(r.enFormato, orden, bandasPorId) }
  }, [discos, bandasPorId, busqueda, formato, orden])

  const irAFormato = (f) => {
    cambiar('formato', f)
    navegar(SLUG_FORMATO[f], { reemplazar: true })
  }
  const Contenedor = vista === 'lista' ? Lista : Grilla
  const buscando = busqueda.trim() !== ''

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-metal/50 bg-fondo/92 pt-[env(safe-area-inset-top)]">
        <div className="flex items-center gap-2 px-4 pt-3">
          <h1 className="font-display min-w-0 flex-1 truncate text-[2.1rem] leading-none">Música Retro</h1>
          <BotonCirculo etiqueta={`Orden: ${ORDENES[orden]}`} onClick={() => setEligiendoOrden(true)}>
            <IconoOrden />
          </BotonCirculo>
          <BotonCirculo etiqueta={vista === 'grilla' ? 'Ver como lista' : 'Ver como cuadrícula'} onClick={() => cambiar('vista', vista === 'grilla' ? 'lista' : 'grilla')}>
            {vista === 'grilla' ? <IconoLista /> : <IconoGrilla />}
          </BotonCirculo>
          <BotonCirculo etiqueta="Ajustes" onClick={() => navegar('ajustes')}>
            <IconoAjustes />
          </BotonCirculo>
        </div>

        <label className="mx-4 mt-3 flex min-h-11 items-center gap-2 border-b border-metal focus-within:border-acento">
          <IconoBuscar className="size-5 text-suave" />
          <span className="sr-only">Buscar disco o banda</span>
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar disco o banda…"
            className="min-w-0 flex-1 bg-transparent text-lg outline-none placeholder:font-light placeholder:text-suave/70 [&::-webkit-search-cancel-button]:hidden"
          />
          {buscando && (
            <button type="button" aria-label="Limpiar búsqueda" onClick={() => setBusqueda('')} className="grid size-11 place-items-center text-suave">
              <IconoCerrar />
            </button>
          )}
        </label>

        <nav className="mt-2 flex" aria-label="Formato">
          {FORMATOS.map((f) => (
            <button
              key={f}
              type="button"
              aria-current={f === formato ? 'page' : undefined}
              onClick={() => irAFormato(f)}
              className={`etiqueta min-h-12 flex-1 text-sm transition-colors ${
                f === formato ? 'border-b-[3px] border-acento text-texto' : 'border-b-[3px] border-transparent text-suave'
              }`}
            >
              {NOMBRE_FORMATO[f]} <span className="font-medium opacity-70">{cuenta[f]}</span>
            </button>
          ))}
        </nav>
      </header>

      {!online && (
        <p role="status" className="border-b border-metal/50 px-4 py-2 text-center text-sm text-suave">
          Sin conexión · datos del {actualizadoEn ? new Date(actualizadoEn).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' }) : '—'}
        </p>
      )}

      <main className="pb-28">
        {buscando ? (
          <>
            {resultados.enOtro > 0 && (
              <button
                type="button"
                onClick={() => irAFormato(otroFormato(formato))}
                className="flex min-h-12 w-full items-center justify-between border-b border-metal/50 px-4 text-left text-acento-texto"
              >
                <span>
                  {resultados.enFormato.length === 0 && `No lo tenés en ${NOMBRE_FORMATO_SINGULAR[formato]}. `}
                  También lo tenés en {NOMBRE_FORMATO_SINGULAR[otroFormato(formato)]} ({resultados.enOtro})
                </span>
                <IconoSiguiente className="size-4" />
              </button>
            )}
            {resultados.enFormato.length > 0 ? (
              <Contenedor>
                {resultados.enFormato.map((d) => (
                  <TarjetaDisco key={d.id} disco={d} banda={bandasPorId.get(d.banda_id)} vista={vista} mostrarBanda onClick={() => navegar(`disco/${d.id}`)} />
                ))}
              </Contenedor>
            ) : (
              resultados.enOtro === 0 && (
                <Vacio titulo="No lo tenés">
                  <p>Nada coincide con “{busqueda.trim()}” en tu colección.</p>
                  <Boton
                    className="mt-5"
                    disabled={!online}
                    onClick={() => navegar(`agregar?titulo=${encodeURIComponent(busqueda.trim())}&formato=${formato}`)}
                  >
                    <IconoMas /> Agregarlo
                  </Boton>
                </Vacio>
              )
            )}
          </>
        ) : items.length > 0 ? (
          <Contenedor>
            {items.map((item) => (
              <TarjetaBanda
                key={item.banda.id}
                item={item}
                formato={formato}
                vista={vista}
                onClick={() => navegar(`${SLUG_FORMATO[formato]}/banda/${item.banda.id}`)}
              />
            ))}
          </Contenedor>
        ) : (
          <Vacio titulo={`Todavía no hay ${NOMBRE_FORMATO[formato].toLowerCase()}`}>
            <p>Agregá el primero con el botón + o importá una lista.</p>
            <Boton variante="secundario" className="mt-5" disabled={!online} onClick={() => navegar('importar')}>
              Importar lista
            </Boton>
          </Vacio>
        )}
      </main>

      <Fab etiqueta={online ? 'Agregar disco' : 'Sin conexión'} disabled={!online} onClick={() => navegar(`agregar?formato=${formato}`)}>
        <IconoMas className="size-7" />
      </Fab>

      {eligiendoOrden && (
        <Hoja
          titulo="Ordenar"
          valor={orden}
          opciones={Object.entries(ORDENES).map(([valor, texto]) => ({ valor, texto }))}
          onElegir={(v) => {
            cambiar('orden', v)
            setEligiendoOrden(false)
          }}
          alCerrar={() => setEligiendoOrden(false)}
        />
      )}
    </>
  )
}
