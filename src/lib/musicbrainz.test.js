import { describe, expect, it } from 'vitest'
import { ErrorMusicBrainz, consultaParcial, crearCliente, datosParaGuardar, esCancelado } from './musicbrainz.js'

const json = (datos, status = 200) => ({ ok: status < 400, status, json: async () => datos, blob: async () => new Blob(['x']) })

// fetch simulado: responde según la URL y registra cuándo se llamó.
function simular(responder) {
  const llamadas = []
  const fetch = async (url, { signal } = {}) => {
    const query = new URL(url).searchParams.get('query')
    llamadas.push({ url: decodeURIComponent(url), query, momento: Date.now() })
    if (signal?.aborted) throw new DOMException('x', 'AbortError')
    return responder(decodeURIComponent(url), signal)
  }
  return { fetch, llamadas }
}

const artistas = { artists: [{ id: 'a1', name: 'Soda Stereo', country: 'AR', score: 100 }] }

describe('consultaParcial', () => {
  it('todas las palabras obligatorias y la última como prefijo', () => {
    expect(consultaParcial('artist', 'Los  Pioj')).toBe('artist:(los AND pioj*)')
    expect(consultaParcial('artist', 'Él Mató')).toBe('artist:(el AND mato*)')
  })
  it('escapa caracteres especiales y no usa prefijo de una letra', () => {
    expect(consultaParcial('artist', 'AC/DC')).toBe('artist:(ac\\/dc*)')
    expect(consultaParcial('artist', 'soda s')).toBe('artist:(soda AND s)')
    expect(consultaParcial('artist', '   ')).toBe('')
  })
})

describe('cola de pedidos', () => {
  it('espacia los pedidos y guarda en caché', async () => {
    const { fetch, llamadas } = simular(() => json(artistas))
    const mb = crearCliente({ fetch, espera: 60 })
    await Promise.all([mb.buscarArtistas('soda'), mb.buscarArtistas('sumo'), mb.buscarArtistas('soda')])
    expect(llamadas).toHaveLength(2)
    expect(llamadas[1].momento - llamadas[0].momento).toBeGreaterThanOrEqual(55)
    expect(llamadas[0].query).toBe('artist:(soda*)')
    expect(llamadas[0].url).toContain('fmt=json')
  })

  it('un pedido cancelado mientras espera no llega a salir', async () => {
    const { fetch, llamadas } = simular(() => json(artistas))
    const mb = crearCliente({ fetch, espera: 80 })
    const control = new AbortController()
    const primero = mb.buscarArtistas('uno')
    const segundo = mb.buscarArtistas('dos', { signal: control.signal })
    control.abort()
    await primero
    const error = await segundo.catch((e) => e)
    expect(esCancelado(error)).toBe(true)
    expect(llamadas).toHaveLength(1)
  })

  it('reintenta una vez si el servidor está ocupado', async () => {
    let veces = 0
    const { fetch } = simular(() => (++veces === 1 ? json({}, 503) : json(artistas)))
    const mb = crearCliente({ fetch, espera: 0, reintento: 10 })
    expect((await mb.buscarArtistas('soda'))[0].nombre).toBe('Soda Stereo')
    expect(veces).toBe(2)
  })

  it('después del reintento, o ante un error de red, avisa que no responde', async () => {
    const ocupado = crearCliente({ fetch: simular(() => json({}, 503)).fetch, espera: 0, reintento: 10 })
    await expect(ocupado.buscarArtistas('soda')).rejects.toBeInstanceOf(ErrorMusicBrainz)
    const sinRed = crearCliente({ fetch: async () => { throw new TypeError('Failed to fetch') }, espera: 0 })
    await expect(sinRed.buscarArtistas('soda')).rejects.toThrow('MusicBrainz no responde')
  })

  it('corta por tiempo', async () => {
    const lento = (url, { signal }) => new Promise((_, rechazar) => signal.addEventListener('abort', () => rechazar(new DOMException('x', 'AbortError'))))
    const mb = crearCliente({ fetch: lento, espera: 0, limite: 20 })
    await expect(mb.buscarArtistas('soda')).rejects.toBeInstanceOf(ErrorMusicBrainz)
  })

  it('una falla no traba la cola', async () => {
    let veces = 0
    const { fetch } = simular(() => (++veces === 1 ? json({}, 500) : json(artistas)))
    const mb = crearCliente({ fetch, espera: 0 })
    await expect(mb.buscarArtistas('uno')).rejects.toBeInstanceOf(ErrorMusicBrainz)
    expect(await mb.buscarArtistas('dos')).toHaveLength(1)
  })
})

