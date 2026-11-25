// Final del Mundo I: «El avión de papel».
//
// Eme llega al borde de la última página del cuaderno, arranca la hoja por el trepado, la
// dobla en un avión de papel, vuela por encima de la mesa y aterriza en el libro de texto
// (el Mundo II), donde los números llevan decimales… y donde le espera EME, el primo grande.
// Usa el reproductor de la historia; se recuerda en localStorage para ofrecerla en el menú.

import { C, FUENTE, dibujarEme, lapiz, trazar, cuadradito } from './dibujo.js';
import { reproducir, suave, texto, bocadillo, boca, IMPRENTA } from './historia.js';

const CLAVE = 'fuga-eme-fin-cuaderno-visto';
const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;

export function finCuadernoVisto() {
  try { return localStorage.getItem(CLAVE) === '1'; } catch { return false; }
}
function marcarVisto() {
  try { localStorage.setItem(CLAVE, '1'); } catch { /* sin almacenamiento: da igual */ }
}

// ---------- decorado ----------
const MADERA = '#c8ad84';

/** La mesa: madera con vetas. */
export function mesa(ctx) {
  ctx.fillStyle = MADERA;
  ctx.fillRect(0, 0, 400, 300);
  ctx.strokeStyle = 'rgba(120,85,45,0.22)';
  ctx.lineWidth = 1.2;
  for (let y = 12; y < 300; y += 23) {
    ctx.beginPath();
    for (let x = 0; x <= 400; x += 20) ctx.lineTo(x, y + Math.sin(x / 37 + y) * 3);
    ctx.stroke();
  }
}

