// Dibujo con estilo de cuaderno: trazo de lápiz, texturas de materiales, tablero y Eme.
// Todas las medidas van en píxeles CSS; el lienzo ya viene escalado por devicePixelRatio.

import { construirPista, celdasTramos, celdaDe, columnas, anchoTablero, inicioRepisa } from './pista.js';
import { NIVEL } from './nivel.js';

export const C = {
  papel: '#FBF8EF', tarjeta: '#FFFEF9', cuadri: '#E2EBF5', rejilla: '#A0A3AA',
  lapiz: '#3A3530', suave: '#6E6862',
  naranja: '#F2A33A', naranjaO: '#D9822B', naranjaC: '#FCC878', tatuaje: '#C46C20',
  julito: '#F7D046', calor: '#E5533D', ep: '#5C8EE6',
  blanco: '#FFFFFF', sudor: '#96CDF0', regla: '#6E8CB4',
};
export const MAT_COLOR = {
  fijo: '#E9E1CE', hielo: '#D4EBF7', arena: '#EED298', madera: '#CD965C', asfalto: '#96969C',
  escalera: '#A9B0B8',
};
export const FUENTE = '"Patrick Hand", "Segoe Print", "Comic Sans MS", cursive';

// ---------- azar con semilla ----------
export function azar(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- trazo de lápiz ----------
export function remuestrear(pts, paso) {
  const out = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const n = Math.max(1, Math.floor(Math.hypot(x1 - x0, y1 - y0) / paso));
    for (let k = 1; k <= n; k++) out.push([x0 + ((x1 - x0) * k) / n, y0 + ((y1 - y0) * k) / n]);
  }
  return out;
}

export function temblar(pts, seed = 0, amp = 0.8, cerrado = false) {
  if (cerrado) pts = [...pts, pts[0]];
  const p = remuestrear(pts, 3);
  const r = azar(seed);
  const f = [r() * 6.28, r() * 6.28, r() * 6.28];
  const out = [];
  let L = 0;
  for (let i = 0; i < p.length; i++) {
    if (i) L += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]);
    const a = p[Math.max(i - 1, 0)];
    const b = p[Math.min(i + 1, p.length - 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const n = Math.hypot(dx, dy) || 1;
    const o = amp * (0.6 * Math.sin(L / 23 + f[0]) + 0.3 * Math.sin(L / 9 + f[1]) + 0.15 * Math.sin(L / 4 + f[2]));
    out.push([p[i][0] - (dy / n) * o, p[i][1] + (dx / n) * o]);
  }
  if (cerrado) out[out.length - 1] = out[0];
  return out;
}

export function trazar(ctx, pts, cerrado = false) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  if (cerrado) ctx.closePath();
}

export function lapiz(ctx, pts, { ancho = 2, color = C.lapiz, seed = 0, amp = 0.8, cerrado = false, doble = true } = {}) {
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = color;
  ctx.lineWidth = ancho;
  trazar(ctx, temblar(pts, seed, amp, cerrado));
  ctx.stroke();
  if (doble) {
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = Math.max(0.6, ancho * 0.4);
    trazar(ctx, temblar(pts, seed + 101, amp * 1.4, cerrado));
    ctx.stroke();
  }
  ctx.restore();
}

