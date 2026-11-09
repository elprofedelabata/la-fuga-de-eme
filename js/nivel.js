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
    altura: 4,           // repisa de la casilla 6
    felpudo: [7.5, 8.3],
    pierdeFelpudo: 1,    // si llega con 1 julito de Ec, se para justo en la bandera
    bandera: 8.75,
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
