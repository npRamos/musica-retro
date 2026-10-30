// Íconos de línea propios (trazo 1.5px), heredan el color del texto.
function Icono({ children, className = 'size-5', ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...props}
    >
      {children}
    </svg>
  )
}

export const IconoVinilo = (p) => (
  <Icono {...p}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="6.2" strokeOpacity="0.45" />
    <circle cx="12" cy="12" r="2.6" />
    <circle cx="12" cy="12" r="0.4" fill="currentColor" />
  </Icono>
)

export const IconoCd = (p) => (
  <Icono {...p}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="2.2" />
    <path d="M6.8 9.2a6 6 0 0 1 3.4-3.1" />
    <path d="M17.2 14.8a6 6 0 0 1-3.4 3.1" strokeOpacity="0.5" />
  </Icono>
)

export const IconoFormato = ({ formato, ...p }) => (formato === 'vinilo' ? <IconoVinilo {...p} /> : <IconoCd {...p} />)

export const IconoBuscar = (p) => (
  <Icono {...p}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="m20 20-4.8-4.8" />
  </Icono>
)

export const IconoMas = (p) => (
  <Icono {...p}>
    <path d="M12 5v14M5 12h14" />
  </Icono>
)

export const IconoAtras = (p) => (
  <Icono {...p}>
    <path d="m15 5-7 7 7 7" />
  </Icono>
)

export const IconoSiguiente = (p) => (
  <Icono {...p}>
    <path d="m9 5 7 7-7 7" />
  </Icono>
)

export const IconoGrilla = (p) => (
  <Icono {...p}>
    <rect x="4" y="4" width="6.5" height="6.5" />
    <rect x="13.5" y="4" width="6.5" height="6.5" />
    <rect x="4" y="13.5" width="6.5" height="6.5" />
    <rect x="13.5" y="13.5" width="6.5" height="6.5" />
  </Icono>
)

export const IconoLista = (p) => (
  <Icono {...p}>
    <path d="M9 6h11M9 12h11M9 18h11" />
    <path d="M4 6h1M4 12h1M4 18h1" />
  </Icono>
)

export const IconoOrden = (p) => (
  <Icono {...p}>
    <path d="M7 4v16M3.5 7.5 7 4l3.5 3.5" />
    <path d="M17 20V4M13.5 16.5 17 20l3.5-3.5" />
  </Icono>
)

export const IconoAjustes = (p) => (
  <Icono {...p}>
    <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
    <circle cx="16" cy="7" r="2" />
    <circle cx="10" cy="17" r="2" />
  </Icono>
)

export const IconoEditar = (p) => (
  <Icono {...p}>
    <path d="M14.5 5.5 18.5 9.5" />
    <path d="M4 20l1-5L16 4l4 4L9 19z" />
  </Icono>
)

export const IconoBorrar = (p) => (
  <Icono {...p}>
    <path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13" />
  </Icono>
)

export const IconoCamara = (p) => (
  <Icono {...p}>
    <path d="M3.5 8h4l1.8-2.5h5.4L16.5 8h4v11h-17z" />
    <circle cx="12" cy="13.2" r="3.4" />
  </Icono>
)

export const IconoGaleria = (p) => (
  <Icono {...p}>
    <rect x="3.5" y="4.5" width="17" height="15" />
    <path d="m3.5 16 5-5 4 4 2.5-2.5 5.5 5.5" />
    <circle cx="15.5" cy="9" r="1.4" />
  </Icono>
)

export const IconoSpotify = (p) => (
  <Icono {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M7.2 9.4c3.3-1 6.8-.7 9.8.9" />
    <path d="M7.8 12.4c2.7-.8 5.5-.5 7.9.8" />
    <path d="M8.4 15.2c2.1-.6 4.2-.4 6 .6" />
  </Icono>
)

export const IconoCerrar = (p) => (
  <Icono {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Icono>
)

export const IconoEtiqueta = (p) => (
  <Icono {...p}>
    <path d="M4 4h7.5l8.5 8.5-7.5 7.5L4 11.5z" />
    <circle cx="8.5" cy="8.5" r="1.3" />
  </Icono>
)

export const IconoImportar = (p) => (
  <Icono {...p}>
    <path d="M12 4v11M7.5 10.5 12 15l4.5-4.5" />
    <path d="M4.5 15.5V20h15v-4.5" />
  </Icono>
)

export const IconoSalir = (p) => (
  <Icono {...p}>
    <path d="M10 4.5H4.5v15H10" />
    <path d="M14.5 8 18.5 12l-4 4M18.5 12H9" />
  </Icono>
)

export const IconoCompartir = (p) => (
  <Icono {...p}>
    <circle cx="6" cy="12" r="2.5" />
    <circle cx="17.5" cy="6" r="2.5" />
    <circle cx="17.5" cy="18" r="2.5" />
    <path d="m8.3 10.8 7-3.6M8.3 13.2l7 3.6" />
  </Icono>
)

export const IconoCopiar = (p) => (
  <Icono {...p}>
    <rect x="8.5" y="8.5" width="11" height="11" />
    <path d="M15.5 8.5V4.5h-11v11h4" />
  </Icono>
)

export const IconoMensaje = (p) => (
  <Icono {...p}>
    <path d="M4.5 19.5 6 15.6A7.5 7.5 0 1 1 9 18.6z" />
  </Icono>
)

export const IconoPlanilla = (p) => (
  <Icono {...p}>
    <rect x="4.5" y="4.5" width="15" height="15" />
    <path d="M4.5 9.5h15M4.5 14.5h15M10 9.5v10" />
  </Icono>
)