export function rrectPts(x0, y0, x1, y1, r) {
  const pts = [];
  for (const [cx, cy, a0, a1] of [[x1 - r, y0 + r, -90, 0], [x1 - r, y1 - r, 0, 90], [x0 + r, y1 - r, 90, 180], [x0 + r, y0 + r, 180, 270]]) {
    for (let i = 0; i <= 12; i++) {
      const a = ((a0 + ((a1 - a0) * i) / 12) * Math.PI) / 180;
      pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
  }
  return pts;
}

export function discontinua(ctx, pts, { ancho = 2, color = C.suave, guion = [7, 5] } = {}) {
  ctx.save();
  ctx.setLineDash(guion);
  ctx.lineWidth = ancho;
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  trazar(ctx, pts, true);
  ctx.stroke();
  ctx.restore();
}

export function cuadradito(ctx, x, y, lado, color, ang = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  ctx.fillStyle = color;
  ctx.fillRect(-lado / 2, -lado / 2, lado, lado);
  ctx.strokeStyle = C.lapiz;
  ctx.lineWidth = Math.max(1, lado * 0.08);
  ctx.strokeRect(-lado / 2, -lado / 2, lado, lado);
  ctx.restore();
}

// ---------- texturas de materiales ----------
const patrones = new Map();
function patron(ctx, mat) {
  if (patrones.has(mat)) return patrones.get(mat);
  const N = 48, E = 2;
  const c = document.createElement('canvas');
  c.width = c.height = N * E;
  const g = c.getContext('2d');
  g.scale(E, E);
  g.fillStyle = MAT_COLOR[mat];
  g.fillRect(0, 0, N, N);
  const r = azar(mat.length * 97);
  if (mat === 'fijo') {
    g.strokeStyle = 'rgba(90,80,60,0.2)';
    g.lineWidth = 1;
    for (let k = 0; k <= 2 * N; k += 8) {
      g.beginPath(); g.moveTo(k - N, N); g.lineTo(k, 0); g.stroke();
    }
  } else if (mat === 'arena') {
    for (let i = 0; i < 90; i++) {
      g.fillStyle = 'rgba(190,152,90,0.85)';
      g.beginPath(); g.arc(r() * N, r() * N, 0.6 + r() * 0.8, 0, 6.29); g.fill();
    }
  } else if (mat === 'asfalto') {
    for (let i = 0; i < 140; i++) {
      g.fillStyle = r() < 0.6 ? 'rgba(95,95,100,0.9)' : 'rgba(210,210,215,0.9)';
      g.beginPath(); g.arc(r() * N, r() * N, 0.4 + r() * 0.6, 0, 6.29); g.fill();
    }
  } else if (mat === 'madera') {
    g.strokeStyle = 'rgba(140,90,45,0.8)';
    g.lineWidth = 1;
    for (let y = 4; y < N; y += 8) {
      g.beginPath(); g.moveTo(0, y); g.lineTo(N, y); g.stroke();
      const jx = r() * N;
      g.beginPath(); g.moveTo(jx, y); g.lineTo(jx, y + 8); g.stroke();
    }
  } else if (mat === 'escalera') {
    // chapa de metal con estrías
    g.strokeStyle = 'rgba(80,88,98,0.55)';
    g.lineWidth = 1.2;
    for (let y = 3; y < N; y += 6) { g.beginPath(); g.moveTo(0, y); g.lineTo(N, y); g.stroke(); }
    g.strokeStyle = 'rgba(255,255,255,0.5)';
    g.lineWidth = 0.8;
    for (let y = 4.5; y < N; y += 6) { g.beginPath(); g.moveTo(0, y); g.lineTo(N, y); g.stroke(); }
  } else if (mat === 'hielo') {
    g.strokeStyle = 'rgba(255,255,255,0.95)';
    g.lineWidth = 2;
    g.lineCap = 'round';
    for (const [x, y] of [[6, 14], [28, 34], [34, 8]]) {
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + 10, y - 4); g.stroke();
    }
  }
  const p = ctx.createPattern(c, 'repeat');
  p.setTransform(new DOMMatrix().scale(1 / E));
  patrones.set(mat, p);
  return p;
}

// ---------- vistas: de cuadritos (x, altura) a píxeles ----------
// W es el ancho del tablero en píxeles; el alto es siempre 9 cuadritos (3 filas de casillas).
export function vistaTablero(W, cols = columnas()) {
  const k = W / (3 * cols);
  return { k, px: (x, h) => [x * k, (9 - h) * k] };
}
export function vistaCelda(celda, lado, cols = columnas()) {
  const c = (celda - 1) % cols, r = Math.floor((celda - 1) / cols);
  const x0 = c * 3, h0 = (2 - r) * 3, k = lado / 3;
  return { k, px: (x, h) => [(x - x0) * k, (h0 + 3 - h) * k] };
}
export function rectCelda(W, celda, cols = columnas()) {
  const L = W / cols, c = (celda - 1) % cols, r = Math.floor((celda - 1) / cols);
  return [c * L, r * L, L, L];
}

function pintarTerreno(ctx, v, pista, rect, mat) {
  const poly = [...pista, [pista[pista.length - 1][0], -1], [0, -1]].map(([x, h]) => v.px(x, h));
  ctx.save();
  ctx.beginPath();
  ctx.rect(...rect);
  ctx.clip();
  trazar(ctx, poly, true);
  ctx.fillStyle = patron(ctx, mat);
  ctx.fill();
  ctx.restore();
}

/** Puntos donde la pista entra o sale de una casilla. */
export function conectores(nivel, celda, colocadas) {
  const pista = construirPista(nivel, colocadas);
  const cols = columnas(nivel);
  const out = [];
  for (let i = 1; i < pista.length; i++) {
    const a = celdaDe(...pista[i - 1], cols);
    const b = celdaDe(...pista[i], cols);
    if (a !== b && (a === celda || b === celda)) out.push(pista[i - 1]);
  }
  return out;
}

