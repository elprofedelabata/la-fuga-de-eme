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
| Bajadas, suelos y rampas de materiales | Rozamiento (trabajo no conservativo → calor) | Cada material quita sus julitos por casilla: hielo 0, madera 1, asfalto 2, arena 3 |
| Hondonadas | La forma no frena: solo cuenta el material | Bajan y suben sin perder energía (si son de hielo) |
| Repisa de meta | Ep final = energía inicial − pérdidas | Hay que llegar con 0 julitos de Ec |
| Montañitas y colinas | Lo que se gasta al subir se recupera al bajar; la cima exige energía | Sin rozamiento no cuestan nada; con rozamiento, hay que llegar arriba con energía (el orden importa) |
| **Escaleras mecánicas** (+N) | Trabajo de una fuerza externa: el motor eléctrico da energía a Eme | Dan N julitos repartidos por su tramo (pegatina verde «+N», etiquetas «+1 ■»). Llevan a Eme aunque vaya sin velocidad y solo suben: si vuelve hacia atrás, se queda arriba. La **averiada** (+0) no tiene motor: es una cuesta normal |

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
- **Rozamiento con ángulo y longitud reales:** W = μ·m·g·cos θ·d. La bajada de arena ya no «come 3 por casilla» («¿por qué?»).
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
- Simplificación consciente: en el Mundo I una bajada de arena come lo mismo que un suelo de arena. En el Mundo II se rompe a propósito («¿por qué la bajada ya no come 3?»).
- La energía siempre suma lo mismo, salvo que una pieza con motor (las escaleras mecánicas) le dé más: entonces la barra de energía crece y el balance queda «salida + lo que dan las escaleras = altura de la meta + pérdidas». Colores: **Ep azul**, **Ec amarillo**, **calor rojo**, lo que da un motor **verde**. Cada julito que se pierde aparece junto a Eme como «−1 ■» flotante que se desvanece, y cada uno que gana, como «+1 ■» verde. Las etiquetas se reparten de forma regular por el tramo de la pieza: si quita n julitos, salen en las posiciones 1/(n+1), 2/(n+1)… (madera al 50 %; asfalto al 33 % y 67 %; arena al 25 %, 50 % y 75 %). No es como se pierde de verdad, pero se lee mejor.

## Meta: pararse a la altura objetivo

La meta es una repisa plana a la altura objetivo, con la bandera en su borde y un precipicio detrás. La repisa no frena. Al llegar a ella con:

- **0 julitos de Ec** → se para justo en el borde (victoria). Después celebra: avanza a saltitos por la repisa hasta la bandera y se la pone de sombrero (la repisa es plana, así que la Ep no cambia).
- **1 o más** → le sobra energía: cruza la repisa y cae por el precipicio gritando un «¡Aaaaah!» que se alarga, tiembla y se desvanece («¡Te pasaste!»).
- Si no tiene energía para subir hasta la repisa, se da la vuelta («¡No llega!»). Se muestra todo el vaivén hasta que se para y, entonces, el resultado. Si no se va a parar nunca (sin rozamiento que lo frene), tras dos ciclos completos de ida y vuelta se marea (ojos en espiral y estrellitas) y sale el resultado mientras sigue balanceándose.

Es el balance en estado puro: **Ep final = energía inicial − pérdidas**. El objetivo se lee **en el propio tablero**: de dónde sale Eme (su plataforma y su marcador naranja en la regla) y adónde tiene que llegar (la bandera, el número de la meta en rojo en la regla y una línea discontinua roja a esa altura que llega hasta la bandera). No hay una línea de texto con el objetivo: se quitó para dar más espacio al tablero (para lectores de pantalla, el tablero lo dice en su descripción). No hay barra de julitos fija: la energía se ve en directo durante el lanzamiento y en el balance final.

## Niveles del Mundo I

El cuaderno tiene **10 niveles**.

**Tablero.** Tiene **3 filas** de casillas (9 cuadritos de alto: la regla va de 0 a 9) o más (`filas`; con 4, 12 de alto, como en el nivel 10) y **3 o más columnas** (`columnas`; 3 por defecto). Cada casilla mide 3 x 3 cuadritos y se numeran por filas, de arriba abajo y de izquierda a derecha (en un tablero de 4 columnas, la fila de abajo son las casillas 9 a 12). Cada nivel elige su **trazado** de pista (`trazado`): la «U» de los niveles 1 a 3, el valle con colina del nivel 4, etc. La repisa de la meta ocupa siempre los últimos 1,6 cuadritos del tablero, hasta el precipicio.

**Nombres de las piezas:** las que bajan son **bajadas** y las que suben, **rampas** (además de suelos, colinas y escaleras mecánicas). Todas las bajadas de un nivel aceptan las mismas piezas, aunque su forma cambie un poco de un hueco a otro.

**Piezas dobles.** Ocupan dos huecos contiguos de la misma forma: en vertical (`doble: 'v'`, el hueco y el de debajo) o en horizontal (`doble: 'h'`, el hueco y el de su derecha). Una zona de dos huecos se puede rellenar con una doble o con dos simples. No traen física nueva, pero enseñan que **el rozamiento depende de la longitud**: cada material quita sus julitos por casilla, así que una pieza doble de madera quita 2 (su pegatina lo dice: −2). Se colocan igual que las simples (tocando cualquiera de sus dos huecos, o arrastrándolas: el imán engancha la pareja de huecos). Si una pieza nueva cae sobre una doble, la doble vuelve entera a la bandeja. En la bandeja, su miniatura muestra las dos casillas.

**La «U»** (niveles 1 a 3, 3 columnas): plataforma de salida y bajada (casillas 1, 4 y 7), suelo (casilla 8) y rampa en S hasta la repisa de la meta (casillas 9, 6 y 3). Cada nivel elige la altura de salida, la de la meta, qué casillas están vacías y qué piezas hay. Formas de hueco: **bajada** (casilla 4), **suelo** (casilla 8) y **rampa** (casilla 6). Perfiles del suelo: plano, hondonada y montañitas de 1 y 2 cuadritos de alto. Los niveles están en `js/nivel.js` y el validador los comprueba todos.

**Continuidad del camino.** Cada nivel es un tramo del camino de Eme y **empieza donde acabó el anterior**: la altura de salida de un nivel es la de la meta del anterior (el validador lo comprueba). Más adelante, elementos decorativos reforzarán esa continuidad espacial.

### Nivel 1 · «Lo que baja, sube» (tutorial)