describe('consultas', () => {
  it('pagina los discos del artista hasta completar', async () => {
    const pagina = (n, desde) => Array.from({ length: n }, (_, i) => ({ id: `rg${desde + i}`, title: `Disco ${desde + i}`, 'primary-type': 'Album' }))
    const { fetch, llamadas } = simular((url) =>
      json({ 'release-group-count': 130, 'release-groups': url.includes('offset=0') ? pagina(100, 0) : pagina(30, 100) }),
    )
    const mb = crearCliente({ fetch, espera: 0 })
    expect(await mb.discosDeArtista('a1')).toHaveLength(130)
    expect(llamadas).toHaveLength(2)
    expect(llamadas[0].url).toContain('type=album|ep')
  })

  it('busca discos por título y artista enlazado, solo álbumes y EP', async () => {
    const { fetch, llamadas } = simular(() => json({ 'release-groups': [] }))
    const mb = crearCliente({ fetch, espera: 0 })
    await mb.buscarDiscos('Soda Stereo', 'sig', { mbid: 'a1' })
    expect(llamadas[0].query).toBe('releasegroup:(sig*) AND arid:a1 AND (primarytype:album OR primarytype:ep)')
  })

  it('arma el candidato: artista por nombre, disco por título, edición por formato y temas', async () => {
    const { fetch } = simular((url) => {
      if (url.includes('/artist?')) return json(artistas)
      if (url.includes('release-group?artist=a1'))
        return json({ 'release-group-count': 1, 'release-groups': [{ id: 'rg1', title: 'Signos', 'first-release-date': '1986', 'primary-type': 'Album' }] })
      if (url.includes('release?release-group=rg1'))
        return json({
          releases: [
            { id: 'v', date: '1986', country: 'AR', media: [{ format: '12" Vinyl' }], 'cover-art-archive': { front: true, back: false } },
            { id: 'c', date: '1986', country: 'AR', media: [{ format: 'CD' }], 'cover-art-archive': { front: true, back: true } },
          ],
        })
      if (url.includes('release/c?')) return json({ media: [{ position: 1, format: 'CD', tracks: [{ number: '1', title: 'Sin sobresaltos', length: 264000 }] }] })
      throw new Error(`inesperado ${url}`)
    })
    const mb = crearCliente({ fetch, espera: 0 })
    const candidato = await mb.buscarCandidato({ banda: 'soda stereo', titulo: 'SIGNOS', formato: 'cd' })
    expect(candidato.artista).toBe('a1')
    expect(candidato.disco.anio).toBe(1986)
    expect(candidato.edicion.id).toBe('c')
    expect(candidato.temas[0].temas[0].titulo).toBe('Sin sobresaltos')
    expect(datosParaGuardar(candidato)).toEqual({
      banda_mbid: 'a1',
      anio: 1986,
      temas: candidato.temas,
      mb_release_group: 'rg1',
      mb_release: 'c',
    })
  })

  it('sin candidato devuelve null', async () => {
    const { fetch } = simular((url) => json(url.includes('/artist?') ? { artists: [] } : { 'release-groups': [] }))
    const mb = crearCliente({ fetch, espera: 0 })
    expect(await mb.buscarCandidato({ banda: 'Banda Inventada', titulo: 'Nada', formato: 'cd' })).toBeNull()
  })

  it('imágenes de Cover Art Archive: tapa y contratapa en 1200, null si faltan', async () => {
    const { fetch, llamadas } = simular((url) => {
      if (url.endsWith('/release/c'))
        return json({
          images: [
            { front: true, types: ['Front'], image: 'http://x/f.jpg', thumbnails: { 1200: 'http://x/f-1200.jpg' } },
            { front: false, back: false, types: ['Booklet'], image: 'http://x/b.jpg', thumbnails: {} },
          ],
        })
      if (url.endsWith('/release/nada')) return json({}, 404)
      return json(null)
    })
    const mb = crearCliente({ fetch, espera: 0 })
    const { tapa, contratapa } = await mb.imagenesDeEdicion('c')
    expect(tapa).toBeInstanceOf(Blob)
    expect(contratapa).toBeNull()
    expect(llamadas.some((l) => l.url === 'https://x/f-1200.jpg')).toBe(true)
    expect(await mb.imagenesDeEdicion('nada')).toEqual({ tapa: null, contratapa: null })
  })

  it('sin edición elegida no se guardan temas ni release', () => {
    expect(datosParaGuardar({ artista: 'a1', disco: { id: 'rg1', anio: 1986 }, edicion: null, temas: [] })).toEqual({
      banda_mbid: 'a1',
      anio: 1986,
      temas: null,
      mb_release_group: 'rg1',
      mb_release: null,
    })
  })

  it('logo: MusicBrainz → Wikidata → Commons; null si no hay', async () => {
    const { fetch, llamadas } = simular((url) => {
      // Formas recortadas de las respuestas reales (28/10/2026)
      if (url.includes('/artist/maiden?')) return json({ relations: [{ type: 'wikidata', url: { resource: 'https://www.wikidata.org/wiki/Q42482' } }] })
      if (url.includes('/artist/sumo?')) return json({ relations: [{ type: 'wikidata', url: { resource: 'https://www.wikidata.org/wiki/Q632499' } }] })
      if (url.includes('/artist/sin-wikidata?')) return json({ relations: [{ type: 'discogs', url: { resource: 'https://www.discogs.com/artist/1' } }] })
      if (url.endsWith('Q42482.json'))
        return json({ entities: { Q42482: { claims: { P154: [{ rank: 'normal', mainsnak: { datavalue: { value: 'Logo iron maiden.png' } } }] } } } })
      if (url.endsWith('Q632499.json')) return json({ entities: { Q632499: { claims: {} } } })
      if (url.startsWith('https://commons.wikimedia.org/')) return json(null)
      throw new Error(`inesperado ${url}`)
    })
    const mb = crearCliente({ fetch, espera: 0 })
    expect(await mb.logoDeArtista('maiden')).toBeInstanceOf(Blob)
    expect(llamadas.at(-1).url).toBe('https://commons.wikimedia.org/wiki/Special:FilePath/Logo_iron_maiden.png?width=600')
    expect(await mb.logoDeArtista('sumo')).toBeNull()
    expect(await mb.logoDeArtista('sin-wikidata')).toBeNull()
  })
})
