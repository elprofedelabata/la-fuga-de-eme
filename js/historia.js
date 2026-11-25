// Historia de primer acceso: quién es Eme y cuál es su plan.
// El reproductor de escenas (reproducir) lo usan también las escenas de final de mundo.
//
// Se reproduce sola, escena a escena, con los textos escribiéndose dentro del propio
// dibujo (el enunciado en la página, las notas del narrador en los huecos). Tocar la pantalla
// adelanta (completa el texto o pasa a la siguiente escena) y «Saltar» la cierra.
// Se recuerda en localStorage para no volver a mostrarla salvo que se pida desde el menú.

import { C, FUENTE, dibujarEme, lapiz, trazar, cuadradito } from './dibujo.js';
import { arrancar, restaurar } from './transicion.js';

const CLAVE = 'fuga-eme-historia-vista';
const AW = 400, AH = 300;            // tamaño lógico del dibujo
const LETRAS_POR_SEGUNDO = 34;
const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;

export function historiaVista() {
  try { return localStorage.getItem(CLAVE) === '1'; } catch { return false; }
}
function marcarVista() {
  try { localStorage.setItem(CLAVE, '1'); } catch { /* sin almacenamiento: da igual */ }
}

// ---------- utilidades de dibujo ----------
export const suave = (a, b, t) => (t <= a ? 0 : t >= b ? 1 : ((t - a) / (b - a)) ** 2 * (3 - 2 * ((t - a) / (b - a))));

export function texto(ctx, s, x, y, { tam = 12, color = C.suave, alin = 'left', negrita = false } = {}) {
  ctx.font = `${negrita ? 'bold ' : ''}${tam}px ${FUENTE}`;
  ctx.fillStyle = color;
  ctx.textAlign = alin;
  ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y);
}

/** Página del libro de física. Con «lineas», relleno gris donde iría el enunciado. */
function pagina(ctx, x0 = 24, x1 = 376, problema = 3, lineas = true) {
  ctx.save();
  ctx.fillStyle = 'rgba(80,70,60,0.12)';
  ctx.fillRect(x0 + 4, 20, x1 - x0, 268);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x0, 16, x1 - x0, 268);
  lapiz(ctx, [[x0, 16], [x1, 16], [x1, 284], [x0, 284]], { ancho: 1.4, cerrado: true, doble: false, amp: 0.4 });
  texto(ctx, 'Tema 7 · Energía mecánica', x0 + 14, 29, { tam: 10 });
  texto(ctx, `Problema ${problema}`, x0 + 14, 46, { tam: 13, color: C.lapiz, negrita: true });
  if (lineas) {
    ctx.fillStyle = '#e4e0d8';
    for (let i = 0; i < 3; i++) ctx.fillRect(x0 + 14, 60 + i * 9, (x1 - x0) * (i === 2 ? 0.4 : 0.82), 3);
  }
  ctx.restore();
}

/** Plano inclinado de los problemas (baja hacia la derecha) con su ángulo θ. */
function plano(ctx, a = [70, 130], b = [300, 250]) {
  const tri = [a, b, [a[0], b[1]]];
  ctx.save();
  ctx.fillStyle = '#efe8d8';
  trazar(ctx, tri, true);
  ctx.fill();
  lapiz(ctx, tri, { ancho: 1.8, cerrado: true, amp: 0.5 });
  ctx.strokeStyle = C.lapiz;
  ctx.lineWidth = 1.2;
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  ctx.beginPath(); ctx.arc(b[0], b[1], 30, Math.PI, Math.PI + ang); ctx.stroke();
  texto(ctx, 'θ', b[0] - 42, b[1] - 9, { tam: 13, color: C.lapiz });
  ctx.restore();
  return ang;
}