Enseña los controles básicos sin física que calcular. Sale a altura 7 y la meta está a altura 7. Tres huecos (bajada, suelo y rampa) y tres piezas de hielo, cada una con una forma que solo encaja en su hueco. Sin rozamiento, **Eme sube justo hasta la altura de la que salió**: la conservación de la energía en estado puro (balance 7 = 7).

- **Bienvenida** (`js/bienvenida.js`, solo la primera vez). El nivel arranca limpio, sin consejos. Al segundo, la pantalla se **oscurece con un fundido suave** (`js/foco.js`) y Eme sube desde abajo en **primer plano** para presentarse. Habla con bocadillos que se escriben letra a letra mientras mueve la boca; debajo de cada uno, «Haz clic para continuar» («Toca para continuar» en pantallas táctiles). Al tocar el bocadillo se completa el texto o se pasa al siguiente. Las frases están en los datos del nivel (`bienvenida`):
  1. «¡Hola! Soy Eme.»
  2. «Sí, el bloque de masa m de los problemas de física. El que siempre se desliza "sin rozamiento".»
  3. «Hoy me escapo del libro… ¡y tú vas a ayudarme!»
  4. «Tú construyes la pista con las piezas y yo me deslizo por ella.»
  5. «Ven, que te enseño cómo se hace.»

  Al terminar, Eme baja del primer plano y, con la pantalla aún oscura, sigue hablando desde el tablero. Se recuerda en `fuga-eme-bienvenida-vista` (Restablecer datos la borra).
- **Charla en el tablero** (solo la primera vez, datos `charla` del nivel). Con todo oscurecido y bloqueado, Eme habla **desde su sitio en la salida**, con su bocadillo de siempre, ambos por encima del oscurecimiento. Mismo sistema: el texto se escribe letra a letra mientras mueve la boca, «Haz clic para continuar» y tocar el bocadillo para avanzar. Cada frase puede iluminar una zona de la interfaz y Eme la mira:
  1. «¡Aquí estoy! Arriba del todo, en la salida.»
  2. «Mira la regla: estoy a 7 cuadritos de altura.» (se ilumina la regla)
  3. «Cada cuadrito de altura es 1 julito de energía potencial. Así que salgo con 7 julitos.» (se iluminan Eme en la salida y el 7 de la regla)
  4. «Mi objetivo: llegar a esa bandera y pararme justo ahí, a altura 7.» (se iluminan la repisa con la bandera y el 7 de la regla)
  5. «Tengo que llegar sin nada de energía cinética. Si llego con velocidad, me paso de largo… ¡y me caigo!» (cara de susto)
  6. «Pero a la pista le faltan trozos: estos huecos.» (se iluminan los tres huecos, latiendo)
  7. «Tú los rellenas con las piezas de abajo. Cada una encaja en el hueco que tiene su misma forma.» (se ilumina la bandeja)
  8. «Cuando la pista esté completa, pulsa LANZAR y allá que voy.» (se ilumina LANZAR)
  9. «Y si quieres empezar de cero, este botón quita todas las piezas de la pista.» (se ilumina el botón de reiniciar)

  Se recuerda en `fuga-eme-charla-1-vista`. Después llega la guía del primer movimiento.
- **Bocadillos de Eme** (`js/escritura.js`). El del tablero se coloca solo para que su pico salga de la **boca de Eme**, esté donde esté la salida; si Eme está muy arriba, el bocadillo no se sale del tablero y el pico baja hasta la boca. Al escribirse letra a letra, el texto entero ya está puesto (lo que falta, invisible), así que ninguna palabra salta de línea. Nada se corta feo: un número va siempre con su palabra («7 julitos»), las citas cortas entre comillas no se parten («sin rozamiento») y las dos últimas palabras van juntas, para que la última línea nunca se quede con una palabra suelta.
- **Guía del primer movimiento.** Con la pantalla oscurecida (tras la charla o, si ya se vio, al segundo de empezar el nivel, con un fundido suave), Eme y su bocadillo («¡Empecemos! Arrastra la bajada de hielo hasta su hueco», escrito letra a letra mientras Eme mira la bandeja) quedan **por encima del oscurecimiento**, sin aura (Eme se pinta en una capa propia del lienzo). Además se iluminan el hueco de la bajada (latiendo) y la bajada en la bandeja, con una **mano fantasma** (`js/tutorial.js`) que hace el gesto de llevarla a su hueco, en bucle.
- Mientras dura, **todo lo demás está bloqueado**: las otras piezas tiemblan si se tocan, los otros huecos no responden y LANZAR y Vaciar están desactivados.
- **Felicitación.** Al colocar la bajada, se ve un momento cómo encaja (solo su hueco iluminado) y Eme vuelve en **primer plano**, como en la bienvenida, a felicitar al jugador (datos `felicitacion` del nivel):
  1. «¡Eso es! ¡Lo has hecho genial!»
  2. «Ahora sigue tú: coloca las otras dos piezas y pulsa LANZAR.»
  3. «Yo te espero en la salida. ¡Tú puedes!»

  Después Eme baja, se va el oscurecimiento y se libera todo: el resto lo hace el jugador solo. La guía (y con ella la felicitación) solo aparece mientras el nivel 1 no está superado.

### Nivel 2 · «Todos los caminos»

Empieza donde acabó el nivel 1, a altura 7, y la meta está también a altura 7. Los mismos tres huecos que el nivel 1 (bajada, suelo y rampa), pero **cinco piezas, todas de hielo**: bajada, rampa y tres para el suelo, una hondonada y dos montañitas (de 1 y de 2 cuadritos de alto). Como no hay rozamiento, las tres sirven: hay **tres soluciones**. Enseña que, sin rozamiento, **la forma del camino no importa**: lo que Eme gasta en subir una montaña lo recupera al bajarla, y llega siempre hasta la altura de la que salió (balance 7 = 7).

- Es el primer nivel con más piezas que huecos: hay que elegir, aunque aquí cualquier elección que encaje vale.
- El bocadillo lo insinúa: «Subir una montaña me cuesta julitos… pero bajarla me los devuelve».
- En los datos, `soluciones: 3` le dice al validador cuántas soluciones debe haber.

### Nivel 3 · «Ni más, ni menos»

Empieza donde acabó el nivel 2, a altura 7 (7 julitos); suelo a altura 1, meta a altura 4. Huecos: casilla 4 (bajada) y casilla 8 (suelo). Hay que perder exactamente 3.

