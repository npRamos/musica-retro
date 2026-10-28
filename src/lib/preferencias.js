import { useCallback, useSyncExternalStore } from 'react'
import { guardar, leer } from './almacen.js'
import { supabase } from './supabase.js'

// Preferencias por dispositivo, con suscripción para que todas las pantallas se enteren.
const POR_DEFECTO = { tema: 'sistema', acento: 'violeta', vista: 'grilla', orden: 'az', formato: 'vinilo' }
const oyentes = new Set()
let estado = { ...POR_DEFECTO, ...leer('preferencias', {}) }

function aplicarAlDocumento() {
  const raiz = document.documentElement
  if (estado.tema === 'sistema') raiz.removeAttribute('data-theme')
  else raiz.setAttribute('data-theme', estado.tema)
  raiz.setAttribute('data-acento', estado.acento)
}

export function cambiarPreferencia(clave, valor, { sincronizar = true } = {}) {
  if (estado[clave] === valor) return
  estado = { ...estado, [clave]: valor }
  guardar('preferencias', estado)
  aplicarAlDocumento()
  oyentes.forEach((f) => f())
  // El acento acompaña a la cuenta en todos los dispositivos.
  if (clave === 'acento' && sincronizar && supabase) supabase.auth.updateUser({ data: { acento: valor } }).catch(() => {})
}

export function usePreferencias() {
  const valor = useSyncExternalStore(
    (f) => {
      oyentes.add(f)
      return () => oyentes.delete(f)
    },
    () => estado,
  )
  const cambiar = useCallback((clave, v) => cambiarPreferencia(clave, v), [])
  return [valor, cambiar]
}

aplicarAlDocumento()
