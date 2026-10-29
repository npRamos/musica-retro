// Decide si un logo se invierte para leerse sobre el fondo oscuro de la tarjeta.
// pixeles: RGBA (ImageData.data). Oscuro = luminancia media de lo visible (ponderada por alfa) < 0,35,
// y solo si tiene transparencia: un logo con fondo propio se muestra tal cual.
export function debeInvertirse(pixeles) {
  let peso = 0
  let luz = 0
  let opacos = 0
  const total = pixeles.length / 4
  for (let i = 0; i < pixeles.length; i += 4) {
    const alfa = pixeles[i + 3] / 255
    if (alfa === 1) opacos++
    if (!alfa) continue
    const luminancia = (0.2126 * pixeles[i] + 0.7152 * pixeles[i + 1] + 0.0722 * pixeles[i + 2]) / 255
    luz += luminancia * alfa
    peso += alfa
  }
  if (!peso || opacos / total > 0.95) return false
  return luz / peso < 0.35
}