/** Posición de un bloque de lado B apoyado en el plano, a una fracción p del recorrido. */
function sobrePlano(a, b, p, B) {
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const x = a[0] + (b[0] - a[0]) * p, y = a[1] + (b[1] - a[1]) * p;
  return { x: x + Math.sin(ang) * B / 2, y: y - Math.cos(ang) * B / 2, ang };
}

function flecha(ctx, x0, y0, x1, y1, etiqueta) {
  ctx.save();
  ctx.strokeStyle = C.lapiz;
  ctx.fillStyle = C.lapiz;
  ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
  const a = Math.atan2(y1 - y0, x1 - x0);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x1 - 7 * Math.cos(a - 0.4), y1 - 7 * Math.sin(a - 0.4));
  ctx.lineTo(x1 - 7 * Math.cos(a + 0.4), y1 - 7 * Math.sin(a + 0.4));
  ctx.closePath(); ctx.fill();
  if (etiqueta) texto(ctx, etiqueta, x1 + 6, y1 - 2, { tam: 11, color: C.lapiz });
  ctx.restore();
}

/**
 * Bocadillo. x es su borde izquierdo (o el derecho, con `derecha`) e y su centro. Con `max`, el
 * texto se parte en líneas de ese ancho como mucho. Con `a: [x, y]` (la boca de quien habla), el
 * pico sale del lado del bocadillo que mira a esa boca y apunta hacia ella; `largo` es lo que mide
 * el pico como mucho (se queda corto para no meterse en la cara). Sin `a`, el pico sale de abajo,
 * en la esquina izquierda (o en la derecha).
 */
export function bocadillo(ctx, x, y, s, alfa = 1, { derecha = false, max = Infinity, a = null, largo = 18 } = {}) {
  if (alfa <= 0) return;
  ctx.save();
  ctx.globalAlpha = alfa;
  ctx.font = `15px ${FUENTE}`;
  // líneas
  const lineas = [];
  let actual = '';
  // las dos últimas palabras, siempre juntas (que la última línea no se quede con una sola)
  const palabras = s.split(' ');
  if (palabras.length > 2) palabras.splice(-2, 2, `${palabras[palabras.length - 2]} ${palabras[palabras.length - 1]}`);
  for (const p of palabras) {
    const prueba = actual ? `${actual} ${p}` : p;
    if (actual && ctx.measureText(prueba).width > max) { lineas.push(actual); actual = p; } else actual = prueba;
  }
  lineas.push(actual);
  const w = Math.max(...lineas.map((l) => ctx.measureText(l).width)) + 20, h = 10 + 18 * lineas.length;
  const x0 = derecha ? x - w : x, x1 = x0 + w, ar = y - h / 2, ab = y + h / 2;
  // el pico: [base 1, punta, base 2], en el orden del contorno (que va en el sentido del reloj)
  const lim = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  let lado, pico;
  if (!a) {
    const ty = ab - 4;
    lado = 'abajo';
    pico = derecha ? [[x1 - 4, ty - 8], [x1 + 10, ty], [x1 - 12, ab]] : [[x0 + 12, ab], [x0 - 10, ty], [x0 + 4, ty - 8]];
  } else {
    const [mx, my] = a;
    let base;
    if (my >= ab) { lado = 'abajo'; base = [lim(mx, x0 + 16, x1 - 16), ab]; }
    else if (my <= ar) { lado = 'arriba'; base = [lim(mx, x0 + 16, x1 - 16), ar]; }
    else if (mx < x0) { lado = 'izq'; base = [x0, lim(my, ar + 10, ab - 10)]; }
    else { lado = 'der'; base = [x1, lim(my, ar + 10, ab - 10)]; }
    const dx = mx - base[0], dy = my - base[1], d = Math.hypot(dx, dy) || 1;
    const L = Math.max(6, Math.min(largo, d - 6));
    const punta = [base[0] + (dx / d) * L, base[1] + (dy / d) * L];
    const m = 6;   // media anchura de la base
    pico = lado === 'abajo' ? [[base[0] + m, ab], punta, [base[0] - m, ab]]
      : lado === 'arriba' ? [[base[0] - m, ar], punta, [base[0] + m, ar]]
      : lado === 'izq' ? [[x0, base[1] + m], punta, [x0, base[1] - m]]
      : [[x1, base[1] - m], punta, [x1, base[1] + m]];
  }
  // contorno: las esquinas redondeadas, con el pico metido en su lado
  const lados = {
    arriba: [[x0 + 10, ar], [x1 - 10, ar]],
    der: [[x1, ar + 10], [x1, ab - 10]],
    abajo: [[x1 - 10, ab], [x0 + 10, ab]],
    izq: [[x0, ab - 10], [x0, ar + 10]],
  };
  const contorno = [];
  for (const k of ['arriba', 'der', 'abajo', 'izq']) {
    const [p1, p2] = lados[k];
    contorno.push(p1);
    if (k === lado) contorno.push(...pico);
    contorno.push(p2);
  }
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.roundRect(x0, ar, w, h, 10); ctx.fill();
  ctx.beginPath(); pico.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py))); ctx.closePath(); ctx.fill();
  lapiz(ctx, contorno, { ancho: 1.4, cerrado: true, doble: false, amp: 0.3 });
  lineas.forEach((l, i) => texto(ctx, l, x0 + 10, y - (lineas.length - 1) * 9 + i * 18, { tam: 15, color: C.lapiz }));
  ctx.restore();
}

