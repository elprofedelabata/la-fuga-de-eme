# La fuga de Eme · diseño

## Idea

Puzzle de física en una rejilla de **3 × 3 casillas**. Cada casilla es una pieza de una misma situación física (rampas, suelos, repisas…). Algunas casillas están vacías y el jugador elige, entre varias piezas, las que hacen que Eme llegue a la meta. Se puede resolver con lápiz y papel antes de pulsar *Lanzar*; la simulación da o quita la razón.

**Ciclo didáctico:** predecir → comprobar → entender el balance de energía.

## Público y progresión

De 4.º de ESO a 2.º de Bachillerato, por mundos (capas del libro de las que Eme escapa):

| Mundo | Estilo | Física |
|---|---|---|
| **I · El cuaderno** | Papel cuadriculado, lápiz | Julitos enteros; rozamiento por casilla; energía elástica; condiciones locales (jorobas, paredes) |
| **II · El libro de texto** | Páginas impresas, figuras con θ | Números reales (m, μ, d), rozamiento con cos θ, ½kx², trabajo de fuerzas externas, choques |
| **III · La pizarra** | Tiza sobre verde | Loops (2,5 R), tiro parabólico, rozamiento que depende de la velocidad, péndulo |
| **Final · Fuera del libro** | Color | La misma altura no siempre vale lo mismo: otros planetas y Arquímedes |

El detalle de cada pieza está en el **catálogo de mecánicas**.

## Catálogo de mecánicas

**Regla de oro: toda pieza tiene un significado físico.** Nada de «reglas de videojuego»: si una pieza da o quita energía, tiene que haber una causa física que se pueda explicar en clase.

### Ya en el juego

| Pieza | Física | Comportamiento |
|---|---|---|
| Suelos y rampas de materiales | Rozamiento (trabajo no conservativo → calor) | Cada material quita sus julitos por casilla: hielo 0, madera 1, asfalto 2, arena 3 |
| Hondonadas | La forma no frena: solo cuenta el material | Bajan y suben sin perder energía (si son de hielo) |
| Repisa de meta | Ep final = energía inicial − pérdidas | Hay que llegar con 0 julitos de Ec |

### Mundo I · El cuaderno (julitos enteros)

- **Muelles cargados** (+N). Un muelle **no crea energía**: lanza a Eme porque estaba comprimido y tenía energía elástica guardada. La pieza lo muestra («muelle cargado: 3 julitos») y suma con la etiqueta «+N ■».
- **Superficies elásticas: rebotadores y colchones.** Devuelven la energía que reciben menos una pérdida (restitución) y cambian el sentido de Eme. Un rebotador perfecto pierde 0; un colchón, 1.
- **Jorobas.** Para pasar por encima hay que llegar a la cima con energía suficiente (Ep de la cima + algo de Ec). Introducen las **condiciones locales**: ya no basta con que cuadre el total; **el orden de las piezas importa**.
- **Paredes de papel** con un parámetro de **resistencia N**. Si Eme llega con Ec ≥ N, la atraviesa y pierde N julitos (trabajo para romperla). Si llega con menos, el choque es inelástico: **se estampa y se para** (nuevo tipo de fallo). Con Ec = N justo, la rompe y se queda parado detrás.
- **Agua (−1 julito por tramo).** El rozamiento con el agua, simplificado como el de la arena. Puede ser un nivel entero bajo el agua.

### Mundo II · El libro de texto (números reales)

- **Piezas giratorias** (mecánica que se desbloquea aquí): la misma pieza puede subir o bajar, o empujar a favor o en contra.
- **Cinta transportadora.** Trabajo de una fuerza externa (W = F·d): en un sentido suma julitos y en el contrario los resta. Encaja con las piezas giratorias.
- **Ventilador.** El aire empuja durante su tramo: a favor suma, en contra resta. (Una rata empujando queda como posible guiño de personaje.)
- **Rozamiento con ángulo y longitud reales:** W = μ·m·g·cos θ·d. La rampa de arena ya no «come 3 por casilla» («¿por qué?»).
- **Muelles con k y x:** Ep elástica = ½·k·x².
- **Choque con otro bloque:** conservación del momento lineal; en un choque inelástico parte de la energía se va en calor.
- **EME, el primo grande** (*M* mayúscula): llega igual de lejos porque la masa se cancela (nivel trampa).

### Mundo III · La pizarra

