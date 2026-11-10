// Datos de los niveles.
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
    frase: 'Arrastra cada pieza a su hueco y pulsa LANZAR. ¿Sin rozamiento? ¡Qué lujo!',
    tutorial: true,
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

  // (El nivel 2 está por diseñar.)

  3: {
    numero: 3,
    titulo: 'Ni más, ni menos',
    frase: '«Desprecie el rozamiento», dicen. Ojalá.',
    energia: 8,            // sale desde altura 8 y en reposo: 8 julitos
    salidaX: 1.0,
    meta: { altura: 5, bandera: 8.55 },   // hay que llegar con 0 julitos de Ec
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
