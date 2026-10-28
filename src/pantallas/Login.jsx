import { useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { Boton, Campo } from '../componentes/ui.jsx'

export default function Login() {
  const [paso, setPaso] = useState('mail')
  const [mail, setMail] = useState('')
  const [codigo, setCodigo] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)

  const pedirAcceso = async (e) => {
    e?.preventDefault()
    setEnviando(true)
    setError(null)
    const { error: err } = await supabase.auth.signInWithOtp({
      email: mail.trim(),
      options: { shouldCreateUser: false, emailRedirectTo: location.origin + location.pathname },
    })
    setEnviando(false)
    if (err) setError(err.status === 429 ? 'Pediste muchos mails seguidos. Esperá unos minutos.' : 'No se pudo enviar el acceso. Revisá el mail.')
    else setPaso('codigo')
  }

  const entrar = async (e) => {
    e.preventDefault()
    setEnviando(true)
    setError(null)
    const { error: err } = await supabase.auth.verifyOtp({ email: mail.trim(), token: codigo.trim(), type: 'email' })
    setEnviando(false)
    if (err) setError('El código no es válido o venció. Pedí un mail nuevo.')
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6 py-10">
      <h1 className="font-display text-6xl leading-none">Música Retro</h1>
      <p className="etiqueta mt-3 text-sm text-suave">Vinilos · CDs · tu colección</p>

      {paso === 'mail' ? (
        <form onSubmit={pedirAcceso} className="mt-12 space-y-6">
          <Campo etiqueta="Tu mail" type="email" inputMode="email" autoComplete="email" required value={mail} onChange={(e) => setMail(e.target.value)} />
          {error && <p className="text-sm text-acento-texto">{error}</p>}
          <Boton type="submit" className="w-full" disabled={enviando || !mail.trim()}>
            {enviando ? 'Enviando…' : 'Mandame el acceso'}
          </Boton>
        </form>
      ) : (
        <form onSubmit={entrar} className="mt-12 space-y-6">
          <p className="font-light text-suave">
            Te mandamos un mail a <span className="text-texto">{mail}</span>. Tocá el link o escribí acá el código.
          </p>
          <Campo
            etiqueta="Código"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6,8}"
            maxLength={8}
            required
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
          />
          {error && <p className="text-sm text-acento-texto">{error}</p>}
          <Boton type="submit" className="w-full" disabled={enviando || codigo.length < 6}>
            {enviando ? 'Entrando…' : 'Entrar'}
          </Boton>
          <div className="flex justify-between">
            <Boton variante="fantasma" className="px-0" onClick={() => setPaso('mail')}>
              Cambiar mail
            </Boton>
            <Boton variante="fantasma" className="px-0" disabled={enviando} onClick={pedirAcceso}>
              Reenviar mail
            </Boton>
          </div>
        </form>
      )}
    </main>
  )
}