// ---------- tablero (parte estática) ----------
export function dibujarTablero(ctx, W, nivel, colocadas) {
  const cols = columnas(nivel), ancho = anchoTablero(nivel);
  const v = vistaTablero(W, cols);
  const k = v.k, H = 9 * k;
  ctx.fillStyle = C.tarjeta;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = C.cuadri;
  ctx.lineWidth = 1;
  for (let i = 1; i < ancho; i++) {
    if (i % 3 === 0) continue;
    ctx.beginPath(); ctx.moveTo(i * k, 0); ctx.lineTo(i * k, H); ctx.stroke();
  }
  for (let i = 1; i < 9; i++) {
    if (i % 3 === 0) continue;
    ctx.beginPath(); ctx.moveTo(0, i * k); ctx.lineTo(W, i * k); ctx.stroke();
  }

  const pista = construirPista(nivel, colocadas);
  const vacia = (c) => nivel.huecos[c] && !colocadas[c];
  for (let c = 1; c <= 3 * cols; c++) {
    if (vacia(c)) continue;
    const mat = nivel.huecos[c] ? colocadas[c].material : 'fijo';
    pintarTerreno(ctx, v, pista, rectCelda(W, c, cols), mat);
  }

  // trazo de la pista, cortado en los huecos vacíos
  const celdas = celdasTramos(pista, cols);
  let tramo = [];
  const cerrar = () => {
    if (tramo.length > 1) lapiz(ctx, tramo.map(([x, h]) => v.px(x, h)), { ancho: 2.4, seed: tramo.length });
    tramo = [];
  };
  for (let i = 0; i < celdas.length; i++) {
    if (vacia(celdas[i])) { cerrar(); continue; }
    if (!tramo.length) tramo.push(pista[i]);
    tramo.push(pista[i + 1]);
  }
  cerrar();

  // escaleras mecánicas colocadas: pasamanos por encima de los escalones
  for (const [cs, p] of Object.entries(colocadas)) {
    if (p?.material === 'escalera') pasamanos(ctx, v, pista, celdas, Number(cs));
  }

  // huecos vacíos: recuadro discontinuo, icono de la forma y conectores
  for (const [cs, forma] of Object.entries(nivel.huecos)) {
    const c = Number(cs);
    if (!vacia(c)) continue;
    const [x, y, L] = rectCelda(W, c, cols);
    const m = L * 0.06;
    discontinua(ctx, rrectPts(x + m, y + m, x + L - m, y + L - m, L * 0.08), { ancho: 1.6, color: C.suave });
    iconoForma(ctx, x + L / 2, y + L / 2, L, forma, C.suave);
    ctx.fillStyle = C.suave;
    for (const [px, ph] of conectores(nivel, c, colocadas)) {
      const [cx, cy] = v.px(px, ph);
      ctx.beginPath(); ctx.arc(cx, cy, Math.max(3, k * 0.1), 0, 6.29); ctx.fill();
    }
  }

  // (la regla de alturas va fuera del tablero, en el HTML)

  // rejilla de casillas, bien marcada por encima del terreno
  for (let i = 1; i < cols; i++) {
    lapiz(ctx, [[i * 3 * k, 0], [i * 3 * k, H]], { ancho: 2.2, color: C.rejilla, seed: 400 + i, amp: 0.5 });
  }
  for (const i of [1, 2]) {
    lapiz(ctx, [[0, i * 3 * k], [W, i * 3 * k]], { ancho: 2.2, color: C.rejilla, seed: 410 + i, amp: 0.5 });
  }

  // altura objetivo: línea discontinua roja desde la regla hasta la meta
  const [, ym] = v.px(0, nivel.meta.altura);
  const [xm] = v.px(inicioRepisa(nivel), nivel.meta.altura);
  ctx.save();
  ctx.setLineDash([7, 5]);
  ctx.strokeStyle = 'rgba(229,83,61,0.75)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, ym); ctx.lineTo(xm, ym); ctx.stroke();
  ctx.restore();
}

