import { useState } from 'react'
import FormClave from '../componentes/FormClave.jsx'
import { Boton, Encabezado } from '../componentes/ui.jsx'
import { useCatalogo } from '../lib/catalogoContexto.jsx'
import { volver } from '../lib/router.js'

// Cambio de contraseña desde Ajustes.
export function CambiarClave() {
  const { online } = useCatalogo()
  const [listo, setListo] = useState(false)
  return (
    <>
      <Encabezado titulo="Contraseña" atras="ajustes" />
      <main className="mx-auto max-w-sm px-5 pt-8 pb-16">
        {listo ? (
          <>
            <p className="etiqueta text-xl tracking-[0.08em]">Contraseña cambiada</p>
            <p className="mt-2 font-light text-suave">La próxima vez que entres en otro dispositivo, usá la nueva.</p>
            <Boton className="mt-8 w-full" onClick={() => volver('ajustes')}>
              Volver
            </Boton>
          </>
        ) : (
          <FormClave alGuardar={() => setListo(true)} deshabilitado={!online} />
        )}
      </main>
    </>
  )
}

// Después de abrir el link de "olvidé mi contraseña": la sesión ya está iniciada, falta la clave nueva.
export function NuevaClave({ alTerminar }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6 py-10">
      <h1 className="font-display text-5xl leading-none">Nueva contraseña</h1>
      <p className="mt-3 font-light text-suave">Elegí una contraseña nueva para entrar de ahora en adelante.</p>
      <div className="mt-10">
        <FormClave alGuardar={alTerminar} />
      </div>
    </main>
  )
}
