import { useState } from 'react'
import { Boton, Dialogo, Encabezado, Vacio } from '../componentes/ui.jsx'
import { IconoBorrar, IconoEditar, IconoSpotify } from '../componentes/Iconos.jsx'
import Carrusel from '../componentes/Carrusel.jsx'
import { ListaTemas } from '../componentes/Temas.jsx'
import { BadgeFormato } from '../componentes/Tarjetas.jsx'
import { linkSpotify } from '../lib/catalogo.js'
import { useCatalogo } from '../lib/catalogoContexto.jsx'
import { mensajeError } from '../lib/errores.js'
import { SLUG_FORMATO, navegar, subir } from '../lib/router.js'

export default function Disco({ id }) {
  const { discos, discosPorId, bandasPorId, online, borrarDisco } = useCatalogo()
  const [confirmando, setConfirmando] = useState(false)
  const [borrando, setBorrando] = useState(false)
  const [error, setError] = useState(null)
  const disco = discosPorId.get(id)
  const banda = disco && bandasPorId.get(disco.banda_id)

  if (!disco) {
    return (
      <>
        <Encabezado titulo="Disco" atras="" />
        <Vacio titulo="No encontramos ese disco">Puede que lo hayas borrado.</Vacio>
      </>
    )
  }

  const rutaBanda = `${SLUG_FORMATO[disco.formato]}/banda/${disco.banda_id}`
  const confirmarBorrado = async () => {
    setBorrando(true)
    // Si era el último de la banda en ese formato, la banda deja de estar en la pestaña.
    const quedanEnBanda = discos.some((d) => d.id !== disco.id && d.banda_id === disco.banda_id && d.formato === disco.formato)
    try {
      await borrarDisco(disco)
      subir(quedanEnBanda ? rutaBanda : SLUG_FORMATO[disco.formato])
    } catch (e) {
      setError(mensajeError(e, 'borrar'))
      setBorrando(false)
      setConfirmando(false)
    }
  }

  return (
    <>
      <Encabezado titulo="Detalle" atras={rutaBanda} />
      <main className="mx-auto max-w-md px-4 pt-4 pb-16">
        <Carrusel disco={disco} />
        <h2 className="mt-5 text-3xl leading-tight font-semibold">{disco.titulo}</h2>
        <button type="button" onClick={() => subir(rutaBanda)} className="etiqueta mt-1 min-h-11 text-left text-lg tracking-[0.08em] text-acento-texto">
          {banda?.nombre}
        </button>

        <dl className="mt-3 divide-y divide-metal/40 border-y border-metal/40">
          <div className="flex min-h-12 items-center justify-between">
            <dt className="etiqueta text-xs text-suave">Formato</dt>
            <dd>
              <BadgeFormato formato={disco.formato} />
            </dd>
          </div>
          {disco.anio && (
            <div className="flex min-h-12 items-center justify-between">
              <dt className="etiqueta text-xs text-suave">Año</dt>
              <dd className="etiqueta text-xl">{disco.anio}</dd>
            </div>
          )}
          <div className="flex min-h-12 items-center justify-between">
            <dt className="etiqueta text-xs text-suave">Copias</dt>
            <dd className="etiqueta text-xl">{disco.copias}</dd>
          </div>
          <div className="flex min-h-12 items-center justify-between">
            <dt className="etiqueta text-xs text-suave">Cargado</dt>
            <dd className="font-light">{new Date(disco.fecha_carga).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}</dd>
          </div>
        </dl>

        {disco.temas?.length > 0 && (
          <section className="mt-6">
            <h3 className="etiqueta text-xs text-suave">Temas</h3>
            <div className="mt-1">
              <ListaTemas temas={disco.temas} />
            </div>
          </section>
        )}

        <a
          href={linkSpotify(disco, banda)}
          target="_blank"
          rel="noopener noreferrer"
          className="etiqueta mt-6 flex min-h-12 items-center justify-center gap-2 rounded-full border border-acento text-sm text-acento-texto active:bg-acento active:text-sobre-acento"
        >
          <IconoSpotify /> Escuchar en Spotify
        </a>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Boton variante="secundario" disabled={!online} onClick={() => navegar(`disco/${disco.id}/editar`)}>
            <IconoEditar /> Editar
          </Boton>
          <Boton variante="peligro" disabled={!online} onClick={() => setConfirmando(true)}>
            <IconoBorrar /> Borrar
          </Boton>
        </div>
        {!online && <p className="mt-3 text-center text-sm font-light text-suave">Sin conexión: solo lectura.</p>}
        {error && <p className="mt-3 text-center text-sm text-acento-texto">{error}</p>}
      </main>

      {confirmando && (
        <Dialogo
          titulo="¿Borrar este disco?"
          alCerrar={() => !borrando && setConfirmando(false)}
          acciones={
            <>
              <Boton variante="fantasma" disabled={borrando} onClick={() => setConfirmando(false)}>
                Cancelar
              </Boton>
              <Boton disabled={borrando} onClick={confirmarBorrado}>
                {borrando ? 'Borrando…' : 'Borrar'}
              </Boton>
            </>
          }
        >
          Se borra “{disco.titulo}” de {banda?.nombre}, con sus {disco.copias} {disco.copias === 1 ? 'copia' : 'copias'} y su tapa.
        </Dialogo>
      )}
    </>
  )
}
