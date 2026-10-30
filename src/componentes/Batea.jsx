import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { useCatalogo } from '../lib/catalogoContexto.jsx'
import { clac, golpe } from '../lib/sonido.js'
import { discoVisible, secuenciaBatea, tiemposBatea } from '../lib/sorteo.js'
import { IconoFormato } from './Iconos.jsx'
import { Imagen } from './Portadas.jsx'

// Revelación del sorteo: se hojea una batea hasta frenar en la bola elegida (ya sorteada), que sale de la batea
// con el disco asomando de su funda, como en una rockola. Después aparecen children (datos y acciones).
// Sobre el fondo casi negro, lo que hace que se lea son los bordes finos claros, no sombras.

const BORDE = 'color-mix(in srgb, var(--texto) 28%, transparent)'
// Composición final: la funda se corre a la izquierda y el disco asoma a la derecha.
const FUNDA_CORRIDA = 'translate(-22%, -6px)'
const DISCO_ASOMADO = 'translateX(40%)'
const SALIDA = 'cubic-bezier(0.2, 0.8, 0.2, 1)'

const reducirMovimiento = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

// Tapas listas antes de arrancar, con un tope: si alguna no llega, se arranca igual con el placeholder.
function precargar(urls, tope) {
  const cargas = urls.filter(Boolean).map((url) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = url
    return img.decode().catch(() => {})
  })
  return Promise.race([Promise.all(cargas), new Promise((listo) => setTimeout(listo, tope))])
}

