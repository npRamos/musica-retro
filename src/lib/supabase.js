import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const clave = import.meta.env.VITE_SUPABASE_ANON_KEY

export const configurado = Boolean(url && clave)

// Llegó desde el link de "olvidé mi contraseña". Se lee antes de que supabase-js limpie la URL.
export const vinoDeRecuperacion = /type=recovery/.test(location.hash)

export const supabase = configurado
  ? createClient(url, clave, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null

export const BUCKET = 'imagenes'
