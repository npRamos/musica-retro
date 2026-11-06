import { normalizar } from './texto.js'

// Imagen vertical del disco sorteado para compartir, con la misma composición que el final de la batea: la funda
// corrida a la izquierda y el disco asomando a la derecha. Siempre con los colores del tema oscuro, para que se vea
// igual con cualquier tema. Instagram tapa con su interfaz el principio y el final de una historia: ahí no hay nada.

const ANCHO = 1080
const ALTO = 1920
const MARGEN = 80
const LADO = 620 // de la funda
const FUNDA = { x: 94, y: 290 }
const DISCO_X = 342 // el disco asoma por la derecha de la funda
const TEXTOS_Y = 1020

const FONDO = '#0d0c0f'
const SUPERFICIE = '#18161b'
const TEXTO = '#ebe5f0'
const SUAVE = '#9b95a3'
const METAL = '#3d3942'
const BORDE = 'rgb(235 229 240 / 0.28)'
const ACENTO_RESPALDO = '#7a2bd1'

const FUENTES = ['600 44px "Barlow Condensed"', '600 72px "Barlow"', '300 48px "Barlow"', '72px "Pirata One"']
const ESPERA_FUENTES = 1500
const ESPERA_TAPA = 3000

const conTope = (promesa, ms) => Promise.race([promesa, new Promise((listo) => setTimeout(() => listo(null), ms))])

// Recorta con puntos suspensivos lo que no entra en el ancho.
function recortar(linea, medir, ancho) {
  if (medir(linea) <= ancho) return linea
  let corta = linea
  while (corta && medir(`${corta}…`) > ancho) corta = corta.slice(0, -1)
  return `${corta.trimEnd()}…`
}

// Reparte el texto en hasta `maximo` líneas que entren en el ancho; lo que sobra se corta con puntos suspensivos.
export function partirLineas(texto, medir, ancho, maximo) {
  const lineas = []
  let actual = ''
  for (const palabra of texto.trim().split(/\s+/)) {
    const prueba = actual ? `${actual} ${palabra}` : palabra
    if (!actual || medir(prueba) <= ancho) actual = prueba
    else {
      lineas.push(actual)
      actual = palabra
    }
  }
  if (actual) lineas.push(actual)
  if (lineas.length <= maximo) return lineas.map((l) => recortar(l, medir, ancho))
  const visibles = lineas.slice(0, maximo).map((l) => recortar(l, medir, ancho))
  visibles[maximo - 1] = recortar(`${lineas[maximo - 1]}…`, medir, ancho).replace(/…+$/, '…')
  return visibles
}

export function nombreImagen(titulo) {
  const base = normalizar(titulo).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return `musica-retro-${base || 'disco'}.jpg`
}

// Con crossOrigin, como el resto de la app: si no, el canvas queda bloqueado y no se puede exportar.
async function cargarTapa(url) {
  if (!url) return null
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.src = url
  try {
    return (await conTope(img.decode().then(() => img), ESPERA_TAPA)) ?? null
  } catch {
    return null
  }
}

async function cargarFuentes() {
  if (!document.fonts?.load) return
  const cargas = FUENTES.map((f) => document.fonts.load(f).catch(() => {}))
  await conTope(Promise.all(cargas), ESPERA_FUENTES)
}

function circulo(ctx, x, y, r) {
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
}

// Recorte centrado para llenar el cuadrado.
function dibujarTapa(ctx, tapa, x, y, lado) {
  const menor = Math.min(tapa.naturalWidth, tapa.naturalHeight)
  ctx.drawImage(tapa, (tapa.naturalWidth - menor) / 2, (tapa.naturalHeight - menor) / 2, menor, menor, x, y, lado, lado)
}

function dibujarVinilo(ctx, cx, cy, r, tapa, acento) {
  ctx.fillStyle = '#0b0a0c'
  circulo(ctx, cx, cy, r)
  ctx.fill()
  ctx.strokeStyle = '#1d1b21'
  ctx.lineWidth = 2
  for (let surco = r * 0.38; surco < r; surco += 6) {
    circulo(ctx, cx, cy, surco)
    ctx.stroke()
  }
  // Etiqueta con la tapa.
  const etiqueta = r * 0.375
  ctx.save()
  circulo(ctx, cx, cy, etiqueta)
  ctx.clip()
  ctx.fillStyle = acento
  ctx.fillRect(cx - etiqueta, cy - etiqueta, etiqueta * 2, etiqueta * 2)
  if (tapa) dibujarTapa(ctx, tapa, cx - etiqueta, cy - etiqueta, etiqueta * 2)
  ctx.restore()
  ctx.fillStyle = FONDO
  circulo(ctx, cx, cy, r * 0.032)
  ctx.fill()
}

