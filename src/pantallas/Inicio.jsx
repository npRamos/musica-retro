import { useMemo, useRef, useState } from 'react'
import { BarraLista, BotonCirculo, Boton, Fab, Hoja, Vacio } from '../componentes/ui.jsx'
import { ChipsGeneros } from '../componentes/Generos.jsx'
import Indice from '../componentes/Indice.jsx'
import { IconoAjustes, IconoBuscar, IconoCerrar, IconoDado, IconoMas, IconoSiguiente } from '../componentes/Iconos.jsx'
import { Grilla, Lista, TarjetaBanda, TarjetaDisco } from '../componentes/Tarjetas.jsx'
import {
  AGRUPACIONES,
  FORMATOS,
  NOMBRE_FORMATO,
  NOMBRE_FORMATO_SINGULAR,
  ORDENES,
  SIN_GENERO,
  agruparPorGenero,
  bandasDeFormato,
  buscar,
  chipsDeGeneros,
  contarPorFormato,
  filtrarPorGenero,
  filtrarSecciones,
  generosVigentes,
  ordenarBandas,
  ordenarDiscos,
  otroFormato,
  seVePorGenero,
  seccionesPorOrden,
} from '../lib/catalogo.js'
import { useCatalogo } from '../lib/catalogoContexto.jsx'
import { mismoGenero } from '../lib/generos.js'
import { criterioDe, marcaDe, primerasMarcas } from '../lib/indice.js'
import { usePreferencias } from '../lib/preferencias.js'
import { SLUG_FORMATO, navegar } from '../lib/router.js'

