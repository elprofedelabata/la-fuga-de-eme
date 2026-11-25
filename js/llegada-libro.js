// Entrada del Mundo II: «La llegada al libro».
//
// Sigue donde acabó el final del cuaderno: EME, el primo grande, sale de la sombra, se
// presenta, le explica a Eme las reglas del libro (julios de verdad, con decimales) y le
// amenaza con devolverlo a su problema. Eme no piensa volver. Usa el reproductor de la
// historia; se recuerda en localStorage.

import { C, dibujarEme, lapiz, trazar, cuadradito } from './dibujo.js';
import { reproducir, suave, bocadillo, IMPRENTA } from './historia.js';
import { mesa, libro } from './fin-cuaderno.js';

const CLAVE = 'fuga-eme-llegada-libro-vista';
const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;

export function llegadaLibroVista() {
  try { return localStorage.getItem(CLAVE) === '1'; } catch { return false; }
}
function marcarVista() {
  try { localStorage.setItem(CLAVE, '1'); } catch { /* sin almacenamiento: da igual */ }
}

// ---------- decorado y personajes ----------
const NOTA = '#3b2c1c';

/** La página del libro donde ocurre todo (sin las fórmulas del final, para que se lean los bocadillos). */
function pagina(ctx) {
  mesa(ctx);
  libro(ctx, 20, 40, 360, 250);
}

/** Texto impreso del libro. */
function imp(ctx, s, x, y, tam = 13, color = '#2c2824', alin = 'left', negrita = false) {
  ctx.font = `${negrita ? 'bold ' : ''}${tam}px ${IMPRENTA}`;
  ctx.fillStyle = color; ctx.textAlign = alin; ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y);
}

/** Boca que se mueve mientras se escribe un bocadillo (de `desde` a `desde + dura`). */
const habla = (t, desde, dura = 1.2) => (!reducido && t > desde && t < desde + dura ? 0.35 + 0.65 * Math.abs(Math.sin(t * 14)) : 0);

/** EME, grande, a la derecha. */
function eme(ctx, t, o = {}) {
  const respira = reducido ? 0 : Math.sin(t * 2.2) * 0.015;
  dibujarEme(ctx, o.x ?? 300, o.y ?? 196, o.B ?? 132, { primo: true, expr: 'serio', px: -0.6, py: 0.15, seed: 8, sy: 1 + respira, sx: 1 - respira, ...o });
}
/** Eme, pequeño, a la izquierda. */
function emePeque(ctx, t, o = {}) {
  dibujarEme(ctx, o.x ?? 104, o.y ?? 242, o.B ?? 40, { px: 0.95, py: -0.4, seed: 4, ...o });
}

