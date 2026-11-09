// Geometría del recorrido y simulación de Eme a lo largo de la pista.
//
// Eme se trata como un punto que desliza por una curva (1D, por longitud de arco).
// Su energía mecánica es E = Ep + Ec, con Ep = altura (en julitos). El rozamiento de
// cada material se reparte a lo largo del tramo de pista de su casilla, de modo que
// cada pieza pierde exactamente los julitos que indica, sea cual sea su forma.

import { MATERIALES } from './nivel.js';

// "Gravedad" visual en cuadritos/s². La rapidez sale de Ec = v² / (2·G).
export const G = 3;

// ---------- geometría ----------
export function construirPista(perfilB = 'plano') {
  const pts = [[0, 8], [1.2, 8]];
  // Rampa de salida: un "quarter pipe" de altura 8 a 1 que ocupa las casillas 1, 4 y 7
  for (let i = 1; i <= 48; i++) {
    const th = (i / 48) * Math.PI / 2;
    pts.push([1.2 + 1.8 * (1 - Math.cos(th)), 1 + 7 * (1 - Math.sin(th))]);
  }
  // Casilla 8: suelo plano u hondonada
  if (perfilB === 'hondonada') {
    for (let i = 1; i <= 36; i++) {
      const x = 3 + (3 * i) / 36;
      pts.push([x, 1 - 0.75 * Math.sin((Math.PI * (x - 3)) / 3)]);
    }
  } else {
    for (let i = 1; i <= 12; i++) pts.push([3 + (3 * i) / 12, 1]);
  }
  // Subida en S hasta la repisa (casillas 9 y 6)
  for (let i = 1; i <= 36; i++) {
    const u = i / 36;
    pts.push([6 + 1.4 * u, 1 + 3 * u * u * (3 - 2 * u)]);
  }
  // Repisa con el felpudo (sus bordes coinciden con puntos de la pista)
  for (const x of [7.5, 7.7, 7.9, 8.1, 8.3, 8.5, 8.75, 9.0]) pts.push([x, 4]);
  return pts;
}

export function celdaDe(x, h) {
  const c = Math.min(Math.max(Math.floor(x / 3), 0), 2);
  const r = Math.min(Math.max(Math.floor(h / 3), 0), 2);
  return (2 - r) * 3 + c + 1;
}

/** Casilla de cada tramo de la pista (por su punto medio). */
export function celdasTramos(pts) {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    out.push(celdaDe((pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2));
  }
  return out;
}