/** Pasamanos de una escalera mecánica: una barandilla paralela a la pista, con dos postes. */
function pasamanos(ctx, v, pista, celdas, celda) {
  const pts = [];
  for (let i = 0; i < celdas.length; i++) {
    if (celdas[i] !== celda) continue;
    if (!pts.length) pts.push(pista[i]);
    pts.push(pista[i + 1]);
  }
  if (pts.length < 2) return;
  const alto = 1.1;   // cuadritos por encima de los escalones
  const arriba = pts.map(([x, h]) => v.px(x, h + alto));
  ctx.save();
  // escalones: dientes de sierra justo por debajo de la pista
  const [x0, h0] = pts[0], [x1, h1] = pts[pts.length - 1];
  const n = Math.max(3, Math.round(Math.hypot(x1 - x0, h1 - h0) / 0.55));
  const dx = (x1 - x0) / n, dh = (h1 - h0) / n;
  ctx.strokeStyle = 'rgba(70,76,86,0.75)';
  ctx.lineWidth = Math.max(1, v.k * 0.05);
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    ctx.moveTo(...v.px(x0 + i * dx, h0 + i * dh));
    ctx.lineTo(...v.px(x0 + (i + 1) * dx, h0 + i * dh));
    ctx.lineTo(...v.px(x0 + (i + 1) * dx, h0 + (i + 1) * dh));
  }
  ctx.stroke();
  ctx.strokeStyle = C.lapiz;
  ctx.lineWidth = 1.4;
  for (const k of [0, pts.length - 1]) {
    const [x, h] = pts[k];
    ctx.beginPath(); ctx.moveTo(...v.px(x, h)); ctx.lineTo(...v.px(x, h + alto)); ctx.stroke();
  }
  ctx.restore();
  lapiz(ctx, arriba, { ancho: Math.max(2.5, v.k * 0.16), color: '#3d3a36', doble: false, amp: 0.3 });
}

