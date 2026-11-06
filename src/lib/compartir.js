// En el celular abre la hoja de compartir con el archivo; donde no se puede, lo descarga. Cancelar no es un error.
// Tiene que llamarse directo desde un toque: navigator.share exige un gesto reciente, y no hay nada asíncrono antes.
export async function compartirArchivo(archivo, titulo = archivo.name) {
  if (navigator.canShare?.({ files: [archivo] })) {
    try {
      await navigator.share({ files: [archivo], title: titulo })
    } catch (e) {
      if (e.name !== 'AbortError') throw e
    }
    return
  }
  const url = URL.createObjectURL(archivo)
  const enlace = Object.assign(document.createElement('a'), { href: url, download: archivo.name })
  document.body.append(enlace)
  enlace.click()
  enlace.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
