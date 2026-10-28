import { BUCKET, supabase } from './supabase.js'

const PESO_MAXIMO = 900_000 // el bucket acepta hasta 1 MB

function aBlob(canvas, tipo, calidad) {
  return new Promise((resolve) => canvas.toBlob(resolve, tipo, calidad))
}

async function codificar(canvas, calidad) {
  const webp = await aBlob(canvas, 'image/webp', calidad)
  if (webp && webp.type === 'image/webp') return webp
  return aBlob(canvas, 'image/jpeg', calidad)
}

// Tapas: recorte cuadrado centrado a 600 px. Contratapas: sin recorte y hasta 1200 px, para leer los temas.
// Tamaños y calidad pensados para que la colección entre holgada en el plan gratis (~200 KB por disco).
// WebP (o JPEG si el navegador no codifica WebP).
export async function procesarImagen(archivo, { recortar = true, lado = 600, calidad = 0.75 } = {}) {
  const bitmap = await createImageBitmap(archivo, { imageOrientation: 'from-image' })
  let [sx, sy, sw, sh] = [0, 0, bitmap.width, bitmap.height]
  if (recortar) {
    const menor = Math.min(sw, sh)
    ;[sx, sy, sw, sh] = [(sw - menor) / 2, (sh - menor) / 2, menor, menor]
  }
  const escala = Math.min(1, lado / Math.max(sw, sh))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(sw * escala)
  canvas.height = Math.round(sh * escala)
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)
  bitmap.close?.()

  let blob = await codificar(canvas, calidad)
  if (blob && blob.size > PESO_MAXIMO) blob = await codificar(canvas, 0.55)
  if (!blob) throw new Error('No se pudo procesar la imagen')
  return blob
}

// El nombre lleva la fecha: al reemplazar cambia la ruta y ninguna caché muestra la vieja.
export async function subirImagen(uid, tipo, id, blob) {
  const extension = blob.type === 'image/webp' ? 'webp' : 'jpg'
  const ruta = `${uid}/${tipo}/${id}-${Date.now()}.${extension}`
  const { error } = await supabase.storage.from(BUCKET).upload(ruta, blob, {
    contentType: blob.type,
    cacheControl: '31536000',
  })
  if (error) throw error
  return ruta
}

export async function borrarImagenes(rutas) {
  const validas = rutas.filter(Boolean)
  if (!validas.length) return
  await supabase.storage.from(BUCKET).remove(validas)
}

export async function firmarImagenes(rutas) {
  if (!rutas.length) return {}
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrls(rutas, 60 * 60 * 24 * 7)
  if (error) throw error
  const urls = {}
  for (const item of data) if (item.signedUrl && item.path) urls[item.path] = item.signedUrl
  return urls
}
