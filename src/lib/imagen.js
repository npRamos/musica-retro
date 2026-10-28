import { BUCKET, supabase } from './supabase.js'

const LADO_MAXIMO = 800

function aBlob(canvas, tipo, calidad) {
  return new Promise((resolve) => canvas.toBlob(resolve, tipo, calidad))
}

// Recorte cuadrado centrado, 800×800 como máximo, WebP (o JPEG si el navegador no codifica WebP).
export async function procesarImagen(archivo) {
  const bitmap = await createImageBitmap(archivo, { imageOrientation: 'from-image' })
  const lado = Math.min(bitmap.width, bitmap.height)
  const salida = Math.min(LADO_MAXIMO, lado)
  const canvas = document.createElement('canvas')
  canvas.width = salida
  canvas.height = salida
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(bitmap, (bitmap.width - lado) / 2, (bitmap.height - lado) / 2, lado, lado, 0, 0, salida, salida)
  bitmap.close?.()

  let blob = await aBlob(canvas, 'image/webp', 0.82)
  if (!blob || blob.type !== 'image/webp') blob = await aBlob(canvas, 'image/jpeg', 0.85)
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
