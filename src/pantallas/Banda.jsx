import { useMemo, useState } from 'react'
import { BotonCirculo, Encabezado, Fab, Hoja, Vacio } from '../componentes/ui.jsx'
import { IconoEditar, IconoGrilla, IconoLista, IconoMas, IconoOrden } from '../componentes/Iconos.jsx'
import { Grilla, Lista, TarjetaDisco } from '../componentes/Tarjetas.jsx'
import { NOMBRE_FORMATO, ORDENES, ordenarDiscos } from '../lib/catalogo.js'
import { useCatalogo } from '../lib/catalogoContexto.jsx'
import { usePreferencias } from '../lib/preferencias.js'
import { SLUG_FORMATO, navegar } from '../lib/router.js'

export default function Banda({ id, formato }) {
  const { bandasPorId, discos, online } = useCatalogo()
  const [{ vista, orden }, cambiar] = usePreferencias()
  const [eligiendoOrden, setEligiendoOrden] = useState(false)
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
            <BotonCirculo etiqueta={`Orden: ${ORDENES[orden]}`} className="border-transparent" onClick={() => setEligiendoOrden(true)}>
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
      </main>
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