// ---------- escenas ----------
const ESCENAS = [
  {   // 1 · la presentación
    textos: [{ s: '—¿Quién eres tú?', x: 18, y: 22, tam: 16, estilo: 'mano', color: NOTA }],
    dur: 4.6,
    dibujar(ctx, t) {
      pagina(ctx);
      // sale de la sombra: se aclara poco a poco
      const luz = reducido ? 1 : suave(0.2, 1.4, t);
      eme(ctx, t, { habla: habla(t, 1.6) });
      if (luz < 1) {     // una sombra redonda que se va aclarando
        const g = ctx.createRadialGradient(300, 196, 30, 300, 196, 130);
        g.addColorStop(0, `rgba(30,24,20,${0.92 * (1 - luz)})`);
        g.addColorStop(0.7, `rgba(30,24,20,${0.8 * (1 - luz)})`);
        g.addColorStop(1, 'rgba(30,24,20,0)');
        ctx.fillStyle = g;
        ctx.fillRect(160, 60, 240, 240);
      }
      emePeque(ctx, t, { expr: 'gulp' });
      bocadillo(ctx, 236, 92, 'Soy EME: el bloque de masa M.', suave(1.6, 1.9, t), { max: 130 });
    },
  },
  {   // 2 · las reglas del libro
    textos: [],
    dur: 5,
    dibujar(ctx, t) {
      pagina(ctx);
      const segunda = t > 2.6;
      eme(ctx, t, { expr: segunda ? 'enfado' : 'serio', habla: habla(t, 0.4) + habla(t, 2.6, 0.8) });
      emePeque(ctx, t, { expr: segunda ? 'fast' : 'gulp', susto: segunda });
      if (!segunda) bocadillo(ctx, 236, 92, 'En este libro, los bloques no se escapan.', suave(0.4, 0.7, t), { max: 130 });
      else bocadillo(ctx, 236, 92, 'Se resuelven.', suave(2.6, 2.8, t), { max: 130 });
    },
  },
  {   // 3 · julios, no julitos
    textos: [{ s: '2,45 J', x: 92, y: 110, tam: 30, estilo: 'imprenta', color: '#2c2824', alin: 'center', desde: 2.4 }],
    dur: 5.2,
    dibujar(ctx, t) {
      pagina(ctx);
      eme(ctx, t, { habla: habla(t, 0.4) });
      emePeque(ctx, t, { expr: t > 2.6 ? 'gulp' : 'idle', px: 0.2, py: -0.9 });
      bocadillo(ctx, 236, 92, 'Aquí no hay julitos. Hay julios.', suave(0.4, 0.7, t), { max: 130 });
      // los julitos de Eme… tachados
      for (let i = 0; i < 3; i++) cuadradito(ctx, 66 + i * 26, 70, 18, C.julito);
      const tacha = reducido ? 1 : suave(1.4, 2.1, t);
      if (tacha > 0) {
        ctx.save();
        ctx.strokeStyle = C.calor; ctx.lineWidth = 3; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(52, 82); ctx.lineTo(52 + (132 - 52) * tacha, 82 - 26 * tacha); ctx.stroke();
        ctx.restore();
      }
    },
  },
  {   // 4 · todo lleva decimales
    textos: [
      { s: 'Eₚ = m · g · h', x: 40, y: 70, tam: 17, estilo: 'imprenta', color: '#2c2824', desde: 0.3 },
      { s: 'm = 2,0 kg', x: 48, y: 96, tam: 13, estilo: 'imprenta', color: '#2c2824' },
      { s: 'g = 9,8 m/s²', x: 48, y: 115, tam: 13, estilo: 'imprenta', color: '#2c2824' },
      { s: 'h = 1,5 m', x: 48, y: 134, tam: 13, estilo: 'imprenta', color: '#2c2824' },
      { s: 'Eₚ = 29,4 J', x: 48, y: 160, tam: 16, estilo: 'imprenta', color: '#8b3a2e', marca: true },
    ],
    dur: 7,
    dibujar(ctx, t) {
      pagina(ctx);
      eme(ctx, t, { habla: habla(t, 0.6) });
      const mareo = t > 4.4;
      emePeque(ctx, t, mareo ? { expr: 'mareado', giro: t * 3 } : { expr: 'idle', px: -0.2, py: -0.9 });
      bocadillo(ctx, 236, 92, 'Y todo lleva decimales.', suave(0.6, 0.9, t), { max: 130 });
      bocadillo(ctx, 70, 196, '¿Veintinueve coma cuatro…?', suave(4.6, 4.9, t), { max: 150 });
    },
  },
  {   // 5 · la amenaza
    textos: [],
    dur: 5.6,
    dibujar(ctx, t) {
      pagina(ctx);
      // el problema de Eme, con su hueco vacío
      ctx.save();
      ctx.fillStyle = '#fbfaf6'; ctx.fillRect(34, 54, 150, 96);
      ctx.strokeStyle = '#7d9cbf'; ctx.lineWidth = 1.2; ctx.strokeRect(34, 54, 150, 96);
      imp(ctx, 'Problema 7.3', 42, 66, 10.5, '#3d6a99', 'left', true);
      ctx.fillStyle = '#efe8d8';
      trazar(ctx, [[52, 104], [168, 142], [52, 142]], true); ctx.fill();
      lapiz(ctx, [[52, 104], [168, 142], [52, 142]], { ancho: 1.4, cerrado: true, doble: false, amp: 0.3 });
      ctx.setLineDash([4, 3]); ctx.strokeStyle = C.suave; ctx.lineWidth = 1.4;
      ctx.translate(82, 112); ctx.rotate(Math.atan2(38, 116)); ctx.strokeRect(-12, -24, 24, 24);
      ctx.restore();
      const segunda = t > 2.9;
      eme(ctx, t, { expr: 'enfado', px: -0.95, py: -0.3, habla: habla(t, 0.4, 1.5) });
      emePeque(ctx, t, segunda ? { expr: 'effort' } : { expr: 'gulp', px: -0.3, py: -0.9 });
      bocadillo(ctx, 236, 92, 'Vuelve a tu problema. O te devuelvo yo.', suave(0.4, 0.7, t), { max: 120 });
      bocadillo(ctx, 128, 206, 'Ni hablar.', suave(3, 3.3, t));
    },
  },
  {   // 6 · el reto
    textos: [
      { s: 'Mundo II · El libro de texto', x: 200, y: 64, tam: 24, estilo: 'mano', color: C.lapiz, alin: 'center', marca: true, desde: 0.6 },
      { s: 'Problemas 11 a 18', x: 200, y: 100, tam: 16, estilo: 'mano', color: NOTA, alin: 'center' },
    ],
    dur: Infinity,
    dibujar(ctx, t) {
      pagina(ctx);
      // el cartel del rótulo (el texto se escribe encima)
      const cartel = suave(0.3, 0.6, t);
      if (cartel > 0) {
        ctx.save();
        ctx.globalAlpha = cartel;
        ctx.translate(200, 64);
        ctx.rotate(-0.02);
        const caja = [[-150, -22], [150, -22], [150, 22], [-150, 22]];
        ctx.fillStyle = 'rgba(40,30,20,0.25)';
        trazar(ctx, caja.map(([a, b]) => [a + 4, b + 5]), true); ctx.fill();
        ctx.fillStyle = '#fffef9';
        trazar(ctx, caja, true); ctx.fill();
        lapiz(ctx, caja, { ancho: 1.6, cerrado: true, doble: false, amp: 0.3 });
        ctx.restore();
      }
      eme(ctx, t, { expr: 'serio', px: -0.8, py: 0.2 });
      const salto = reducido ? 0 : Math.abs(Math.sin(t * 3)) * 8;
      emePeque(ctx, t, { expr: 'effort', y: 242 - salto });
    },
  },
];

/** Reproduce la llegada al libro y, al terminar, llama a `alTerminar`. */
export function mostrarLlegadaLibro({ alTerminar } = {}) {
  reproducir(ESCENAS, { alTerminar, alVer: marcarVista, etiqueta: 'La llegada al libro de texto', vamos: '¡A resolver!' });
}