- **Loops con Ec mínima.** Arriba del loop hace falta v² ≥ g·R, es decir, **Ec arriba ≥ R/2 julitos** (con R en cuadritos). Desde abajo equivale a entrar con **Ec ≥ 2,5·R** (la clásica «altura 2,5 R»): con R = 2 cuadritos hay que entrar con 5 julitos. Si no, Eme se despega y cae.
- **Saltos con Ec mínima y máxima.** Lanzado a 45° y aterrizando a la misma altura, **alcance = 2·Ec** (cada julito de Ec da 2 cuadritos). La plataforma de aterrizaje tiene un ancho: si se queda corto cae al hueco y si se pasa la sobrevuela. Ni más, ni menos.
- **Agua que frena según la velocidad** (rozamiento viscoso): por ejemplo, −2 julitos por tramo si llega rápido y −1 si llega lento.
- **Péndulo:** Eme se agarra a una cuerda; Ep ↔ Ec en movimiento circular, con la tensión.

### Final · Fuera del libro

- **Otros planetas:** en la Luna, la misma altura vale menos julitos (Ep = m·g·h).
- **Empuje de Arquímedes** bajo el agua: Eme «pesa menos» y la misma altura da menos julitos.
- Niveles que mezclan todo lo anterior.

## Julitos (Mundo I)

- 1 cuadrito de altura = 1 julito de Ep. El tablero mide 9 × 9 cuadritos.
- Cada material se come un número fijo de julitos por casilla: hielo 0, madera 1, asfalto 2, arena 3.
- Simplificación consciente: en el Mundo I una rampa de arena come lo mismo que un suelo de arena. En el Mundo II se rompe a propósito («¿por qué la rampa ya no come 3?»).
- La energía siempre suma lo mismo. Colores: **Ep azul**, **Ec amarillo**, **calor rojo**. Cada julito que se pierde aparece junto a Eme como «−1 ■» flotante que se desvanece (y «+1 ■» cuando haya piezas que den energía). Las etiquetas se reparten de forma regular por el tramo de la pieza: si quita n julitos, salen en las posiciones 1/(n+1), 2/(n+1)… (madera al 50 %; asfalto al 33 % y 67 %; arena al 25 %, 50 % y 75 %). No es como se pierde de verdad, pero se lee mejor.

## Meta: pararse a la altura objetivo

La meta es una repisa plana a la altura objetivo, con la bandera en su borde y un precipicio detrás. La repisa no frena. Al llegar a ella con:

- **0 julitos de Ec** → se para justo en el borde (victoria). Después celebra: avanza a saltitos por la repisa hasta la bandera y se la pone de sombrero (la repisa es plana, así que la Ep no cambia).
- **1 o más** → le sobra energía: cruza la repisa y cae por el precipicio gritando un «¡Aaaaah!» que se alarga, tiembla y se desvanece («¡Te pasaste!»).
- Si no tiene energía para subir hasta la repisa, se da la vuelta («¡No llega!»). Se muestra todo el vaivén hasta que se para y, entonces, el resultado. Si no se va a parar nunca (sin rozamiento que lo frene), tras dos ciclos completos de ida y vuelta se marea (ojos en espiral y estrellitas) y sale el resultado mientras sigue balanceándose.

Es el balance en estado puro: **Ep final = energía inicial − pérdidas**. El objetivo se muestra siempre: una línea bajo el título que dice de dónde sale y adónde llega («Sale con **8** julitos · Meta: pararse a altura **5**», el 8 en naranja como Eme y su marcador, el 5 en rojo), el número de la meta en rojo en la regla y una línea discontinua roja a esa altura que llega hasta la bandera. No hay barra de julitos fija: la energía se ve en directo durante el lanzamiento y en el balance final.

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
- Como la energía final solo depende de la suma de pérdidas, intercambiar dos suelos da lo mismo. Para que el orden importe, usar piezas con condiciones locales: jorobas, paredes de papel, loops y saltos.
- Cada mundo introduce sus mecánicas de una en una y luego las combina (ver el catálogo).
- Estrellas por intentos (3 a la primera, 2 a la segunda, 1 después): se puede ir probando, pero el juego premia calcular. Tras dos fallos aparece una pista con el balance incompleto («8 = 5 + ¿?»).

## Simulación

Eme es un punto que desliza por la pista (1D, por longitud de arco): Ec = E₀ − h − calor y v = √(2·G·Ec). El rozamiento de cada pieza se reparte a lo largo de su tramo para que pierda exactamente sus julitos, sea cual sea su forma. Es determinista y la energía total se conserva exactamente. Nada de motores de física genéricos.

Eme **desliza, no rueda**: un objeto que rueda tendría energía de rotación (½Iω²).

## Personaje: Eme

