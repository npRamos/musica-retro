import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Encabezado, Vacio } from './componentes/ui.jsx'
import { CatalogoProvider, useCatalogo } from './lib/catalogoContexto.jsx'
import { cambiarPreferencia, usePreferencias } from './lib/preferencias.js'
import { FORMATO_DE_SLUG, useRuta } from './lib/router.js'
import { configurado, supabase, vinoDeRecuperacion } from './lib/supabase.js'
import Ajustes from './pantallas/Ajustes.jsx'
import Banda from './pantallas/Banda.jsx'
import { CambiarClave, NuevaClave } from './pantallas/Clave.jsx'
import Completar from './pantallas/Completar.jsx'
import CompletarGeneros from './pantallas/CompletarGeneros.jsx'
import Disco from './pantallas/Disco.jsx'
import EditarBanda from './pantallas/EditarBanda.jsx'
import FormDisco from './pantallas/FormDisco.jsx'
import Importar from './pantallas/Importar.jsx'
import Inicio from './pantallas/Inicio.jsx'
import Login from './pantallas/Login.jsx'

export default function App() {
  const [sesion, setSesion] = useState(undefined)
  const [recuperando, setRecuperando] = useState(vinoDeRecuperacion)

  useEffect(() => {
    if (!configurado) return
    // getSession lee la sesión guardada: funciona también sin conexión.
    supabase.auth.getSession().then(({ data }) => setSesion(data.session))
    const { data } = supabase.auth.onAuthStateChange((evento, nueva) => {
      setSesion(nueva)
      if (evento === 'PASSWORD_RECOVERY') setRecuperando(true)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  // El acento elegido viaja con la cuenta entre dispositivos.
  const acentoCuenta = sesion?.user?.user_metadata?.acento
  useEffect(() => {
    if (acentoCuenta) cambiarPreferencia('acento', acentoCuenta, { sincronizar: false })
  }, [acentoCuenta])

  if (!configurado) {
    return (
      <Vacio titulo="Falta configurar Supabase">
        Copiá <code>.env.example</code> como <code>.env.local</code> y completá la URL y la clave del proyecto.
      </Vacio>
    )
  }
  if (sesion === undefined) return null
  if (!sesion) return <Login />
  if (recuperando) return <NuevaClave alTerminar={() => setRecuperando(false)} />

  return (
    <CatalogoProvider key={sesion.user.id} sesion={sesion}>
      <Rutas mail={sesion.user.email} />
    </CatalogoProvider>
  )
}

function Rutas({ mail }) {
  const { partes, consulta } = useRuta()
  const [prefs] = usePreferencias()
  const { discosPorId, error, miembro } = useCatalogo()
  const [busqueda, setBusqueda] = useState('')
  const [primera, segunda, tercera] = partes
  const formatoDeRuta = FORMATO_DE_SLUG[primera]

  useEffect(() => {
    if (formatoDeRuta) cambiarPreferencia('formato', formatoDeRuta)
  }, [formatoDeRuta])

  // Al volver a una pantalla, recupera la posición de scroll que tenía.
  const claveRuta = partes.join('/')
  const posiciones = useRef(new Map())
  useLayoutEffect(() => {
    scrollTo(0, posiciones.current.get(claveRuta) ?? 0)
    return () => posiciones.current.set(claveRuta, scrollY)
  }, [claveRuta])

  let pantalla
  if (!primera || (formatoDeRuta && !segunda)) {
    pantalla = <Inicio formato={formatoDeRuta ?? prefs.formato} busqueda={busqueda} setBusqueda={setBusqueda} />
  } else if (formatoDeRuta && segunda === 'banda') {
    pantalla = <Banda key={tercera} id={tercera} formato={formatoDeRuta} />
  } else if (primera === 'banda' && tercera === 'editar') {
    pantalla = <EditarBanda key={segunda} id={segunda} />
  } else if (primera === 'disco' && tercera === 'editar') {
    const disco = discosPorId.get(segunda)
    pantalla = disco ? (
      <FormDisco key={segunda} disco={disco} />
    ) : (
      <>
        <Encabezado titulo="Editar disco" atras="" />
        <Vacio titulo="No encontramos ese disco" />
      </>
    )
  } else if (primera === 'disco' && tercera === 'completar') {
    pantalla = <Completar key={segunda} id={segunda} />
  } else if (primera === 'disco') {
    pantalla = <Disco key={segunda} id={segunda} />
  } else if (primera === 'completar') {
    pantalla = <Completar />
  } else if (primera === 'generos') {
    pantalla = <CompletarGeneros />
  } else if (primera === 'agregar') {
    const inicial = { banda: consulta.get('banda') ?? '', titulo: consulta.get('titulo') ?? '', formato: consulta.get('formato') }
    pantalla = <FormDisco key={consulta.toString()} inicial={inicial} />
  } else if (primera === 'importar') {
    pantalla = <Importar />
  } else if (primera === 'ajustes' && segunda === 'clave') {
    pantalla = <CambiarClave />
  } else if (primera === 'ajustes') {
    pantalla = <Ajustes mail={mail} />
  } else {
    pantalla = <Inicio formato={prefs.formato} busqueda={busqueda} setBusqueda={setBusqueda} />
  }

  return (
    <>
      {miembro === false && (
        <p role="alert" className="border-b border-metal/50 px-4 py-2 text-center text-sm text-acento-texto">
          Tu cuenta todavía no está habilitada en el catálogo compartido. Hay que sumarla a los miembros en Supabase.
        </p>
      )}
      {error && (
        <p role="alert" className="border-b border-metal/50 px-4 py-2 text-center text-sm text-acento-texto">
          No se pudo sincronizar: {error}
        </p>
      )}
      {pantalla}
    </>
  )
}