export default function Batea({ bombo, elegida, activa, sonar, alTerminar, children }) {
  const { urls } = useCatalogo()
  const [reducido] = useState(reducirMovimiento)
  const [animar] = useState(activa && !reducido)
  const [secuencia] = useState(() => (animar ? secuenciaBatea(bombo, elegida) : [elegida]))
  const [fase, setFase] = useState(animar ? 'hojear' : 'listo')
  const [frente, setFrente] = useState(0)
  const ultima = secuencia.length - 1

  const fundas = useRef([])
  const caja = useRef(null)
  const disco = useRef(null)
  const batea = useRef(null)
  const enCurso = useRef([])
  const saltado = useRef(false)

  // Las animaciones quedan en su último cuadro hasta que React pone el mismo estado en el DOM; recién ahí se sueltan.
  const soltar = () => {
    enCurso.current.forEach((a) => a.cancel())
    enCurso.current = []
  }

  useEffect(() => {
    // Sin animación (movimiento reducido), el resultado ya está: se avisa enseguida para habilitar las acciones.
    if (!animar) {
      if (activa) alTerminar()
      return
    }
    let vivo = true
    const sigue = () => vivo && !saltado.current
    const animarEl = (el, cuadros, opciones) => {
      const a = el.animate(cuadros, { fill: 'forwards', ...opciones })
      enCurso.current.push(a)
      return a.finished
    }

    ;(async () => {
      await precargar(secuencia.map((b) => urls[discoVisible(b).tapa_path]), 600)
      const tiempos = tiemposBatea(ultima)
      try {
        // Hojear: la funda del frente cae hacia adelante y la de atrás se adelanta e ilumina.
        for (let i = 0; i < tiempos.length; i++) {
          if (!sigue()) return
          if (sonar) clac(1 - (0.5 * i) / tiempos.length)
          await Promise.all([
            animarEl(
              fundas.current[i],
              [
                { transform: 'rotateX(0deg)', filter: 'brightness(1)' },
                { transform: 'rotateX(-80deg)', filter: 'brightness(0.35)' },
              ],
              { duration: tiempos[i], easing: 'ease-in' },
            ),
            animarEl(
              fundas.current[i + 1],
              [
                { transform: 'translateY(6px)', filter: 'brightness(0.55)' },
                { transform: 'none', filter: 'brightness(1)' },
              ],
              { duration: tiempos[i], easing: 'ease-out' },
            ),
          ])
          if (!sigue()) return
          flushSync(() => setFrente(i + 1))
          soltar()
        }
        // Final: la batea se va, la funda sube y se corre, y el disco asoma.
        if (!sigue()) return
        await Promise.all([
          animarEl(batea.current, [{ opacity: 1 }, { opacity: 0 }], { duration: 300 }),
          animarEl(caja.current, [{ transform: 'none' }, { transform: FUNDA_CORRIDA }], { duration: 450, easing: SALIDA }),
          animarEl(disco.current, [{ transform: 'none' }, { transform: DISCO_ASOMADO }], { duration: 500, delay: 250, easing: SALIDA }),
        ])
      } catch {
        return // cancelada: se saltó o se desmontó
      }
      if (!sigue()) return
      if (sonar) golpe()
      flushSync(() => setFase('listo'))
      soltar()
      alTerminar()
    })()

    return () => {
      vivo = false
      soltar()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const saltar = () => {
    saltado.current = true
    flushSync(() => {
      setFrente(ultima)
      setFase('listo')
    })
    soltar()
    alTerminar()
  }

  const listo = fase === 'listo'
  const estiloFunda = (k) => {
    if (listo) return k === ultima ? { zIndex: 3 } : { opacity: 0 }
    if (k === frente) return { zIndex: 3 }
    if (k === frente + 1) return { zIndex: 2, transform: 'translateY(6px)', filter: 'brightness(0.55)' }
    return { opacity: 0 }
  }
  const visible = discoVisible(elegida)

  const escenario = (
    <div className="relative mx-auto w-full max-w-sm pt-7 pb-2">
      <div ref={caja} className="relative mx-auto aspect-square w-[64%] [perspective:900px]" style={listo ? { transform: FUNDA_CORRIDA } : undefined}>
        <div ref={disco} className="absolute inset-0" style={listo ? { transform: DISCO_ASOMADO } : undefined}>
          <Disco formato={elegida.discos[0].formato} tapa={visible.tapa_path} girar={!reducido} unaVuelta={animar} />
        </div>
        {secuencia.map((bola, k) => (
          <Funda
            key={k}
            ref={(el) => (fundas.current[k] = el)}
            disco={discoVisible(bola)}
            acento={k === ultima && frente === ultima}
            style={estiloFunda(k)}
          />
        ))}
        {!listo && (
          <div ref={batea} className="pointer-events-none absolute inset-0 z-10" aria-hidden="true">
            {/* Bordes de los discos de atrás: dan profundidad sin sombras. */}
            {[0, 1, 2, 3].map((n) => (
              <div
                key={n}
                className="absolute border-t"
                style={{ top: `${-6 - n * 5}px`, left: `${3 + n * 3}%`, right: `${3 + n * 3}%`, borderColor: BORDE, opacity: 0.9 - n * 0.2 }}
              />
            ))}
            {/* Frente de la batea: tapa la parte de abajo de las fundas y, más abajo, las que ya cayeron. */}
            <div className="absolute -inset-x-[18%] -bottom-[16%] h-[36%] border-t-2 border-metal bg-fondo">
              <div className="mx-[6%] mt-1.5 border-t" style={{ borderColor: BORDE }} />
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {listo ? (
        escenario
      ) : (
        <button type="button" onClick={saltar} aria-label="Saltar la animación" className="block w-full">
          {escenario}
          <span className="etiqueta mt-2 block text-center text-xs text-suave">Tocá para saltar</span>
        </button>
      )}
      <div className={listo ? (animar ? 'animate-[aparecer_250ms_ease-out]' : '') : 'invisible'}>{children}</div>
    </>
  )
}

// Funda de la batea: la tapa (o el ícono del formato) con un borde fino claro, para que una tapa negra se lea.
function Funda({ ref, disco, acento, style }) {
  return (
    <div
      ref={ref}
      className="absolute inset-0 origin-bottom overflow-hidden border bg-superficie-solida will-change-transform"
      style={{ borderColor: acento ? 'var(--acento)' : BORDE, ...style }}
    >
      <div className="absolute inset-0 grid place-items-center text-metal">
        <IconoFormato formato={disco.formato} className="size-1/2" />
      </div>
      <Imagen ruta={disco.tapa_path} alt={`Tapa de ${disco.titulo}`} />
    </div>
  )
}

// El disco que asoma: vinilo negro con surcos y la tapa como etiqueta, girando a 33⅓; o un CD plateado.
function Disco({ formato, tapa, girar, unaVuelta }) {
  if (formato === 'cd') {
    return (
      <div className="absolute inset-[2%] rounded-full border" style={{ borderColor: BORDE }}>
        <div
          className={`absolute inset-0 rounded-full ${girar && unaVuelta ? 'animate-[girar_1.2s_cubic-bezier(0.2,0.8,0.2,1)_1]' : ''}`}
          style={{ background: 'conic-gradient(#d9dce0, #8d939b, #eceef0, #9aa0a8, #d9dce0, #868c94, #e2e4e7, #9aa0a8, #d9dce0)' }}
        >
          <div className="absolute inset-[33%] rounded-full border border-black/20 bg-white/25" />
          <div className="absolute inset-[44%] rounded-full border border-black/30 bg-fondo" />
        </div>
      </div>
    )
  }
  return (
    <div className="absolute inset-[2%] rounded-full border" style={{ borderColor: BORDE }}>
      <div
        className={`absolute inset-0 rounded-full ${girar ? 'animate-[girar_1.8s_linear_infinite]' : ''}`}
        style={{ background: 'repeating-radial-gradient(circle, #0b0a0c 0 2px, #1d1b21 2px 3px)' }}
      >
        <div className="absolute inset-[32%] overflow-hidden rounded-full bg-acento">
          <Imagen ruta={tapa} />
        </div>
        <div className="absolute inset-[48.5%] rounded-full bg-fondo" />
      </div>
      {/* Brillo quieto: el disco gira debajo. */}
      <div
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{ background: 'conic-gradient(from 20deg, transparent 0 8%, rgb(255 255 255 / 0.1) 12%, transparent 16% 58%, rgb(255 255 255 / 0.07) 62%, transparent 66%)' }}
      />
    </div>
  )
}