/** Dónde tiene la boca un bloque dibujado con `dibujarEme(ctx, x, y, B, { sy })` (sin girar). */
export const boca = (x, y, B, sy = 1) => [x, y + 0.18 * B * sy];

export function estrella(ctx, x, y, r, color) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 ? r * 0.45 : r, t = -Math.PI / 2 + (i * Math.PI) / 5;
    ctx.lineTo(x + rr * Math.cos(t), y + rr * Math.sin(t));
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = C.lapiz;
  ctx.lineWidth = 1;
  ctx.stroke();
}

// ---------- textos dentro de la escena ----------
// Cada escena lleva una lista de textos que se escriben letra a letra, uno tras otro, en su
// sitio del dibujo: «imprenta» es el enunciado del libro; «mano», las notas del narrador.
export const IMPRENTA = 'Georgia, "Times New Roman", serif';

function lineasDe(ctx, item) {
  if (item._lineas) return item._lineas;
  ctx.font = fuenteDe(item);
  const palabras = item.s.split(' ');
  const lineas = [];
  let actual = '';
  for (const p of palabras) {
    const prueba = actual ? `${actual} ${p}` : p;
    if (item.w && ctx.measureText(prueba).width > item.w && actual) { lineas.push(actual); actual = p; }
    else actual = prueba;
  }
  if (actual) lineas.push(actual);
  item._lineas = lineas;
  return lineas;
}
const fuenteDe = (item) => `${item.tam}px ${item.estilo === 'imprenta' ? IMPRENTA : FUENTE}`;

/** Programa cuándo empieza y acaba de escribirse cada texto de la escena. */
function programar(escena) {
  let fin = 0;
  escena.textos.forEach((item, i) => {
    item.inicio = item.desde ?? fin + (i ? 0.35 : 0.3);
    item.fin = item.inicio + item.s.length / LETRAS_POR_SEGUNDO;
    fin = item.fin;
  });
  escena.finTextos = fin;
}