| Hueco 4 | Hueco 8 | Pierde | Llega con | Resultado |
|---|---|---|---|---|
| Bajada de hielo | Suelo de madera | 1 | 2 | Se pasa |
| Bajada de hielo | Suelo de asfalto | 2 | 1 | Se pasa |
| Bajada de hielo | Hondonada de hielo | 0 | 3 | Se pasa |
| Bajada de arena | Suelo de madera | 4 | — | No llega |
| Bajada de arena | Suelo de asfalto | 5 | — | No llega |
| **Bajada de arena** | **Hondonada de hielo** | **3** | **0** | **Victoria** |

**Charla del rozamiento** (primer nivel con rozamiento; solo la primera vez, se recuerda en `fuga-eme-charla-3-vista`). Al segundo de empezar, con todo oscurecido y bloqueado, Eme lo explica desde la salida con el mismo sistema de bocadillos que en el nivel 1:

1. «Uy… Aquí ya no todo es hielo.» (cara de susto; se ilumina la bandeja)
2. «Cada material roza, y al rozar me quita julitos. El número de cada pieza es lo que me quita.» (se iluminan las pegatinas −0, −1, −2, −3 de las piezas)
3. «El hielo, nada. La madera, 1. El asfalto, 2. Y la arena… ¡3!» (las pegatinas)
4. «Esos julitos no desaparecen: se convierten en calor. ¡Por eso la arena quema!» (cara de esfuerzo)
5. «Salgo con 7 julitos y tengo que pararme a altura 4.» (se iluminan Eme en la salida, la bandera y sus alturas en la regla)
6. «¿Cuántos julitos tengo que perder por el camino? ¡Ni más, ni menos!» (deja la cuenta al jugador)

Después se va el oscurecimiento y se juega con normalidad. Cualquier nivel puede tener su `charla`.

La hondonada enseña que **la forma no frena; el material, sí**. `herramientas/validar-nivel.mjs` comprueba esta tabla con la simulación real.

### Nivel 4 · «La colina»

Primer tablero de **3 filas y 4 columnas**. Empieza donde acabó el nivel 3, a altura 4, y la meta está a altura 1: hay que perder 3 julitos. Trazado de **valle y colina** en la fila de abajo: bajada (casilla 9), suelo llano a altura 0,5 (casilla 10), una colina con la cima a altura 2 (casilla 11) y una rampa suave hasta la repisa de la meta (casilla 12). Las dos filas de arriba quedan libres para la decoración.

Lo nuevo: **el orden importa**. Para pasar la cima (altura 2), Eme tiene que llegar arriba habiendo perdido menos de 2 julitos (4 − 2); el rozamiento de la propia colina cuenta a medias, porque la mitad se pierde subiendo. Si pierde demasiado antes, no sube la colina, vuelve al valle y no llega, aunque la suma total sea la buena.

Piezas (7 para 3 huecos): bajada de hielo o de asfalto; suelo de hielo, de madera o de asfalto; colina de madera o de arena.

| Bajada | Suelo | Colina | Pierde | Resultado |
|---|---|---|---|---|
| **Hielo** | **Hielo** | **Arena** | **3** | **Victoria** (llega a la cima habiendo perdido 1,5) |
| Hielo | Asfalto | Madera | 3 | No sube la colina (perdió 2,5 antes de la cima) |
| Asfalto | Hielo | Madera | 3 | No sube la colina (perdió 2,5 antes de la cima) |
| Hielo | Hielo / Madera | Madera | 1 / 2 | Se pasa |
| (resto) | | | 4 o más | No llega |

Si Eme se queda en la colina, la hoja de resultado lo explica: «Su cima está a altura 2: para pasarla tenía que llegar arriba habiendo perdido menos de 2 julitos, y perdió 2,5. Las cuentas cuadraban… ¡pero el orden de las piezas importa!». El análisis (`analizar` en `js/pista.js`) recorre la pista sumando lo que pierde cada tramo para detectar estos atascos, y el validador lo contrasta con la simulación.

### Nivel 5 · «Sube, sube»

Tablero de 3 filas y 4 columnas. Empieza donde acabó el nivel 4, a altura 1, y la meta está a altura 8, arriba a la derecha. Introduce las **piezas que dan julitos**: dos huecos para **escaleras mecánicas** (casillas 10 y 7) que suben en diagonal. Eme baja un poco hasta el pie de la primera, sube por las dos y una rampa en S lo lleva a la repisa.

Piezas: escaleras mecánicas de **+3, +4 y +5** y una **averiada (+0)**. Hay que conseguir 1 + ¿? = 8: entre las dos tienen que dar **7** (la de +3 y la de +4, en cualquier orden: una solución). Con más se pasa; con la averiada no llega (se queda arriba de la otra escalera o no consigue subir).

**Charla de las escaleras** (solo la primera vez, `fuga-eme-charla-5-vista`):

1. «Uf… Estoy a altura 1 y la meta está a altura 8.» (se iluminan la salida y la meta)
2. «Con 1 julito no subo ni un escalón. ¡Necesito más energía!»
3. «Por suerte, hay escaleras mecánicas: tienen motor y, al subirme, me dan julitos.» (la bandeja)
4. «Esos julitos salen de la electricidad del motor. El número verde es lo que me da cada una.» (las pegatinas)
5. «Y ojo con la averiada: sin motor, no me da nada.»
6. «¿Cuántos julitos me tienen que dar entre las dos para pararme justo en la bandera?» (la bandera)

Las escaleras se dibujan con chapa de metal, escalones y pasamanos. La hoja de resultado muestra lo que da cada escalera en verde («1 + 4 + 3 = 8»).

### Nivel 6 · «Sube y baja» (pico de dificultad)

Tablero de **3 filas y 5 columnas**: la pista más larga hasta ahora. Empieza donde acabó el nivel 5, a altura 8, y la meta está a altura 6. Trazado de **travesía**: bajada desde lo alto hasta un valle a media altura (3,5), una **colina alta** (cima a 5,5), otra bajada en S hasta el fondo (0,5), una **escalera mecánica** que sube hasta 2,9 y una rampa en S hasta la repisa de la meta.

Combina todo lo anterior: hay que cuadrar el balance (8 + lo que da la escalera = 6 + lo que quitan las piezas) **y** llegar a la cima de la colina con energía, así que antes de la cima solo se pueden perder menos de 2,5 julitos (8 − 5,5). La colina cuenta a medias, porque la mitad se pierde subiendo.

