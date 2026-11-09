# La fuga de Eme · diseño

## Idea

Puzzle de física en una rejilla de **3 × 3 casillas**. Cada casilla es una pieza de una misma situación física (rampas, suelos, repisas…). Algunas casillas están vacías y el jugador elige, entre varias piezas, las que hacen que Eme llegue a la meta. Se puede resolver con lápiz y papel antes de pulsar *Lanzar*; la simulación da o quita la razón.

**Ciclo didáctico:** predecir → comprobar → entender el balance de energía.

## Público y progresión

De 4.º de ESO a 2.º de Bachillerato, por mundos (capas del libro de las que Eme escapa):

| Mundo | Estilo | Física |
|---|---|---|
| **I · El cuaderno** | Papel cuadriculado, lápiz | Julitos enteros; rozamiento por casilla |
| **II · El libro de texto** | Páginas impresas, figuras con θ | Números reales (m, μ, d), planos con rozamiento (cos θ), muelles ½kx² |
| **III · La pizarra** | Tiza sobre verde | Loops (v² ≥ g·R), normal variable, tiro parabólico |
| **Final · Fuera del libro** | Color | Nivel mezcla |

Nivel trampa previsto: **EME**, el primo grande (*M* mayúscula), llega igual de lejos porque la masa se cancela.

## Julitos (Mundo I)

- 1 cuadrito de altura = 1 julito de Ep. El tablero mide 9 × 9 cuadritos.
- Cada material se come un número fijo de julitos por casilla: hielo 0, madera 1, asfalto 2, arena 3.
- Simplificación consciente: en el Mundo I una rampa de arena come lo mismo que un suelo de arena. En el Mundo II se rompe a propósito («¿por qué la rampa ya no come 3?»).
- La barra de julitos siempre suma lo mismo. Colores: **Ep azul**, **Ec amarillo**, **calor rojo**.

## Meta: repisa con felpudo

El felpudo come 1 julito y detrás hay un precipicio. Llegar a la repisa con:

- **0 julitos de Ec** → se queda en el borde y cae hacia atrás (fallo «¡Por los pelos!»).
- **1** → se para en la bandera (victoria).
- **2 o más** → cruza el felpudo y cae por el precipicio (fallo «¡Te pasaste!»).

Así cada nivel tiene una condición exacta y cada fallo es distinto y visible.

## Nivel 1 · «Ni más, ni menos»

Salida a altura 8 (8 julitos), suelo a altura 1, repisa a altura 4. Huecos: casilla 4 (rampa) y casilla 8 (suelo). Hay que perder exactamente 3.

| Hueco 4 | Hueco 8 | Pierde | Llega con | Resultado |
|---|---|---|---|---|
| Rampa de hielo | Suelo de madera | 1 | 3 | Se pasa |
| Rampa de hielo | Suelo de asfalto | 2 | 2 | Se pasa |
| Rampa de hielo | Hondonada de hielo | 0 | 4 | Se pasa |
| Rampa de arena | Suelo de madera | 4 | 0 | Se queda en el borde |
| Rampa de arena | Suelo de asfalto | 5 | — | No llega |
| **Rampa de arena** | **Hondonada de hielo** | **3** | **1** | **Victoria** |

La hondonada enseña que **la forma no frena; el material, sí**. `herramientas/validar-nivel.mjs` comprueba esta tabla con la simulación real.

## Diseño de niveles

- Muchas piezas distintas y, en lo posible, **una única solución**: el validador cuenta las soluciones.
- Como la energía final solo depende de la suma de pérdidas, intercambiar dos suelos da lo mismo. Para que el orden importe, usar piezas con condiciones locales (loops, saltos).
- Estrellas por intentos (3 a la primera, 2 a la segunda, 1 después): se puede ir probando, pero el juego premia calcular. Tras dos fallos aparece una pista con el balance incompleto.

## Simulación

Eme es un punto que desliza por la pista (1D, por longitud de arco): Ec = E₀ − h − calor y v = √(2·G·Ec). El rozamiento de cada pieza se reparte a lo largo de su tramo para que pierda exactamente sus julitos, sea cual sea su forma. Es determinista y la energía total se conserva exactamente. Nada de motores de física genéricos.

Eme **desliza, no rueda**: un objeto que rueda tendría energía de rotación (½Iω²).

## Personaje: Eme

Cubo naranja (`#F2A33A`, sombra `#D9822B`) con trazo de lápiz, ojos grandes y una «m» en el costado que odia llevar. Sarcástico y harto de los enunciados: *«Desprecie el rozamiento», dicen. Ojalá.* Sus expresiones dependen de la física: traga saliva en la salida, ojos como platos con mucha Ec, cara de esfuerzo y sudor en la arena, feliz en el hielo, tambaleo en el borde, bandera de sombrero al ganar. Al frenar no se inclina hacia atrás (el rozamiento en la base lo vuelca hacia delante).

Referencias en `arte/`: hoja de personaje, animación *idle*, boceto de interfaz.

## Interfaz (móvil en vertical primero)

De arriba abajo: barra superior (nivel, estrellas) · barra de julitos · tablero cuadrado a todo el ancho · bandeja de piezas deslizable · botones grandes al alcance del pulgar.

- **Tocar y tocar:** tocas una pieza (se levanta, los huecos donde encaja laten y los demás se apagan) y luego el hueco. También al revés: tocas un hueco y la bandeja filtra las piezas que encajan. Tocar una pieza colocada la devuelve a la bandeja.
- **Lanzamiento:** la bandeja se cambia por la energía en directo; cámara lenta ×0,5, pausa y parar.
- **Resultado:** panel inferior con estrellas, balance agrupado (8 = 4 + 3 + 1) y la frase de Eme.
- Rejilla 3 × 3 en gris claro sobre el terreno; cuadritos de altura en azul muy suave.

## Pendiente

- Más niveles del Mundo I (más huecos y piezas, muelles que *dan* julitos).
- Arrastrar piezas, además de tocar.
- Animaciones de victoria y caída más elaboradas, sonido.
- PWA, imagen para compartir, dominio propio.