function escribirTextos(ctx, escena, t, completo) {
  for (const item of escena.textos) {
    const n = completo ? item.s.length : Math.floor((t - item.inicio) * LETRAS_POR_SEGUNDO);
    if (n <= 0) continue;
    const lineas = lineasDe(ctx, item);
    const alto = item.tam * 1.22;
    ctx.save();
    ctx.translate(item.x, item.y);
    if (item.rot) ctx.rotate(item.rot);
    ctx.font = fuenteDe(item);
    ctx.textBaseline = 'middle';
    ctx.textAlign = item.alin ?? 'left';
    let quedan = n;
    lineas.forEach((linea, k) => {
      if (quedan <= 0) return;
      const trozo = linea.slice(0, quedan);
      quedan -= linea.length + 1;
      const y = k * alto;
      if (item.marca) {          // rotulador fosforito
        const w = ctx.measureText(trozo).width;
        const x0 = item.alin === 'center' ? -w / 2 : 0;
        ctx.fillStyle = 'rgba(247,208,70,0.6)';
        ctx.fillRect(x0 - 3, y - item.tam * 0.55, w + 6, item.tam * 1.1);
      }
      ctx.fillStyle = item.color ?? (item.estilo === 'imprenta' ? '#4a4540' : C.naranjaO);
      ctx.fillText(trozo, 0, y);
    });
    ctx.restore();
  }
}

// ---------- escenas ----------
const A = [70, 130], Bp = [300, 250];   // extremos del plano inclinado

