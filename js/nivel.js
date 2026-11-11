// Datos de los niveles.
//
// Continuidad: cada nivel es un tramo del camino de Eme y empieza donde acabó el anterior
// (la altura de salida de un nivel es la de la meta del anterior).
//
// Unidades: el tablero mide 9 x 9 cuadritos (3 x 3 casillas de 3 x 3 cuadritos).
// 1 cuadrito de altura = 1 julito de energía potencial.
//
// La pista de los niveles del cuaderno es una «U»: plataforma de salida y rampa de bajada
// (casillas 1, 4 y 7), suelo (casilla 8) y subida en S hasta la repisa de la meta
// (casillas 9, 6 y 3). Cada nivel elige la altura de salida, la de la meta y qué casillas
// están vacías. Formas de hueco: «rampa» (casilla 4), «suelo» (casilla 8) y «subida» (casilla 6).

export const MATERIALES = {
  fijo: { nombre: 'pista', pierde: 0 },
  hielo: { nombre: 'hielo', pierde: 0 },
  madera: { nombre: 'madera', pierde: 1 },
  asfalto: { nombre: 'asfalto', pierde: 2 },
  arena: { nombre: 'arena', pierde: 3 },
};

export const NIVELES = {
  // Tutorial: colocar piezas, sin rozamiento. Lo que baja, sube hasta la misma altura.
  1: {
    numero: 1,
    titulo: 'Lo que baja, sube',
    frase: '¿Sin rozamiento? ¡Qué lujo!',
    tutorial: true,
    // Bienvenida (solo la primera vez): Eme, en primer plano, se presenta
    bienvenida: [
      { texto: '¡Hola! Soy Eme.', expr: 'win' },
      { texto: 'Sí, el bloque de masa\u00a0m de los problemas de física. El que siempre se desliza «sin rozamiento».' },
      { texto: 'Hoy me escapo del libro… ¡y tú vas a ayudarme!', expr: 'win' },
      { texto: 'Tú construyes la pista con las piezas y yo me deslizo por ella.' },
      { texto: 'Ven, que te enseño cómo se hace.', py: 0.9 },
    ],
    // Después, Eme habla desde su sitio en el tablero (solo la primera vez).
    // zonas: lo que se ilumina mientras lo dice (regla, salida, bandera, meta, huecos, bandeja,
    // pegatinas, lanzar, vaciar)
    charla: [
      { texto: '¡Aquí estoy! Arriba del todo, en la salida.', expr: 'win' },
      { texto: 'Mira la regla: estoy a 7 cuadritos de altura.', zonas: ['regla'], px: -0.95, py: 0.2 },
      { texto: 'Cada cuadrito de altura es 1 julito de energía potencial. Así que salgo con 7 julitos.', zonas: ['salida'], px: -0.3, py: -0.95 },
      // el objetivo
      { texto: 'Mi objetivo: llegar a esa bandera y pararme justo ahí, a altura 7.', zonas: ['bandera', 'meta'], px: 0.95, py: 0 },
      { texto: 'Tengo que llegar sin nada de energía cinética. Si llego con velocidad, me paso de largo… ¡y me caigo!', expr: 'gulp' },
      // las piezas
      { texto: 'Pero a la pista le faltan trozos: estos huecos.', zonas: ['huecos'], px: 0.5, py: 0.95 },
      { texto: 'Tú los rellenas con las piezas de abajo. Cada una encaja en el hueco que tiene su misma forma.', zonas: ['bandeja'], px: 0.2, py: 0.95 },
      // los botones
      { texto: 'Cuando la pista esté completa, pulsa LANZAR y allá que voy.', zonas: ['lanzar'], px: 0.4, py: 0.95 },
      { texto: 'Y si quieres empezar de cero, este botón quita todas las piezas de la pista.', zonas: ['vaciar'], px: -0.3, py: 0.95 },
    ],
    // Al colocar la pieza de la guía, Eme vuelve en primer plano a felicitar al jugador
    felicitacion: [
      { texto: '¡Eso es! ¡Lo has hecho genial!', expr: 'win' },
      { texto: 'Ahora sigue tú: coloca las otras dos piezas y pulsa LANZAR.' },
      { texto: 'Yo te espero en la salida. ¡Tú puedes!', expr: 'win' },
    ],
    // Guía del primer movimiento: a los 2 s se oscurece todo salvo Eme, este hueco y esta pieza
    guia: { pieza: 'rampa-hielo', texto: '¡Empecemos! Arrastra la rampa de hielo hasta su hueco.' },
    energia: 7,            // sale desde altura 7 y en reposo: 7 julitos
    salidaX: 1.0,
    meta: { altura: 7, bandera: 8.55 },
    huecos: { 4: 'rampa', 8: 'suelo', 6: 'subida' },
    piezas: [
      { id: 'rampa-hielo', forma: 'rampa', material: 'hielo', nombre: ['Rampa', 'de hielo'] },
      { id: 'suelo-hielo', forma: 'suelo', perfil: 'plano', material: 'hielo', nombre: ['Suelo', 'de hielo'] },
      { id: 'subida-hielo', forma: 'subida', material: 'hielo', nombre: ['Subida', 'de hielo'] },
    ],
  },

  // Sin rozamiento, la forma del camino da igual: lo que sube una montaña lo devuelve al
  // bajarla, y Eme llega siempre hasta la altura de salida. Hay más piezas que huecos y todas
  // son de hielo, así que hay más de una solución.
  2: {
    numero: 2,
    titulo: 'Todos los caminos',
    frase: 'Subir una montaña me cuesta julitos… pero bajarla me los devuelve.',
    soluciones: 3,         // el validador comprueba que haya justo estas
    energia: 7,            // empieza donde acabó el nivel 1: a altura 7
    salidaX: 1.0,
    meta: { altura: 7, bandera: 8.55 },
    huecos: { 4: 'rampa', 8: 'suelo', 6: 'subida' },
    piezas: [
      { id: 'rampa-hielo', forma: 'rampa', material: 'hielo', nombre: ['Rampa', 'de hielo'] },
      { id: 'hondonada-hielo', forma: 'suelo', perfil: 'hondonada', material: 'hielo', nombre: ['Hondonada', 'de hielo'] },
      { id: 'montanita-hielo', forma: 'suelo', perfil: 'montana1', material: 'hielo', nombre: ['Montañita', 'de hielo'] },
      { id: 'montana-hielo', forma: 'suelo', perfil: 'montana2', material: 'hielo', nombre: ['Montaña', 'de hielo'] },
      { id: 'subida-hielo', forma: 'subida', material: 'hielo', nombre: ['Subida', 'de hielo'] },
    ],
  },

  3: {
    numero: 3,
    titulo: 'Ni más, ni menos',
    frase: '«Desprecie el rozamiento», dicen. Ojalá.',
    // Primer nivel con rozamiento: Eme lo explica desde la salida (solo la primera vez)
    charla: [
      { texto: 'Uy… Aquí ya no todo es hielo.', expr: 'gulp', zonas: ['bandeja'] },
      { texto: 'Cada material roza, y al rozar me quita julitos. El número de cada pieza es lo que me quita.', zonas: ['pegatinas'], px: 0.2, py: 0.95 },
      { texto: 'El hielo, nada. La madera, 1. El asfalto, 2. Y la arena… ¡3!', zonas: ['pegatinas'], px: 0.2, py: 0.95 },
      { texto: 'Esos julitos no desaparecen: se convierten en calor. ¡Por eso la arena quema!', expr: 'effort' },
      { texto: 'Salgo con 7 julitos y tengo que pararme a altura 4.', zonas: ['salida', 'meta'], px: 0.3, py: -0.95 },
      { texto: '¿Cuántos julitos tengo que perder por el camino? ¡Ni más, ni menos!', expr: 'win' },
    ],
    energia: 7,            // empieza donde acabó el nivel 2: a altura 7
    salidaX: 1.0,
    meta: { altura: 4, bandera: 8.55 },   // hay que perder 3 y llegar con 0 julitos de Ec
    huecos: { 4: 'rampa', 8: 'suelo' },
    piezas: [
      { id: 'rampa-hielo', forma: 'rampa', material: 'hielo', nombre: ['Rampa', 'de hielo'] },
      { id: 'rampa-arena', forma: 'rampa', material: 'arena', nombre: ['Rampa', 'de arena'] },
      { id: 'suelo-madera', forma: 'suelo', perfil: 'plano', material: 'madera', nombre: ['Suelo', 'de madera'] },
      { id: 'suelo-asfalto', forma: 'suelo', perfil: 'plano', material: 'asfalto', nombre: ['Suelo', 'de asfalto'] },
      { id: 'hondonada-hielo', forma: 'suelo', perfil: 'hondonada', material: 'hielo', nombre: ['Hondonada', 'de hielo'] },
    ],
  },
};

/**
 * Nivel en juego. Es un enlace vivo: los módulos que lo importan ven siempre el actual.
 * Se cambia con usarNivel(n).
 */
export let NIVEL = NIVELES[1];

export function usarNivel(n) {
  NIVEL = NIVELES[n];
  return NIVEL;
}

// Mundos del juego: capas del libro de las que Eme escapa.
export const MUNDOS = [
  { id: 'cuaderno', numero: 'I', nombre: 'El cuaderno', niveles: 10 },
  { id: 'libro', numero: 'II', nombre: 'El libro de texto', niveles: 6 },
  { id: 'pizarra', numero: 'III', nombre: 'La pizarra', niveles: 6 },
  { id: 'fuera', numero: '★', nombre: 'Fuera del libro', niveles: 1 },
];
export const NIVELES_JUGABLES = new Set(Object.keys(NIVELES).map(Number));
