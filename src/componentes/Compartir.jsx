import { useMemo, useState } from 'react'
import { useCatalogo } from '../lib/catalogoContexto.jsx'
import { compartirArchivo } from '../lib/compartir.js'
import { ALCANCES, LIMITE_WHATSAPP, enlaceWhatsapp, generarCsv, nombreArchivo, textoCatalogo } from '../lib/exportar.js'
import { IconoCopiar, IconoMensaje, IconoPlanilla } from './Iconos.jsx'
import { Boton, Segmentado } from './ui.jsx'

// Copiar el texto o abrirlo en WhatsApp para elegir el chat.
export function AccionesTexto({ texto }) {
  const [aviso, setAviso] = useState(null)
  const largo = texto.length > LIMITE_WHATSAPP

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(texto)
      setAviso('Copiado')
    } catch {
      setAviso('No se pudo copiar. Probá de nuevo.')
    }
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        <Boton variante="secundario" onClick={copiar}>
          <IconoCopiar /> Copiar
        </Boton>
        {largo ? (
          <Boton variante="secundario" disabled>
            <IconoMensaje /> WhatsApp
          </Boton>
        ) : (
          <a
            href={enlaceWhatsapp(texto)}
            target="_blank"
            rel="noopener noreferrer"
            className="etiqueta inline-flex min-h-11 items-center justify-center gap-2 rounded-[2px] border border-metal px-5 text-sm text-texto active:bg-superficie"
          >
            <IconoMensaje /> WhatsApp
          </a>
        )}
      </div>
      <p role="status" className="mt-2 min-h-5 text-sm font-light text-suave">
        {largo ? 'Muy largo para un mensaje: usá Copiar o la planilla.' : aviso}
      </p>
    </div>
  )
}

// Ajustes: planilla CSV o texto del catálogo, con alcance Todo / Vinilos / CDs. Funciona sin conexión.
export function CompartirCatalogo() {
  const { discos, bandasPorId } = useCatalogo()
  const [alcance, setAlcance] = useState('todo')
  const [error, setError] = useState(null)
  const texto = useMemo(() => textoCatalogo(discos, bandasPorId, alcance), [discos, bandasPorId, alcance])

  const descargar = async () => {
    setError(null)
    try {
      await compartirArchivo(new File([generarCsv(discos, bandasPorId, alcance)], nombreArchivo(alcance), { type: 'text/csv' }))
    } catch {
      setError('No se pudo compartir la planilla. Probá de nuevo.')
    }
  }

  return (
    <section className="space-y-3">
      <Segmentado
        etiqueta="Compartir el catálogo"
        opciones={Object.entries(ALCANCES).map(([valor, texto]) => ({ valor, texto }))}
        valor={alcance}
        onChange={setAlcance}
      />
      <Boton variante="secundario" className="w-full" disabled={!discos.length} onClick={descargar}>
        <IconoPlanilla /> Planilla para Excel (CSV)
      </Boton>
      {error && <p className="text-sm text-acento-texto">{error}</p>}
      <AccionesTexto texto={texto} />
    </section>
  )
}