const ESCENAS = [
  {
    textos: [
      { s: 'Un bloque de masa m se desliza por un plano inclinado de ángulo θ. Calcule su velocidad al llegar abajo.',
        x: 38, y: 64, w: 326, tam: 12.5, estilo: 'imprenta' },
      { s: 'Así empezaban todos sus días.', x: 205, y: 128, w: 160, tam: 17, estilo: 'mano', rot: -0.05 },
    ],
    dur: 5.2,
    dibujar(ctx, t) {
      pagina(ctx, 24, 376, 3, false);
      plano(ctx, A, Bp);
      const p = sobrePlano(A, Bp, 0.17, 34);
      dibujarEme(ctx, p.x, p.y, 34, { sinCara: true, ang: p.ang, seed: 2 });
      const f = suave(1.2, 2.2, t);
      if (f > 0) {
        ctx.globalAlpha = f;
        flecha(ctx, p.x, p.y, p.x, p.y + 42, 'mg');
        ctx.globalAlpha = 1;
      }
    },
  },
  {
    textos: [
      { s: 'Un bloque de masa m se desliza por un plano inclinado…', x: 38, y: 64, w: 326, tam: 12.5, estilo: 'imprenta', desde: 0 },
      { s: 'Desprecie el rozamiento.', x: 38, y: 82, w: 326, tam: 12.5, estilo: 'imprenta', marca: true, desde: 0.6 },
      { s: 'Problema tras problema. Siempre el mismo plano. Siempre «desprecie el rozamiento».',
        x: 214, y: 112, w: 160, tam: 14.5, estilo: 'mano', rot: -0.04 },
    ],
    dur: 5.4,
    dibujar(ctx, t) {
      const ciclo = 1.35;
      const n = Math.floor(t / ciclo);
      const u = (t % ciclo) / ciclo;
      pagina(ctx, 24, 376, 4 + n, false);
      plano(ctx, A, Bp);
      const pr = reducido ? 0.5 : Math.min(1, (u / 0.85) ** 2) * 0.8 + 0.12;
      const p = sobrePlano(A, Bp, pr, 34);
      dibujarEme(ctx, p.x, p.y, 34, { sinCara: true, ang: p.ang, seed: 2 + (n % 3) });
      // líneas de velocidad
      if (u > 0.2 && u < 0.85) {
        ctx.strokeStyle = 'rgba(110,104,98,0.6)';
        ctx.lineWidth = 1.2;
        for (const k of [-8, 0, 8]) {
          ctx.beginPath();
          ctx.moveTo(p.x - 24 * Math.cos(p.ang) - k * Math.sin(p.ang), p.y - 24 * Math.sin(p.ang) + k * Math.cos(p.ang));
          ctx.lineTo(p.x - 40 * Math.cos(p.ang) - k * Math.sin(p.ang), p.y - 40 * Math.sin(p.ang) + k * Math.cos(p.ang));
          ctx.stroke();
        }
      }
    },
  },
  {
    textos: [{ s: 'Hasta que un día, el bloque abrió los ojos.', x: 38, y: 70, w: 330, tam: 19, estilo: 'mano', rot: -0.02, desde: 0.9 }],
    dur: 4.6,
    dibujar(ctx, t) {
      pagina(ctx, 24, 376, 9, false);
      plano(ctx, A, Bp);
      const B = 34 + 46 * suave(0, 0.8, t);
      const p0 = sobrePlano(A, Bp, 0.17, 34);
      const x = p0.x + (200 - p0.x) * suave(0, 0.8, t), y = p0.y + (175 - p0.y) * suave(0, 0.8, t);
      const ang = p0.ang * (1 - suave(0, 0.8, t));
      if (t < 1.1) {
        dibujarEme(ctx, x, y, B, { sinCara: true, ang, seed: 2 });
      } else {
        const lid = t < 1.7 ? 1 - suave(1.1, 1.7, t) * 0.88 : (t > 2.3 && t < 2.45 ? 1 : 0.12);
        const harto = t > 2.6;
        dibujarEme(ctx, x, y, B, harto ? { expr: 'bored', seed: 2 } : { expr: 'idle', lid, px: 0, py: 0.1, seed: 2 });
        bocadillo(ctx, 252, 128, '¿Otra vez?', suave(2.8, 3.1, t), { a: boca(x, y, B) });
      }
    },
  },
  {
    textos: [{ s: 'Y decidió escaparse del libro.', x: 38, y: 70, w: 250, tam: 19, estilo: 'mano', rot: -0.03 }],
    dur: 4.2,
    dibujar(ctx, t) {
      pagina(ctx, 24, 300, 9, false);
      plano(ctx, A, [250, 250]);
      // Eme mira al borde de la página y sale a saltitos
      const salida = suave(1.0, 3.6, t);
      const x = 160 + 230 * salida;
      const brinco = reducido ? 0 : Math.abs(Math.sin(salida * Math.PI * 3)) * 26;
      const y = 175 - brinco + (x > 300 ? (x - 300) * 0.9 : 0);
      dibujarEme(ctx, x, y, 56, t < 1.0
        ? { expr: 'idle', px: 0.95, py: 0, lid: 0.1, seed: 3 }
        : { expr: 'fast', px: 0.8, seed: 3, ang: (salida - 0.5) * 0.4 });
      if (t < 1.0) texto(ctx, '…', 205, 120, { tam: 22, color: C.suave });
    },
  },
  {
    textos: [
      { s: 'Su plan:', x: 22, y: 24, tam: 21, estilo: 'mano' },
      { s: 'atravesar el cuaderno, el libro de texto y la pizarra… hasta salir al mundo real.',
        x: 22, y: 47, w: 360, tam: 15.5, estilo: 'mano', color: C.lapiz },
    ],
    dur: 6.2,
    dibujar(ctx, t) {
      const paradas = [[60, 210], [150, 140], [250, 205], [342, 132]];
      // camino discontinuo
      ctx.save();
      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = C.suave;
      ctx.lineWidth = 2;
      ctx.beginPath();
      paradas.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.stroke();
      ctx.restore();
      const etiquetas = ['cuaderno', 'libro de texto', 'pizarra', '¡fuera!'];
      paradas.forEach(([x, y], i) => {
        const aparece = suave(0.3 + i * 0.6, 0.7 + i * 0.6, t);
        if (aparece <= 0) return;
        ctx.save();
        ctx.globalAlpha = aparece;
        ctx.translate(x, y);
        ctx.scale(0.6 + 0.4 * aparece, 0.6 + 0.4 * aparece);
        if (i === 0) {          // cuaderno: papel cuadriculado con espiral
          ctx.fillStyle = '#fff'; ctx.fillRect(-26, -30, 52, 60);
          ctx.strokeStyle = C.cuadri; ctx.lineWidth = 1;
          for (let k = -20; k < 30; k += 8) { ctx.beginPath(); ctx.moveTo(-26, k); ctx.lineTo(26, k); ctx.stroke(); ctx.beginPath(); ctx.moveTo(k, -30); ctx.lineTo(k, 30); ctx.stroke(); }
          lapiz(ctx, [[-26, -30], [26, -30], [26, 30], [-26, 30]], { ancho: 1.6, cerrado: true, doble: false });
          for (let k = -24; k < 30; k += 9) { ctx.beginPath(); ctx.arc(-26, k, 3, 0, 6.29); ctx.strokeStyle = C.lapiz; ctx.stroke(); }
        } else if (i === 1) {   // libro abierto
          ctx.fillStyle = '#fff';
          trazar(ctx, [[-32, -22], [0, -16], [32, -22], [32, 24], [0, 30], [-32, 24]], true); ctx.fill();
          lapiz(ctx, [[-32, -22], [0, -16], [32, -22], [32, 24], [0, 30], [-32, 24]], { ancho: 1.6, cerrado: true, doble: false });
          lapiz(ctx, [[0, -16], [0, 30]], { ancho: 1.2, doble: false });
          ctx.fillStyle = '#d9d3c7';
          for (let k = 0; k < 4; k++) { ctx.fillRect(-26, -12 + k * 9, 20, 2.5); ctx.fillRect(6, -12 + k * 9, 20, 2.5); }
        } else if (i === 2) {   // pizarra
          ctx.fillStyle = '#7a5a3a'; ctx.fillRect(-36, -26, 72, 52);
          ctx.fillStyle = '#2f5d48'; ctx.fillRect(-32, -22, 64, 44);
          ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 1.6;
          ctx.beginPath(); ctx.moveTo(-24, 10); ctx.quadraticCurveTo(-8, -18, 10, 4); ctx.stroke();
          texto(ctx, 'E=mgh', 18, -10, { tam: 9, color: '#fff', alin: 'center' });
        } else {                // el mundo real: un sol
          ctx.fillStyle = C.julito;
          ctx.beginPath(); ctx.arc(0, 0, 16, 0, 6.29); ctx.fill();
          ctx.strokeStyle = C.lapiz; ctx.lineWidth = 1.6; ctx.stroke();
          for (let k = 0; k < 8; k++) {
            const a = (k * Math.PI) / 4 + t * 0.6;
            ctx.beginPath(); ctx.moveTo(22 * Math.cos(a), 22 * Math.sin(a)); ctx.lineTo(30 * Math.cos(a), 30 * Math.sin(a)); ctx.stroke();
          }
        }
        ctx.restore();
        texto(ctx, etiquetas[i], x, y + 44, { tam: 13, color: i === 3 ? C.naranjaO : C.lapiz, alin: 'center' });
      });
      // Eme recorre el camino
      const p = suave(2.6, 5.6, t) * 3;
      const k = Math.min(2, Math.floor(p)), f = p - k;
      const [xa, ya] = paradas[k], [xb, yb] = paradas[k + 1];
      const brinco = reducido ? 0 : Math.abs(Math.sin(p * Math.PI)) * 14;
      dibujarEme(ctx, xa + (xb - xa) * f, ya + (yb - ya) * f - 30 - brinco, 26, { expr: p > 2.9 ? 'win' : 'idle', px: 0.8, seed: 4 });
    },
  },
  {
    textos: [{ s: 'Pero cada pista le roba energía: los julitos que pierde se le escapan en forma de calor.',
      x: 214, y: 94, w: 172, tam: 15, estilo: 'mano', rot: -0.03 }],
    dur: 6.0,
    dibujar(ctx, t) {
      const pista = [[30, 120], [60, 120]];
      for (let i = 1; i <= 30; i++) { const u = i / 30; pista.push([60 + 220 * u, 120 + 110 * (u * u * (3 - 2 * u))]); }
      pista.push([370, 230]);
      ctx.save();
      ctx.fillStyle = '#efe8d8';
      trazar(ctx, [...pista, [370, 290], [30, 290]], true);
      ctx.fill();
      // tramo de arena
      ctx.fillStyle = 'rgba(238,210,152,0.95)';
      trazar(ctx, [...pista.slice(12, 26), [pista[25][0], 290], [pista[12][0], 290]], true);
      ctx.fill();
      ctx.restore();
      lapiz(ctx, pista, { ancho: 2.2, amp: 0.6 });
      // Eme baja: Ep → Ec, y la arena se come 3 julitos
      const p = reducido ? 0.7 : suave(0.8, 4.2, t);
      const idx = Math.min(pista.length - 2, Math.floor(p * (pista.length - 1)));
      const f = p * (pista.length - 1) - idx;
      const [xa, ya] = pista[idx], [xb, yb] = pista[idx + 1];
      const ang = Math.atan2(yb - ya, xb - xa);
      const x = xa + (xb - xa) * f, y = ya + (yb - ya) * f;
      const enArena = idx >= 12 && idx < 25;
      dibujarEme(ctx, x + Math.sin(ang) * 16, y - Math.cos(ang) * 16, 32,
        { expr: enArena ? 'effort' : p > 0.05 && p < 0.99 ? 'fast' : 'idle', ang, seed: 5 });
      // julitos: la Ep sigue a la altura (de 8 a 1) y la arena se come 3, al 25 %, 50 % y 75 % de su tramo
      const fArena = Math.max(0, Math.min(1, (p - 12 / 31) / (13 / 31)));
      const calor = Math.min(3, Math.floor(fArena * 4));
      const ep = Math.round(8 - 7 * (y - 120) / 110);
      const ec = Math.max(0, 8 - ep - calor);
      for (let i = 0; i < 8; i++) {
        const color = i < ep ? C.ep : i < ep + ec ? C.julito : C.calor;
        cuadradito(ctx, 112 + i * 22, 40, 17, color);
      }
      texto(ctx, '8 julitos', 200, 64, { tam: 12, alin: 'center' });
      if (calor > 0) texto(ctx, `−${calor}`, 302, 40, { tam: 16, color: C.calor });
    },
  },
  {
    textos: [
      { s: 'Tu misión: elegir las piezas para que llegue justo a la bandera.', x: 200, y: 26, w: 340, tam: 17, estilo: 'mano', color: C.lapiz, alin: 'center' },
      { s: 'Ni más, ni menos.', x: 200, y: 72, tam: 23, estilo: 'mano', alin: 'center', rot: -0.03 },
    ],
    dur: Infinity,
    dibujar(ctx, t) {
      ctx.fillStyle = '#efe8d8';
      trazar(ctx, [[120, 240], [280, 240], [280, 300], [120, 300]], true);
      ctx.fill();
      lapiz(ctx, [[120, 300], [120, 240], [280, 240], [280, 300]], { ancho: 2.2 });
      const salto = reducido ? 0 : Math.abs(Math.sin(t * 3.2)) * 12;
      dibujarEme(ctx, 200, 240 - 40 - salto, 80, { expr: 'win', bandera: true, seed: 6, sy: 1 + salto * 0.004 });
      const r = (n) => ((Math.sin(n * 91.7) + 1) / 2);
      for (let i = 0; i < 14; i++) {
        const x = 40 + r(i) * 320, y = ((r(i + 9) * 300 + t * (30 + r(i + 3) * 30)) % 320) - 20;
        cuadradito(ctx, x, y, 8, C.julito, t * (r(i + 5) - 0.5) * 4);
      }
      estrella(ctx, 86, 150, 9, C.julito);
      estrella(ctx, 322, 132, 7, C.julito);
    },
  },
];

