import { useId, useMemo, useState } from 'react'
import { IconoFormato } from '../componentes/Iconos.jsx'
import { Boton, Encabezado } from '../componentes/ui.jsx'
import { useCatalogo } from '../lib/catalogoContexto.jsx'
import { clasificar, parsearLista } from '../lib/importar.js'
import { navegar } from '../lib/router.js'

const ESTADOS = {
  nuevo: { texto: 'Nuevo', clase: 'text-texto' },
  'banda-nueva': { texto: 'Banda nueva', clase: 'text-acento-texto' },
  existe: { texto: 'Ya lo tenés', clase: 'text-suave' },
}

const EJEMPLO = 'Soda Stereo; Signos; CD\nSumo; After Chabón; vinilo\nLos Piojos; Ay Ay Ay; cd'

export default function Importar() {
  const { bandas, discos, online, importar } = useCatalogo()
  const idTexto = useId()
  const [texto, setTexto] = useState('')
  const [revisando, setRevisando] = useState(false)
  const [sumarDuplicados, setSumarDuplicados] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)
  const [resultado, setResultado] = useState(null)

  const vista = useMemo(() => (revisando ? clasificar(parsearLista(texto), bandas, discos) : null), [revisando, texto, bandas, discos])
  const aGuardar = vista ? vista.items.filter((i) => i.estado !== 'existe' || sumarDuplicados) : []

  const confirmar = async () => {
    setGuardando(true)
    setError(null)
    try {
      setResultado(await importar(aGuardar, sumarDuplicados ? 'sumar' : 'omitir'))
    } catch {
      setError('No se importó nada: hubo un error al guardar. El texto sigue acá para reintentar.')
    } finally {
      setGuardando(false)
    }
  }

  if (resultado) {
    return (
      <>
        <Encabezado titulo="Importar" atras="ajustes" />
        <main className="mx-auto max-w-md px-5 pt-8">
          <p className="etiqueta text-xl tracking-[0.08em]">Listo</p>
          <ul className="mt-4 divide-y divide-metal/40 border-y border-metal/40">
            <Fila etiqueta="Discos agregados" valor={resultado.discos_creados} />
            <Fila etiqueta="Bandas nuevas" valor={resultado.bandas_creadas} />
            <Fila etiqueta="Copias sumadas" valor={resultado.copias_sumadas} />
            <Fila etiqueta="Duplicados omitidos" valor={resultado.omitidos} />
          </ul>
          <Boton className="mt-8 w-full" onClick={() => navegar('', { reemplazar: true })}>
            Ver colección
          </Boton>
        </main>
      </>
    )
  }

  return (
    <>
      <Encabezado titulo="Importar" atras="ajustes" />
      <main className="mx-auto max-w-2xl px-5 pt-6 pb-16">
        {!revisando ? (
          <>
            <label htmlFor={idTexto} className="etiqueta text-xs text-suave">
              Una línea por disco: banda; disco; formato
            </label>
            <textarea
              id={idTexto}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              rows={12}
              placeholder={EJEMPLO}
              spellCheck={false}
              className="mt-2 block w-full resize-y border border-metal bg-superficie p-3 font-mono text-sm leading-relaxed outline-none placeholder:text-suave/50 focus:border-acento"
            />
            <p className="mt-2 text-sm font-light text-suave">
              También podés pegar tres columnas copiadas de una planilla. Formatos: vinilo, lp, v · cd, c.
            </p>
            <Boton className="mt-6 w-full" disabled={!texto.trim()} onClick={() => setRevisando(true)}>
              Revisar
            </Boton>
          </>
        ) : (
          <>
            <dl className="grid grid-cols-2 gap-px border border-metal/50 bg-metal/50 sm:grid-cols-4">
              <Total etiqueta="A agregar" valor={vista.resumen.nuevos} />
              <Total etiqueta="Bandas nuevas" valor={vista.resumen.bandasNuevas} />
              <Total etiqueta="Ya los tenés" valor={vista.resumen.duplicados} />
              <Total etiqueta="Inválidas" valor={vista.resumen.invalidas} />
            </dl>

            {vista.resumen.duplicados > 0 && (
              <label className="mt-5 flex min-h-11 items-center gap-3">
                <input type="checkbox" checked={sumarDuplicados} onChange={(e) => setSumarDuplicados(e.target.checked)} className="size-5 accent-[var(--acento)]" />
                <span>Sumar los que ya tenés como copias</span>
              </label>
            )}

            <ul className="mt-5 border-t border-metal/40">
              {vista.items.map((i) => (
                <li key={`${i.banda}|${i.titulo}|${i.formato}`} className="flex min-h-14 items-center gap-3 border-b border-metal/40 py-2">
                  <IconoFormato formato={i.formato} className="size-5 shrink-0 text-suave" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{i.titulo}</span>
                    <span className="etiqueta block truncate text-xs text-suave">
                      {i.banda}
                      {i.copias > 1 && ` · ${i.copias} copias (líneas ${i.lineas.join(', ')})`}
                    </span>
                  </span>
                  <span className={`etiqueta shrink-0 text-xs ${ESTADOS[i.estado].clase}`}>
                    {i.estado === 'existe' && sumarDuplicados ? `+${i.copias} copia${i.copias > 1 ? 's' : ''}` : ESTADOS[i.estado].texto}
                  </span>
                </li>
              ))}
              {vista.invalidas.map((l) => (
                <li key={`inv-${l.numero}`} className="border-b border-metal/40 py-2">
                  <span className="block truncate font-mono text-sm line-through opacity-60">{l.original}</span>
                  <span className="text-sm text-acento-texto">
                    Línea {l.numero}: {l.error}
                  </span>
                </li>
              ))}
            </ul>

            {error && <p className="mt-4 text-sm text-acento-texto">{error}</p>}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Boton variante="secundario" disabled={guardando} onClick={() => setRevisando(false)}>
                Corregir texto
              </Boton>
              <Boton disabled={guardando || !online || aGuardar.length === 0} onClick={confirmar}>
                {!online ? 'Sin conexión' : guardando ? 'Importando…' : `Importar ${aGuardar.length}`}
              </Boton>
            </div>
          </>
        )}
      </main>
    </>
  )
}

function Total({ etiqueta, valor }) {
  return (
    <div className="bg-fondo p-3">
      <dt className="etiqueta text-[0.7rem] text-suave">{etiqueta}</dt>
      <dd className="etiqueta text-2xl">{valor}</dd>
    </div>
  )
}

function Fila({ etiqueta, valor }) {
  return (
    <li className="flex min-h-12 items-center justify-between">
      <span className="font-light">{etiqueta}</span>
      <span className="etiqueta text-xl">{valor}</span>
    </li>
  )
}