Las **dos bajadas** (antes y después de la colina) **aceptan las mismas piezas**. Piezas (8 para 4 huecos): bajada de hielo, asfalto o arena; colina de asfalto o arena; escalera mecánica de +1, +4 o +5. De las 36 combinaciones:

- **Una solución:** bajada de hielo antes de la colina, colina de arena, bajada de arena después y escalera +4 (8 + 4 = 6 + 3 + 3). Llega a la cima habiendo perdido 1,5.
- **Tres trampas** que cuadran el balance pero no suben la colina. La más bonita es la solución con las dos bajadas **intercambiadas** (arena antes, hielo después): mismas piezas, misma suma… y Eme se queda en la colina.
- La idea clave: **el rozamiento, en la colina o después de ella**, y que la escalera devuelva lo que falte.

La hoja de resultado escribe las alturas con coma decimal y dibuja medio cuadradito en el balance para las mitades («8 = 5,5 (cima) + 2,5 (margen)»).

### Nivel 7 · «Piezas dobles»

Tablero de 3 filas y 4 columnas. Empieza donde acabó el nivel 6, a altura 6, y la meta está a altura 4: hay que perder 2. Trazado de **bajada larga y suelo largo**: la bajada atraviesa dos filas (casillas 5 y 9: pareja vertical), el suelo llano ocupa dos casillas (10 y 11: pareja horizontal) y una rampa en S sube a la meta.

Introduce las **piezas dobles**. Piezas (9 para 4 huecos): bajadas simples de hielo y asfalto; suelos simples de hielo, madera y arena; bajadas dobles de hielo y madera; suelos dobles de madera y asfalto. De las 32 formas de rellenar los huecos:

- **Una solución:** bajada doble de hielo y suelo doble de madera (6 = 4 + 2): el suelo doble de madera quita 2, uno por casilla.
- Con dos piezas simples en una zona, el orden daría dos soluciones (intercambiarlas no cambia nada), así que el nivel está pensado para que la solución use dos dobles y ninguna combinación de simples sume justo 2.

La bajada simple se dibuja en la bandeja con la forma de la casilla 9 (`miniatura` en los datos del nivel), que se ve mejor que el tramo casi vertical de la casilla 5.

### Nivel 8 · «Par o impar»

Primer **valle y colina de 5 columnas**: el trazado del nivel 4, con el suelo alargado a dos casillas. Empieza donde acabó el nivel 7, a altura 4, y la meta está a altura 2: hay que perder 2. Fila de abajo: bajada (casilla 11), suelo (12 y 13: pareja horizontal), colina con la cima a 2 (14) y rampa hasta la meta. Las dos filas de arriba quedan libres.

Hay **suelos dobles horizontales**, pero la solución va con **piezas simples**. Piezas (9 para 4 huecos): bajadas de hielo y asfalto; suelos simples de hielo, madera y asfalto; suelos dobles de hielo y madera; colinas de madera y arena.

- **Solución:** bajada de hielo, suelos de hielo y madera (en cualquier orden) y colina de madera (4 = 2 + 1 + 1).
- **Por qué no sirven las dobles:** las bajadas y las dobles quitan un número **par** de julitos (0 o 2) y las colinas, **impar** (1 o 3). Con una doble, el total siempre sale impar y nunca da 2. La trampa tentadora es el suelo doble de madera, que quita justo 2… pero la colina quita al menos 1 más (y con él, además, Eme no llega a la cima: pierde 2,5 antes de coronarla).

### Nivel 9 · «Cuesta arriba» (difícil)

Tablero de 3 filas y 5 columnas con un trazado de **ascenso**. Empieza donde acabó el nivel 8, a altura 2, y la meta está a altura 3. Eme cae al fondo, sube por una **escalera mecánica de dos filas** (casillas 12 y 7: pareja vertical, de 0,5 a 5,5), baja en S otras dos filas (casillas 8 y 13: pareja vertical), pasa una **colina** (cima a 2, casilla 14) y sube a la meta. Junta casi todo lo anterior: rozamiento, escaleras (y la averiada), piezas dobles y una condición local.

Piezas (10 para 5 huecos): escaleras mecánicas de +3 y +5, la averiada (+0) y una escalera doble de +6; bajadas simples de hielo, madera y asfalto y una bajada doble de madera; colinas de hielo y madera. De las 98 colocaciones:

- **Una solución:** escalera de +5 **abajo** y la **averiada arriba**, bajadas de asfalto y madera (en cualquier orden) y colina de madera (2 + 5 = 3 + 2 + 1 + 1). La averiada no da nada, pero Eme llega a ella con 4 julitos de impulso y la sube solo (necesita 2,5).
- **Trampas:** doce colocaciones cuadran la suma pero fallan. La más clara es la solución con la averiada **abajo**: Eme llega a ella con 2 julitos y no puede subirla. La hoja de resultado lo explica: «No pudo subir la escalera: para llegar arriba, a altura 3, necesitaba más de 3 julitos, y solo tenía 2. La averiada no da julitos: hay que llegar a ella con impulso».

El mensaje de los atascos vale ya para cualquier cuesta: si no hay escaleras de por medio, habla de lo que se podía perder antes de la cima; si las hay, de la energía que tenía al llegar arriba.

### Nivel 10 · «La última página» (examen final)

El cierre del cuaderno, en el primer tablero de **4 filas**: **5 columnas y 4 filas** (15 × 12 cuadritos; la regla va de 0 a 12). Se probó con 6 columnas y 3 filas, pero en el móvil quedaba muy pequeño (casillas de 53 px); con 5 × 4 las casillas miden unos 64 px y se aprovecha el espacio vertical. Empieza donde acabó el nivel 9, a altura 3, y la meta está **arriba del todo, en el borde de la hoja**, a altura 10. Trazado **cumbre**: caída al fondo (casilla 16), colina baja con la cima a 1,5 (17), **escalera mecánica de tres filas** (18, 13 y 8: de 0,5 a 8,5), **bajada de dos filas** (9 y 14: de 8,5 a 3,5) y una rampa en S hasta la meta. Sin piezas nuevas: es un examen de todo el Mundo I.

**El borde de la hoja** (`bordeHoja` en los datos del nivel): la repisa de la meta, más corta (0,9), acaba en un **acantilado**; detrás quedan una tira de papel con la **línea de agujeritos del trepado** y el **borde rasgado** de la página, y más allá, fuera de la hoja, la mesa con la sombra de la página. La pista acaba 1 cuadrito antes del borde del tablero para que quepa.

