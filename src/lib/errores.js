const esSinAcceso = (e) => e?.code === '42501' || /sin acceso al cat[aá]logo|row-level security/i.test(e?.message ?? '')
export const esErrorDeRed = (e) => globalThis.navigator?.onLine === false || /fetch|network|load failed/i.test(e?.message ?? '')

// Mensaje para mostrar ante un error al guardar: distingue permisos, red y el resto.
export function mensajeError(e, accion = 'guardar') {
  if (esSinAcceso(e)) return 'Tu cuenta no está habilitada en el catálogo compartido. Hay que sumarla a los miembros.'
  if (esErrorDeRed(e)) return `Sin conexión: no se pudo ${accion}. Probá de nuevo cuando tengas señal.`
  return `No se pudo ${accion} (${e?.message ?? 'error desconocido'}).`
}
