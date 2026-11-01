## Why

Issue #2: con la colección creciendo, llegar a una banda de la mitad de la lista obliga a scrollear a ojo. Se busca un índice al costado que aparezca al scrollear, como el de Google Fotos, para arrastrar o tocar y llegar directo a una letra (o a un género, o a un mes).

## What Changes

- **Índice al costado de la lista del inicio:**
  - Aparece al scrollear y se esconde solo después de un momento quieto.
  - Tiene una manija que se arrastra, con una burbuja que muestra dónde se está, y marcas que se tocan para saltar.
- **Marcas según cómo se ve la lista:**
  - A → Z / Z → A, por banda o con todos los discos: la primera letra de la banda, normalizada, y `#` para números y signos.
  - Por género (agrupado): una marca por sección. Ordenado por género sin agrupar: el género principal de cada banda, y "Sin género".
  - Última compra: mes y año ("nov 2026").
- **Cada marca va a la altura en que está en la lista**, no repartidas parejo. Si dos quedan pegadas, se muestra solo una. La burbuja siempre dice la marca exacta.
- **Solo con listas largas:** varias pantallas de alto y al menos dos marcas distintas. No aparece al buscar ni en la pantalla de una banda.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `consulta`: se suma el requisito "Índice al desplazarse" sobre la lista del inicio.

## Impact

- **Código nuevo:**
  - `src/lib/indice.js`, con tests: la marca de cada elemento según orden y agrupación, sus textos, y el raleo de marcas pegadas.
  - `src/componentes/Indice.jsx`: la manija, las marcas y la burbuja, y la lectura de posiciones del DOM.
- **Cambios en archivos existentes:**
  - `src/pantallas/Inicio.jsx`: calcular las marcas y marcar el primer elemento de cada una (y los títulos de las secciones por género).
  - `src/componentes/Tarjetas.jsx`: las tarjetas aceptan la marca como atributo `data-marca`.
- Sin cambios en la base ni dependencias nuevas.