function dibujarCd(ctx, cx, cy, r) {
  const colores = ['#d9dce0', '#8d939b', '#eceef0', '#9aa0a8', '#d9dce0', '#868c94', '#e2e4e7', '#9aa0a8', '#d9dce0']
  let relleno = '#9aa0a8'
  if (ctx.createConicGradient) {
    relleno = ctx.createConicGradient(0, cx, cy)
    colores.forEach((color, i) => relleno.addColorStop(i / (colores.length - 1), color))
  }
  ctx.fillStyle = relleno
  circulo(ctx, cx, cy, r)
  ctx.fill()
  ctx.lineWidth = 2
  ctx.fillStyle = 'rgb(255 255 255 / 0.25)'
  ctx.strokeStyle = 'rgb(0 0 0 / 0.2)'
  circulo(ctx, cx, cy, r * 0.35)
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = FONDO
  ctx.strokeStyle = 'rgb(0 0 0 / 0.3)'
  circulo(ctx, cx, cy, r * 0.125)
  ctx.fill()
  ctx.stroke()
}

function dibujarDisco(ctx, formato, tapa, acento) {
  const r = LADO * 0.48
  const cx = DISCO_X + LADO / 2
  const cy = FUNDA.y + LADO / 2
  if (formato === 'cd') dibujarCd(ctx, cx, cy, r)
  else dibujarVinilo(ctx, cx, cy, r, tapa, acento)
  ctx.strokeStyle = BORDE
  ctx.lineWidth = 2
  circulo(ctx, cx, cy, r)
  ctx.stroke()
}

function dibujarFunda(ctx, tapa, acento) {
  const { x, y } = FUNDA
  ctx.fillStyle = SUPERFICIE
  ctx.fillRect(x, y, LADO, LADO)
  if (tapa) dibujarTapa(ctx, tapa, x, y, LADO)
  else {
    // Sin tapa: el dibujo de un disco, como el ícono del formato.
    ctx.strokeStyle = METAL
    ctx.lineWidth = 8
    circulo(ctx, x + LADO / 2, y + LADO / 2, LADO * 0.25)
    ctx.stroke()
    circulo(ctx, x + LADO / 2, y + LADO / 2, LADO * 0.07)
    ctx.stroke()
  }
  ctx.strokeStyle = acento
  ctx.lineWidth = 3
  ctx.strokeRect(x, y, LADO, LADO)
}

function dibujarTextos(ctx, { banda, titulo, anio }) {
  const ancho = ANCHO - MARGEN * 2
  const medir = (t) => ctx.measureText(t).width
  let y = TEXTOS_Y
  ctx.textAlign = 'left'

  ctx.font = FUENTES[0]
  ctx.letterSpacing = '4px'
  ctx.fillStyle = SUAVE
  ctx.fillText(recortar((banda ?? '').toUpperCase(), medir, ancho), MARGEN, y)
  ctx.letterSpacing = '0px'

  ctx.font = FUENTES[1]
  ctx.fillStyle = TEXTO
  y += 10
  for (const linea of partirLineas(titulo, medir, ancho, 3)) {
    y += 84
    ctx.fillText(linea, MARGEN, y)
  }

  if (anio) {
    ctx.font = FUENTES[2]
    ctx.fillStyle = SUAVE
    y += 70
    ctx.fillText(String(anio), MARGEN, y)
  }

  ctx.font = FUENTES[3]
  ctx.fillStyle = TEXTO
  ctx.fillText('Música Retro', MARGEN, 1530)
}

// Devuelve un File JPEG listo para compartir. urlTapa: la de la tapa; si falta o no carga, usa el dibujo del formato.
export async function generarImagenDisco({ banda, titulo, anio, formato, urlTapa }) {
  const [tapa] = await Promise.all([cargarTapa(urlTapa), cargarFuentes()])
  const canvas = Object.assign(document.createElement('canvas'), { width: ANCHO, height: ALTO })
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingQuality = 'high'
  const acento = getComputedStyle(document.documentElement).getPropertyValue('--acento').trim() || ACENTO_RESPALDO

  ctx.fillStyle = FONDO
  ctx.fillRect(0, 0, ANCHO, ALTO)
  // La luz tenue del color de acento, como el fondo de la app.
  const luz = ctx.createRadialGradient(ANCHO / 2, 600, 0, ANCHO / 2, 600, 900)
  luz.addColorStop(0, acento)
  luz.addColorStop(1, 'transparent')
  ctx.globalAlpha = 0.18
  ctx.fillStyle = luz
  ctx.fillRect(0, 0, ANCHO, ALTO)
  ctx.globalAlpha = 1

  dibujarDisco(ctx, formato, tapa, acento)
  dibujarFunda(ctx, tapa, acento)
  dibujarTextos(ctx, { banda, titulo, anio })

  const blob = await new Promise((listo) => canvas.toBlob(listo, 'image/jpeg', 0.9))
  if (!blob) throw new Error('No se pudo generar la imagen')
  return new File([blob], nombreImagen(titulo), { type: 'image/jpeg' })
}
