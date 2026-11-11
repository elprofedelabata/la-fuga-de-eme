// Geometría del recorrido y simulación de Eme a lo largo de la pista.
//
// Eme se trata como un punto que desliza por una curva (1D, por longitud de arco).
// Su energía mecánica es E = Ep + Ec, con Ep = altura (en julitos). El rozamiento de
// cada material se reparte a lo largo del tramo de pista de su casilla, de modo que
// cada pieza pierde exactamente los julitos que indica, sea cual sea su forma.
//
// Meta: la repisa está a la altura objetivo. Si Eme llega a ella con 0 julitos de Ec,
// se para justo en el borde, junto a la bandera. Si le sobra energía, cruza la repisa
// (que no frena) y cae por el precipicio; si le falta, no llega y vuelve hacia atrás.

import { MATERIALES, NIVEL } from './nivel.js';

// "Gravedad" visual en cuadritos/s². La rapidez sale de Ec = v² / (2·G).
export const G = 3;

// ---------- geometría ----------
export function construirPista(perfilB = 'plano', alturaMeta = NIVEL.meta.altura, alturaSalida = NIVEL.energia) {
  const pts = [[0, alturaSalida], [1.2, alturaSalida]];
  // Rampa de salida: un "quarter pipe" de la altura de salida a 1 (casillas 1, 4 y 7)
  for (let i = 1; i <= 48; i++) {
    const th = (i / 48) * Math.PI / 2;
    pts.push([1.2 + 1.8 * (1 - Math.cos(th)), 1 + (alturaSalida - 1) * (1 - Math.sin(th))]);
  }
  // Casilla 8: suelo plano, hondonada o montañita (de 1 o 2 cuadritos de alto)
  const montana = { montana1: 1, montana2: 2 }[perfilB];
  if (perfilB === 'hondonada') {
    for (let i = 1; i <= 36; i++) {
      const x = 3 + (3 * i) / 36;
      pts.push([x, 1 - 0.75 * Math.sin((Math.PI * (x - 3)) / 3)]);
    }
  } else if (montana) {
    // sube y baja con suavidad (sin esquinas al empezar ni al acabar); la cima, en el centro
    for (let i = 1; i <= 36; i++) {
      const x = 3 + (3 * i) / 36;
      pts.push([x, 1 + (montana * (1 - Math.cos((2 * Math.PI * (x - 3)) / 3))) / 2]);
    }
  } else {
    for (let i = 1; i <= 12; i++) pts.push([3 + (3 * i) / 12, 1]);
  }
  // Subida en S hasta la repisa de la meta (casillas 9 y 6), que empieza en x = 7.4
  for (let i = 1; i <= 40; i++) {
    const u = i / 40;
    pts.push([6 + 1.4 * u, 1 + (alturaMeta - 1) * u * u * (3 - 2 * u)]);
  }
  // Repisa plana y sin rozamiento hasta el precipicio (borde derecho del tablero)
  for (let i = 1; i <= 8; i++) pts.push([7.4 + (1.6 * i) / 8, alturaMeta]);
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
  const pts = construirPista(colocadas[8]?.perfil ?? 'plano', nivel.meta.altura, nivel.energia);
  const celdas = celdasTramos(pts);
  const s = [0];
  for (let i = 1; i < pts.length; i++) {
    s.push(s[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  }
  const material = (c) => (nivel.huecos[c] ? colocadas[c]?.material ?? 'fijo' : 'fijo');
  const largo = {};
  for (let i = 0; i < celdas.length; i++) largo[celdas[i]] = (largo[celdas[i]] ?? 0) + (s[i + 1] - s[i]);
  // densidad de pérdida (julitos por cuadrito recorrido) de cada tramo
  const dens = celdas.map((c) => MATERIALES[material(c)].pierde / largo[c]);
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
  const llegada = nivel.energia - nivel.meta.altura - perdidas;   // Ec al llegar a la meta
  const tipo = llegada === 0 ? 'meta' : llegada > 0 ? 'pasaste' : 'nollega';
  return { tipo, perdidas, llegada, piezas };
}

// ---------- simulación ----------
export function nuevaSimulacion(rec, nivel) {
  return {
    s: sDeX(rec, nivel.salidaX), dir: 1, perdido: 0, t: 0, v: 0,
    perdidoCelda: {},     // julitos perdidos en cada casilla (para repartir las etiquetas −1)
    estado: 'rodando',    // rodando | cayendo | meta | parado
    vueltas: 0, gracia: 1.0, caida: null,   // gracia: el empujoncito inicial
    E0: nivel.energia,
  };
}

export function energias(sim, rec) {
  const h = sim.caida ? sim.caida.h : muestra(rec, sim.s).h;
  const ep = Math.max(h, 0);
  return { ep, ec: Math.max(sim.E0 - h - sim.perdido, 0), calor: sim.perdido };
}

export function avanzar(sim, rec, nivel, dt) {
  if (sim.t > 120) return;
  if (sim.estado === 'cayendo') {
    const c = sim.caida;
    sim.t += dt;
    c.x += c.vx * dt;
    c.vh -= G * dt;
    c.h += c.vh * dt;
    c.giro += dt * 4;
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

    if (ns >= rec.total) {      // cruza la repisa y se sale por el precipicio
      sim.estado = 'cayendo';
      sim.caida = { x: m.x, h: m.h, vx: v, vh: 0, giro: 0, t0: sim.t };
      return;
    }
    const i = muestra(rec, (sim.s + Math.max(ns, 0)) / 2).i;
    const dl = rec.dens[i] * Math.abs(ns - sim.s);
    const mn = muestra(rec, ns);
    const ecn = sim.E0 - mn.h - sim.perdido - dl;

    // Tolerancia de una centésima de julito: las cuentas del nivel son enteras, pero la
    // integración numérica deja restos minúsculos que no deben mover a Eme.
    if (ecn < 0.01 && sim.gracia <= 0) {
      detener(sim, nivel, m);
      return;
    }
    sim.s = Math.max(ns, 0);
    if (dl > 0) {
      sim.perdido += dl;
      const c = rec.celdas[i];
      sim.perdidoCelda[c] = (sim.perdidoCelda[c] ?? 0) + dl;
    }
  }
}

function detener(sim, nivel, m) {
  if (sim.dir === 1 && m.h > nivel.meta.altura - 0.05) {   // llega a la meta sin energía: se queda
    sim.estado = 'meta';
    return;
  }
  if (Math.abs(m.th) < 0.06) {   // en llano y sin energía: se para
    sim.estado = 'parado';
    return;
  }
  sim.dir = -sim.dir;           // en cuesta: se da la vuelta
  sim.vueltas++;
  if (sim.vueltas > 400) sim.estado = 'parado';
}

/**
 * Cuántas etiquetas «−1» deben haber salido en una pieza que quita n julitos por pasada
 * cuando Eme ya ha perdido L julitos en ella. Se reparten de forma regular: en una
 * pasada completa salen n, en las posiciones 1/(n+1), 2/(n+1)… del tramo. No es como
 * se pierde de verdad (el rozamiento es continuo), pero se lee mejor.
 */
export function etiquetasPerdida(L, n) {
  if (n <= 0 || L <= 0) return 0;
  const pasadas = Math.floor(L / n + 1e-9);
  const resto = L - pasadas * n;
  return pasadas * n + Math.min(n, Math.floor((resto * (n + 1)) / n + 1e-9));
}
