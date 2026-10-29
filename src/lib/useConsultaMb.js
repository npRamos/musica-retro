import { useEffect, useState } from 'react'
import { esCancelado } from './musicbrainz.js'

// Corre consultar(signal) cada vez que cambia la clave (null = no consultar), después de una pausa.
// Cancela la consulta anterior. "ultimos" conserva el resultado previo mientras llega el nuevo.
export function useConsultaMb(clave, consultar, { pausa = 0 } = {}) {
  const [estado, setEstado] = useState({ clave: null, datos: null, error: null })

  useEffect(() => {
    if (clave == null) return
    const control = new AbortController()
    const reloj = setTimeout(async () => {
      try {
        const datos = await consultar(control.signal)
        setEstado({ clave, datos, error: null })
      } catch (e) {
        if (!esCancelado(e)) setEstado({ clave, datos: null, error: e.message || 'MusicBrainz no responde' })
      }
    }, pausa)
    return () => {
      clearTimeout(reloj)
      control.abort()
    }
    // consultar se arma en cada render; la clave resume de qué depende.
  }, [clave]) // eslint-disable-line react-hooks/exhaustive-deps

  const vigente = clave != null && estado.clave === clave
  return {
    datos: vigente ? estado.datos : null,
    ultimos: clave == null ? null : estado.datos,
    error: vigente ? estado.error : null,
    cargando: clave != null && !vigente,
  }
}
