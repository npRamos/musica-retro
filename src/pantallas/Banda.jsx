import { useMemo, useState } from 'react'
import { AccionesTexto } from '../componentes/Compartir.jsx'
import { Boton, BotonCirculo, Dialogo, Encabezado, Fab, Hoja, Vacio } from '../componentes/ui.jsx'
import { IconoCompartir, IconoEditar, IconoGrilla, IconoLista, IconoMas, IconoOrden } from '../componentes/Iconos.jsx'
import { Grilla, Lista, TarjetaDisco } from '../componentes/Tarjetas.jsx'
import { NOMBRE_FORMATO, ORDENES_BANDA, ordenarDiscos } from '../lib/catalogo.js'
import { useCatalogo } from '../lib/catalogoContexto.jsx'
import { textoBanda } from '../lib/exportar.js'
import { usePreferencias } from '../lib/preferencias.js'
import { SLUG_FORMATO, navegar } from '../lib/router.js'

export default function Banda({ id, formato }) {
  const { bandasPorId, discos, online } = useCatalogo()
  // El orden de esta pantalla es propio (por año por defecto), independiente del de la grilla de bandas.
  const [{ vista, ordenBanda: orden }, cambiar] = usePreferencias()
  const [eligiendoOrden, setEligiendoOrden] = useState(false)
  const [compartiendo, setCompartiendo] = useState(false)
  const banda = bandasPorId.get(id)
  const suyos = useMemo(() => ordenarDiscos(discos.filter((d) => d.banda_id === id && d.formato === formato), orden), [discos, id, formato, orden])

  if (!banda) {
    return (
      <>
        <Encabezado titulo="Banda" atras={SLUG_FORMATO[formato]} />
        <Vacio titulo="No encontramos esa banda">Puede que la hayas unido con otra o borrado.</Vacio>
      </>
    )
  }

  const Contenedor = vista === 'lista' ? Lista : Grilla
  return (
    <>
      <Encabezado
        titulo={banda.nombre}
        display={false}
        subtitulo={`${NOMBRE_FORMATO[formato]} · ${suyos.length} ${suyos.length === 1 ? 'disco' : 'discos'}`}
        atras={SLUG_FORMATO[formato]}
        acciones={
          <>
            <BotonCirculo etiqueta={`Orden: ${ORDENES_BANDA[orden]}`} className="border-transparent" onClick={() => setEligiendoOrden(true)}>
              <IconoOrden />
            </BotonCirculo>
            <BotonCirculo
              etiqueta={vista === 'grilla' ? 'Ver como lista' : 'Ver como cuadrícula'}
              className="border-transparent"
              onClick={() => cambiar('vista', vista === 'grilla' ? 'lista' : 'grilla')}
            >
              {vista === 'grilla' ? <IconoLista /> : <IconoGrilla />}
            </BotonCirculo>
            <BotonCirculo etiqueta="Editar banda" className="border-transparent" disabled={!online} onClick={() => navegar(`banda/${id}/editar`)}>
              <IconoEditar />
            </BotonCirculo>
          </>
        }
      />
      <main className="pb-28">
        {suyos.length ? (
          <Contenedor>
            {suyos.map((d) => (
              <TarjetaDisco key={d.id} disco={d} banda={banda} vista={vista} onClick={() => navegar(`disco/${d.id}`)} />
            ))}
          </Contenedor>
        ) : (
          <Vacio titulo={`Sin ${NOMBRE_FORMATO[formato].toLowerCase()} de ${banda.nombre}`} />
        )}
        <div className="px-4 pt-4">
          <Boton variante="fantasma" className="w-full" onClick={() => setCompartiendo(true)}>
            <IconoCompartir /> Compartir esta banda
          </Boton>
        </div>
      </main>
      {compartiendo && (
        <Dialogo
          titulo={`Compartir ${banda.nombre}`}
          alCerrar={() => setCompartiendo(false)}
          acciones={
            <Boton variante="fantasma" onClick={() => setCompartiendo(false)}>
              Cerrar
            </Boton>
          }
        >
          <pre className="mb-4 max-h-60 overflow-y-auto border border-metal/50 p-3 font-sans text-sm whitespace-pre-wrap">{textoBanda(banda, discos)}</pre>
          <AccionesTexto texto={textoBanda(banda, discos)} />
        </Dialogo>
      )}
      <Fab
        etiqueta={online ? 'Agregar disco de esta banda' : 'Sin conexión'}
        disabled={!online}
        onClick={() => navegar(`agregar?banda=${encodeURIComponent(banda.nombre)}&formato=${formato}`)}
      >
        <IconoMas className="size-7" />
      </Fab>
      {eligiendoOrden && (
        <Hoja
          titulo="Ordenar"
          valor={orden}
          opciones={Object.entries(ORDENES_BANDA).map(([valor, texto]) => ({ valor, texto }))}
          onElegir={(v) => {
            cambiar('ordenBanda', v)
            setEligiendoOrden(false)
          }}
          alCerrar={() => setEligiendoOrden(false)}
        />
      )}
    </>
  )
}