**Charla corta** (solo la primera vez): «¡Mira! ¡El borde de la hoja! Es la última página del cuaderno.» (se iluminan la bandera y el 10 de la regla) y «Si llego a esa bandera, ¡me escapo! Pero esta vez no hay pistas: todo lo que has aprendido, junto.»

Piezas (10 para 7 huecos): escaleras de +3, +4 y +5 y una escalera doble de +8; bajadas de madera, asfalto y arena y una bajada doble de madera; colinas de hielo y madera. La escalera de tres filas se rellena con tres simples o con una doble y una simple. De las 216 colocaciones:

- **Una solución** (que se puede colocar de cuatro maneras): bajada de madera al principio, colina de hielo, escalera doble de +8 y la de +5 en la escalera de tres filas (en cualquier orden) y bajadas de asfalto y arena en la bajada larga (en cualquier orden): 3 + 8 + 5 = 10 + 2 + 3 + 1. Con solo 3 julitos al salir, antes de la cima de la colina se puede perder menos de 1,5: la bajada de madera y la colina de hielo son lo único que cabe.
- **30 colocaciones** cuadran la suma pero fallan por el camino (no suben la colina o se quedan frenadas en una bajada).

**Tablero de 4 filas.** El tablero admite ya las filas que diga el nivel (`filas`, 3 por defecto): la regla se rehace con el alto del tablero (de 0 a 12 con 4 filas), los huecos y la capa de Eme se adaptan y las casillas se numeran igual, por filas de arriba abajo (con 5 columnas y 4 filas, la fila de abajo son las casillas 16 a 20).

Al hacerlo aparecieron y se corrigieron tres cosas del análisis y la simulación, que no afectaban a los niveles anteriores:

- Una **bajada que roza más de lo que baja** (arena en una caída de solo 2,5) deja a Eme **frenado** en ella: el análisis lo detecta y la hoja lo explica.
- Llegar a una cima con **0 julitos justos** es quedarse parado arriba (como en la simulación): hace falta algo de sobra.
- Con muchas piezas, la integración numérica puede dejar a Eme en la repisa con unas centésimas de julito: se queda en la meta en lugar de arrastrarse hasta el precipicio.

## Diseño de niveles

- Muchas piezas distintas y, en lo posible, **una única solución**: el validador cuenta las soluciones. Una solución es un **juego de piezas** que gana: colocar las mismas piezas en otro orden con el mismo resultado no cuenta como otra (si el orden importa, como en el nivel 6, el otro orden no gana y no se cuenta). Si un nivel tiene varias a propósito (como el 2), lo dice en `soluciones` y el validador comprueba que sean justo esas.
- Como la energía final solo depende de la suma de pérdidas, intercambiar dos suelos da lo mismo. Para que el orden importe, usar piezas con condiciones locales: jorobas, paredes de papel, loops y saltos.
- Cada mundo introduce sus mecánicas de una en una y luego las combina (ver el catálogo).
- **Una estrella por nivel superado.** Con estrellas por intentos (3 a la primera, 2 a la segunda…) bastaba con fallar una vez, ver la solución y repetir «a la primera» para tener 3, así que no tenían sentido. Ahora la estrella dice solo si el nivel está superado, y **reintentar después de ganar** sirve para trastear y ver otras posibilidades. «¡A la primera!» sale solo la primera vez que se supera un nivel sin fallar. Tras dos fallos aparece una pista con el balance incompleto (en el nivel 3, «7 = 4 + ¿?»).

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

`js/niveles.js`. Cabecera con ← (vuelve a la portada), «Elige nivel» y las estrellas conseguidas sobre el total (una por nivel). Debajo, los mundos como tarjetas, cada una con su estilo:

- **I · El cuaderno:** papel cuadriculado, margen rojo y anillas.
- **II · El libro de texto:** página con renglones, títulos en letra de imprenta y esquina doblada.
- **III · La pizarra:** tiza sobre verde y marco de madera.
- **Final · Fuera del libro:** cielo y sol, un único nivel.

Los niveles de cada mundo (10 en el cuaderno, 8 en el libro, 6 en la pizarra y 1 el final: 25 en total; numerados de forma correlativa, así que el libro va del 11 al 18 y la pizarra del 19 al 24) van unidos por un camino discontinuo en zigzag. Estados: completado (naranja, con su estrella debajo), siguiente (naranja, late), pronto (naranja claro: ya tocaría, pero aún no está hecho; al tocarlo sale «¡Próximamente!») y bloqueado (gris con candado; al tocarlo tiembla). Un nivel se desbloquea al completar el anterior. El primer nivel de un mundo con escena de entrada sigue cerrado hasta verla (tocarlo la pone). Los mundos bloqueados se ven apagados con «Termina el mundo anterior».

**Siempre se vuelve al mapa.** La hoja de resultado no tiene «Siguiente»: tiene **«Al mapa»** (el botón principal si el nivel está superado; si no, lo es «Reintentar»). Al superar un nivel por primera vez, en el mapa la vista va hasta el nivel siguiente y se ve **desbloquearse**: tiembla, se le cae el candado y aparece su número con un brillo. Lo mismo pasa con el primer nivel del Mundo II al terminar su escena de entrada («¡A resolver!»). Vale para todos los mundos.

Los niveles superados (su estrella) se guardan en `localStorage` (`js/progreso.js`); el progreso guardado con el sistema antiguo de 1 a 3 estrellas cuenta como superado. Desde el juego se vuelve al mapa con ☰ → «Elegir nivel». Flujo: carga → portada → (historia, la primera vez) → niveles → nivel. La historia termina contando el plan de los mundos, que es justo lo que muestra el mapa de niveles a continuación. Al cambiar de pantalla, la siguiente se coloca debajo y la anterior se **arranca** (ver «Transiciones»).

## Transiciones: arrancar la hoja

Todos los cambios de pantalla (carga → portada, portada ↔ niveles, niveles → nivel, final de la historia) usan la misma transición, transgresora y de la casa (`js/transicion.js`): la pantalla se tensa, se rasga por una línea irregular junto al borde izquierdo, como una hoja arrancada de un cuaderno de espiral, y sale volando girando mientras debajo ya está la siguiente. A la izquierda queda un momento la tira rota con los agujeros de la espiral. El borde roto se genera al azar cada vez y lleva trazo de lápiz. Dura ~0,7 s; con «reducir movimiento», el cambio es directo. `herramientas/prueba-arrancar.html?t=ms` congela el efecto en un instante para revisarlo.

