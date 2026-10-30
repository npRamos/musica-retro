## Why

El sorteo ya funciona, pero el resultado aparece con un fundido: falta el "momento". La idea original era una ruleta, y la forma que buscamos es hojear la batea de una disquería hasta frenar en un disco, sacarlo de su funda y ponerlo a girar, como una rockola. Es lo que hace que sortear sea divertido.

## What Changes

- **Animación de la batea** (reemplaza el fundido):
  - Las tapas de la batea caen hacia adelante, cada vez más despacio, hasta frenar en el disco sorteado.
  - **Final de rockola:** el disco sube, el vinilo sale de su funda y gira, o el CD brilla y gira. Después aparecen los datos y las acciones.
  - Dura unos 3 a 4 segundos.
  - Se diseñó para que se lea sobre el fondo oscuro: bordes finos claros en cada funda, los bordes de los discos de atrás, y el que cae se oscurece mientras el siguiente se ilumina.
- **El resultado queda con la composición final:** la funda con el vinilo asomado, girando, o el CD.
- **Sonido:** un "clac" corto por cada disco que pasa y un golpe suave al final, generados por el navegador (sin archivos). Se silencia desde la pantalla de sorteo y la elección se recuerda.
- **Tocar para saltar:** tocar la batea durante la animación muestra el resultado enseguida.
- **Movimiento reducido:** si el celular lo pide, no hay animación ni giro. Tampoco suena.

## Capabilities

### New Capabilities
<!-- Ninguna. -->

### Modified Capabilities
- `sorteo`:
  - "Sortear un disco": la transición pasa a ser la animación de la batea.
  - Requisitos nuevos para la batea, el sonido y saltar la animación.

## Impact

- **Código:**
  - `src/componentes/Batea.jsx` (escenario, secuencia y final), que reemplaza `Revelacion` en `Sorteo.jsx`;
  - `src/lib/sorteo.js` (secuencia de tapas y tiempos), con tests;
  - `src/lib/sonido.js` (Web Audio);
  - `preferencias.js` (`sorteoSonido`);
  - `Iconos.jsx` (sonido y silencio);
  - `index.css` (giro).
- **Sin cambios** en la base ni en dependencias: CSS 3D y la API de animaciones del navegador.
