import { useMemo, useState } from 'react'
import { IconoBorrar, IconoMas } from '../componentes/Iconos.jsx'
import { Boton, BotonCirculo, Dialogo, Encabezado, Fab, Vacio } from '../componentes/ui.jsx'
import { NOMBRE_FORMATO_SINGULAR } from '../lib/catalogo.js'
import { useCatalogo } from '../lib/catalogoContexto.jsx'
import { ordenarDeseados, rutaCargar } from '../lib/deseados.js'
import { mensajeError } from '../lib/errores.js'
import { navegar } from '../lib/router.js'

// Los discos que se quieren comprar, compartidos entre los miembros. Sin conexión, solo se consultan.
export default function Deseados() {
  const { deseados, bandasPorId, online, quitarDeseado } = useCatalogo()
  const lista = useMemo(() => ordenarDeseados(deseados, bandasPorId), [deseados, bandasPorId])
  const [quitando, setQuitando] = useState(null)
  const [ocupado, setOcupado] = useState(false)
  const [error, setError] = useState(null)

  const confirmar = async () => {
    setOcupado(true)
    setError(null)
    try {
      await quitarDeseado(quitando)
    } catch (e) {
      setError(mensajeError(e, 'quitar'))
    } finally {
      setOcupado(false)
      setQuitando(null)
    }
  }

  return (
    <>
      <Encabezado titulo="Lista de deseados" display={false} atras="ajustes" />
      <main className="mx-auto max-w-md px-4 pt-2 pb-28">
        {!online && <p className="py-2 text-center text-sm font-light text-suave">Sin conexión: solo lectura.</p>}
        {error && <p className="py-2 text-center text-sm text-acento-texto">{error}</p>}
        {lista.length ? (
          <ul>
            {lista.map((d) => {
              const banda = bandasPorId.get(d.banda_id)
              return (
                <li key={d.id} className="flex min-h-16 items-center gap-2 border-b border-metal/40 py-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{d.titulo}</p>
                    <p className="etiqueta truncate text-xs text-suave">
                      {[banda?.nombre, d.formato && NOMBRE_FORMATO_SINGULAR[d.formato]].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <Boton variante="secundario" className="px-3" disabled={!online} onClick={() => navegar(rutaCargar(d, banda))}>
                    Cargar
                  </Boton>
                  <BotonCirculo etiqueta={`Quitar ${d.titulo}`} className="border-transparent" disabled={!online} onClick={() => setQuitando(d)}>
                    <IconoBorrar />
                  </BotonCirculo>
                </li>
              )
            })}
          </ul>
        ) : (
          <Vacio titulo="La lista está vacía">
            <p>Sumá los discos que querés comprar.</p>
            <Boton className="mt-5" disabled={!online} onClick={() => navegar('deseados/agregar')}>
              <IconoMas /> Agregar uno
            </Boton>
          </Vacio>
        )}
      </main>

      {lista.length > 0 && (
        <Fab etiqueta={online ? 'Agregar a deseados' : 'Sin conexión'} disabled={!online} onClick={() => navegar('deseados/agregar')}>
          <IconoMas className="size-7" />
        </Fab>
      )}

      {quitando && (
        <Dialogo
          titulo="¿Quitar de deseados?"
          alCerrar={() => !ocupado && setQuitando(null)}
          acciones={
            <>
              <Boton variante="fantasma" disabled={ocupado} onClick={() => setQuitando(null)}>
                Cancelar
              </Boton>
              <Boton disabled={ocupado} onClick={confirmar}>
                {ocupado ? 'Quitando…' : 'Quitar'}
              </Boton>
            </>
          }
        >
          “{quitando.titulo}” de {bandasPorId.get(quitando.banda_id)?.nombre} deja de estar en la lista.
        </Dialogo>
      )}
    </>
  )
}
