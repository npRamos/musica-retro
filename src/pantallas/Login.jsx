import { useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { Boton, Campo } from '../componentes/ui.jsx'

// El límite de 60 s por dirección trae los segundos en el mensaje; el otro es por hora.
function mensajeLimite(err) {
  const segundos = err.message?.match(/after (\d+) seconds?/)?.[1]
  if (segundos) return `Esperá ${segundos} segundos antes de pedir otro mail.`
  return 'El servicio de mail permite pocos envíos por hora. Probá más tarde o entrá con contraseña.'
}

export default function Login() {
  const [paso, setPaso] = useState('clave')
  const [mail, setMail] = useState('')
  const [clave, setClave] = useState('')
  const [codigo, setCodigo] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)

  const cambiarPaso = (nuevo) => {
    setError(null)
    setPaso(nuevo)
  }

  const entrarConClave = async (e) => {
    e.preventDefault()
    setEnviando(true)
    setError(null)
    const { error: err } = await supabase.auth.signInWithPassword({ email: mail.trim(), password: clave })
    setEnviando(false)
    if (!err) return
    if (err.code === 'email_not_confirmed') setError('La cuenta todavía no está confirmada.')
    else if (err.status === 429) setError('Demasiados intentos seguidos. Esperá unos minutos.')
    else setError('Mail o contraseña incorrectos.')
  }

  const pedirRecuperacion = async (e) => {
    e.preventDefault()
    setEnviando(true)
    setError(null)
    const { error: err } = await supabase.auth.resetPasswordForEmail(mail.trim(), { redirectTo: location.origin + location.pathname })
    setEnviando(false)
    if (err) setError(err.status === 429 ? mensajeLimite(err) : 'No se pudo enviar el link. Probá de nuevo.')
    else setPaso('olvide-enviado')
  }

  const pedirLink = async (e) => {
    e?.preventDefault()
    setEnviando(true)
    setError(null)
    const { error: err } = await supabase.auth.signInWithOtp({
      email: mail.trim(),
      options: { shouldCreateUser: false, emailRedirectTo: location.origin + location.pathname },
    })
    setEnviando(false)
    if (err) setError(err.status === 429 ? mensajeLimite(err) : 'No se pudo enviar el acceso. Revisá el mail.')
    else setPaso('codigo')
  }

  const entrarConCodigo = async (e) => {
    e.preventDefault()
    setEnviando(true)
    setError(null)
    const { error: err } = await supabase.auth.verifyOtp({ email: mail.trim(), token: codigo.trim(), type: 'email' })
    setEnviando(false)
    if (err) setError('El código no es válido o venció. Pedí un mail nuevo.')
  }

  const campoMail = (
    <Campo etiqueta="Tu mail" type="email" inputMode="email" autoComplete="email" required value={mail} onChange={(e) => setMail(e.target.value)} />
  )

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6 py-10">
      <h1 className="font-display text-6xl leading-none">Música Retro</h1>
      <p className="etiqueta mt-3 text-sm text-suave">Vinilos · CDs · tu colección</p>

      {paso === 'clave' && (
        <form onSubmit={entrarConClave} className="mt-12 space-y-6">
          {campoMail}
          <Campo etiqueta="Contraseña" type="password" autoComplete="current-password" required value={clave} onChange={(e) => setClave(e.target.value)} />
          {error && <p className="text-sm text-acento-texto">{error}</p>}
          <Boton type="submit" className="w-full" disabled={enviando || !mail.trim() || !clave}>
            {enviando ? 'Entrando…' : 'Entrar'}
          </Boton>
          <div className="flex flex-col">
            <Boton variante="fantasma" className="w-full" onClick={() => cambiarPaso('olvide')}>
              ¿Olvidaste tu contraseña?
            </Boton>
            <Boton variante="fantasma" className="w-full" onClick={() => cambiarPaso('mail')}>
              Prefiero recibir un link por mail
            </Boton>
          </div>
        </form>
      )}

      {paso === 'olvide' && (
        <form onSubmit={pedirRecuperacion} className="mt-12 space-y-6">
          <p className="font-light text-suave">Te mandamos un link por mail. Abrilo en este dispositivo y elegí una contraseña nueva.</p>
          {campoMail}
          {error && <p className="text-sm text-acento-texto">{error}</p>}
          <Boton type="submit" className="w-full" disabled={enviando || !mail.trim()}>
            {enviando ? 'Enviando…' : 'Mandame el link'}
          </Boton>
          <Boton variante="fantasma" className="w-full" onClick={() => cambiarPaso('clave')}>
            Volver
          </Boton>
        </form>
      )}

      {paso === 'olvide-enviado' && (
        <div className="mt-12 space-y-6">
          <p className="font-light text-suave">
            Si <span className="text-texto">{mail}</span> tiene cuenta, te llega un mail con el link. Abrilo en este mismo dispositivo.
          </p>
          <Boton variante="secundario" className="w-full" onClick={() => cambiarPaso('clave')}>
            Volver a entrar con contraseña
          </Boton>
        </div>
      )}

      {paso === 'mail' && (
        <form onSubmit={pedirLink} className="mt-12 space-y-6">
          {campoMail}
          {error && <p className="text-sm text-acento-texto">{error}</p>}
          <Boton type="submit" className="w-full" disabled={enviando || !mail.trim()}>
            {enviando ? 'Enviando…' : 'Mandame el acceso'}
          </Boton>
          <Boton variante="fantasma" className="w-full" onClick={() => cambiarPaso('clave')}>
            Entrar con contraseña
          </Boton>
        </form>
      )}

      {paso === 'codigo' && (
        <form onSubmit={entrarConCodigo} className="mt-12 space-y-6">
          <p className="font-light text-suave">
            Te mandamos un mail a <span className="text-texto">{mail}</span>. Abrilo en este mismo dispositivo y tocá el link para entrar. Si el
            mail trae un código, también podés escribirlo acá.
          </p>
          <Campo
            etiqueta="Código"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6,8}"
            maxLength={8}
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
          />
          {error && <p className="text-sm text-acento-texto">{error}</p>}
          <Boton type="submit" className="w-full" disabled={enviando || codigo.length < 6}>
            {enviando ? 'Entrando…' : 'Entrar con el código'}
          </Boton>
          <Boton variante="fantasma" className="w-full" onClick={() => cambiarPaso('clave')}>
            Entrar con contraseña
          </Boton>
        </form>
      )}
    </main>
  )
}
