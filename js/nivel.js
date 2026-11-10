// Datos de los niveles. De momento, solo el nivel 1 del Mundo I (el cuaderno).
//
// Unidades: el tablero mide 9 x 9 cuadritos (3 x 3 casillas de 3 x 3 cuadritos).
// 1 cuadrito de altura = 1 julito de energía potencial.

export const MATERIALES = {
  fijo: { nombre: 'pista', pierde: 0 },
  hielo: { nombre: 'hielo', pierde: 0 },
  madera: { nombre: 'madera', pierde: 1 },
  asfalto: { nombre: 'asfalto', pierde: 2 },
  arena: { nombre: 'arena', pierde: 3 },
};

export const NIVEL = {
  numero: 1,
  titulo: 'Ni más, ni menos',
  frase: '«Desprecie el rozamiento», dicen. Ojalá.',
  energia: 8,            // Eme sale desde altura 8 y en reposo: 8 julitos
  salidaX: 1.0,          // posición inicial sobre la plataforma
  meta: {
    altura: 5,           // repisa de la casilla 6: hay que llegar con 0 julitos de Ec
    bandera: 8.55,       // al ganar, Eme avanza a saltitos desde el borde hasta la bandera
  },
  // Casillas vacías y la forma de pieza que admite cada una
  huecos: { 4: 'rampa', 8: 'suelo' },
  piezas: [
    { id: 'rampa-hielo', forma: 'rampa', material: 'hielo', nombre: ['Rampa', 'de hielo'] },
    { id: 'rampa-arena', forma: 'rampa', material: 'arena', nombre: ['Rampa', 'de arena'] },
    { id: 'suelo-madera', forma: 'suelo', perfil: 'plano', material: 'madera', nombre: ['Suelo', 'de madera'] },
    { id: 'suelo-asfalto', forma: 'suelo', perfil: 'plano', material: 'asfalto', nombre: ['Suelo', 'de asfalto'] },
    { id: 'hondonada-hielo', forma: 'suelo', perfil: 'hondonada', material: 'hielo', nombre: ['Hondonada', 'de hielo'] },
  ],
};

// Mundos del juego: capas del libro de las que Eme escapa. De momento solo se puede jugar
// el nivel 1; el resto aparecen en el mapa como bloqueados.
export const MUNDOS = [
  { id: 'cuaderno', numero: 'I', nombre: 'El cuaderno', niveles: 6 },
  { id: 'libro', numero: 'II', nombre: 'El libro de texto', niveles: 6 },
  { id: 'pizarra', numero: 'III', nombre: 'La pizarra', niveles: 6 },
  { id: 'fuera', numero: '★', nombre: 'Fuera del libro', niveles: 1 },
];
export const NIVELES_JUGABLES = new Set([1]);