/** Papel cuadriculado dentro de un polígono (para la hoja y el avión). */
function cuadricula(ctx, poli, paso = 12) {
  ctx.save();
  trazar(ctx, poli, true);
  ctx.fillStyle = '#fffef9';
  ctx.fill();
  ctx.clip();
  ctx.strokeStyle = C.cuadri;
  ctx.lineWidth = 1;
  const xs = poli.map((p) => p[0]), ys = poli.map((p) => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  for (let x = x0; x < x1; x += paso) { ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.stroke(); }
  for (let y = y0; y < y1; y += paso) { ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke(); }
  ctx.restore();
}

/**
 * La última página: cuadriculada, con la repisa de la meta acabando en un acantilado y,
 * a la derecha, el trepado (agujeritos) y el borde. `rasgado`: hasta dónde (0-1) se ha roto.
 */
function hoja(ctx, { rasgado = 0 } = {}) {
  const xb = 300;                      // el trepado
  cuadricula(ctx, [[-10, 40], [xb + 10, 40], [xb + 10, 320], [-10, 320]]);
  // la repisa y el acantilado (como en el nivel 10)
  ctx.save();
  ctx.fillStyle = '#e9e1ce';
  trazar(ctx, [[150, 320], [150, 230], [205, 150], [285, 150], [285, 320]], true);
  ctx.fill();
  ctx.restore();
  lapiz(ctx, [[150, 230], [205, 150], [285, 150], [285, 320]], { ancho: 2.2, seed: 5 });
  // el trepado: agujeritos
  for (let y = 52; y < 310; y += 13) {
    ctx.beginPath(); ctx.arc(xb, y, 2.6, 0, 6.29);
    ctx.fillStyle = MADERA; ctx.fill();
    ctx.strokeStyle = 'rgba(110,104,98,0.55)'; ctx.lineWidth = 1; ctx.stroke();
  }
  // lo que se ha rasgado ya: una grieta que baja por el trepado
  if (rasgado > 0) {
    const yf = 40 + 280 * rasgado;
    const pts = [];
    for (let y = 40, i = 0; y <= yf; y += 6, i++) pts.push([xb + (i % 2 ? 2.5 : -2.5), y]);
    ctx.save();
    ctx.strokeStyle = MADERA;
    ctx.lineWidth = 4;
    trazar(ctx, pts);
    ctx.stroke();
    ctx.restore();
    lapiz(ctx, pts, { ancho: 1.2, color: '#6f675d', doble: false, amp: 0.2 });
  }
  lapiz(ctx, [[-10, 40], [xb + 10, 40], [xb + 10, 320]], { ancho: 1.6, doble: false });
}

/** El libro de texto abierto: dos páginas impresas, ordenadas, con fórmulas. */
export function libro(ctx, x, y, w, h, { detalle = false, tenue = false } = {}) {
  ctx.save();
  ctx.fillStyle = 'rgba(60,45,30,0.25)';
  ctx.fillRect(x + 5, y + 6, w, h);
  ctx.fillStyle = '#8b3a2e';             // tapas
  ctx.fillRect(x - 4, y - 3, w + 8, h + 6);
  ctx.fillStyle = '#fff';
  ctx.fillRect(x, y, w / 2 - 1, h);
  ctx.fillRect(x + w / 2 + 1, y, w / 2 - 1, h);
  ctx.restore();
  lapiz(ctx, [[x + w / 2, y], [x + w / 2, y + h]], { ancho: 1.2, doble: false, amp: 0.2 });
  if (!detalle) {
    // renglones de texto: de lejos se marcan; de cerca (`tenue`) apenas, para que no distraigan
    const paso = tenue ? 11 : 9, grosor = tenue ? 1.6 : 2.5;
    ctx.fillStyle = tenue ? '#efebe4' : '#d9d3c7';
    for (let k = 0; k < Math.floor(h / paso) - 1; k++) {
      ctx.fillRect(x + 6, y + 8 + k * paso, w / 2 - 14, grosor);
      ctx.fillRect(x + w / 2 + 6, y + 8 + k * paso, w / 2 - 14, grosor);
    }
    return;
  }
  // de cerca: cabecera, enunciado y un ejemplo resuelto con números con decimales
  const imp = (s, xx, yy, tam = 11, color = '#4a4540', alin = 'left', negrita = false) => {
    ctx.font = `${negrita ? 'bold ' : ''}${tam}px ${IMPRENTA}`;
    ctx.fillStyle = color; ctx.textAlign = alin; ctx.textBaseline = 'middle';
    ctx.fillText(s, xx, yy);
  };
  imp('Tema 7 · Energía mecánica', x + 12, y + 14, 9.5, '#8b3a2e');
  // el título se encoge si no cabe en la página (para que no se meta en el lomo)
  let tamTit = 12;
  ctx.font = `bold ${tamTit}px ${IMPRENTA}`;
  while (tamTit > 8 && ctx.measureText('4.2  Conservación de la energía').width > w / 2 - 24) {
    tamTit -= 0.5;
    ctx.font = `bold ${tamTit}px ${IMPRENTA}`;
  }
  imp('4.2  Conservación de la energía', x + 12, y + 32, tamTit, '#4a4540', 'left', true);
  ctx.fillStyle = '#e4e0d8';
  for (let k = 0; k < 4; k++) ctx.fillRect(x + 12, y + 46 + k * 9, (w / 2 - 26) * (k === 3 ? 0.5 : 1), 3);
  // fórmulas con subíndices de verdad: [texto, subíndice?]
  const formula = (trozos, cx, cy, tam) => {
    const ancho = (t, sub) => { ctx.font = `${sub ? tam * 0.62 : tam}px ${IMPRENTA}`; return ctx.measureText(t).width; };
    let xx = cx - trozos.reduce((a, [t, sub]) => a + ancho(t, sub), 0) / 2;
    ctx.fillStyle = '#2c2824'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    for (const [t, sub] of trozos) {
      ctx.font = `${sub ? tam * 0.62 : tam}px ${IMPRENTA}`;
      ctx.fillText(t, xx, cy + (sub ? tam * 0.28 : 0));
      xx += ctx.measureText(t).width;
    }
  };
  formula([['E'], ['m', 1], [' = E'], ['c', 1], [' + E'], ['p', 1]], x + w / 4, y + 98, 15);
  formula([['E'], ['p', 1], [' = m · g · h']], x + w / 4, y + 122, 13);
  // ejemplo resuelto
  const ex = x + w / 2 + 10, ey = y + 12;
  ctx.fillStyle = '#eef3f8';
  ctx.fillRect(ex, ey, w / 2 - 20, 118);
  ctx.strokeStyle = '#7d9cbf'; ctx.lineWidth = 1.2; ctx.strokeRect(ex, ey, w / 2 - 20, 118);
  imp('Ejemplo resuelto', ex + 8, ey + 12, 10.5, '#3d6a99', 'left', true);
  const datos = ['m = 2,5 kg', 'h = 1,8 m', 'g = 9,8 m/s²', 'μ = 0,3', 'v = 5,94 m/s'];
  datos.forEach((d, i) => imp(d, ex + 12, ey + 32 + i * 17, 11.5, '#2c2824'));
}

/** Avión de papel (de lado), con la cuadrícula del cuaderno. Morro hacia la derecha. */
function avion(ctx, x, y, s = 1, ang = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  ctx.scale(s, s);
  const ala = [[110, 0], [-110, -34], [-80, 0]];
  const quilla = [[110, 0], [-80, 0], [-104, 30]];
  cuadricula(ctx, quilla, 10);
  ctx.save(); trazar(ctx, quilla, true); ctx.fillStyle = 'rgba(80,70,60,0.12)'; ctx.fill(); ctx.restore();
  cuadricula(ctx, ala, 10);
  // en el ala aún se ve un trozo de pista del nivel 10, a lápiz
  ctx.save(); trazar(ctx, ala, true); ctx.clip();
  lapiz(ctx, [[-90, -14], [-60, -10], [-40, -24], [-20, -6], [10, -4]], { ancho: 1.6, doble: false, amp: 0.4 });
  ctx.restore();
  lapiz(ctx, ala, { ancho: 1.6, cerrado: true, doble: false, amp: 0.3 });
  lapiz(ctx, quilla, { ancho: 1.6, cerrado: true, doble: false, amp: 0.3 });
  ctx.restore();
}

/** Bombilla de idea. */
function bombilla(ctx, x, y, alfa) {
  if (alfa <= 0) return;
  ctx.save();
  ctx.globalAlpha = alfa;
  ctx.strokeStyle = C.lapiz;
  ctx.lineWidth = 1.6;
  for (let k = 0; k < 7; k++) {
    const a = -Math.PI + (k * Math.PI) / 6;
    ctx.beginPath(); ctx.moveTo(x + 17 * Math.cos(a), y + 17 * Math.sin(a)); ctx.lineTo(x + 24 * Math.cos(a), y + 24 * Math.sin(a)); ctx.stroke();
  }
  ctx.fillStyle = C.julito;
  ctx.beginPath(); ctx.arc(x, y, 11, 0, 6.29); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#9a948c';
  ctx.fillRect(x - 5, y + 10, 10, 7);
  ctx.strokeRect(x - 5, y + 10, 10, 7);
  ctx.restore();
}

/** EME, el primo grande: una sombra enorme con una M mayúscula y dos ojos que miran. */
function primo(ctx, x, y, L, mira = -1) {
  ctx.save();
  ctx.fillStyle = 'rgba(40,34,30,0.93)';
  ctx.beginPath(); ctx.roundRect(x - L / 2, y - L / 2, L, L, L * 0.18); ctx.fill();
  ctx.font = `bold ${L * 0.38}px ${IMPRENTA}`;
  ctx.fillStyle = C.naranja;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('M', x + L * 0.2, y + L * 0.24);
  for (const dx of [-0.2, 0.12]) {
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.ellipse(x + dx * L, y - L * 0.14, L * 0.075, L * 0.095, 0, 0, 6.29); ctx.fill();
    ctx.fillStyle = '#1f1b18';
    ctx.beginPath(); ctx.arc(x + dx * L + mira * L * 0.03, y - L * 0.11, L * 0.035, 0, 6.29); ctx.fill();
  }
  ctx.restore();
}

// ---------- escenas ----------
const ESCENAS = [
  {   // 1 · al borde
    textos: [{ s: 'La última página del cuaderno. Y más allá…', x: 18, y: 22, w: 300, tam: 16, estilo: 'mano', color: '#3b2c1c' }],
    dur: 5,
    dibujar(ctx, t) {
      mesa(ctx);
      libro(ctx, 322, 208, 120, 70);
      hoja(ctx);
      const mira = t > 1.2;
      dibujarEme(ctx, 262, 128, 44, mira
        ? { expr: 'gulp', px: 0.7, py: 0.8, seed: 2, bandera: true }
        : { expr: 'win', bandera: true, seed: 2 });
      bocadillo(ctx, 236, 76, 'Uf… Está demasiado lejos.', suave(1.6, 2, t), { derecha: true, a: boca(262, 128, 44) });
    },
  },
  {   // 2 · la idea
    textos: [{ s: 'Pero la hoja tenía un trepado… ¡para arrancarla!', x: 18, y: 22, w: 370, tam: 16, estilo: 'mano', color: '#3b2c1c' }],
    dur: 4.6,
    dibujar(ctx, t) {
      mesa(ctx);
      libro(ctx, 322, 208, 120, 70);
      hoja(ctx);
      const idea = t > 1.8;
      dibujarEme(ctx, 262, 128, 44, idea
        ? { expr: 'win', seed: 2, bandera: true, sy: 1 + 0.06 * Math.abs(Math.sin(t * 6)) * (reducido ? 0 : 1) }
        : { expr: 'idle', px: 0.95, py: 0.25, lid: 0.1, seed: 2, bandera: true });
      // los agujeritos parpadean mientras Eme los mira
      if (!idea && Math.floor(t * 3) % 2) {
        ctx.strokeStyle = 'rgba(242,163,58,0.9)'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(300, 50); ctx.lineTo(300, 310); ctx.stroke();
      }
      bombilla(ctx, 226, 82, suave(1.8, 2.1, t));
    },
  },
  {   // 3 · ¡rrriiip!
    textos: [{ s: 'Y la arrancó.', x: 18, y: 22, tam: 17, estilo: 'mano', color: '#3b2c1c' }],
    dur: 3.8,
    dibujar(ctx, t) {
      mesa(ctx);
      libro(ctx, 322, 208, 120, 70);
      const p = reducido ? 1 : suave(0.4, 2.2, t);
      const suelta = suave(2.3, 3.2, t);
      ctx.save();
      ctx.translate(-14 * suelta, -10 * suelta);
      ctx.rotate(-0.04 * suelta);
      hoja(ctx, { rasgado: p });
      dibujarEme(ctx, 262, 128, 44, { expr: p < 1 ? 'effort' : 'win', seed: 2, bandera: true });
      ctx.restore();
      if (p > 0 && p < 1 || (t > 0.4 && t < 2.6)) {
        const temblor = reducido ? 0 : Math.sin(t * 50) * 2;
        ctx.save();
        ctx.translate(318 + temblor, 120 + 120 * p);
        ctx.rotate(-0.25);
        ctx.font = `bold 26px ${FUENTE}`;
        ctx.textAlign = 'center';
        ctx.lineWidth = 5; ctx.strokeStyle = '#fff'; ctx.strokeText('¡RRRIIIP!', 0, 0);
        ctx.fillStyle = C.lapiz; ctx.fillText('¡RRRIIIP!', 0, 0);
        ctx.restore();
      }
    },
  },
  {   // 4 · el avión
    textos: [
      { s: 'La dobló una vez, y otra…', x: 18, y: 22, tam: 16, estilo: 'mano', color: '#3b2c1c' },
      { s: '¡Un avión de papel!', x: 200, y: 270, tam: 22, estilo: 'mano', color: '#3b2c1c', alin: 'center', desde: 3.2 },
    ],
    dur: 5.4,
    dibujar(ctx, t) {
      mesa(ctx);
      const fase = reducido ? 3 : Math.min(3, Math.floor(t / 1.05));
      const formas = [
        [[130, 50], [270, 50], [270, 240], [130, 240]],
        [[200, 50], [270, 120], [270, 240], [130, 240], [130, 120]],
        [[200, 50], [240, 140], [240, 240], [160, 240], [160, 140]],
      ];
      if (fase < 3) {
        cuadricula(ctx, formas[fase]);
        lapiz(ctx, formas[fase], { ancho: 1.6, cerrado: true, doble: false });
        // pliegues
        if (fase > 0) lapiz(ctx, [[200, 50], [200, 240]], { ancho: 1, color: '#9a948c', doble: false, amp: 0.2 });
        // "¡puf!" al doblar
        const u = (t % 1.05) / 1.05;
        if (fase > 0 && u < 0.3) {
          ctx.fillStyle = `rgba(255,255,255,${0.8 * (1 - u / 0.3)})`;
          for (const [px, py] of [[130, 120], [270, 120], [200, 40]]) { ctx.beginPath(); ctx.arc(px, py, 10 + u * 40, 0, 6.29); ctx.fill(); }
        }
      } else {
        const sube = reducido ? 0 : Math.sin(t * 3) * 4;
        avion(ctx, 200, 150 + sube, 1, -0.05);
        dibujarEme(ctx, 175, 112 + sube, 34, { expr: 'win', seed: 3, ang: -0.05 });
      }
    },
  },
  {   // 5 · el vuelo
    textos: [{ s: 'Lo que perdía de altura… lo ganaba en velocidad.', x: 18, y: 22, w: 360, tam: 16, estilo: 'mano', color: '#3b2c1c' }],
    dur: 5.4,
    dibujar(ctx, t) {
      mesa(ctx);
      // el cuaderno (sin su última hoja) a la izquierda, el libro abajo a la derecha
      ctx.save();
      ctx.fillStyle = 'rgba(60,45,30,0.25)'; ctx.fillRect(16, 66, 116, 190);
      ctx.restore();
      cuadricula(ctx, [[10, 60], [124, 60], [124, 250], [10, 250]], 9);
      lapiz(ctx, [[10, 60], [124, 60], [124, 250], [10, 250]], { ancho: 1.4, cerrado: true, doble: false });
      for (let y = 68; y < 250; y += 12) { ctx.beginPath(); ctx.arc(10, y, 3.5, 0, 6.29); ctx.strokeStyle = C.lapiz; ctx.lineWidth = 1.4; ctx.stroke(); }
      libro(ctx, 238, 200, 150, 80);
      // la trayectoria
      const u = reducido ? 1 : suave(0.3, 4.6, t);
      // planea: sube un poco al salir y baja suave hasta posarse en el libro
      const camino = (k) => [120 + 190 * k, 70 + 150 * k * k * (3 - 2 * k) - 25 * Math.sin(Math.PI * k)];
      ctx.save();
      ctx.setLineDash([4, 6]);
      ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let k = 0; k <= u; k += 0.02) { const [x, y] = camino(k); k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke();
      ctx.restore();
      const [x, y] = camino(u), [x2, y2] = camino(Math.min(1, u + 0.02));
      const ang = Math.atan2(y2 - y, x2 - x);
      avion(ctx, x, y, 0.32, ang);
      // Eme va sentado en el ala: gira con el avión
      const ox = -8, oy = -14;
      dibujarEme(ctx, x + ox * Math.cos(ang) - oy * Math.sin(ang), y + ox * Math.sin(ang) + oy * Math.cos(ang), 15,
        { expr: u < 0.95 ? 'fast' : 'win', px: 0.8, seed: 3, ang });
      // los julitos: la altura (azul) se va convirtiendo en velocidad (amarillo)
      const n = 6, ec = Math.round(u * n);
      for (let i = 0; i < n; i++) cuadradito(ctx, 150 + i * 18, 280, 13, i < n - ec ? C.ep : C.julito);
    },
  },
  {   // 6 · el libro de texto
    textos: [{ s: 'Aterrizaje en el libro de texto.', x: 18, y: 22, tam: 16, estilo: 'mano', color: '#3b2c1c' }],
    dur: 6.4,
    dibujar(ctx, t) {
      mesa(ctx);
      libro(ctx, 20, 40, 360, 250, { detalle: true });
      // el avión entra desde arriba a la izquierda y aterriza con un ¡plaf!
      const u = reducido ? 1 : suave(0.2, 1.3, t);
      const ax = -60 + 300 * u, ay = 60 + 190 * u;
      const plaf = t > 1.3 && t < 2.0;
      avion(ctx, ax, ay, 0.45 * (plaf ? 1.05 : 1), 0.25 * (1 - u));
      if (plaf) {
        ctx.font = `bold 22px ${FUENTE}`; ctx.textAlign = 'center'; ctx.lineWidth = 5; ctx.strokeStyle = '#fff';
        ctx.strokeText('¡PLAF!', 250, 200); ctx.fillStyle = C.lapiz; ctx.fillText('¡PLAF!', 250, 200);
      }
      if (t < 1.4) {
        dibujarEme(ctx, ax - 12, ay - 20, 22, { expr: 'fast', seed: 3 });
      } else {
        // Eme baja de un salto y mira a su alrededor
        const s = suave(1.4, 2.1, t);
        const ex = 228 - 120 * s, ey = 230 - 30 * Math.sin(Math.PI * s);
        const mira = t < 3 ? 0.9 : t < 3.8 ? -0.9 : 0.4;
        dibujarEme(ctx, ex, ey, 40, { expr: t > 4.2 ? 'gulp' : 'idle', px: mira, py: -0.2, seed: 4 });
        bocadillo(ctx, 96, 190, 'Uy… Aquí los números llevan decimales.', suave(4.2, 4.6, t), { a: boca(ex, ey, 40), largo: 8 });
      }
    },
  },
  {   // 7 · EME, el primo grande
    textos: [
      { s: 'Y en el libro de texto no estaba solo…', x: 18, y: 22, w: 360, tam: 16, estilo: 'mano', color: '#3b2c1c' },
      { s: 'Mundo II · El libro de texto', x: 200, y: 64, tam: 24, estilo: 'mano', color: C.lapiz, alin: 'center', marca: true, desde: 3.4 },
    ],
    dur: Infinity,
    dibujar(ctx, t) {
      mesa(ctx);
      libro(ctx, 20, 40, 360, 250, { detalle: true });
      avion(ctx, 240, 250, 0.45, 0);
      // se oscurece un poco: llega una sombra enorme desde la derecha
      const llega = reducido ? 1 : suave(0.6, 2.4, t);
      ctx.fillStyle = `rgba(20,16,12,${0.28 * llega})`;
      ctx.fillRect(0, 0, 400, 300);
      primo(ctx, 470 - 160 * llega, 200, 170, -1);
      dibujarEme(ctx, 108, 230, 40, { expr: llega > 0.5 ? 'fast' : 'idle', susto: llega > 0.5, px: 0.95, py: -0.3, seed: 4 });
      if (llega >= 1) bocadillo(ctx, 140, 192, '¿Q-quién eres tú?', suave(2.6, 3, t), { a: boca(108, 230, 40) });
      // el cartel del rótulo «Mundo II · El libro de texto» (el texto se escribe encima)
      const cartel = suave(3.2, 3.5, t);
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
    },
  },
];

/** Reproduce el final del cuaderno y, al terminar, llama a `alTerminar`. */
export function mostrarFinCuaderno({ alTerminar } = {}) {
  reproducir(ESCENAS, { alTerminar, alVer: marcarVisto, etiqueta: 'Final del cuaderno', vamos: '¡Al libro!' });
}
