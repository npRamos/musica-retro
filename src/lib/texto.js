// Minúsculas, sin tildes, espacios colapsados. Espejo de public.normalizar() en la base.
export function normalizar(texto = '') {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

const CONECTORES = new Set([
  'de', 'del', 'la', 'las', 'el', 'los', 'y', 'e', 'o', 'u', 'a', 'al', 'en', 'con', 'por', 'para',
  'un', 'una', 'of', 'the', 'and', 'in', 'on', 'to',
])

const esMayuscula = (s) => s === s.toUpperCase() && s !== s.toLowerCase()

// "divididos por la felicidad" → "Divididos por la Felicidad"; respeta siglas como AC/DC.
export function formatearTitulo(texto = '') {
  const limpio = texto.replace(/\s+/g, ' ').trim()
  if (!limpio) return limpio
  // Todo en mayúsculas con varias palabras ("SODA STEREO") se formatea; una sola palabra ("AC/DC") se respeta.
  const todoMayusculas = limpio.includes(' ') && esMayuscula(limpio.replace(/[^\p{L}]/gu, ''))

  let inicioFrase = true
  return limpio
    .split(' ')
    .map((palabra) => {
      const resultado = formatearPalabra(palabra, inicioFrase, todoMayusculas)
      inicioFrase = /[:.!?]$/.test(palabra)
      return resultado
    })
    .join(' ')
}

function formatearPalabra(palabra, inicioFrase, todoMayusculas) {
  const letras = palabra.replace(/[^\p{L}]/gu, '')
  if (!todoMayusculas && letras.length >= 2 && esMayuscula(letras)) return palabra

  const minusculas = palabra.toLowerCase()
  const nucleo = minusculas.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '')
  if (!inicioFrase && !/^[("¿¡]/.test(palabra) && CONECTORES.has(nucleo)) return minusculas

  return minusculas.replace(/(^|[/\-("¿¡])(\p{L})/gu, (_, separador, letra) => separador + letra.toUpperCase())
}