Cubo naranja (`#F2A33A`, sombra `#D9822B`) con trazo de lápiz, ojos grandes y una «m» en el costado que odia llevar. Sarcástico y harto de los enunciados: *«Desprecie el rozamiento», dicen. Ojalá.* Sus expresiones dependen de la física: traga saliva en la salida, ojos como platos con mucha Ec, cara de esfuerzo y sudor en la arena, feliz en el hielo, tambaleo en el borde, bandera de sombrero al ganar. Al frenar no se inclina hacia atrás (el rozamiento en la base lo vuelca hacia delante).

Referencias en `arte/`: hoja de personaje, animación *idle*, boceto de interfaz.

## Logo y pantalla de carga

- **Logo** (`img/logo.svg`, generado por `arte/logo.py`): Eme saliendo disparado de un trozo de hoja de cuaderno rasgada, con líneas de velocidad, y el nombre «La fuga de / **Eme**». Las letras son trazos propios a mano (no texto con fuente), así que se ve igual en cualquier sitio y antes de que cargue la tipografía. «Eme» va en naranja con contorno de lápiz.
- **Imagen para compartir** (`img/compartir.png`, 1200 × 630): logo, lema, julitos y el tablero real del nivel 1 con Eme en la meta. Se compone en `arte/compartir.html` (que dibuja el tablero con el código del juego) y se captura con Chrome sin ventana (el comando está en el propio archivo).
- **Pantalla de carga:** el logo flotando y 8 julitos que se llenan de azul uno a uno («Cargando julitos…»). Dura al menos 2 s desde que empieza a cargar la página y se desvanece para dar paso a la pantalla de inicio.

## Pantalla de inicio

Tras la carga: el logo flotando, Eme de pie sobre una tira de papel rasgada (respira, parpadea, mira a los botones y a veces se aburre) y dos botones, **JUGAR** y **OPCIONES**, con el pie «Un juego de El profe de la bata · boceto v0.1» (`js/inicio.js`).

- **JUGAR** → la primera vez, la historia; después, la selección de niveles.
- **OPCIONES** → ventana de opciones (ver abajo).

## Opciones

Ventana modal (`js/opciones.js`) que se abre desde OPCIONES en la portada o desde ☰ en el juego, con aspecto de hoja de cuaderno:

- **Apariencia:** Calidad (Baja · Media · Alta) y Modo (Claro · Oscuro).
- **Sonido:** volumen General, Música y Efectos (deslizadores con el mando como Eme).
- **Datos:** «Borrar progreso», con confirmación en dos pasos. Borra todo lo que el juego guarda (claves `fuga-eme-*`: estrellas, historia vista y opciones) y recarga el juego como la primera vez.

De momento solo «Borrar progreso» tiene efecto; el resto se recuerda en `localStorage` (`fuga-eme-opciones`) pero aún no se aplica.

## Selección de niveles

`js/niveles.js`. Cabecera con ← (vuelve a la portada), «Elige nivel» y las estrellas totales. Debajo, los mundos como tarjetas, cada una con su estilo:

- **I · El cuaderno:** papel cuadriculado, margen rojo y anillas.
- **II · El libro de texto:** página con renglones, títulos en letra de imprenta y esquina doblada.
- **III · La pizarra:** tiza sobre verde y marco de madera.
- **Final · Fuera del libro:** cielo y sol, un único nivel.

Los niveles de cada mundo (6, y 1 el final; numerados de forma correlativa) van unidos por un camino discontinuo en zigzag. Estados: completado (naranja, con sus estrellas debajo), siguiente (naranja, late), bloqueado (gris con candado; al tocarlo tiembla). Un nivel se desbloquea al completar el anterior. Los mundos bloqueados se ven apagados con «Termina el mundo anterior». De momento solo se puede jugar el nivel 1.

Las mejores estrellas de cada nivel se guardan en `localStorage` (`js/progreso.js`). Desde el juego se vuelve al mapa con ☰ → «Elegir nivel». Flujo: carga → portada → (historia, la primera vez) → niveles → nivel. La historia termina contando el plan de los mundos, que es justo lo que muestra el mapa de niveles a continuación. Al cambiar de pantalla, la siguiente se coloca debajo y la anterior se **arranca** (ver «Transiciones»).

## Transiciones: arrancar la hoja

Todos los cambios de pantalla (carga → portada, portada ↔ niveles, niveles → nivel, final de la historia) usan la misma transición, transgresora y de la casa (`js/transicion.js`): la pantalla se tensa, se rasga por una línea irregular junto al borde izquierdo, como una hoja arrancada de un cuaderno de espiral, y sale volando girando mientras debajo ya está la siguiente. A la izquierda queda un momento la tira rota con los agujeros de la espiral. El borde roto se genera al azar cada vez y lleva trazo de lápiz. Dura ~0,7 s; con «reducir movimiento», el cambio es directo. `herramientas/prueba-arrancar.html?t=ms` congela el efecto en un instante para revisarlo.

