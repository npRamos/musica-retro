import { useState } from 'react'
import { CampoBanda, CampoDisco } from '../componentes/Formulario.jsx'
import { IconoCd, IconoVinilo } from '../componentes/Iconos.jsx'
import { Boton, Encabezado, Segmentado } from '../componentes/ui.jsx'
import { useCatalogo } from '../lib/catalogoContexto.jsx'
import { motivoParaNoAgregar } from '../lib/deseados.js'
import { mensajeError } from '../lib/errores.js'
import { volver } from '../lib/router.js'
import { formatearTitulo, normalizar } from '../lib/texto.js'

const CUALQUIERA = 'cualquiera'
const OPCIONES_FORMATO = [
  { valor: CUALQUIERA, texto: 'Cualquiera' },
  { valor: 'vinilo', texto: 'Vinilo', icono: <IconoVinilo /> },
  { valor: 'cd', texto: 'CD', icono: <IconoCd /> },
]
const MOTIVOS = { 'ya-lo-tenes': 'Ya lo tenés', 'ya-esta': 'Ya está en deseados' }

// Agregar un disco a la lista de deseados. El formato es opcional: si se sabe en cuál se quiere, se elige.
export default function FormDeseado({ bandaInicial = '' }) {
  const { bandas, discos, deseados, online, agregarDeseado } = useCatalogo()
  const [banda, setBanda] = useState(bandaInicial)
  const [titulo, setTitulo] = useState('')
  const [formato, setFormato] = useState(CUALQUIERA)
  const [artistaMb, setArtistaMb] = useState(null) // artista elegido para una banda que no está en el catálogo
  const [discoMb, setDiscoMb] = useState(null)
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState(null)
  const [guardando, setGuardando] = useState(false)

  const bandaLocal = bandas.find((b) => b.nombre_norm === normalizar(banda))
  const artistaElegido = artistaMb && normalizar(artistaMb.nombre) === normalizar(banda) ? artistaMb : null
  const artista = bandaLocal?.mbid ?? artistaElegido?.id ?? null

  const cambiarBanda = (texto) => {
    setBanda(texto)
    setDiscoMb(null)
  }
  // Escribir otro título suelta el disco elegido.
  const cambiarTitulo = (texto) => {
    setTitulo(texto)
    if (discoMb && normalizar(texto) !== normalizar(formatearTitulo(discoMb.titulo))) setDiscoMb(null)
  }
  const elegirDisco = (d) => {
    setDiscoMb(d)
    if (d) setTitulo(formatearTitulo(d.titulo))
  }

  const guardar = async (ev) => {
    ev.preventDefault()
    const e = {}
    if (!banda.trim()) e.banda = 'Falta la banda'
    if (!titulo.trim()) e.titulo = 'Falta el disco'
    setErrores(e)
    if (Object.keys(e).length) return

    const elegido = formato === CUALQUIERA ? null : formato
    setErrorGeneral(null)
    const motivo = motivoParaNoAgregar({ bandaId: bandaLocal?.id ?? null, titulo, formato: elegido }, discos, deseados)
    if (motivo) {
      setErrorGeneral(MOTIVOS[motivo])
      return
    }

    setGuardando(true)
    try {
      const r = await agregarDeseado({
        banda,
        bandaTalCual: Boolean(artistaElegido && !bandaLocal),
        titulo,
        formato: elegido,
        anio: discoMb?.anio ?? null,
        mb_release_group: discoMb?.id ?? null,
        mbid: artista ?? discoMb?.artista?.id ?? null,
      })
      if (r.estado === 'repetido') setErrorGeneral(MOTIVOS['ya-esta'])
      else volver('deseados')
    } catch (err) {
      setErrorGeneral(mensajeError(err))
    } finally {
      setGuardando(false)
    }
  }

  return (
    <>
      <Encabezado titulo="Agregar a deseados" display={false} atras="deseados" />
      <form onSubmit={guardar} className="mx-auto max-w-md space-y-7 px-5 pt-6 pb-16" noValidate>
        <CampoBanda
          valor={banda}
          onChange={cambiarBanda}
          onElegirMb={setArtistaMb}
          enlazada={Boolean(artistaElegido)}
          conMusicbrainz={online}
          error={errores.banda}
          autoFocus={!bandaInicial}
        />
        <CampoDisco valor={titulo} onChange={cambiarTitulo} onElegir={elegirDisco} banda={banda} artista={artista} conMusicbrainz={online} error={errores.titulo} />
        <div>
          <Segmentado etiqueta="Formato" opciones={OPCIONES_FORMATO} valor={formato} onChange={setFormato} />
          <p className="mt-2 text-sm font-light text-suave">{formato === CUALQUIERA ? 'Sirve en vinilo o en CD.' : 'Solo se resuelve al cargarlo en este formato.'}</p>
        </div>
        {errorGeneral && (
          <p role="alert" className="text-sm text-acento-texto">
            {errorGeneral}
          </p>
        )}
        <Boton type="submit" className="w-full" disabled={guardando || !online}>
          {!online ? 'Sin conexión' : guardando ? 'Guardando…' : 'Guardar'}
        </Boton>
      </form>
    </>
  )
}