## Final del Mundo I: «El avión de papel»

Al superar el nivel 10, el botón «Al mapa» de la hoja de resultado pasa a ser **«¡A escapar!»** y lanza la escena de final del cuaderno (`js/fin-cuaderno.js`). Usa el mismo reproductor que la historia de primer acceso (escenas dibujadas en el lienzo, textos que se escriben solos, se avanza tocando y «Saltar» la cierra) y termina arrancando la hoja hacia el mapa de niveles.

1. **Al borde.** Eme, con la bandera de sombrero, en el acantilado de la última página. Abajo, la mesa; al otro lado, el libro de texto. «Uf… Demasiado lejos para saltar.»
2. **La idea.** Mira la línea de agujeritos del trepado y se le enciende la bombilla. «Pero las hojas del cuaderno tienen un trepado… para arrancarlas.»
3. **¡Rrriiip!** Arranca la hoja por el trepado. «Y la arrancó.»
4. **El avión.** La hoja se dobla dos veces y se convierte en un avión de papel (con un trozo de pista del nivel 10 aún dibujado en el ala). «La dobló una vez, y otra… ¡Un avión de papel!»
5. **El vuelo.** Planea por encima de la mesa dejando una trayectoria punteada, del cuaderno al libro. Debajo, seis julitos pasan de azul (altura) a amarillo (velocidad): «Lo que perdía de altura… lo ganaba en velocidad.»
6. **El libro de texto.** ¡Plaf! Aterriza en una página impresa con fórmulas (Eₘ = E꜀ + Eₚ, Eₚ = m·g·h) y un ejemplo resuelto con números con decimales (m = 2,5 kg, g = 9,8 m/s², μ = 0,3…). Eme: «Uy… Aquí los números llevan decimales.»
7. **EME.** Todo se oscurece y entra por la derecha una sombra enorme con una «M» mayúscula y dos ojos: **EME, el primo grande**. Eme, sudando: «¿Q-quién eres tú?». Rótulo: «Mundo II · El libro de texto». Botón «¡Al libro!».

Al terminar se vuelve al mapa: la tarjeta del **Mundo II se desbloquea** con un saltito y un brillo y, mientras no tenga niveles, dice «¡Desbloqueado! Sus niveles llegan pronto». Un mundo se abre al superar el último nivel del anterior. La escena se recuerda (`fuga-eme-fin-cuaderno-visto`) y, una vez vista, se puede volver a ver desde el menú: «Ver el final del cuaderno».

## Historia: mundos II y III

### EME, el primo grande

**EME** es el bloque de masa **M** (mayúscula) de los problemas del libro de texto: el bloque «oficial». Serio, orgulloso y reglamentista; habla como el libro («Sustituyendo valores…», «Exprese el resultado en julios», «Compruebe sus unidades»). Aparece al final del Mundo I como una sombra enorme con una «M» y dos ojos.

Arco del personaje: **rival en todo el Mundo II**, haciendo lo posible por devolver a Eme al sitio donde «debe» estar (su problema), y **redención en la pizarra (Mundo III)**: ve la luz, ayuda a Eme a escapar y **se sacrifica dejándose borrar**.

### Mundo II · El libro de texto (niveles 11 a 18): números serios

**Escena de entrada: «La llegada al libro»** (`js/llegada-libro.js`). Sigue justo donde acaba el final del cuaderno, en la página del libro, con el mismo reproductor (tocar para avanzar, «Saltar»):

1. **La presentación.** «—¿Quién eres tú?». EME sale de la sombra (una sombra redonda que se aclara): grande, granate, con su «M» naranja y cara seria. «Soy EME: el bloque de masa M.» Eme, pequeño, traga saliva.
2. **Las reglas del libro.** «En este libro, los bloques no se escapan.» Y, enfadado: «Se resuelven.» Eme se asusta.
3. **Julios, no julitos.** Los tres julitos de Eme se tachan en rojo y aparece, impreso, «2,45 J». «Aquí no hay julitos. Hay julios.»
4. **Decimales.** Se escribe un ejemplo: Eₚ = m · g · h con m = 2,0 kg, g = 9,8 m/s², h = 1,5 m → **Eₚ = 29,4 J**. «Y todo lleva decimales.» Eme, mareado: «¿Veintinueve coma cuatro…?»
5. **La amenaza.** En la página está el «Problema 7.3», con el hueco punteado del bloque en su plano inclinado: el sitio de Eme. EME, enfadado: «Vuelve a tu problema. O te devuelvo yo.» Eme, apretando los dientes: «Ni hablar.»
6. **El reto.** Cartel «Mundo II · El libro de texto». Botón **«¡A resolver!»**, que lleva al mapa.

Sale al tocar el nivel 11 la primera vez (o con su botón en el mapa); al pulsar «¡A resolver!» se vuelve al mapa y se desbloquea el nivel 11 con su animación. Se recuerda en `fuga-eme-llegada-libro-vista` y se puede volver a ver con el botón «▶ La llegada al libro» de la tarjeta del Mundo II en el mapa, desde el menú y desde el panel de desarrollo.

A partir de aquí, Eₚ = m·g·h con g = 9,8 y datos reales (masas, alturas, longitudes con decimales). EME es el antagonista de todo el mundo: va por delante y deja trampas «reglamentarias» para devolver a Eme a su problema. Cada nivel es un problema del libro («Problema 7.11»…).

1. **«El cambio de moneda»** (11). Hecho: ver «Nivel 11» más abajo. La traducción directa del cuaderno: las pegatinas dicen cuántos julios quita cada pieza. EME vigila: «Compruebe sus unidades».
2. **«Datos del problema»** (12). Hecho: ver «Nivel 12» más abajo. Rozamiento en llano con μ: W = μ·m·g·d. La pérdida ya depende de lo que mide el tramo.
3. **«La rampa ya no come lo mismo»** (13). Rozamiento en cuestas: entra cos θ. Responde a la pregunta que dejó el cuaderno: «¿por qué la rampa de arena ya no quita 3?».
4. **«Muelle homologado»** (14). Muelles con ½·k·x². EME deja en la bandeja muelles «oficiales» que parecen ayudar pero no dan lo justo.
5. **«El transportador del margen»** (15). Eme encuentra un transportador de ángulos: se desbloquean las **piezas giratorias** (cintas transportadoras a favor o en contra).
6. **«La rata del margen»** (16). Ventiladores (con la rata como guiño), combinados con todo lo anterior.
7. **«M contra m»** (17). EME echa una carrera para cortarle el paso. Nivel trampa: con mucha más masa, llega exactamente igual de lejos. «¡Imposible! ¡Yo peso mucho más!» — «La masa se va en las cuentas, primo». EME sale humillado y más decidido.
8. **«El choque»** (18). Final del libro. EME bloquea la salida con su cuerpo y Eme tiene que usar un **choque** (momento lineal; en uno inelástico parte de la energía se va en calor) para apartarlo y saltar.

