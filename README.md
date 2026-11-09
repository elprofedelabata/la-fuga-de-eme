# La fuga de Eme 🟧

*Desprecie el rozamiento. Si puede.*

Eme es **el** bloque de los problemas de física: «un bloque de masa *m* desliza por un plano inclinado…». Está harto de ser un ejercicio, y quiere escapar del libro. En cada nivel, el tablero de 3 × 3 casillas tiene huecos: elige las piezas que faltan para que Eme llegue a la bandera con la energía justa. **Ni más, ni menos.**

Cada cuadrito de altura es un **julito** de energía potencial; cada material se come unos cuantos en forma de calor. Juego para 4.º de ESO a 2.º de Bachillerato sobre conservación (o no) de la energía mecánica.

**Prueba el boceto en [elprofedelabata.github.io/la-fuga-de-eme](https://elprofedelabata.github.io/la-fuga-de-eme/).** Un juego de [El profe de la bata](https://elprofedelabata.es/). El diseño está en [DISEÑO.md](DISEÑO.md).

> Estado: **boceto v0.1**, solo el nivel 1.

## Estructura

| Carpeta | Qué hay |
|---|---|
| `index.html`, `css/`, `js/` | El juego: HTML, CSS y módulos de JavaScript sin dependencias |
| `js/pista.js` | Geometría de la pista y simulación de Eme por energía |
| `js/dibujo.js` | Estilo de cuaderno: trazo de lápiz, texturas y Eme |
| `herramientas/validar-nivel.mjs` | Prueba todas las combinaciones de piezas de un nivel |
| `arte/` | Hoja de personaje, animación *idle* y boceto de interfaz (scripts de Python + Pillow) |

Para probarlo en local hace falta un servidor (los módulos no cargan con `file://`):

```bash
python -m http.server 8765
```

Para validar el nivel (una sola solución, simulación coherente con las cuentas):

```bash
node herramientas/validar-nivel.mjs
```

© 2026 El profe de la bata. Todos los derechos reservados.
