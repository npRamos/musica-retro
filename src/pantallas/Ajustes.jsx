import { IconoImportar, IconoSalir, IconoSiguiente } from '../componentes/Iconos.jsx'
import { Encabezado, Segmentado } from '../componentes/ui.jsx'
import { useCatalogo } from '../lib/catalogoContexto.jsx'
import { usePreferencias } from '../lib/preferencias.js'
import { navegar } from '../lib/router.js'

const ACENTOS = [
  { valor: 'violeta', texto: 'Violeta Sabbath', muestra: 'var(--violeta)' },
  { valor: 'rojo', texto: 'Rojo sangre', muestra: 'var(--rojo)' },
]

export default function Ajustes({ mail }) {
  const { online, actualizadoEn, sincronizando, sincronizar, cerrarSesion } = useCatalogo()
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