export function iconoForma(ctx, cx, cy, L, forma, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  const s = L / 122;
  ctx.beginPath();
  if (forma === 'rampa') {
    ctx.moveTo(cx - 10 * s, cy - 22 * s);
    ctx.quadraticCurveTo(cx - 10 * s, cy + 4 * s, cx + 14 * s, cy + 10 * s);
  } else if (forma === 'subida') {
    ctx.moveTo(cx - 14 * s, cy + 10 * s);
    ctx.quadraticCurveTo(cx + 10 * s, cy + 4 * s, cx + 10 * s, cy - 22 * s);
  } else if (forma === 'escalera') {
    // escalones en diagonal
    ctx.moveTo(cx - 20 * s, cy + 12 * s);
    for (let i = 0; i < 4; i++) {
      ctx.lineTo(cx - 20 * s + i * 10 * s, cy + 12 * s - (i + 1) * 9 * s);
      ctx.lineTo(cx - 10 * s + i * 10 * s, cy + 12 * s - (i + 1) * 9 * s);
    }
  } else if (forma === 'bajada') {
    ctx.moveTo(cx - 20 * s, cy - 18 * s);
    ctx.bezierCurveTo(cx, cy - 18 * s, cx, cy + 10 * s, cx + 20 * s, cy + 10 * s);
  } else if (forma === 'colina') {
    ctx.moveTo(cx - 22 * s, cy + 8 * s);
    ctx.bezierCurveTo(cx - 8 * s, cy + 8 * s, cx - 8 * s, cy - 16 * s, cx, cy - 16 * s);
    ctx.bezierCurveTo(cx + 8 * s, cy - 16 * s, cx + 8 * s, cy + 8 * s, cx + 22 * s, cy + 8 * s);
  } else {
    ctx.moveTo(cx - 20 * s, cy + 4 * s);
    ctx.lineTo(cx + 20 * s, cy + 4 * s);
  }
  ctx.stroke();
  ctx.font = `${Math.max(11, 12 * s)}px ${FUENTE}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(forma, cx, cy + 26 * s);
  ctx.restore();
}

/** Resaltes animados de los huecos: 'activo' (aquí encaja), 'apagado' (no encaja). */
export function dibujarResaltes(ctx, W, estados, t) {
  for (const [cs, est] of Object.entries(estados)) {
    if (!est) continue;
    const [x, y, L] = rectCelda(W, Number(cs));
    const m = L * 0.06;
    ctx.save();
    if (est === 'iman') {   // la pieza está enganchada a este hueco: resalte fijo e intenso
      ctx.fillStyle = 'rgba(242,163,58,0.32)';
      trazar(ctx, rrectPts(x + m * 0.3, y + m * 0.3, x + L - m * 0.3, y + L - m * 0.3, L * 0.1), true);
      ctx.fill();
      ctx.strokeStyle = C.naranjaO;
      ctx.lineWidth = 4;
      ctx.stroke();
    } else if (est === 'activo' || est === 'aviso') {
      const pulso = 0.5 + 0.5 * Math.sin(t * 6);
      const col = est === 'aviso' ? '229,83,61' : '242,163,58';
      ctx.fillStyle = `rgba(${col},${0.12 + 0.14 * pulso})`;
      trazar(ctx, rrectPts(x + m, y + m, x + L - m, y + L - m, L * 0.08), true);
      ctx.fill();
      ctx.strokeStyle = `rgba(${col},${0.35 + 0.3 * pulso})`;
      ctx.lineWidth = 3 + 3 * pulso;
      trazar(ctx, rrectPts(x + m * 0.4, y + m * 0.4, x + L - m * 0.4, y + L - m * 0.4, L * 0.1), true);
      ctx.stroke();
      discontinua(ctx, rrectPts(x + m, y + m, x + L - m, y + L - m, L * 0.08),
        { ancho: 2.4, color: est === 'aviso' ? C.calor : C.naranjaO });
    } else if (est === 'apagado') {
      ctx.fillStyle = 'rgba(120,120,120,0.22)';
      trazar(ctx, rrectPts(x + m, y + m, x + L - m, y + L - m, L * 0.08), true);
      ctx.fill();
    }
    ctx.restore();
  }
}

export function dibujarBandera(ctx, W, nivel) {
  const v = vistaTablero(W, columnas(nivel));
  const [bx, by] = v.px(nivel.meta.bandera, nivel.meta.altura);
  const [, ty] = v.px(nivel.meta.bandera, nivel.meta.altura + 1.6);
  ctx.save();
  ctx.strokeStyle = C.lapiz;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx, ty); ctx.stroke();
  const t = [[bx, ty], [bx + v.k * 0.55, ty + v.k * 0.18], [bx, ty + v.k * 0.38]];
  ctx.fillStyle = C.calor;
  trazar(ctx, t, true);
  ctx.fill();
  lapiz(ctx, t, { ancho: 1.3, cerrado: true, doble: false, amp: 0.2 });
  ctx.restore();
}

/** Miniatura de una pieza: la casilla real del nivel, con su material. */
export function dibujarMiniatura(ctx, lado, celda, pieza, nivel = NIVEL) {
  const cols = columnas(nivel);
  const v = vistaCelda(celda, lado, cols);
  ctx.fillStyle = C.tarjeta;
  ctx.fillRect(0, 0, lado, lado);
  ctx.strokeStyle = C.cuadri;
  ctx.lineWidth = 1;
  for (const i of [1, 2]) {
    ctx.beginPath(); ctx.moveTo((i * lado) / 3, 0); ctx.lineTo((i * lado) / 3, lado); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, (i * lado) / 3); ctx.lineTo(lado, (i * lado) / 3); ctx.stroke();
  }
  const pista = construirPista(nivel, { [celda]: pieza });
  pintarTerreno(ctx, v, pista, [0, 0, lado, lado], pieza.material);
  const celdas = celdasTramos(pista, cols);
  const pts = [];
  for (let i = 0; i < celdas.length; i++) {
    if (celdas[i] !== celda) continue;
    if (!pts.length) pts.push(v.px(...pista[i]));
    pts.push(v.px(...pista[i + 1]));
  }
  if (pts.length > 1) lapiz(ctx, pts, { ancho: 2, doble: false, amp: 0.4 });
  if (pieza.material === 'escalera') pasamanos(ctx, v, pista, celdas, celda);
}

// ---------- Eme ----------
/**
 * Dibuja a Eme centrado en (cx, cy) con lado B.
 * o.expr: idle | gulp | fast | effort | ice | edge | win | bored
 */
export function dibujarEme(ctx, cx, cy, B, o = {}) {
  const { expr = 'idle', ang = 0, sx = 1, sy = 1, lid = 0, px = 0, py = 0, bandera = false, seed = 1, giro = 0, susto = false, sinCara = false, habla = 0 } = o;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(ang);
  const bw = B * sx, bh = B * sy;
  const x0 = -bw / 2, y0 = -bh / 2, x1 = bw / 2, y1 = bh / 2;
  const cuerpo = temblar(rrectPts(x0, y0, x1, y1, 0.2 * Math.min(bw, bh)), seed, Math.max(0.25, B * 0.006), true);
  const lw = Math.max(0.8, B * 0.024);

  // relleno con sombra, rayado y brillo
  ctx.save();
  trazar(ctx, cuerpo, true);
  ctx.clip();
  ctx.fillStyle = C.naranja;
  ctx.fillRect(x0 - 2, y0 - 2, bw + 4, bh + 4);
  ctx.fillStyle = C.naranjaO;
  ctx.beginPath(); ctx.ellipse(0.625 * bw, 0.725 * bh, 0.675 * bw, 0.675 * bh, 0, 0, 6.29); ctx.fill();
  ctx.beginPath(); ctx.ellipse(0.775 * bw, 0.25 * bh, 0.525 * bw, 1.15 * bh, 0, 0, 6.29); ctx.fill();
  ctx.strokeStyle = 'rgba(190,105,30,0.45)';
  ctx.lineWidth = Math.max(0.6, B * 0.009);
  for (let i = 0; i < 7; i++) {
    const t = bw * (0.12 + 0.07 * i);
    ctx.beginPath(); ctx.moveTo(x1 - t, y1); ctx.lineTo(x1, y1 - t); ctx.stroke();
  }
  ctx.strokeStyle = C.naranjaC;
  ctx.lineWidth = B * 0.045;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x0 + 0.11 * bw, y0 + 0.38 * bh);
  ctx.lineTo(x0 + 0.11 * bw, y0 + 0.18 * bh);
  ctx.quadraticCurveTo(x0 + 0.12 * bw, y0 + 0.1 * bh, x0 + 0.38 * bw, y0 + 0.1 * bh);
  ctx.stroke();
  ctx.restore();

  // la "m" que odia
  ctx.fillStyle = C.tatuaje;
  ctx.font = `${B * 0.32}px ${FUENTE}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('m', 0.27 * bw, 0.25 * bh);

  if (!sinCara) cara(ctx, { expr, bw, bh, B, lid, px, py, lw, x0, y0, x1, giro, susto, habla });   // sinCara: el bloque anónimo de los problemas

  ctx.strokeStyle = C.lapiz;
  ctx.lineWidth = lw * 1.3;
  ctx.lineJoin = 'round';
  trazar(ctx, cuerpo, true);
  ctx.stroke();

  if (expr === 'mareado') {
    // estrellitas dando vueltas sobre la cabeza
    for (let k = 0; k < 3; k++) {
      const a = giro * 0.8 + (k * 2 * Math.PI) / 3;
      const sxe = Math.cos(a) * bw * 0.5, sye = y0 - bh * 0.18 + Math.sin(a) * bh * 0.1;
      const r = B * 0.09;
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const rr = i % 2 ? r * 0.45 : r;
        const t = -Math.PI / 2 + (i * Math.PI) / 5;
        ctx.lineTo(sxe + rr * Math.cos(t), sye + rr * Math.sin(t));
      }
      ctx.closePath();
      ctx.fillStyle = C.julito;
      ctx.fill();
      ctx.strokeStyle = C.lapiz;
      ctx.lineWidth = Math.max(0.7, lw * 0.8);
      ctx.stroke();
    }
  }

  if (bandera) {
    const base = [0.06 * bw, y0 + 0.03 * bh];
    const top = [0.14 * bw, y0 - 0.62 * B];
    ctx.strokeStyle = C.lapiz;
    ctx.lineWidth = lw * 1.4;
    ctx.beginPath(); ctx.moveTo(...base); ctx.lineTo(...top); ctx.stroke();
    const t = [top, [top[0] + 0.36 * B, top[1] + 0.1 * B], [top[0] + 0.02 * B, top[1] + 0.22 * B]];
    ctx.fillStyle = C.calor;
    trazar(ctx, t, true);
    ctx.fill();
    ctx.lineWidth = lw;
    ctx.stroke();
  }
  ctx.restore();
}

