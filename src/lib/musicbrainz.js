import {
  convertirTemas,
  elegirArtista,
  elegirDisco,
  elegirEdicion,
  elegirLogo,
  simplificarArtista,
  simplificarDisco,
  simplificarEdicion,
  simplificarGenero,
} from './discografia.js'
import { normalizar } from './texto.js'

// Cliente de MusicBrainz y Cover Art Archive, directo desde el navegador (los dos permiten CORS, sin clave).
// MusicBrainz admite 1 pedido por segundo: todos sus pedidos pasan por una cola serial.

const MB = 'https://musicbrainz.org/ws/2/'
const CAA = 'https://coverartarchive.org/release/'
const WIKIDATA = 'https://www.wikidata.org/wiki/Special:EntityData/'
// La API de Commons (con origin=*) permite CORS; Special:FilePath no, porque sus redirecciones no lo declaran.
const COMMONS = 'https://commons.wikimedia.org/w/api.php'

export class ErrorMusicBrainz extends Error {
  constructor(mensaje = 'MusicBrainz no responde') {
    super(mensaje)
    this.name = 'ErrorMusicBrainz'
  }
}

export const esCancelado = (e) => e?.name === 'AbortError'
const cancelado = () => new DOMException('Cancelado', 'AbortError')

function dormir(ms, signal) {
  return new Promise((resolver, rechazar) => {
    if (signal?.aborted) return rechazar(cancelado())
    const reloj = setTimeout(resolver, ms)
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(reloj)
        rechazar(cancelado())
      },
      { once: true },
    )
  })
}