## Historia de primer acceso

La primera vez que se pulsa JUGAR se reproduce sola una historia de ~30 s en 7 escenas dibujadas con el estilo del juego (`js/historia.js`):

1. Una página del libro de física: «Un bloque de masa *m* se desliza por un plano inclinado…» (el bloque aún no tiene cara).
2. Problema tras problema, siempre el mismo plano y «desprecie el rozamiento».
3. El bloque abre los ojos: «¿Otra vez?».
4. Salta fuera de la página: decide escaparse del libro.
5. El plan, en un mapa: cuaderno → libro de texto → pizarra → mundo real (los mundos del juego).
6. El problema: cada pista le roba energía; los julitos que pierde se van en calor.
7. La misión: elegir las piezas para que llegue justo a la bandera. Ni más, ni menos. Botón «¡Vamos!».

Los textos van **dentro del dibujo**, no en una franja aparte, para leer y ver la acción a la vez: el enunciado del libro, impreso en la página (con «Desprecie el rozamiento» resaltado con rotulador), y la voz del narrador como notas a mano en naranja, en los huecos libres de cada escena. Se escriben letra a letra y cada escena avanza cuando ha dado tiempo a leerla. Tocar adelanta (completa el texto o pasa de escena); «Saltar» (o Esc) la cierra en cualquier momento. Se recuerda en `localStorage` y se puede volver a ver desde el menú.

## Interfaz (móvil en vertical primero)

De arriba abajo: barra superior (nivel, estrellas) · línea del objetivo · tablero cuadrado con la regla de alturas · bandeja de piezas deslizable · botones grandes al alcance del pulgar.

- **Arrastrar:** la pieza sale de la bandeja (queda su silueta discontinua) y flota con sombra, con inercia y una ligera inclinación según la velocidad; en móvil va por encima del dedo. Cerca de un hueco compatible se **engancha** (imán, borde naranja); los huecos que no la admiten se apagan. Al soltar encaja con rebote, polvo y una vibración corta; si se suelta fuera, vuelve volando a su sitio. Las piezas del tablero también se pueden sacar arrastrando. Eme sigue la pieza con la mirada.
- En la bandeja táctil, deslizar en horizontal la desplaza; tirar de una pieza hacia arriba la arrastra.
- **Tocar y tocar** (también animado: la pieza vuela al hueco): tocas una pieza y luego el hueco, o al revés (el hueco filtra la bandeja). Tocar una pieza colocada, o su silueta, la devuelve. Soltar sobre un hueco ocupado devuelve la anterior.
- **Cursores propios con ratón:** flecha clásica por defecto (con el mismo trazo que las manos; un lápiz invitaba a pensar que se podía escribir); dedo índice sobre lo que se pulsa (botones, huecos vacíos, la silueta de una pieza, el bocadillo); mano abierta sobre las piezas que se pueden coger; mano cerrada (la misma mano con los dedos recogidos) en cuanto se pulsa sobre una pieza y mientras se arrastra. En pantallas táctiles no se usan.
- **Hover de los botones (ratón):** se levantan un poco con una ligera inclinación, como un papel, con más sombra y color más claro.
- **Sin textos de ayuda:** la interfaz se explica sola con lo visual. Un hueco donde la pieza no encaja, o los huecos vacíos al pulsar Lanzar, parpadean en rojo.
- **Lanzamiento:** la bandeja se cambia por la energía en directo; cámara lenta ×0,5, pausa y parar. Cada tramo de la barra lleva su icono: montaña para Ep (altura), velocímetro para Ec (rapidez) y llama para el calor. Los mismos iconos, en el color de cada energía, acompañan al balance del resultado.
- **Resultado:** panel inferior con estrellas, balance agrupado (8 = 4 + 3 + 1) y la frase de Eme.
- Rejilla 3 × 3 en gris claro sobre el terreno; cuadritos de altura en azul muy suave.
- **Regla de alturas** fuera del tablero, a la izquierda: un número por cuadrito, todos con el mismo estilo (escala uniforme). El tamaño de letra se adapta al número de cuadritos, pensando en niveles con cuadritos más pequeños. Un marcador naranja sigue la altura de Eme en directo: es su Ep.

## Pendiente

- Niveles 2 a 6 del Mundo I con las mecánicas del catálogo (muelles, rebotadores, jorobas, paredes de papel, agua).
- Animaciones de victoria y caída más elaboradas, sonido.
- PWA, dominio propio.