const contar = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`
const ALTO_CHIPS = 69 // la fila de chips: botón de 44 px, márgenes y borde

export default function Inicio({ formato, busqueda, setBusqueda }) {
  const { bandas, discos, bandasPorId, online, actualizadoEn } = useCatalogo()
  const [prefs, cambiar] = usePreferencias()
  const [eligiendoOrden, setEligiendoOrden] = useState(false)
  const encabezado = useRef(null)
  const contenido = useRef(null)
  const { vista, orden, agrupar, generosFiltro } = prefs
  const buscando = busqueda.trim() !== ''

  const cuenta = useMemo(() => contarPorFormato(discos), [discos])
  const items = useMemo(() => ordenarBandas(bandasDeFormato(bandas, discos, formato), orden), [bandas, discos, formato, orden])
  const sueltos = useMemo(
    () => (agrupar === 'discos' ? ordenarDiscos(discos.filter((d) => d.formato === formato), orden, bandasPorId) : []),
    [agrupar, discos, formato, orden, bandasPorId],
  )
  // Lo que se lista (discos sueltos o bandas) y cómo llegar a la banda de cada elemento.
  const sonDiscos = agrupar === 'discos'
  const elementos = sonDiscos ? sueltos : items
  const bandaDe = useMemo(() => (sonDiscos ? (d) => bandasPorId.get(d.banda_id) : (i) => i.banda), [sonDiscos, bandasPorId])

  // Vista por género: chips para filtrar y secciones con título. No aplica al buscar.
  const porGenero = !buscando && seVePorGenero(agrupar, orden)
  const chips = useMemo(() => (porGenero ? chipsDeGeneros(elementos, bandaDe) : []), [porGenero, elementos, bandaDe])
  const elegidos = useMemo(() => generosVigentes(generosFiltro, chips), [generosFiltro, chips])
  const visibles = useMemo(() => filtrarPorGenero(elementos, bandaDe, elegidos), [elementos, bandaDe, elegidos])
  const secciones = useMemo(() => {
    if (!porGenero) return []
    // Agrupada, cada sección ya es un género: adentro, el orden por género se lee como A → Z.
    if (agrupar === 'generos') return filtrarSecciones(agruparPorGenero(orden === 'genero' ? ordenarBandas(items, 'az') : items), elegidos)
    return seccionesPorOrden(visibles, bandaDe, elegidos)
  }, [porGenero, agrupar, orden, items, visibles, bandaDe, elegidos])
  const alternarGenero = (g) =>
    cambiar('generosFiltro', generosFiltro.some((f) => mismoGenero(f, g)) ? generosFiltro.filter((f) => !mismoGenero(f, g)) : [...generosFiltro, g])

  // Marcas del índice al costado: solo en el primer elemento de cada tramo (por género, los títulos).
  const criterio = criterioDe(orden, agrupar)
  const marcasBandas = useMemo(
    () => (criterio ? primerasMarcas(items.map((i) => marcaDe(i.banda, i.ultima, criterio))) : []),
    [items, criterio],
  )
  const marcasSueltos = useMemo(
    () => (criterio ? primerasMarcas(sueltos.map((d) => marcaDe(bandasPorId.get(d.banda_id), d.fecha_carga, criterio))) : []),
    [sueltos, bandasPorId, criterio],
  )
  const resultados = useMemo(() => {
    const r = buscar(discos, bandasPorId, busqueda, formato)
    return { ...r, enFormato: ordenarDiscos(r.enFormato, orden, bandasPorId) }
  }, [discos, bandasPorId, busqueda, formato, orden])

  const irAFormato = (f) => {
    cambiar('formato', f)
    navegar(SLUG_FORMATO[f], { reemplazar: true })
  }
  const Contenedor = vista === 'lista' ? Lista : Grilla
  // La barra cuenta lo que se ve: resultados, discos sueltos o bandas, con el filtro de géneros aplicado.
  const cantidad = buscando
    ? contar(resultados.enFormato.length, 'resultado', 'resultados')
    : sonDiscos && sueltos.length > 0
      ? contar(visibles.length, 'disco', 'discos')
      : contar(sonDiscos ? items.length : visibles.length, 'banda', 'bandas')
  const hayLista = buscando || items.length > 0
  const tarjetaBanda = (item, marca) => (
    <TarjetaBanda
      key={item.banda.id}
      item={item}
      formato={formato}
      vista={vista}
      marca={marca}
      onClick={() => navegar(`${SLUG_FORMATO[formato]}/banda/${item.banda.id}`)}
    />
  )
  const tarjetaDisco = (d, marca) => (
    <TarjetaDisco key={d.id} disco={d} banda={bandasPorId.get(d.banda_id)} vista={vista} mostrarBanda marca={marca} onClick={() => navegar(`disco/${d.id}`)} />
  )

  return (
    <>
      <header ref={encabezado} className="sticky top-0 z-20 border-b border-metal/50 bg-fondo/92 pt-[env(safe-area-inset-top)]">
        <div className="flex items-center gap-2 px-4 pt-3">
          <h1 className="font-display min-w-0 flex-1 truncate text-[2.1rem] leading-none">Música Retro</h1>
          <BotonCirculo etiqueta="Sortear un disco" onClick={() => navegar('sorteo')}>
            <IconoDado />
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

      <main ref={contenido} className="pb-28">
        {hayLista && (
          <BarraLista
            cantidad={cantidad}
            orden={ORDENES[orden]}
            onOrden={() => setEligiendoOrden(true)}
            vista={vista}
            onVista={() => cambiar('vista', vista === 'grilla' ? 'lista' : 'grilla')}
          />
        )}
        {chips.length > 0 && <ChipsGeneros chips={chips} elegidos={elegidos} onAlternar={alternarGenero} />}
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
                {resultados.enFormato.map((d) => tarjetaDisco(d))}
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
        ) : secciones.length > 0 ? (
          secciones.map((s) => (
            <section key={s.genero ?? ''} aria-label={s.genero ?? SIN_GENERO} className="[&:first-of-type>h2]:border-t-0">
              <h2 data-marca={s.genero ?? SIN_GENERO} className="etiqueta mx-4 border-t border-metal/40 pt-5 text-xl tracking-[0.1em]">
                {s.genero ?? SIN_GENERO} <span className="text-base font-light text-suave">{s.items.length}</span>
              </h2>
              <Contenedor>{s.items.map((item) => (sonDiscos ? tarjetaDisco(item) : tarjetaBanda(item)))}</Contenedor>
            </section>
          ))
        ) : sonDiscos && sueltos.length > 0 ? (
          <Contenedor>{sueltos.map((d, i) => tarjetaDisco(d, marcasSueltos[i]))}</Contenedor>
        ) : items.length > 0 ? (
          <Contenedor>{items.map((item, i) => tarjetaBanda(item, marcasBandas[i]))}</Contenedor>
        ) : (
          <Vacio titulo={`Todavía no hay ${NOMBRE_FORMATO[formato].toLowerCase()}`}>
            <p>Agregá el primero con el botón + o importá una lista.</p>
            <Boton variante="secundario" className="mt-5" disabled={!online} onClick={() => navegar('importar')}>
              Importar lista
            </Boton>
          </Vacio>
        )}
      </main>

      {!buscando && prefs.indice && (
        <Indice
          contenido={contenido}
          encabezado={encabezado}
          version={`${formato}|${agrupar}|${orden}|${vista}|${items.length}|${sueltos.length}|${elegidos.join(',')}`}
          extra={chips.length > 0 ? ALTO_CHIPS : 0}
        />
      )}

      <Fab etiqueta={online ? 'Agregar disco' : 'Sin conexión'} disabled={!online} onClick={() => navegar(`agregar?formato=${formato}`)}>
        <IconoMas className="size-7" />
      </Fab>

      {eligiendoOrden && (
        <Hoja
          titulo="Mostrar y ordenar"
          grupos={[
            {
              titulo: 'Mostrar',
              valor: agrupar,
              opciones: Object.entries(AGRUPACIONES).map(([valor, texto]) => ({ valor, texto })),
              onElegir: (v) => {
                cambiar('agrupar', v)
                setEligiendoOrden(false)
              },
            },
            {
              titulo: 'Ordenar',
              valor: orden,
              opciones: Object.entries(ORDENES).map(([valor, texto]) => ({ valor, texto })),
              onElegir: (v) => {
                cambiar('orden', v)
                setEligiendoOrden(false)
              },
            },
          ]}
          alCerrar={() => setEligiendoOrden(false)}
        />
      )}
    </>
  )
}
