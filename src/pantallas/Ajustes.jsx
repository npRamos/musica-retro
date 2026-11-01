import { useState } from 'react'
import { IconoBuscar, IconoEditar, IconoEtiqueta, IconoImportar, IconoSalir, IconoSiguiente } from '../componentes/Iconos.jsx'
import { CompartirCatalogo } from '../componentes/Compartir.jsx'
import { Encabezado, Segmentado } from '../componentes/ui.jsx'
import { useCatalogo } from '../lib/catalogoContexto.jsx'
import { mensajeError } from '../lib/errores.js'
import { RANGO_GENEROS } from '../lib/generos.js'
import { usePreferencias } from '../lib/preferencias.js'
import { navegar } from '../lib/router.js'

const ACENTOS = [
  { valor: 'violeta', texto: 'Violeta Sabbath', muestra: 'var(--violeta)' },
  { valor: 'rojo', texto: 'Rojo sangre', muestra: 'var(--rojo)' },
]

export default function Ajustes({ mail }) {
  const { bandas, discos, online, actualizadoEn, sincronizando, sincronizar, cerrarSesion, maximoGeneros, ajusteGenerosLeido, cambiarMaximoGeneros } =
    useCatalogo()
  const pendientes = discos.filter((d) => d.mb_estado === 'pendiente').length
  const sinGeneros = bandas.filter((b) => b.generos_estado === 'pendiente').length
  const [prefs, cambiar] = usePreferencias()

  return (
    <>
      <Encabezado titulo="Ajustes" atras="" />
      <main className="mx-auto max-w-md space-y-8 px-5 pt-6 pb-16">
        <Segmentado
          etiqueta="Tema"
          valor={prefs.tema}
          onChange={(v) => cambiar('tema', v)}
          opciones={[
            { valor: 'sistema', texto: 'Sistema' },
            { valor: 'oscuro', texto: 'Escenario' },
            { valor: 'claro', texto: 'Fanzine' },
          ]}
        />

        <fieldset>
          <legend className="etiqueta text-xs text-suave">Color de acento</legend>
          <div className="mt-2 grid grid-cols-2 gap-3">
            {ACENTOS.map((a) => (
              <button
                key={a.valor}
                type="button"
                aria-pressed={prefs.acento === a.valor}
                onClick={() => cambiar('acento', a.valor)}
                className={`flex min-h-14 items-center gap-3 border px-3 text-left ${prefs.acento === a.valor ? 'border-acento' : 'border-metal'}`}
              >
                <span className="size-6 shrink-0 rounded-full" style={{ background: a.muestra }} />
                <span className="etiqueta text-sm">{a.texto}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <div>
          <Segmentado
            etiqueta="Índice al desplazarse"
            valor={prefs.indice}
            onChange={(v) => cambiar('indice', v)}
            opciones={[
              { valor: true, texto: 'Mostrar' },
              { valor: false, texto: 'No mostrar' },
            ]}
          />
          <p className="mt-2 text-sm font-light text-suave">Al costado de las listas largas: letras, géneros o meses para saltar, con una manija para arrastrar.</p>
        </div>

        <GenerosPorBanda
          valor={maximoGeneros}
          onChange={cambiarMaximoGeneros}
          deshabilitado={!online || !ajusteGenerosLeido}
          aviso={!ajusteGenerosLeido ? 'Falta actualizar la base para poder cambiarlo.' : !online ? 'Sin conexión: se cambia con conexión.' : null}
        />

        <CompartirCatalogo />

        <ul className="border-t border-metal/40">
          <li>
            <button
              type="button"
              disabled={!online}
              onClick={() => navegar('importar')}
              className="flex min-h-14 w-full items-center gap-3 border-b border-metal/40 text-left disabled:opacity-40"
            >
              <IconoImportar />
              <span className="flex-1">Importar una lista</span>
              <IconoSiguiente className="size-4 text-suave" />
            </button>
          </li>
          <li>
            <button
              type="button"
              disabled={!online || !pendientes}
              onClick={() => navegar('completar')}
              className="flex min-h-14 w-full items-center gap-3 border-b border-metal/40 text-left disabled:opacity-40"
            >
              <IconoBuscar />
              <span className="flex-1">
                Completar pendientes
                <span className="block text-sm font-light text-suave">
                  {pendientes ? `${pendientes} ${pendientes === 1 ? 'disco' : 'discos'} sin datos de MusicBrainz` : 'Todos completos'}
                </span>
              </span>
              <IconoSiguiente className="size-4 text-suave" />
            </button>
          </li>
          <li>
            <button
              type="button"
              disabled={!online || !sinGeneros}
              onClick={() => navegar('generos')}
              className="flex min-h-14 w-full items-center gap-3 border-b border-metal/40 text-left disabled:opacity-40"
            >
              <IconoEtiqueta />
              <span className="flex-1">
                Completar géneros
                <span className="block text-sm font-light text-suave">
                  {sinGeneros ? `${sinGeneros} ${sinGeneros === 1 ? 'banda' : 'bandas'} sin géneros revisados` : 'Todas revisadas'}
                </span>
              </span>
              <IconoSiguiente className="size-4 text-suave" />
            </button>
          </li>
          <li>
            <button
              type="button"
              disabled={!online || sincronizando}
              onClick={sincronizar}
              className="flex min-h-14 w-full items-center gap-3 border-b border-metal/40 text-left disabled:opacity-60"
            >
              <span className="flex-1">
                Sincronizar ahora
                <span className="block text-sm font-light text-suave">
                  {sincronizando
                    ? 'Sincronizando…'
                    : actualizadoEn
                      ? `Última vez: ${new Date(actualizadoEn).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}`
                      : 'Nunca'}
                  {!online && ' · sin conexión'}
                </span>
              </span>
            </button>
          </li>
          <li>
            <button
              type="button"
              disabled={!online}
              onClick={() => navegar('ajustes/clave')}
              className="flex min-h-14 w-full items-center gap-3 border-b border-metal/40 text-left disabled:opacity-40"
            >
              <IconoEditar />
              <span className="flex-1">Cambiar contraseña</span>
              <IconoSiguiente className="size-4 text-suave" />
            </button>
          </li>
          <li>
            <button type="button" onClick={cerrarSesion} className="flex min-h-14 w-full items-center gap-3 border-b border-metal/40 text-left">
              <IconoSalir />
              <span className="flex-1">
                Cerrar sesión
                <span className="block text-sm font-light text-suave">{mail}</span>
              </span>
            </button>
          </li>
        </ul>
      </main>
    </>
  )
}

// Máximo de géneros por banda: del catálogo, lo ven todos los miembros.
function GenerosPorBanda({ valor, onChange, deshabilitado, aviso }) {
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)
  const opciones = Array.from({ length: RANGO_GENEROS.maximo - RANGO_GENEROS.minimo + 1 }, (_, i) => {
    const n = RANGO_GENEROS.minimo + i
    return { valor: n, texto: String(n) }
  })

  const cambiar = async (n) => {
    if (n === valor) return
    setGuardando(true)
    setError(null)
    try {
      await onChange(n)
    } catch (e) {
      setError(mensajeError(e, 'cambiar el máximo'))
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div>
      <Segmentado etiqueta="Géneros por banda" valor={valor} onChange={cambiar} opciones={opciones} deshabilitado={deshabilitado || guardando} />
      <p className={`mt-2 text-sm ${error ? 'text-acento-texto' : 'font-light text-suave'}`}>
        {error ?? aviso ?? 'Para todo el catálogo. Bajarlo no borra los géneros que ya tienen las bandas.'}
      </p>
    </div>
  )
}
