import { useEffect, useMemo, useRef, useState } from 'react'
import { SelectorImagen } from '../componentes/Formulario.jsx'
import { EditorGeneros } from '../componentes/Generos.jsx'
import { IconoFormato, IconoSiguiente } from '../componentes/Iconos.jsx'
import { Imagen } from '../componentes/Portadas.jsx'
import { Boton, Campo, Dialogo, Encabezado, Vacio } from '../componentes/ui.jsx'
import { ordenarDiscos } from '../lib/catalogo.js'
import { useCatalogo } from '../lib/catalogoContexto.jsx'
import { elegirGeneros } from '../lib/discografia.js'
import { mensajeError } from '../lib/errores.js'
import { mismoGenero, mismosGeneros } from '../lib/generos.js'
import { procesarLogo } from '../lib/imagen.js'
import { musicbrainz } from '../lib/musicbrainz.js'
import { usePreferencias } from '../lib/preferencias.js'
import { SLUG_FORMATO, navegar, subir } from '../lib/router.js'

export default function EditarBanda({ id }) {
  const catalogo = useCatalogo()
  const { bandasPorId, discos, online } = catalogo
  const [{ formato }] = usePreferencias()
  const banda = bandasPorId.get(id)
  const [nombre, setNombre] = useState(banda?.nombre ?? '')
  const [imagen, setImagen] = useState(undefined)
  const [logo, setLogo] = useState(undefined) // { blob, invertir } nuevo | null (quitar) | undefined (sin cambios)
  const [generos, setGeneros] = useState(banda?.generos ?? [])
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)
  const [conflicto, setConflicto] = useState(null)
  const suyos = useMemo(() => ordenarDiscos(discos.filter((d) => d.banda_id === id), 'az'), [discos, id])

  if (!banda) {
    return (
      <>
        <Encabezado titulo="Editar banda" atras="" />
        <Vacio titulo="No encontramos esa banda" />
      </>
    )
  }

  const formatoDestino = suyos.some((d) => d.formato === formato) ? formato : (suyos[0]?.formato ?? formato)
  // Vuelve a la banda que se estaba editando; al unir, esa entrada pasa a ser la de la otra banda.
  const irABanda = (bandaId) => subir(`${SLUG_FORMATO[formatoDestino]}/banda/${bandaId}`, { en: `banda/${id}` })

  const guardar = async (e) => {
    e.preventDefault()
    if (!nombre.trim()) return setError('Falta el nombre')
    setGuardando(true)
    setError(null)
    try {
      if (imagen !== undefined) await catalogo.cambiarImagenBanda(banda, imagen)
      if (logo !== undefined) await catalogo.cambiarLogoBanda(banda, logo)
      // Solo si cambiaron: así guardar otra cosa no da por revisados unos géneros pendientes.
      if (!mismosGeneros(generos, banda.generos ?? [])) await catalogo.cambiarGenerosBanda(banda, generos)
      if (nombre.trim() !== banda.nombre) {
        const r = await catalogo.renombrarBanda(banda, nombre)
        if (r.estado === 'conflicto') {
          setConflicto(r.banda)
          return
        }
      }
      irABanda(banda.id)
    } catch (e) {
      setError(mensajeError(e))
    } finally {
      setGuardando(false)
    }
  }

  const unir = async () => {
    setGuardando(true)
    try {
      await catalogo.fusionarBandas(banda, conflicto)
      irABanda(conflicto.id)
    } catch (e) {
      setError(mensajeError(e, 'unir las bandas'))
      setConflicto(null)
    } finally {
      setGuardando(false)
    }
  }

  const discosDelConflicto = conflicto ? discos.filter((d) => d.banda_id === conflicto.id).length : 0

  return (
    <>
      <Encabezado titulo="Editar banda" atras={`${SLUG_FORMATO[formatoDestino]}/banda/${id}`} />
      <form onSubmit={guardar} className="mx-auto max-w-md space-y-7 px-5 pt-6 pb-16" noValidate>
        <Campo
          etiqueta="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          autoComplete="off"
          ayuda="Se guarda exactamente como lo escribas."
        />
        <SelectorGeneros banda={banda} valor={generos} onChange={setGeneros} deshabilitado={guardando} />
        <SelectorImagen
          etiqueta="Imagen de la banda"
          actual={banda.imagen_path ? <Imagen ruta={banda.imagen_path} /> : null}
          valor={imagen}
          onChange={setImagen}
          deshabilitado={guardando}
        />
        <SelectorLogo banda={banda} valor={logo} onChange={setLogo} deshabilitado={guardando} />
        {error && <p className="text-sm text-acento-texto">{error}</p>}
        <Boton type="submit" className="w-full" disabled={guardando || !online}>
          {!online ? 'Sin conexión' : guardando ? 'Guardando…' : 'Guardar'}
        </Boton>

        <section>
          <h2 className="etiqueta text-xs text-suave">Sus discos ({suyos.length})</h2>
          <ul className="mt-2 border-t border-metal/40">
            {suyos.map((d) => (
              <li key={d.id}>
                <button type="button" onClick={() => navegar(`disco/${d.id}`)} className="flex min-h-12 w-full items-center gap-3 border-b border-metal/40 text-left">
                  <IconoFormato formato={d.formato} className="size-5 text-suave" />
                  <span className="min-w-0 flex-1 truncate">{d.titulo}</span>
                  <IconoSiguiente className="size-4 text-suave" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      </form>

      {conflicto && (
        <Dialogo
          titulo="Ya existe esa banda"
          alCerrar={() => !guardando && setConflicto(null)}
          acciones={
            <>
              <Boton variante="fantasma" disabled={guardando} onClick={() => setConflicto(null)}>
                Cancelar
              </Boton>
              <Boton disabled={guardando} onClick={unir}>
                {guardando ? 'Uniendo…' : 'Unir las dos'}
              </Boton>
            </>
          }
        >
          Ya tenés «{conflicto.nombre}» ({discosDelConflicto} {discosDelConflicto === 1 ? 'disco' : 'discos'}). Si las unís, los discos de «{banda.nombre}» pasan
          a «{conflicto.nombre}» y los repetidos suman copias.
        </Dialogo>
      )}
    </>
  )
}

// Géneros: cualquier banda se edita a mano; una enlazada además puede traer los de MusicBrainz,
// que se suman como sugerencias para activar sin reemplazar los marcados.
function SelectorGeneros({ banda, valor, onChange, deshabilitado }) {
  const { online } = useCatalogo()
  const [traidos, setTraidos] = useState(null)
  const [trayendo, setTrayendo] = useState(false)
  const [aviso, setAviso] = useState(null)

  const traer = async () => {
    setTrayendo(true)
    setAviso(null)
    try {
      const { todos } = elegirGeneros(await musicbrainz.generosDeArtista(banda.mbid))
      setTraidos(todos)
      if (!todos.length) setAviso('MusicBrainz no tiene géneros para esta banda.')
      else if (todos.every((g) => valor.some((m) => mismoGenero(m, g)))) setAviso('Ya tiene los géneros de MusicBrainz.')
    } catch {
      setAviso('MusicBrainz no responde. Probá de nuevo.')
    } finally {
      setTrayendo(false)
    }
  }

  return (
    <div>
      <EditorGeneros valor={valor} onChange={onChange} deMusicbrainz={traidos} deshabilitado={deshabilitado} />
      {banda.mbid && traidos === null && (
        <Boton variante="secundario" className="mt-4" disabled={deshabilitado || trayendo || !online} onClick={traer}>
          {trayendo ? 'Trayendo…' : 'Traer de MusicBrainz'}
        </Boton>
      )}
      {aviso && <p className="mt-2 text-sm font-light text-suave">{aviso}</p>}
    </div>
  )
}

// Logo: vista previa sobre fondo oscuro (como en la tarjeta), buscar en Wikidata, elegir un archivo o quitar.
function SelectorLogo({ banda, valor, onChange, deshabilitado }) {
  const { buscarLogo, online } = useCatalogo()
  const archivo = useRef(null)
  const [trabajando, setTrabajando] = useState(false)
  const [aviso, setAviso] = useState(null)
  const vistaPrevia = useMemo(() => (valor ? URL.createObjectURL(valor.blob) : null), [valor])
  useEffect(() => () => vistaPrevia && URL.revokeObjectURL(vistaPrevia), [vistaPrevia])

  const correr = async (obtener, sinResultado) => {
    setTrabajando(true)
    setAviso(null)
    try {
      const nuevo = await obtener()
      if (nuevo) onChange(nuevo)
      else setAviso(sinResultado)
    } catch {
      setAviso('No se pudo conseguir el logo. Probá de nuevo o con otro archivo.')
    } finally {
      setTrabajando(false)
    }
  }

  const elegir = (e) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (f) correr(() => procesarLogo(f))
  }

  const actual = valor === undefined && banda.logo_path
  const invertir = valor ? valor.invertir : banda.logo_invertir
  const hayLogo = Boolean(vistaPrevia || actual)

  return (
    <div>
      <p className="etiqueta text-xs text-suave">Logo</p>
      <div className="mt-2 flex items-start gap-4">
        <div className="relative size-28 shrink-0 overflow-hidden border border-metal/60 bg-[#141218]">
          {vistaPrevia && <img src={vistaPrevia} alt="Logo" className={`absolute inset-0 size-full object-contain p-2 ${invertir ? 'invert' : ''}`} />}
          {actual && <Imagen ruta={banda.logo_path} ajuste="contain" className={`p-2 ${invertir ? 'invert' : ''}`} />}
          {!hayLogo && <p className="absolute inset-0 grid place-items-center text-xs font-light text-[#9b95a3]">Sin logo</p>}
          {trabajando && <p className="absolute inset-0 grid place-items-center bg-black/70 text-xs text-[#ebe5f0]">Buscando…</p>}
        </div>
        <div className="flex flex-col gap-2">
          {banda.mbid && (
            <Boton variante="secundario" disabled={deshabilitado || trabajando || !online} onClick={() => correr(() => buscarLogo(banda.mbid), 'Wikidata no tiene el logo de esta banda.')}>
              Buscar en Wikidata
            </Boton>
          )}
          <Boton variante="secundario" disabled={deshabilitado || trabajando} onClick={() => archivo.current.click()}>
            Elegir archivo
          </Boton>
          {hayLogo && (
            <Boton variante="fantasma" disabled={deshabilitado} onClick={() => onChange(banda.logo_path ? null : undefined)}>
              Quitar
            </Boton>
          )}
        </div>
      </div>
      <p className="mt-2 text-sm font-light text-suave">{aviso ?? 'Ideal: un PNG con fondo transparente.'}</p>
      <input ref={archivo} type="file" accept="image/png,image/webp,image/jpeg,image/svg+xml" hidden onChange={elegir} />
    </div>
  )
}
