import { useMemo, useState } from 'react'
import { SelectorImagen } from '../componentes/Formulario.jsx'
import { IconoFormato, IconoSiguiente } from '../componentes/Iconos.jsx'
import { Imagen } from '../componentes/Portadas.jsx'
import { Boton, Campo, Dialogo, Encabezado, Vacio } from '../componentes/ui.jsx'
import { ordenarDiscos } from '../lib/catalogo.js'
import { useCatalogo } from '../lib/catalogoContexto.jsx'
import { mensajeError } from '../lib/errores.js'
import { usePreferencias } from '../lib/preferencias.js'
import { SLUG_FORMATO, navegar } from '../lib/router.js'

export default function EditarBanda({ id }) {
  const catalogo = useCatalogo()
  const { bandasPorId, discos, online } = catalogo
  const [{ formato }] = usePreferencias()
  const banda = bandasPorId.get(id)
  const [nombre, setNombre] = useState(banda?.nombre ?? '')
  const [imagen, setImagen] = useState(undefined)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)
  const [conflicto, setConflicto] = useState(null)
  const suyos = useMemo(() => ordenarDiscos(discos.filter((d) => d.banda_id === id), 'az'), [discos, id])

  if (!banda) {
    return (
      <>
        <Encabezado titulo="Editar banda" atras="" />
        <Vacio titulo="No encontramos esa banda" />
      </>
    )
  }

  const formatoDestino = suyos.some((d) => d.formato === formato) ? formato : (suyos[0]?.formato ?? formato)
  const irABanda = (bandaId) => navegar(`${SLUG_FORMATO[formatoDestino]}/banda/${bandaId}`, { reemplazar: true })

  const guardar = async (e) => {
    e.preventDefault()
    if (!nombre.trim()) return setError('Falta el nombre')
    setGuardando(true)
    setError(null)
    try {
      if (imagen !== undefined) await catalogo.cambiarImagenBanda(banda, imagen)
      if (nombre.trim() !== banda.nombre) {
        const r = await catalogo.renombrarBanda(banda, nombre)
        if (r.estado === 'conflicto') {
          setConflicto(r.banda)
          return
        }
      }
      irABanda(banda.id)
    } catch (e) {
      setError(mensajeError(e))
    } finally {
      setGuardando(false)
    }
  }

  const unir = async () => {
    setGuardando(true)
    try {
      await catalogo.fusionarBandas(banda, conflicto)
      irABanda(conflicto.id)
    } catch (e) {
      setError(mensajeError(e, 'unir las bandas'))
      setConflicto(null)
    } finally {
      setGuardando(false)
    }
  }

  const discosDelConflicto = conflicto ? discos.filter((d) => d.banda_id === conflicto.id).length : 0

  return (
    <>
      <Encabezado titulo="Editar banda" atras={`${SLUG_FORMATO[formatoDestino]}/banda/${id}`} />
      <form onSubmit={guardar} className="mx-auto max-w-md space-y-7 px-5 pt-6 pb-16" noValidate>
        <Campo
          etiqueta="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          autoComplete="off"
          ayuda="Se guarda exactamente como lo escribas."
        />
        <SelectorImagen
          etiqueta="Imagen de la banda"
          actual={banda.imagen_path ? <Imagen ruta={banda.imagen_path} /> : null}
          valor={imagen}
          onChange={setImagen}
          deshabilitado={guardando}
        />
        {error && <p className="text-sm text-acento-texto">{error}</p>}
        <Boton type="submit" className="w-full" disabled={guardando || !online}>
          {!online ? 'Sin conexión' : guardando ? 'Guardando…' : 'Guardar'}
        </Boton>

        <section>
          <h2 className="etiqueta text-xs text-suave">Sus discos ({suyos.length})</h2>
          <ul className="mt-2 border-t border-metal/40">
            {suyos.map((d) => (
              <li key={d.id}>
                <button type="button" onClick={() => navegar(`disco/${d.id}`)} className="flex min-h-12 w-full items-center gap-3 border-b border-metal/40 text-left">
                  <IconoFormato formato={d.formato} className="size-5 text-suave" />
                  <span className="min-w-0 flex-1 truncate">{d.titulo}</span>
                  <IconoSiguiente className="size-4 text-suave" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      </form>

      {conflicto && (
        <Dialogo
          titulo="Ya existe esa banda"
          alCerrar={() => !guardando && setConflicto(null)}
          acciones={
            <>
              <Boton variante="fantasma" disabled={guardando} onClick={() => setConflicto(null)}>
                Cancelar
              </Boton>
              <Boton disabled={guardando} onClick={unir}>
                {guardando ? 'Uniendo…' : 'Unir las dos'}
              </Boton>
            </>
          }
        >
          Ya tenés «{conflicto.nombre}» ({discosDelConflicto} {discosDelConflicto === 1 ? 'disco' : 'discos'}). Si las unís, los discos de «{banda.nombre}» pasan
          a «{conflicto.nombre}» y los repetidos suman copias.
        </Dialogo>
      )}
    </>
  )
}