// ---------- recorrido para la simulación ----------
export function prepararRecorrido(nivel, colocadas) {
  const pts = construirPista(colocadas[8]?.perfil ?? 'plano');
  const celdas = celdasTramos(pts);
  const s = [0];
  for (let i = 1; i < pts.length; i++) {
    s.push(s[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  }
  const material = (c) => (nivel.huecos[c] ? colocadas[c]?.material ?? 'fijo' : 'fijo');
  const [f0, f1] = nivel.meta.felpudo;
  const enFelpudo = (i) => {
    const xm = (pts[i][0] + pts[i + 1][0]) / 2;
    return pts[i][1] > 3.99 && pts[i + 1][1] > 3.99 && xm > f0 && xm < f1;
  };
  const largo = {};
  let largoFelpudo = 0;
  for (let i = 0; i < celdas.length; i++) {
    const l = s[i + 1] - s[i];
    largo[celdas[i]] = (largo[celdas[i]] ?? 0) + l;
    if (enFelpudo(i)) largoFelpudo += l;
  }
  // densidad de pérdida (julitos por cuadrito recorrido) de cada tramo
  const dens = celdas.map((c, i) => {
    let d = MATERIALES[material(c)].pierde / largo[c];
    if (enFelpudo(i)) d += nivel.meta.pierdeFelpudo / largoFelpudo;
    return d;
  });
  const mats = celdas.map(material);
  return { pts, s, dens, celdas, mats, total: s[s.length - 1] };
}

function indice(rec, q) {
  let lo = 0, hi = rec.s.length - 2;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (rec.s[mid] <= q) lo = mid; else hi = mid - 1;
  }
  return lo;
}

/** Punto de la pista a una distancia q del inicio: posición, tangente y tramo. */
export function muestra(rec, q) {
  q = Math.min(Math.max(q, 0), rec.total);
  const i = indice(rec, q);
  const [x0, h0] = rec.pts[i];
  const [x1, h1] = rec.pts[i + 1];
  const l = rec.s[i + 1] - rec.s[i] || 1;
  const u = (q - rec.s[i]) / l;
  return { x: x0 + (x1 - x0) * u, h: h0 + (h1 - h0) * u, tx: (x1 - x0) / l, th: (h1 - h0) / l, i };
}

/** Distancia recorrida hasta el primer punto con esa x (para colocar a Eme en la salida). */
export function sDeX(rec, x) {
  for (let i = 0; i < rec.pts.length - 1; i++) {
    const [x0] = rec.pts[i];
    const [x1] = rec.pts[i + 1];
    if (x >= x0 && x <= x1) return rec.s[i] + ((x - x0) / (x1 - x0)) * (rec.s[i + 1] - rec.s[i]);
  }
  return 0;
}

// ---------- resultado esperado (cuentas con julitos enteros) ----------
export function analizar(nivel, colocadas) {
  const piezas = Object.values(colocadas).filter(Boolean);
  const perdidas = piezas.reduce((a, p) => a + MATERIALES[p.material].pierde, 0);
  const llegada = nivel.energia - nivel.meta.altura - perdidas;
  let tipo;
  if (llegada === nivel.meta.pierdeFelpudo) tipo = 'meta';
  else if (llegada > nivel.meta.pierdeFelpudo) tipo = 'pasaste';
  else if (llegada === 0) tipo = 'borde';
  else tipo = 'nollega';
  return { tipo, perdidas, llegada, piezas };
}

// ---------- simulación ----------
export function nuevaSimulacion(rec, nivel) {
  return {
    s: sDeX(rec, nivel.salidaX), dir: 1, perdido: 0, t: 0, v: 0,
    estado: 'rodando',    // rodando | tambaleo | cayendo | meta | parado
    vueltas: 0, gracia: 1.0, tTambaleo: 0, caida: null,   // gracia: el empujoncito inicial
    E0: nivel.energia,
  };
}

export function energias(sim, rec) {
  const h = sim.caida ? sim.caida.h : muestra(rec, sim.s).h;
  const ep = Math.max(h, 0);
  return { ep, ec: Math.max(sim.E0 - h - sim.perdido, 0), calor: sim.perdido };
}

export function avanzar(sim, rec, nivel, dt) {
  if (sim.t > 25) return;
  if (sim.estado === 'cayendo') {
    const c = sim.caida;
    sim.t += dt;
    c.x += c.vx * dt;
    c.vh -= G * dt;
    c.h += c.vh * dt;
    c.giro += dt * 4;
    return;
  }
  if (sim.estado === 'tambaleo') {
    sim.t += dt;
    sim.tTambaleo -= dt;
    if (sim.tTambaleo <= 0) {   // se queda sin energía en el borde y cae hacia atrás
      sim.estado = 'rodando';
      sim.dir = -1;
      sim.gracia = 0.8;
    }
    return;
  }
  if (sim.estado !== 'rodando') return;

  const pasos = Math.max(1, Math.ceil(dt * 480));
  const h = dt / pasos;
  for (let k = 0; k < pasos; k++) {
    sim.t += h;
    sim.gracia -= h;
    const m = muestra(rec, sim.s);
    const ec = sim.E0 - m.h - sim.perdido;
    const v = Math.sqrt(2 * G * (Math.max(ec, 0) + 0.02));
    sim.v = v;
    const ns = sim.s + sim.dir * v * h;

    if (ns >= rec.total) {      // se sale por el final de la repisa
      sim.estado = 'cayendo';
      sim.caida = { x: m.x, h: m.h, vx: v, vh: 0, giro: 0 };
      return;
    }
    const i = muestra(rec, (sim.s + Math.max(ns, 0)) / 2).i;
    const dl = rec.dens[i] * Math.abs(ns - sim.s);
    const mn = muestra(rec, ns);
    const ecn = sim.E0 - mn.h - sim.perdido - dl;

    // Tolerancia de una centésima de julito: las cuentas del nivel son enteras, pero la
    // integración numérica deja restos minúsculos que no deben mover a Eme.
    if (ecn < 0.01 && sim.gracia <= 0) {
      detener(sim, rec, nivel, m);
      return;
    }
    sim.s = Math.max(ns, 0);
    sim.perdido += Math.max(dl, 0);
  }
}

function detener(sim, rec, nivel, m) {
  const [f0] = nivel.meta.felpudo;
  if (sim.dir === 1 && m.x >= f0 - 0.02 && m.h > 3.99) {
    sim.estado = 'meta';
    return;
  }
  if (sim.dir === 1 && m.x > 6.9 && m.x < f0) {
    sim.estado = 'tambaleo';
    sim.tTambaleo = 1.1;
    return;
  }
  if (Math.abs(m.th) < 0.06) {   // en llano y sin energía: se para
    sim.estado = 'parado';
    return;
  }
  sim.dir = -sim.dir;           // en cuesta: se da la vuelta
  sim.vueltas++;
  if (sim.vueltas > 40) sim.estado = 'parado';
}
