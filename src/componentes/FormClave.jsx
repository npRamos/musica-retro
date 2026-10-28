import { useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { Boton, Campo } from './ui.jsx'

const MINIMO = 8

// Nueva contraseña para la cuenta con sesión iniciada (cambio normal o recuperación).
export default function FormClave({ alGuardar, deshabilitado = false }) {
  const [clave, setClave] = useState('')
  const [repetida, setRepetida] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)

  const guardar = async (e) => {
    e.preventDefault()
    if (clave.length < MINIMO) return setError(`Tiene que tener al menos ${MINIMO} caracteres.`)
    if (clave !== repetida) return setError('Las dos contraseñas no coinciden.')
    setGuardando(true)
    setError(null)
    const { error: err } = await supabase.auth.updateUser({ password: clave })
    setGuardando(false)
    if (!err) return alGuardar()
    if (err.code === 'same_password') setError('Es igual a la contraseña actual.')
    else if (err.code === 'weak_password') setError('Es muy débil. Probá con una más larga.')
    else setError('No se pudo cambiar. Revisá la conexión y probá de nuevo.')
  }

  return (
    <form onSubmit={guardar} className="space-y-6" noValidate>
      <Campo
        etiqueta="Nueva contraseña"
        type="password"
        autoComplete="new-password"
        value={clave}
        onChange={(e) => setClave(e.target.value)}
        ayuda={`Al menos ${MINIMO} caracteres.`}
      />
      <Campo etiqueta="Repetila" type="password" autoComplete="new-password" value={repetida} onChange={(e) => setRepetida(e.target.value)} />
      {error && <p className="text-sm text-acento-texto">{error}</p>}
      <Boton type="submit" className="w-full" disabled={guardando || deshabilitado || !clave || !repetida}>
        {deshabilitado ? 'Sin conexión' : guardando ? 'Guardando…' : 'Guardar contraseña'}
      </Boton>
    </form>
  )
}