function cara(ctx, { expr, bw, bh, B, lid, px, py, lw, x0, y0, x1, giro, susto, habla }) {
  const ey = -0.1 * bh, rx = 0.12 * bw, ry = 0.15 * bh;
  const lx = -0.2 * bw, rxx = 0.2 * bw;
  const mx = 0, my = 0.18 * bh;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const L = () => { ctx.strokeStyle = C.lapiz; ctx.fillStyle = C.lapiz; };

  const ojo = (x, k = 1, opx = 0, opy = 0, pr = 0.45, plid = 0) => {
    const a = rx * k, b = ry * k;
    L();
    if (plid >= 0.92) {
      ctx.lineWidth = lw * 1.4;
      ctx.beginPath(); ctx.ellipse(x, ey + b * 0.1, a, b * 0.45, 0, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
      return;
    }
    ctx.fillStyle = C.blanco;
    ctx.beginPath(); ctx.ellipse(x, ey, a, b, 0, 0, 6.29); ctx.fill();
    const qx = x + opx * a * 0.45, qy = ey + opy * b * 0.45, R = a * pr;
    ctx.fillStyle = C.lapiz;
    ctx.beginPath(); ctx.arc(qx, qy, R, 0, 6.29); ctx.fill();
    ctx.fillStyle = C.blanco;
    ctx.beginPath(); ctx.arc(qx - R * 0.35, qy - R * 0.4, R * 0.32, 0, 6.29); ctx.fill();
    if (plid > 0.02) {
      const yl = ey - b + 2 * b * plid;
      ctx.save();
      ctx.beginPath(); ctx.ellipse(x, ey, a, b, 0, 0, 6.29); ctx.clip();
      ctx.fillStyle = C.naranja;
      ctx.fillRect(x - a - 1, ey - b - 1, 2 * a + 2, yl - (ey - b) + 1);
      ctx.restore();
      const xr = a * Math.sqrt(Math.max(0, 1 - ((yl - ey) / b) ** 2));
      L();
      ctx.lineWidth = lw * 1.2;
      ctx.beginPath(); ctx.moveTo(x - xr, yl); ctx.lineTo(x + xr, yl); ctx.stroke();
    }
    L();
    ctx.lineWidth = lw;
    ctx.beginPath(); ctx.ellipse(x, ey, a, b, 0, 0, 6.29); ctx.stroke();
  };
  const feliz = (x) => {
    L(); ctx.lineWidth = lw * 1.4;
    ctx.beginPath(); ctx.ellipse(x, ey + ry * 0.2, rx, ry * 0.8, 0, 1.1 * Math.PI, 1.9 * Math.PI); ctx.stroke();
  };
  const aprieta = (x, der) => {
    const s = der ? -1 : 1;
    L(); ctx.lineWidth = lw * 1.4;
    ctx.beginPath();
    ctx.moveTo(x - s * rx * 0.7, ey - ry * 0.55); ctx.lineTo(x + s * rx * 0.6, ey); ctx.lineTo(x - s * rx * 0.7, ey + ry * 0.55);
    ctx.stroke();
  };
  const ceja = (xa, ya, xb, yb) => {
    L(); ctx.lineWidth = lw * 1.4;
    ctx.beginPath(); ctx.moveTo(xa, ya); ctx.lineTo(xb, yb); ctx.stroke();
  };
  const boca = (tipo) => {
    L(); ctx.lineWidth = lw * 1.2;
    if (tipo === 'ondas') {
      ctx.beginPath();
      for (let i = 0; i <= 30; i++) {
        const x = mx - 0.11 * bw + (0.22 * bw * i) / 30, y = my + 0.018 * bh * Math.sin((i / 30) * 4 * Math.PI);
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
    } else if (tipo === 'O') {
      ctx.beginPath(); ctx.ellipse(mx, my + 0.02 * bh, 0.06 * bw, 0.07 * bh, 0, 0, 6.29); ctx.fill();
      ctx.fillStyle = C.calor;
      ctx.beginPath(); ctx.ellipse(mx, my + 0.058 * bh, 0.035 * bw, 0.022 * bh, 0, 0, 6.29); ctx.fill();
    } else if (tipo === 'dientes') {
      ctx.fillStyle = C.blanco;
      const w = 0.3 * bw, h = 0.11 * bh, x = mx - w / 2, y = my - 0.04 * bh;
      ctx.beginPath(); ctx.roundRect(x, y, w, h, 0.03 * bw); ctx.fill(); ctx.lineWidth = lw; ctx.stroke();
      ctx.lineWidth = lw * 0.7;
      ctx.beginPath(); ctx.moveTo(x, y + h / 2); ctx.lineTo(x + w, y + h / 2);
      for (const i of [-1, 0, 1]) { ctx.moveTo(mx + i * 0.07 * bw, y); ctx.lineTo(mx + i * 0.07 * bw, y + h); }
      ctx.stroke();
    } else if (tipo === 'habla') {
      // boca abierta hablando: `habla` (0-1) es cuánto se abre
      const h = (0.025 + 0.06 * habla) * bh;
      ctx.beginPath(); ctx.ellipse(mx, my, 0.085 * bw, h, 0, 0, 6.29); ctx.fill();
      ctx.fillStyle = C.calor;
      ctx.beginPath(); ctx.ellipse(mx, my + h * 0.55, 0.05 * bw, h * 0.4, 0, 0, 6.29); ctx.fill();
    } else if (tipo === 'sonrisa') {
      ctx.lineWidth = lw * 1.3;
      ctx.beginPath(); ctx.ellipse(mx, my - 0.025 * bh, 0.12 * bw, 0.075 * bh, 0, 0.1 * Math.PI, 0.9 * Math.PI); ctx.stroke();
    } else if (tipo === 'grande') {
      ctx.beginPath(); ctx.ellipse(mx, my - 0.005 * bh, 0.15 * bw, 0.115 * bh, 0, 0, Math.PI); ctx.closePath(); ctx.fill();
      ctx.fillStyle = C.calor;
      ctx.beginPath(); ctx.ellipse(mx, my + 0.075 * bh, 0.075 * bw, 0.035 * bh, 0, Math.PI, 2 * Math.PI); ctx.fill();
    } else {
      ctx.beginPath(); ctx.moveTo(mx - 0.09 * bw, my + 0.01 * bh); ctx.lineTo(mx + 0.08 * bw, my - 0.005 * bh); ctx.stroke();
    }
  };
  const gota = (x, y, s) => {
    const R = s * 0.5, yc = y + s * 0.3;
    ctx.fillStyle = C.sudor;
    ctx.beginPath();
    ctx.moveTo(x, y - s * 0.75);
    ctx.arc(x, yc, R, -0.2 * Math.PI, 1.2 * Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = C.lapiz; ctx.lineWidth = Math.max(0.6, lw * 0.7); ctx.stroke();
  };
  const rubor = (color = 'rgba(240,110,110,0.45)') => {
    ctx.fillStyle = color;
    for (const x of [-0.3 * bw, 0.3 * bw]) { ctx.beginPath(); ctx.ellipse(x, my - 0.045 * bh, 0.065 * bw, 0.025 * bh, 0, 0, 6.29); ctx.fill(); }
  };

  const espiral = (x, sentido) => {
    const a = rx * 1.05, b = ry * 1.05;
    ctx.fillStyle = C.blanco;
    ctx.beginPath(); ctx.ellipse(x, ey, a, b, 0, 0, 6.29); ctx.fill();
    L(); ctx.lineWidth = lw; ctx.stroke();
    ctx.lineWidth = lw * 1.1;
    ctx.beginPath();
    const vueltas = 2.6 * Math.PI;
    for (let i = 0; i <= 40; i++) {
      const t = (i / 40) * vueltas;
      const r = (t / vueltas) * 0.85;
      const ang = sentido * (t + giro);
      const xx = x + r * a * Math.cos(ang), yy = ey + r * b * Math.sin(ang);
      i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy);
    }
    ctx.stroke();
  };

  switch (expr) {
    case 'mareado':
      espiral(lx, 1); espiral(rxx, -1); boca('ondas');
      rubor('rgba(150,200,120,0.45)');   // un poco verde
      break;
    case 'bored':
      ojo(lx, 1, 0.2, 0.55, 0.45, 0.5); ojo(rxx, 1, 0.2, 0.55, 0.45, 0.5); boca('plana'); break;
    case 'gulp':
      ojo(lx, 1.05, 0.7, 0.75); ojo(rxx, 1.05, 0.7, 0.75);
      ceja(lx - 0.8 * rx, ey - 1.3 * ry, lx + 0.8 * rx, ey - 1.6 * ry);
      ceja(rxx - 0.8 * rx, ey - 1.6 * ry, rxx + 0.8 * rx, ey - 1.3 * ry);
      boca('ondas'); gota(x0 - 0.04 * bw, y0 + 0.18 * bh, 0.16 * B); break;
    case 'fast':
      ojo(lx, 1.25, px, py, 0.24); ojo(rxx, 1.25, px, py, 0.24);
      ceja(lx - 0.8 * rx, ey - 1.95 * ry, lx + 0.8 * rx, ey - 2.0 * ry);
      ceja(rxx - 0.8 * rx, ey - 2.0 * ry, rxx + 0.8 * rx, ey - 1.95 * ry);
      boca('O');
      if (susto) { gota(x0 - 0.06 * bw, y0 + 0.15 * bh, 0.16 * B); gota(x1 + 0.08 * bw, y0 + 0.05 * bh, 0.13 * B); }
      break;
    case 'effort':
      aprieta(lx, false); aprieta(rxx, true);
      ceja(lx - 0.9 * rx, ey - 1.35 * ry, lx + 0.9 * rx, ey - 0.85 * ry);
      ceja(rxx - 0.9 * rx, ey - 0.85 * ry, rxx + 0.9 * rx, ey - 1.35 * ry);
      boca('dientes'); rubor('rgba(229,83,61,0.5)');
      gota(x0 - 0.05 * bw, y0 + 0.12 * bh, 0.15 * B); gota(x1 + 0.08 * bw, y0 + 0.02 * bh, 0.12 * B); break;
    case 'ice':
      feliz(lx); feliz(rxx); boca('sonrisa'); rubor(); break;
    case 'edge':
      ojo(lx, 1, 0, 0.1, 0.28); ojo(rxx, 1, 0, 0.1, 0.28);
      ceja(lx - 0.8 * rx, ey - 1.45 * ry, lx + 0.8 * rx, ey - 1.75 * ry);
      ceja(rxx - 0.8 * rx, ey - 1.35 * ry, rxx + 0.8 * rx, ey - 1.35 * ry);
      boca('ondas'); gota(x1 + 0.06 * bw, y0 + 0.1 * bh, 0.15 * B); break;
    case 'win':
      feliz(lx); feliz(rxx); boca('grande'); rubor(); break;
    default: // idle
      ojo(lx, 1, px, py, 0.45, lid); ojo(rxx, 1, px, py, 0.45, lid); boca(habla ? 'habla' : 'plana');
  }
}