**Escena final del Mundo II.** Eme sale despedido del libro y aterriza en la bandeja de la tiza, al pie de la pizarra. EME, furioso, salta detrás: «¡Vuelve a tu problema!». Rótulo: «Mundo III · La pizarra».

### Unidades del libro

Por dentro todo sigue en **julitos** (la Eₚ de un cuadrito de altura) y en cuadritos; el simulador y el validador no cambian. Un nivel del libro lleva `unidades: { m, g, cuadrito }` y lo que se enseña se traduce (`js/unidades.js`):

- **Alturas en metros:** cuadritos · `cuadrito` (en el Mundo II, 0,5 m por cuadrito). La regla va en metros.
- **Regla en metros o en julios:** arriba de la regla hay un interruptor **m | J**; tocándolo (o tocando la regla) cada marca pasa a decir la **Eₚ de esa altura en julios** (0 · 4,9 · 9,8 · … J), y vuelta. Lo elegido se recuerda (`fuga-eme-regla-julios`).
- **Energías en julios:** julitos · m · g · `cuadrito`. Con m = 1,0 kg y g = 9,8 m/s², un julito vale 4,9 J.
- **Números con coma** y, como en los problemas, con al menos una cifra decimal (29,4 J · 3,0 m · 2,45 J); el cero, «0».
- Las **pegatinas** dicen julios (−4,9 J); la **barra de energía** en directo es continua, con una cifra decimal; las etiquetas flotantes, «−4,9 J ■» (cada cuadradito sigue siendo un julito).
- La **hoja de resultado** da el balance y la cuenta en julios: 29,4 J = 9,8 J + 4,9 J + 14,7 J.
- Cada nivel tiene su **enunciado** («Problema 7.11. Un bloque de masa m = 1,0 kg…»): una ficha del libro que sale en la charla y se vuelve a ver tocando el título del nivel.

### Aspecto del tablero en el libro

Para que se note que se ha cambiado de mundo, el tablero del libro no es el del cuaderno:

- **Fondo:** solo renglones horizontales (uno por cuadrito), como una página impresa, en vez de la cuadrícula.
- **Terreno fijo** (lo que no son piezas): una tinta plana de imprenta, lila claro, con una trama de puntos, en vez del beis con rayado diagonal. No se parece a ningún material (hielo, madera, asfalto, arena).
- Las miniaturas de las piezas usan el mismo fondo. El mundo de cada nivel sale de `MUNDOS` (`mundoDe(n)` en `js/nivel.js`).

### Nivel 11 · «El cambio de moneda»

- **Datos:** m = 1,0 kg, g = 9,8 m/s², cuadritos de 0,5 m. Sale de 3,0 m (29,4 J) y la bandera está a 1,0 m (9,8 J): hay que perder **19,6 J**. Empieza el mundo, así que no sigue la altura del nivel 10 (`inicioMundo`).
- **Tablero:** 4 × 3, trazado de la colina (cima a 1,5 m). Huecos: bajada (9), suelo (10) y colina (11).
- **Piezas:** bajadas de hielo, madera y asfalto; suelos de madera y arena; colinas de madera y arena.
- **Solución única:** bajada de hielo + suelo de madera + colina de arena (0 + 4,9 + 14,7 = 19,6 J). Las otras cuentas que suman 19,6 J se quedan en la colina: llegan a ella con demasiado poco.
- **Charla con animaciones** (la primera vez; mientras, la regla y las pegatinas empiezan en julitos):
  1. Entra la ficha del enunciado: «¡Un problema de verdad!».
  2. Los números de la regla dan la vuelta, uno a uno, y pasan a metros: «Cada cuadrito mide 0,5 m».
  3. Los 6 cuadritos de altura de la salida se llenan de julitos con «4,9» dentro: m · g · 0,5 m = 4,9 J.
  4. Una llave los suma: Eₚ = 1,0 · 9,8 · 3,0 = 29,4 J.
  5. El truco de la regla: se pone en julios sola («toca la regla y cambia de metros a julios: te dice la Eₚ de cada altura, ¡sin multiplicar!») y, en la frase siguiente, vuelve a metros.
  6. Las pegatinas dan la vuelta y pasan a julios.
  7. La bandera, a 1,0 m: «¿Cuántos julios tengo que perder?».
  8. EME asoma por la esquina de arriba con una nota en rojo: «Compruebe sus unidades.» — «¿¡EME!? Me está vigilando…».

### Rozamiento con μ

En el libro, las piezas pueden llevar su **coeficiente de rozamiento** (`mu`) en vez de un número fijo de julitos. Quitan W = μ · m · g · d, con **d la distancia horizontal** que recorre la pieza: 1,5 m por casilla de ancho (3 cuadritos de 0,5 m), así que un suelo doble mide 3,0 m. En julitos (que valen m · g · un cuadrito) eso es simplemente μ · d en cuadritos, así que el simulador y el validador no cambian (`cambioDe` en `js/pista.js`). Que cuente la distancia horizontal también vale para las cuestas (W = μ · m · g · cos θ · L = μ · m · g · Δx): es la sorpresa del nivel 13.

- La **pegatina** dice «μ = 0,25» (en azul, en cursiva): la cuenta la hace el jugador.
- La **etiqueta flotante** sale de una vez al acabar de recorrer la pieza, con todo lo que ha quitado: «−7,35 J».
- Las cuentas se redondean (0,1 · 3 no da exactamente 0,3) para que «justo cero» salga cero.
- Si la meta cae entre dos marcas de la regla (0,25 m), la regla le pone su propio número, en rojo.

### Calculadora

En el libro, junto a «Quitar todas las piezas», hay un botón de **calculadora**: un panel pequeño que flota abajo a la derecha, sin bloquear el juego (`js/calculadora.js`). Escribe con coma decimal, entiende + − × ÷ y paréntesis (con su propio analizador, sin `eval`) y también va con el teclado. En el cuaderno no sale.

### Nivel 12 · «Datos del problema»

