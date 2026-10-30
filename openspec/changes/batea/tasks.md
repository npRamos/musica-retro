## 1. Secuencia y tiempos

- [x] 1.1 `secuenciaBatea(bombo, elegida, azar, largo = 16)` en `sorteo.js`: primero bolas con tapa, sin repetir dos seguidas si hay más de una, completa repitiendo, termina en la elegida; con 1 bola, solo la elegida
- [x] 1.2 `tiemposBatea(n)`: de 60 ms a 400 ms con curva `t^2,2` (~2,7 s para las 15 caídas)
- [x] 1.3 Tests de 1.1 y 1.2 (termina en la elegida, prioriza con tapa, sin repetidas seguidas, bombo de 1 y 2, suma de tiempos)

## 2. Sonido

- [x] 2.1 `src/lib/sonido.js`: `AudioContext` perezoso creado en el gesto; `clac(intensidad)` (ruido pasabanda ~2,2 kHz, ~15 ms) y `golpe()` (seno 90 Hz, ~140 ms); sin errores si no hay audio
- [x] 2.2 Preferencia `sorteoSonido` (activada por defecto) e íconos de línea `IconoSonido` / `IconoSilencio`
- [x] 2.3 `BotonCirculo` en el encabezado del sorteo para silenciar o activar

## 3. Batea

- [x] 3.1 `src/componentes/Batea.jsx`: escenario con perspectiva, 3 fundas recicladas, bordes superiores de los discos de atrás y frente de la batea; bordes de 1px con `--texto` para que se lea en los dos temas
- [x] 3.2 Fase hojear: precarga de tapas (tope 600 ms), caídas encadenadas con `element.animate` (rotateX y brillo), clac por caída, borde de acento en la elegida
- [x] 3.3 Fase final: la funda sube, la batea se desvanece, el disco asoma (vinilo con surcos y etiqueta con la tapa, girando a 33⅓; CD plateado con una vuelta), golpe, y `alTerminar`
- [x] 3.4 Composición final quieta o girando para el resultado sin animación (volver del detalle) y con movimiento reducido (quieta, sin sonido)
- [x] 3.5 Tocar para saltar: cancela las animaciones, va al final sin golpe y llama a `alTerminar`; texto "Tocá para saltar"

## 4. Integración

- [x] 4.1 `Sorteo.jsx`: reemplazar `Revelacion` por `Batea`; `Resultado` sin la tapa; datos y acciones ocultos sin mover el layout mientras anima
- [x] 4.2 Keyframes de giro en `index.css`
- [x] 4.3 `npm test` y `npm run build` sin errores

## 5. Verificación

- [ ] 5.1 Probar en el celular: fluidez, tapas negras en tema oscuro y claro, disco sin tapa, bombo de 1 y 2, saltar, silenciar, movimiento reducido, volver del detalle
- [ ] 5.2 Ajustar tiempos y volumen con lo que se vea en el celular
- [ ] 5.3 Sincronizar las specs y archivar el change