// ---------- reproductor ----------

export function mostrarHistoria({ alTerminar } = {}) {
  reproducir(ESCENAS, { alTerminar, alVer: marcarVista, etiqueta: 'La historia de Eme', vamos: '¡Vamos!' });
}

/**
 * Reproduce una lista de escenas en la capa de la historia: cada escena dibuja su animación y
 * escribe sus textos; se avanza sola o tocando, y «Saltar» la cierra. Al terminar llama a
 * `alVer` (para recordarla) y arranca la hoja con `alTerminar` debajo.
 */
export function reproducir(ESCENAS, { alTerminar, alVer, etiqueta, vamos: textoVamos = '¡Vamos!' } = {}) {
  const $ = (id) => document.getElementById(id);
  const raiz = $('historia');
  const lienzo = $('historia-lienzo');
  const parrafo = $('historia-texto');      // solo para lectores de pantalla
  const puntos = $('historia-puntos');
  const vamos = $('historia-vamos');
  const ctx = lienzo.getContext('2d');

  let escena = 0, t = 0, completo = false, vivo = true, ultimo = performance.now();
  restaurar(raiz);
  raiz.hidden = false;
  raiz.setAttribute('aria-label', etiqueta ?? 'La historia de Eme');
  vamos.textContent = textoVamos;
  vamos.hidden = true;
  puntos.innerHTML = ESCENAS.map(() => '<i></i>').join('');
  ESCENAS.forEach(programar);

  const ajustar = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const w = lienzo.clientWidth || 360;
    lienzo.width = Math.round(w * dpr);
    lienzo.height = Math.round(w * (AH / AW) * dpr);
  };
  ajustar();
  window.addEventListener('resize', ajustar);

  const ir = (n) => {
    escena = n;
    t = 0;
    completo = false;
    [...puntos.children].forEach((p, i) => p.classList.toggle('activo', i <= n));
    vamos.hidden = true;
    parrafo.textContent = ESCENAS[n].textos.map((x) => x.s).join(' ');
  };

  const terminar = () => {
    if (!vivo) return;
    vivo = false;
    alVer?.();
    window.removeEventListener('resize', ajustar);
    document.removeEventListener('keydown', teclas);
    arrancar(raiz, { antes: alTerminar });
  };

  const escrita = () => completo || t >= ESCENAS[escena].finTextos;
  const adelantar = () => {
    if (!escrita()) completo = true;                  // primero, completar los textos
    else if (escena < ESCENAS.length - 1) ir(escena + 1);
  };

  const teclas = (e) => {
    if (e.key === 'Escape') terminar();
    else if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight') { e.preventDefault(); adelantar(); }
  };

  raiz.onclick = (e) => { if (!e.target.closest('button')) adelantar(); };
  $('historia-saltar').onclick = terminar;
  vamos.onclick = terminar;
  document.addEventListener('keydown', teclas);
  ir(0);

  const fotograma = (ahora) => {
    if (!vivo) return;
    const dt = Math.min(0.05, (ahora - ultimo) / 1000);
    ultimo = ahora;
    t += dt;
    const e = ESCENAS[escena];

    const w = lienzo.width, s = w / AW;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, w, lienzo.height);
    ctx.setTransform(s, 0, 0, s, 0, 0);
    e.dibujar(ctx, t);
    escribirTextos(ctx, e, t, completo);

    if (escena === ESCENAS.length - 1 && escrita()) vamos.hidden = false;
    // avanza sola cuando ha pasado su tiempo y ha dado tiempo a leer los textos
    const lectura = e.finTextos + 1.8;
    if (escrita() && t > Math.max(e.dur, completo ? 0 : lectura) && escena < ESCENAS.length - 1) ir(escena + 1);
    requestAnimationFrame(fotograma);
  };
  requestAnimationFrame(fotograma);
}