const escapar = (palabra) => palabra.replace(/[+\-&|!(){}[\]^"~*?:\\/]/g, '\\$&')

// Signos que separan palabras: con comodín, "ac\/dc*" no encuentra AC/DC y "ac AND dc*" sí.
// Los puntos y apóstrofos quedan dentro de la palabra ("b.b." encuentra a B.B. King; "b AND b" no).
const SEPARADORES = /[/\-&+,:;!?()[\]{}"…]/g

// Lucene: todas las palabras obligatorias y la última como prefijo ("artist:(los AND pioj*)"),
// para encontrar el nombre mientras se escribe. En minúsculas no se confunden con AND/OR.
export function consultaParcial(campo, texto) {
  const palabras = normalizar(texto).replace(SEPARADORES, ' ').split(' ').filter(Boolean).map(escapar)
  if (!palabras.length) return ''
  // Sin comodín solo si toda la búsqueda es una letra suelta (demasiado amplia): "ac AND d*" sí encuentra AC/DC.
  const ultima = palabras.pop()
  palabras.push(ultima.length >= 2 || palabras.length ? `${ultima}*` : ultima)
  return `${campo}:(${palabras.join(' AND ')})`
}

export function crearCliente({ fetch: pedirHttp = (...a) => fetch(...a), espera = 1100, reintento = 2000, limite = 8000 } = {}) {
  let ultimo = 0
  let cola = Promise.resolve()
  const cache = new Map()

  const enCola = (tarea) => {
    const resultado = cola.then(tarea)
    cola = resultado.catch(() => {})
    return resultado
  }

  // fetch con tiempo límite. Distingue la cancelación (al seguir escribiendo) de una falla.
  async function obtener(url, signal, tiempo = limite) {
    const control = new AbortController()
    const cortar = () => control.abort()
    const reloj = setTimeout(cortar, tiempo)
    signal?.addEventListener('abort', cortar, { once: true })
    try {
      return await pedirHttp(url, { signal: control.signal })
    } catch {
      if (signal?.aborted) throw cancelado()
      throw new ErrorMusicBrainz()
    } finally {
      clearTimeout(reloj)
      signal?.removeEventListener('abort', cortar)
    }
  }

  async function pedir(ruta, parametros, signal) {
    const url = `${MB}${ruta}?${new URLSearchParams({ ...parametros, fmt: 'json' })}`
    // Se guarda la promesa: dos pedidos iguales al mismo tiempo comparten una sola llamada.
    if (cache.has(url)) return cache.get(url)
    const datos = enCola(async () => {
      for (let intento = 0; ; intento++) {
        if (signal?.aborted) throw cancelado()
        const falta = ultimo + espera - Date.now()
        if (falta > 0) await dormir(falta, signal)
        ultimo = Date.now()
        const respuesta = await obtener(url, signal)
        if (respuesta.status === 503 && intento === 0) {
          await dormir(reintento, signal)
          continue
        }
        if (!respuesta.ok) throw new ErrorMusicBrainz()
        return respuesta.json()
      }
    })
    cache.set(url, datos)
    datos.catch(() => cache.delete(url))
    return datos
  }

  async function bajarImagen(url, signal) {
    const respuesta = await obtener(url.replace(/^http:/, 'https:'), signal, 20000)
    if (!respuesta.ok) throw new ErrorMusicBrainz('No se pudo bajar la imagen')
    return respuesta.blob()
  }

  const cliente = {
    async buscarArtistas(texto, { signal } = {}) {
      const query = consultaParcial('artist', texto)
      if (!query) return []
      const datos = await pedir('artist', { query, limit: 8 }, signal)
      return datos.artists.map(simplificarArtista)
    },

    // Álbumes y EP de un artista (de a 100, hasta 3 páginas).
    async discosDeArtista(mbid, { signal } = {}) {
      const discos = []
      for (let pagina = 0; pagina < 3; pagina++) {
        const datos = await pedir('release-group', { artist: mbid, type: 'album|ep', limit: 100, offset: pagina * 100 }, signal)
        discos.push(...datos['release-groups'].map(simplificarDisco))
        if (discos.length >= datos['release-group-count'] || !datos['release-groups'].length) break
      }
      return discos
    },

    // Para una banda sin enlazar (o como respaldo): busca por título y banda (o artista conocido).
    async buscarDiscos(banda, titulo, { signal, mbid } = {}) {
      const porTitulo = consultaParcial('releasegroup', titulo)
      if (!porTitulo) return []
      const porArtista = mbid ? `arid:${mbid}` : consultaParcial('artist', banda)
      const query = [porTitulo, porArtista, '(primarytype:album OR primarytype:ep)'].filter(Boolean).join(' AND ')
      const datos = await pedir('release-group', { query, limit: 15 }, signal)
      return datos['release-groups'].map(simplificarDisco)
    },

    async edicionesDeDisco(releaseGroup, { signal } = {}) {
      const datos = await pedir('release', { 'release-group': releaseGroup, inc: 'media', limit: 100 }, signal)
      return datos.releases.map(simplificarEdicion)
    },

    async temasDeEdicion(release, { signal } = {}) {
      return convertirTemas(await pedir(`release/${release}`, { inc: 'recordings' }, signal))
    },

    // Tapa y contratapa en 1200 px como Blob (null si no hay o no se pudo bajar). Fuera de la cola.
    async imagenesDeEdicion(release, { signal } = {}) {
      const respuesta = await obtener(`${CAA}${release}`, signal)
      if (respuesta.status === 404) return { tapa: null, contratapa: null }
      if (!respuesta.ok) throw new ErrorMusicBrainz('Cover Art Archive no responde')
      const { images = [] } = await respuesta.json()
      const url = (img) => img.thumbnails?.['1200'] ?? img.thumbnails?.large ?? img.image
      const bajar = async (img) => {
        if (!img) return null
        try {
          return await bajarImagen(url(img), signal)
        } catch (e) {
          if (esCancelado(e)) throw e
          return null
        }
      }
      const [tapa, contratapa] = await Promise.all([
        bajar(images.find((i) => i.front || i.types?.includes('Front'))),
        bajar(images.find((i) => i.back || i.types?.includes('Back'))),
      ])
      return { tapa, contratapa }
    },

    // Géneros votados del artista: [{ nombre, votos }] (la búsqueda de artistas no los trae).
    async generosDeArtista(mbid, { signal } = {}) {
      const artista = await pedir(`artist/${mbid}`, { inc: 'genres' }, signal)
      return (artista.genres ?? []).map(simplificarGenero)
    },

    // Logo de un artista: MusicBrainz (relación con Wikidata) → Wikidata P154 → miniatura de Commons de ~600 px
    // (PNG aunque el original sea SVG). null si no hay. Solo el pedido a MusicBrainz pasa por la cola.
    async logoDeArtista(mbid, { signal } = {}) {
      const artista = await pedir(`artist/${mbid}`, { inc: 'url-rels' }, signal)
      const enlace = artista.relations?.find((r) => r.type === 'wikidata')?.url?.resource
      const item = enlace?.match(/Q\d+$/)?.[0]
      if (!item) return null
      const respuesta = await obtener(`${WIKIDATA}${item}.json`, signal)
      if (!respuesta.ok) throw new ErrorMusicBrainz('Wikidata no responde')
      const { entities = {} } = await respuesta.json()
      // Si el ítem fue redirigido, la entidad viene con otro id: se toma la única que hay.
      const archivo = elegirLogo(Object.values(entities)[0]?.claims?.P154)
      if (!archivo) return null
      const consulta = new URLSearchParams({
        action: 'query',
        titles: `File:${archivo}`,
        prop: 'imageinfo',
        iiprop: 'url',
        iiurlwidth: '600',
        format: 'json',
        origin: '*',
      })
      const info = await obtener(`${COMMONS}?${consulta}`, signal)
      if (!info.ok) throw new ErrorMusicBrainz('Commons no responde')
      const { query } = await info.json()
      const imagen = Object.values(query?.pages ?? {})[0]?.imageinfo?.[0]
      const url = imagen?.thumburl ?? imagen?.url
      return url ? bajarImagen(url, signal) : null
    },

    // Candidato para un disco ya cargado: artista (enlazado o por nombre), disco por título y edición por formato.
    async buscarCandidato({ banda, titulo, formato, bandaMbid }, { signal } = {}) {
      let artista = bandaMbid ?? elegirArtista(await cliente.buscarArtistas(banda, { signal }), banda)?.id ?? null
      let disco = artista ? elegirDisco(await cliente.discosDeArtista(artista, { signal }), titulo) : null
      if (!disco) disco = elegirDisco(await cliente.buscarDiscos(banda, titulo, { signal, mbid: artista }), titulo, { aproximado: true })
      if (!disco) return null
      artista ??= disco.artista?.id ?? null
      return { artista, disco, ...(await cliente.detalleDeDisco(disco, formato, { signal })) }
    },

    // Ediciones de un disco, la elegida para el formato y sus temas.
    async detalleDeDisco(disco, formato, { signal } = {}) {
      const ediciones = await cliente.edicionesDeDisco(disco.id, { signal })
      const { edicion, coincide } = elegirEdicion(ediciones, formato)
      const temas = edicion ? await cliente.temasDeEdicion(edicion.id, { signal }) : null
      return { ediciones, edicion, coincide, temas }
    },
  }
  return cliente
}

export const musicbrainz = crearCliente()

// Lo que se guarda con el disco (p_datos de agregar_disco / completar_disco).
export function datosParaGuardar({ artista, disco, edicion, temas }) {
  return {
    banda_mbid: artista ?? null,
    anio: disco?.anio ?? null,
    temas: edicion ? (temas ?? null) : null,
    mb_release_group: disco?.id ?? null,
    mb_release: edicion?.id ?? null,
  }
}
