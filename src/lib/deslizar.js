import { useRef } from 'react'

// Gesto de deslizar en horizontal, sin nada visible. Lo que está dentro de [data-sin-deslizar] (el carrusel, que tiene
// su propio scroll) o de un <dialog> (React propaga los eventos de las capas a sus padres) no cuenta.

const RECORRIDO = 60 // mínimo en horizontal
const PROPORCION = 1.5 // cuánto más en horizontal que en vertical: un scroll inclinado no cuenta
const BORDE = 24 // los bordes de la pantalla quedan para el gesto de atrás del sistema

// 'siguiente' (hacia la izquierda), 'anterior' (hacia la derecha) o null si el movimiento no cuenta.
export function direccionDeslizar(inicio, fin, ancho) {
  if (inicio.x < BORDE || inicio.x > ancho - BORDE) return null
  const dx = fin.x - inicio.x
  const dy = fin.y - inicio.y
  if (Math.abs(dx) <= RECORRIDO || Math.abs(dx) < PROPORCION * Math.abs(dy)) return null
  return dx < 0 ? 'siguiente' : 'anterior'
}

// Props para el contenedor, que necesita touch-action: pan-y para que el navegador no se quede con el gesto.
export function useDeslizar(alDeslizar) {
  const inicio = useRef(null)
  return {
    onPointerDown: (e) => {
      // Un segundo dedo (pellizcar para hacer zoom) cancela el gesto; con el mouse se selecciona texto.
      const cuenta = e.isPrimary && e.pointerType !== 'mouse' && !e.target.closest('[data-sin-deslizar], dialog')
      inicio.current = cuenta ? { x: e.clientX, y: e.clientY } : null
    },
    onPointerUp: (e) => {
      if (!inicio.current) return
      const direccion = direccionDeslizar(inicio.current, { x: e.clientX, y: e.clientY }, innerWidth)
      inicio.current = null
      if (direccion) alDeslizar(direccion)
    },
    // El navegador tomó el gesto para desplazar la pantalla.
    onPointerCancel: () => {
      inicio.current = null
    },
  }
}
