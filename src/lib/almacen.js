// Todo lo que se guarda en el dispositivo: preferencias, copia del catálogo e imágenes.
const PREFIJO = 'musica-retro:'
export const CACHE_IMAGENES = 'imagenes'

export function leer(clave, porDefecto = null) {
  try {
    const valor = localStorage.getItem(PREFIJO + clave)
    return valor === null ? porDefecto : JSON.parse(valor)
  } catch {
    return porDefecto
  }
}

export function guardar(clave, valor) {
  try {
    localStorage.setItem(PREFIJO + clave, JSON.stringify(valor))
  } catch {
    // Sin almacenamiento disponible (modo privado o cuota llena): la app sigue funcionando en memoria.
  }
}

export function borrar(clave) {
  try {
    localStorage.removeItem(PREFIJO + clave)
  } catch {
    // idem
  }
}

// La URL firmada cambia en cada sincronización; la clave de caché es la ruta sin el token.
export function claveImagen(url) {
  const u = new URL(url)
  u.search = ''
  return u.href
}

// Descarga en segundo plano las imágenes que faltan y saca las que ya no se usan.
export async function precargarImagenes(urls) {
  if (typeof caches === 'undefined') return
  try {
    const cache = await caches.open(CACHE_IMAGENES)
    const vigentes = new Set(urls.map(claveImagen))
    for (const req of await cache.keys()) {
      if (!vigentes.has(req.url)) await cache.delete(req)
    }

    const faltan = []
    for (const url of urls) {
      if (!(await cache.match(claveImagen(url), { ignoreVary: true }))) faltan.push(url)
    }

    const conServiceWorker = Boolean(navigator.serviceWorker?.controller)
    const trabajador = async () => {
      while (faltan.length) {
        const url = faltan.shift()
        try {
          const res = await fetch(url, { mode: 'cors' })
          // Con service worker, la respuesta ya quedó guardada por su ruta de runtime caching.
          if (res.ok && !conServiceWorker) await cache.put(claveImagen(url), res)
        } catch {
          // Sin red: se reintenta en la próxima sincronización.
        }
      }
    }
    await Promise.all([trabajador(), trabajador(), trabajador(), trabajador()])
  } catch {
    // Cache Storage no disponible.
  }
}

export async function borrarImagenesCacheadas() {
  if (typeof caches === 'undefined') return
  try {
    await caches.delete(CACHE_IMAGENES)
  } catch {
    // idem
  }
}

export async function pedirAlmacenamientoPersistente() {
  try {
    if (navigator.storage?.persist && !(await navigator.storage.persisted())) await navigator.storage.persist()
  } catch {
    // No soportado: el navegador decide.
  }
}
