// Sonidos del sorteo, generados con Web Audio (sin archivos). Si el navegador no puede, no suena y no falla.
// El AudioContext se crea en el primer toque ("Sortear" u "Otro"): los navegadores solo dejan sonar después de un gesto.

let contexto = null

function audio() {
  try {
    const Contexto = window.AudioContext ?? window.webkitAudioContext
    if (!Contexto) return null
    contexto ??= new Contexto()
    if (contexto.state === 'suspended') contexto.resume().catch(() => {})
    return contexto
  } catch {
    return null
  }
}

// Llamarla dentro del toque que dispara la animación.
export const prepararSonido = () => void audio()

// "Clac" de una funda que cae: ruido corto por un pasabanda. intensidad entre 0 y 1.
export function clac(intensidad = 1) {
  const c = audio()
  if (!c) return
  try {
    const muestras = Math.ceil(c.sampleRate * 0.015)
    const buffer = c.createBuffer(1, muestras, c.sampleRate)
    const datos = buffer.getChannelData(0)
    for (let i = 0; i < muestras; i++) datos[i] = (Math.random() * 2 - 1) * (1 - i / muestras) ** 2
    const fuente = c.createBufferSource()
    fuente.buffer = buffer
    const filtro = c.createBiquadFilter()
    filtro.type = 'bandpass'
    filtro.frequency.value = 2200
    filtro.Q.value = 1.2
    const volumen = c.createGain()
    volumen.gain.value = 0.5 * intensidad
    fuente.connect(filtro).connect(volumen).connect(c.destination)
    fuente.start()
  } catch {
    // Sin sonido: la animación sigue igual.
  }
}

// Golpe suave grave: el disco que cae en el plato.
export function golpe() {
  const c = audio()
  if (!c) return
  try {
    const ahora = c.currentTime
    const oscilador = c.createOscillator()
    oscilador.type = 'sine'
    oscilador.frequency.setValueAtTime(110, ahora)
    oscilador.frequency.exponentialRampToValueAtTime(70, ahora + 0.14)
    const volumen = c.createGain()
    volumen.gain.setValueAtTime(0.45, ahora)
    volumen.gain.exponentialRampToValueAtTime(0.001, ahora + 0.14)
    oscilador.connect(volumen).connect(c.destination)
    oscilador.start(ahora)
    oscilador.stop(ahora + 0.15)
  } catch {
    // Sin sonido: la animación sigue igual.
  }
}
