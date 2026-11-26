// Unidades de lo que se enseña en pantalla.
//
// Por dentro, todo va en «julitos» (1 julito = la energía potencial de un cuadrito de altura) y
// en cuadritos. En el cuaderno se enseña así, con números enteros. En el libro de texto (los
// niveles con `unidades: { m, g, cuadrito }`) se traduce a unidades de verdad:
//   altura (m)   = cuadritos · cuadrito
//   energía (J)  = julitos · m · g · cuadrito
// Los números van con coma decimal y, como en los problemas, con al menos una cifra decimal.

import { NIVEL } from './nivel.js';

/** ¿Usa este nivel unidades de verdad (julios y metros)? */
export const serio = (n = NIVEL) => !!n.unidades;

/** Julios que vale un julito (la Eₚ de un cuadrito de altura): m · g · cuadrito. */
export const julitoEnJ = (n = NIVEL) => (n.unidades ? n.unidades.m * n.unidades.g * n.unidades.cuadrito : 1);

/**
 * Un número con coma: con al menos una cifra decimal y como mucho `max` (29,4 · 2,45 · 3,0).
 * El cero, sin decimales: 0.
 */
export function coma(x, max = 2) {
  const f = 10 ** max;
  if (Math.abs(Math.round(x * f)) === 0) return '0';
  let s = (Math.round(x * f) / f).toFixed(max);
  while (s.endsWith('0') && !/\.\d$/.test(s)) s = s.slice(0, -1);
  return s.replace('.', ',');
}

/** Un número entero o con decimales, como en el cuaderno (7 · 1,5). */
const comoCuaderno = (x) => String(Math.round(x * 100) / 100).replace('.', ',');

/** Valor de una energía (en julitos) sin la unidad: «7» o «34,3». */
export const valorE = (j, n = NIVEL) => (serio(n) ? coma(j * julitoEnJ(n)) : comoCuaderno(j));

/** Una energía (en julitos) con su unidad: «7 julitos», «1 julito» o «34,3 J». */
export function energia(j, n = NIVEL) {
  if (serio(n)) return `${coma(j * julitoEnJ(n))} J`;
  return `${comoCuaderno(j)} ${Math.abs(j) === 1 ? 'julito' : 'julitos'}`;
}

/** Unidad corta de la energía, para etiquetas: «» (cuaderno) o « J». */
export const unidadE = (n = NIVEL) => (serio(n) ? ' J' : '');

/** Una altura (en cuadritos) con su unidad: «7» o «3,0 m». */
export const altura = (h, n = NIVEL) => (serio(n) ? `${coma(h * n.unidades.cuadrito)} m` : comoCuaderno(h));

/** «a altura 7» o «a 3,0 m de altura». */
export const aAltura = (h, n = NIVEL) => (serio(n) ? `a ${altura(h, n)} de altura` : `a altura ${comoCuaderno(h)}`);

/** Cuánto mide un cuadrito: «0,5 m». */
export const cuadrito = (n = NIVEL) => `${coma(n.unidades.cuadrito)} m`;