- **Datos:** m = 1,0 kg. Sale de 1,0 m (9,8 J), donde acabó el 11, y la bandera está a 0,25 m (2,45 J): hay que perder **7,35 J**. Solo rozan los suelos: las rampas son lisas.
- **Tablero:** 4 × 2 (el nivel es bajito: con dos filas sobra menos tablero), trazado «larga» con el suelo a 0,125 m. Dos huecos de suelo seguidos (6 y 7), donde cabe un suelo doble.
- **Piezas:** suelos de hielo (μ = 0,1), madera (0,25) y asfalto (0,5); suelos dobles de hielo y de madera.
- **Solución única:** el suelo doble de madera: 0,25 · 1,0 · 9,8 · 3,0 = 7,35 J. Ninguna pareja de suelos sencillos da 7,35 J (no hay dos de madera).
- **Charla** (la primera vez): qué es μ (las pegatinas), W = μ · m · g · d, una cota «d = 1,5 m» sobre cada casilla de suelo y luego una sola «d = 3,0 m» para la pieza doble («con la misma μ, ¡roza el doble!»), y la calculadora.

### Mundo III · La pizarra (niveles 19 a 24): el giro

EME persigue a Eme por la pizarra, entre fórmulas y dibujos de tiza. La amenaza es el **borrador**: al final de la clase, todo lo de la pizarra se borra. Cuando el borrador llega, EME «ve la luz»: si se quedan, desaparecen los dos. Empuja a Eme fuera de su camino y **se deja borrar**; solo queda, muy tenue, la «M». Eme escapa al mundo final, «Fuera del libro», con esa pérdida a cuestas. (Los niveles de la pizarra están por diseñar con el catálogo de su mundo: loops, saltos, agua viscosa, péndulo.)

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

De arriba abajo: barra superior (nivel y su estrella) · tablero con la regla de alturas · bandeja de piezas deslizable · botones grandes al alcance del pulgar.

- **Arrastrar:** la pieza sale de la bandeja (queda su silueta discontinua) y flota con sombra, con inercia y una ligera inclinación según la velocidad; en móvil va por encima del dedo. Cerca de un hueco compatible se **engancha** (imán, borde naranja); los huecos que no la admiten se apagan. Al soltar encaja con rebote, polvo y una vibración corta; si se suelta fuera, vuelve volando a su sitio. Las piezas del tablero también se pueden sacar arrastrando. Eme sigue la pieza con la mirada.
- En la bandeja táctil, deslizar en horizontal la desplaza; tirar de una pieza hacia arriba la arrastra.
- **Bandeja desordenada:** las piezas salen barajadas (nunca en el orden de los huecos), para que su posición no delate la solución.
- **Tocar y tocar** (también animado: la pieza vuela al hueco): tocas una pieza y luego el hueco, o al revés (el hueco filtra la bandeja). Tocar una pieza colocada, o su silueta, la devuelve. Soltar sobre un hueco ocupado devuelve la anterior.
- **Cursores propios con ratón:** flecha clásica por defecto (con el mismo trazo que las manos; un lápiz invitaba a pensar que se podía escribir); dedo índice sobre lo que se pulsa (botones, huecos vacíos, la silueta de una pieza, el bocadillo); mano abierta sobre las piezas que se pueden coger; mano cerrada (la misma mano con los dedos recogidos) en cuanto se pulsa sobre una pieza y mientras se arrastra. En pantallas táctiles no se usan.
- **Hover de los botones (ratón):** se levantan un poco con una ligera inclinación, como un papel, con más sombra y color más claro.
- **Sin textos de ayuda:** la interfaz se explica sola con lo visual. Un hueco donde la pieza no encaja, o los huecos vacíos al pulsar Lanzar, parpadean en rojo.
- **Lanzamiento:** la bandeja se cambia por la energía en directo; cámara lenta ×0,5, pausa y parar. Cada tramo de la barra lleva su icono: montaña para Ep (altura), velocímetro para Ec (rapidez) y llama para el calor. Los mismos iconos, en el color de cada energía, acompañan al balance del resultado.
- **Resultado:** panel inferior con la estrella, balance agrupado (8 = 4 + 3 + 1) y la frase de Eme.
- Rejilla 3 × 3 en gris claro sobre el terreno; cuadritos de altura en azul muy suave.
- **Regla de alturas** fuera del tablero, a la izquierda: un número por cuadrito, todos con el mismo estilo (escala uniforme). El tamaño de letra se adapta al número de cuadritos, pensando en niveles con cuadritos más pequeños. Un marcador naranja sigue la altura de Eme en directo: es su Ep.

## Herramientas de desarrollo

Con **`?dev`** en la dirección (por ejemplo, `https://elprofedelabata.github.io/la-fuga-de-eme/?dev`) aparece un botón «DEV» abajo a la izquierda, por encima de todo, que abre un panel (`js/dev.js`). Sin `?dev` no se carga nada.

- Por cada nivel: **▶** jugarlo directamente (desde cualquier pantalla), **★** marcarlo o desmarcarlo como superado y **↺** dejarlo **como nuevo**: sin estrella y con sus ayudas (su charla y, en el nivel 1, la bienvenida y la guía).
- Generales: superar todos, quitar todas las estrellas, volver a ver todas las ayudas, abrir el mapa, ver la historia, ver el final del cuaderno y ver la llegada al libro (como la primera vez: al acabar se desbloquea el nivel 11).
- Sirve para repetir partes concretas (y hacer capturas) sin «Restablecer datos», que lo borra todo.

### Versiones de los archivos (caché)

GitHub Pages guarda los archivos en caché hasta 10 minutos y los navegadores también, así que tras publicar se podía seguir jugando con código viejo. `node herramientas/versionar.mjs` pone en `index.html` la versión de cada archivo (un trozo del hash de su contenido): `?v=…` en la hoja de estilos, los `modulepreload` y `main.js`, y un *import map* que traduce cada `js/x.js` a `js/x.js?v=…` para que los `import` entre módulos también pidan la versión nueva. **Hay que ejecutarlo antes de cada commit que toque `js/` o `css/`.**

## Pendiente

- Los 8 niveles del Mundo II (11 a 18), con julios y decimales (decidir cómo se ven los números en la regla, las pegatinas y la barra de energía): ver «Historia: mundos II y III».
- Mecánicas del catálogo aún sin usar (muelles, rebotadores, paredes de papel, agua) para los mundos siguientes.
- Animaciones de victoria y caída más elaboradas, sonido.
- PWA, dominio propio.
