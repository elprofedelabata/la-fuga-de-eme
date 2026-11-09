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

## Meta: pararse a la altura objetivo

La meta es una repisa plana a la altura objetivo, con la bandera en su borde y un precipicio detrás. La repisa no frena. Al llegar a ella con:

- **0 julitos de Ec** → se para justo en el borde (victoria). Después celebra: avanza a saltitos por la repisa hasta la bandera y se la pone de sombrero (la repisa es plana, así que la Ep no cambia).
- **1 o más** → le sobra energía: cruza la repisa y cae por el precipicio («¡Te pasaste!»).
- Si no tiene energía para subir hasta la repisa, se da la vuelta («¡No llega!»).

Es el balance en estado puro: **Ep final = energía inicial − pérdidas**. El objetivo se muestra siempre: una línea bajo el título («Objetivo: que Eme se pare en la bandera, a altura 5»), el número de la meta en rojo en la regla y una línea discontinua roja a esa altura que llega hasta la bandera.

## Nivel 1 · «Ni más, ni menos»

Salida a altura 8 (8 julitos), suelo a altura 1, meta a altura 5. Huecos: casilla 4 (rampa) y casilla 8 (suelo). Hay que perder exactamente 3.

| Hueco 4 | Hueco 8 | Pierde | Llega con | Resultado |
|---|---|---|---|---|
| Rampa de hielo | Suelo de madera | 1 | 2 | Se pasa |
| Rampa de hielo | Suelo de asfalto | 2 | 1 | Se pasa |
| Rampa de hielo | Hondonada de hielo | 0 | 3 | Se pasa |
| Rampa de arena | Suelo de madera | 4 | — | No llega |
| Rampa de arena | Suelo de asfalto | 5 | — | No llega |
| **Rampa de arena** | **Hondonada de hielo** | **3** | **0** | **Victoria** |

La hondonada enseña que **la forma no frena; el material, sí**. `herramientas/validar-nivel.mjs` comprueba esta tabla con la simulación real.

## Diseño de niveles

- Muchas piezas distintas y, en lo posible, **una única solución**: el validador cuenta las soluciones.
- Como la energía final solo depende de la suma de pérdidas, intercambiar dos suelos da lo mismo. Para que el orden importe, usar piezas con condiciones locales (loops, saltos).
- Estrellas por intentos (3 a la primera, 2 a la segunda, 1 después): se puede ir probando, pero el juego premia calcular. Tras dos fallos aparece una pista con el balance incompleto («8 = 5 + ¿?»).

## Simulación

Eme es un punto que desliza por la pista (1D, por longitud de arco): Ec = E₀ − h − calor y v = √(2·G·Ec). El rozamiento de cada pieza se reparte a lo largo de su tramo para que pierda exactamente sus julitos, sea cual sea su forma. Es determinista y la energía total se conserva exactamente. Nada de motores de física genéricos.

Eme **desliza, no rueda**: un objeto que rueda tendría energía de rotación (½Iω²).

## Personaje: Eme

Cubo naranja (`#F2A33A`, sombra `#D9822B`) con trazo de lápiz, ojos grandes y una «m» en el costado que odia llevar. Sarcástico y harto de los enunciados: *«Desprecie el rozamiento», dicen. Ojalá.* Sus expresiones dependen de la física: traga saliva en la salida, ojos como platos con mucha Ec, cara de esfuerzo y sudor en la arena, feliz en el hielo, tambaleo en el borde, bandera de sombrero al ganar. Al frenar no se inclina hacia atrás (el rozamiento en la base lo vuelca hacia delante).

Referencias en `arte/`: hoja de personaje, animación *idle*, boceto de interfaz.

## Interfaz (móvil en vertical primero)

De arriba abajo: barra superior (nivel, estrellas) · barra de julitos · tablero cuadrado a todo el ancho · bandeja de piezas deslizable · botones grandes al alcance del pulgar.

- **Arrastrar:** la pieza sale de la bandeja (queda su silueta discontinua) y flota con sombra, con inercia y una ligera inclinación según la velocidad; en móvil va por encima del dedo. Cerca de un hueco compatible se **engancha** (imán, borde naranja); los huecos que no la admiten se apagan. Al soltar encaja con rebote, polvo y una vibración corta; si se suelta fuera, vuelve volando a su sitio. Las piezas del tablero también se pueden sacar arrastrando. Eme sigue la pieza con la mirada.
- En la bandeja táctil, deslizar en horizontal la desplaza; tirar de una pieza hacia arriba la arrastra.
- **Tocar y tocar** (también animado: la pieza vuela al hueco): tocas una pieza y luego el hueco, o al revés (el hueco filtra la bandeja). Tocar una pieza colocada, o su silueta, la devuelve. Soltar sobre un hueco ocupado devuelve la anterior.
- **Cursores propios con ratón:** lápiz por defecto (la punta hace clic), mano abierta sobre las piezas que se pueden coger y mano cerrada (la misma mano con los dedos recogidos) en cuanto se pulsa sobre una pieza y mientras se arrastra. En pantallas táctiles no se usan.
- **Sin textos de ayuda:** la interfaz se explica sola con lo visual. Un hueco donde la pieza no encaja, o los huecos vacíos al pulsar Lanzar, parpadean en rojo.
- **Lanzamiento:** la bandeja se cambia por la energía en directo; cámara lenta ×0,5, pausa y parar.
- **Resultado:** panel inferior con estrellas, balance agrupado (8 = 4 + 3 + 1) y la frase de Eme.
- Rejilla 3 × 3 en gris claro sobre el terreno; cuadritos de altura en azul muy suave.
- **Regla de alturas** fuera del tablero, a la izquierda: un número por cuadrito, todos con el mismo estilo (escala uniforme). El tamaño de letra se adapta al número de cuadritos, pensando en niveles con cuadritos más pequeños. Un marcador naranja sigue la altura de Eme en directo: es su Ep.

## Pendiente

- Más niveles del Mundo I (más huecos y piezas, muelles que *dan* julitos).
- Animaciones de victoria y caída más elaboradas, sonido.
- PWA, imagen para compartir, dominio propio.
