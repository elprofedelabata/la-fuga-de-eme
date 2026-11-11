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
// Rapidez mínima en una escalera mecánica (cuadritos/s): la escalera lleva a Eme aunque vaya
// sin velocidad. No cambia las cuentas de energía, solo el movimiento.
const V_ESCALERA = 1.4;

/**
 * Julitos que cambia una pieza al recorrerla: positivo si los quita (rozamiento), negativo si
 * los da (escaleras mecánicas, con `gana`).
 */
export const cambioDe = (p) => (!p ? 0 : p.gana != null ? -p.gana : MATERIALES[p.material].pierde * tamDe(p));
/** Casillas que ocupa una pieza: 1, o 2 si es doble (horizontal o vertical). */
export const tamDe = (p) => (p?.doble ? 2 : 1);
/** Julitos que cambia la pieza en cada una de sus casillas (el rozamiento va por casilla). */
export const cambioPorCasilla = (p) => cambioDe(p) / tamDe(p);

/**
 * Huecos que ocupa la pieza si se ancla en la casilla `a`: [a], o [a, la de al lado] si es
 * doble ('h': la de la derecha; 'v': la de debajo). null si se saldría del tablero.
 */
export function huecosDe(p, a, nivel = NIVEL) {
  if (!p.doble) return [a];
  const cols = columnas(nivel);
  if (p.doble === 'h') return a % cols === 0 ? null : [a, a + 1];
  return a + cols > 3 * cols ? null : [a, a + cols];
}
/** ¿Tiene motor? (una escalera que da julitos; la averiada no) */
export const conMotor = (p) => (p?.gana ?? 0) > 0;

// ---------- geometría ----------
// El tablero tiene siempre 3 filas de casillas (9 cuadritos de alto) y 3 o más columnas.
// Cada casilla mide 3 x 3 cuadritos. Las casillas se numeran por filas, de arriba abajo y
// de izquierda a derecha.

/** Columnas de casillas del tablero del nivel. */
export const columnas = (nivel = NIVEL) => nivel.columnas ?? 3;
/** Ancho del tablero en cuadritos. */
export const anchoTablero = (nivel = NIVEL) => 3 * columnas(nivel);
/** x donde empieza la repisa de la meta (llana y sin rozamiento hasta el precipicio). */
export const inicioRepisa = (nivel = NIVEL) => anchoTablero(nivel) - 1.6;

/**
 * Puntos de la pista del nivel con las piezas colocadas (las piezas con perfil propio
 * cambian la forma de su casilla). Cada nivel elige su trazado.
 */
export function construirPista(nivel = NIVEL, colocadas = {}) {
  return (TRAZADOS[nivel.trazado ?? 'u'])(nivel, colocadas);
}

/** La «U» de los primeros niveles: bajada, suelo y rampa en S hasta la meta. */
function pistaU(nivel, colocadas) {
  const perfilB = colocadas[8]?.perfil ?? 'plano';
  const alturaMeta = nivel.meta.altura, alturaSalida = nivel.energia;
  const pts = [[0, alturaSalida], [1.2, alturaSalida]];
  // Bajada de salida: un "quarter pipe" de la altura de salida a 1 (casillas 1, 4 y 7)
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
  // Rampa en S hasta la repisa de la meta (casillas 9 y 6), que empieza en x = 7.4
  for (let i = 1; i <= 40; i++) {
    const u = i / 40;
    pts.push([6 + 1.4 * u, 1 + (alturaMeta - 1) * u * u * (3 - 2 * u)]);
  }
  // Repisa plana y sin rozamiento hasta el precipicio (borde derecho del tablero)
  for (let i = 1; i <= 8; i++) pts.push([7.4 + (1.6 * i) / 8, alturaMeta]);
  return pts;
}

/**
 * Valle y colina: bajada hasta el suelo del valle, un tramo llano (de una o más casillas,
 * según el ancho del tablero), una colina y una rampa suave hasta la repisa de la meta.
 *   fila de abajo (4 columnas): bajada | suelo | colina | rampa y meta
 *   fila de abajo (5 columnas): bajada | suelo | suelo | colina | rampa y meta
 */
function pistaColina(nivel) {
  const hs = nivel.energia, hm = nivel.meta.altura;
  const suelo = nivel.suelo ?? 0.5, cima = nivel.cima ?? 2;
  const fin = anchoTablero(nivel), repisa = inicioRepisa(nivel);
  const pts = [[0, hs], [1.2, hs]];
  // bajada: "quarter pipe" de la salida al suelo (de x = 1.2 a 3)
  for (let i = 1; i <= 48; i++) {
    const th = (i / 48) * Math.PI / 2;
    pts.push([1.2 + 1.8 * (1 - Math.cos(th)), suelo + (hs - suelo) * (1 - Math.sin(th))]);
  }
  // suelo llano (de 3 hasta la colina, que ocupa la penúltima columna)
  const x0 = fin - 6;
  const n = Math.round(((x0 - 3) / 3) * 12);
  for (let i = 1; i <= n; i++) pts.push([3 + ((x0 - 3) * i) / n, suelo]);
  // colina: sube y baja con suavidad, con la cima en el centro
  for (let i = 1; i <= 36; i++) {
    const x = x0 + (3 * i) / 36;
    pts.push([x, suelo + ((cima - suelo) * (1 - Math.cos((2 * Math.PI * (x - x0)) / 3))) / 2]);
  }
  // rampa suave en S hasta la repisa de la meta
  for (let i = 1; i <= 20; i++) {
    const u = i / 20;
    pts.push([x0 + 3 + (repisa - x0 - 3) * u, suelo + (hm - suelo) * u * u * (3 - 2 * u)]);
  }
  // repisa plana y sin rozamiento hasta el precipicio
  for (let i = 1; i <= 8; i++) pts.push([repisa + ((fin - repisa) * i) / 8, hm]);
  return pts;
}

/**
 * Escaleras (tablero de 4 columnas): Eme sale abajo, baja un poco hasta el pie de la primera
 * escalera mecánica (casilla 10), sube por ella y por la segunda (casilla 7) en diagonal, y una
 * subida en S lo lleva a la repisa de la meta, arriba a la derecha.
 */
function pistaEscaleras(nivel) {
  const hs = nivel.energia, hm = nivel.meta.altura;
  const fin = anchoTablero(nivel), repisa = inicioRepisa(nivel);
  const suave = (u) => u * u * (3 - 2 * u);
  const pie = hs - 0.5;           // pie de la primera escalera
  const pts = [[0, hs], [1.2, hs]];
  // bajadita hasta el pie de la escalera (empieza con caída, como las rampas): así Eme
  // arranca y llega a la escalera con algo de velocidad
  for (let i = 1; i <= 24; i++) {
    const th = (i / 24) * Math.PI / 2;
    pts.push([1.2 + 1.8 * (1 - Math.cos(th)), pie + (hs - pie) * (1 - Math.sin(th))]);
  }
  // primera escalera: recta, de (3, pie) a (6, 3)
  for (let i = 1; i <= 12; i++) pts.push([3 + (3 * i) / 12, pie + ((3 - pie) * i) / 12]);
  // segunda escalera: recta, de (6, 3) a (9, 6)
  for (let i = 1; i <= 12; i++) pts.push([6 + (3 * i) / 12, 3 + (3 * i) / 12]);
  // subida en S hasta la repisa de la meta
  for (let i = 1; i <= 20; i++) pts.push([9 + (repisa - 9) * (i / 20), 6 + (hm - 6) * suave(i / 20)]);
  // repisa plana y sin rozamiento hasta el precipicio
  for (let i = 1; i <= 8; i++) pts.push([repisa + ((fin - repisa) * i) / 8, hm]);
  return pts;
}

/**
 * Travesía (tablero de 5 columnas): bajada desde lo alto hasta un valle a media altura,
 * colina alta, otra bajada en S hasta el fondo, escalera mecánica y rampa en S hasta la meta.
 *   fila del medio: bajada (6) | colina (7) | inicio de la segunda bajada
 *   fila de abajo:                          | bajada (13) | escalera (14) | rampa
 */
function pistaTravesia(nivel) {
  const hs = nivel.energia, hm = nivel.meta.altura;
  const valle = nivel.valle ?? 3.5, cima = nivel.cima ?? 5.5, fondo = nivel.suelo ?? 0.5;
  const arriba = nivel.escalera ?? 2.9;    // altura a la que deja la escalera
  const fin = anchoTablero(nivel), repisa = inicioRepisa(nivel);
  const suave = (u) => u * u * (3 - 2 * u);
  const pts = [[0, hs], [1.2, hs]];
  // bajada: "quarter pipe" de la salida al valle (de x = 1.2 a 3)
  for (let i = 1; i <= 48; i++) {
    const th = (i / 48) * Math.PI / 2;
    pts.push([1.2 + 1.8 * (1 - Math.cos(th)), valle + (hs - valle) * (1 - Math.sin(th))]);
  }
  // colina (de 3 a 6)
  for (let i = 1; i <= 36; i++) {
    const x = 3 + (3 * i) / 36;
    pts.push([x, valle + ((cima - valle) * (1 - Math.cos((2 * Math.PI * (x - 3)) / 3))) / 2]);
  }
  // bajada en S del valle al fondo (de 6 a 9)
  for (let i = 1; i <= 24; i++) pts.push([6 + (3 * i) / 24, valle - (valle - fondo) * suave(i / 24)]);
  // escalera mecánica: recta, del fondo hasta `arriba` (de 9 a 12)
  for (let i = 1; i <= 12; i++) pts.push([9 + (3 * i) / 12, fondo + ((arriba - fondo) * i) / 12]);
  // subida en S hasta la repisa de la meta
  for (let i = 1; i <= 20; i++) pts.push([12 + (repisa - 12) * (i / 20), arriba + (hm - arriba) * suave(i / 20)]);
  // repisa plana y sin rozamiento hasta el precipicio
  for (let i = 1; i <= 8; i++) pts.push([repisa + ((fin - repisa) * i) / 8, hm]);
  return pts;
}

/**
 * Bajada larga y suelo largo (tablero de 4 columnas): de la salida baja hasta el fondo
 * atravesando dos filas, recorre dos casillas de suelo llano y sube en S hasta la meta.
 *   columna 1: bajada (casillas 5 y 9: hueco doble vertical)
 *   fila de abajo: suelo (casillas 10 y 11: hueco doble horizontal) | rampa y meta
 */
function pistaLarga(nivel) {
  const hs = nivel.energia, hm = nivel.meta.altura, suelo = nivel.suelo ?? 0.5;
  const fin = anchoTablero(nivel), repisa = inicioRepisa(nivel);
  const suave = (u) => u * u * (3 - 2 * u);
  const pts = [[0, hs], [1.2, hs]];
  // bajada: "quarter pipe" de la salida al suelo (de x = 1.2 a 3)
  for (let i = 1; i <= 48; i++) {
    const th = (i / 48) * Math.PI / 2;
    pts.push([1.2 + 1.8 * (1 - Math.cos(th)), suelo + (hs - suelo) * (1 - Math.sin(th))]);
  }
  // suelo llano (de 3 a 9)
  for (let i = 1; i <= 24; i++) pts.push([3 + (6 * i) / 24, suelo]);
  // rampa en S hasta la repisa de la meta
  for (let i = 1; i <= 20; i++) pts.push([9 + (repisa - 9) * (i / 20), suelo + (hm - suelo) * suave(i / 20)]);
  // repisa plana y sin rozamiento hasta el precipicio
  for (let i = 1; i <= 8; i++) pts.push([repisa + ((fin - repisa) * i) / 8, hm]);
  return pts;
}

const TRAZADOS = { u: pistaU, colina: pistaColina, escaleras: pistaEscaleras, travesia: pistaTravesia, larga: pistaLarga };

export function celdaDe(x, h, cols = 3) {
  const c = Math.min(Math.max(Math.floor(x / 3), 0), cols - 1);
  const r = Math.min(Math.max(Math.floor(h / 3), 0), 2);
  return (2 - r) * cols + c + 1;
}

/** Casilla de cada tramo de la pista (por su punto medio). */
export function celdasTramos(pts, cols = 3) {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    out.push(celdaDe((pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2, cols));
  }
  return out;
}

// ---------- recorrido para la simulación ----------
export function prepararRecorrido(nivel, colocadas) {
  const pts = construirPista(nivel, colocadas);
  const celdas = celdasTramos(pts, columnas(nivel));
  const s = [0];
  for (let i = 1; i < pts.length; i++) {
    s.push(s[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  }
  const pieza = (c) => (nivel.huecos[c] ? colocadas[c] ?? null : null);
  const material = (c) => pieza(c)?.material ?? 'fijo';
  const largo = {};
  for (let i = 0; i < celdas.length; i++) largo[celdas[i]] = (largo[celdas[i]] ?? 0) + (s[i + 1] - s[i]);
  // densidad de pérdida (julitos por cuadrito recorrido) de cada tramo; negativa si los da
  const dens = celdas.map((c) => cambioPorCasilla(pieza(c)) / largo[c]);
  const mats = celdas.map(material);
  const motor = celdas.map((c) => conMotor(pieza(c)));
  return { pts, s, dens, celdas, mats, motor, total: s[s.length - 1] };
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
  const piezas = [...new Set(Object.values(colocadas).filter(Boolean))];   // una doble ocupa dos huecos
  const perdidas = piezas.reduce((a, p) => a + Math.max(cambioDe(p), 0), 0);
  const ganancias = piezas.reduce((a, p) => a + Math.max(-cambioDe(p), 0), 0);
  const llegada = nivel.energia + ganancias - nivel.meta.altura - perdidas;   // Ec al llegar a la meta
  const atasco = buscarAtasco(nivel, colocadas);
  const tipo = atasco ? 'nollega' : llegada === 0 ? 'meta' : llegada > 0 ? 'pasaste' : 'nollega';
  return { tipo, perdidas, ganancias, llegada, piezas, atasco };
}

/**
 * ¿Se queda Eme sin energía en una colina antes de la meta? Recorre la pista sumando lo que
 * pierde cada tramo: si en algún punto la energía no le llega para la altura, y después
 * la pista vuelve a bajar (es una colina, no la subida final), se queda atascado ahí.
 * Devuelve { celda, cima, antes } (antes: julitos perdidos al llegar a la cima) o null.
 */
function buscarAtasco(nivel, colocadas) {
  const rec = prepararRecorrido(nivel, colocadas);
  const { pts, s, dens, celdas } = rec;
  const repisa = inicioRepisa(nivel);
  let perdido = 0, bajo = false;
  const perdidoEn = [0];
  for (let i = 0; i < pts.length - 1; i++) {
    perdido += dens[i] * (s[i + 1] - s[i]);
    perdidoEn.push(perdido);
    const [x, h] = pts[i + 1];
    if (x >= repisa - 1e-9) break;
    if (h < nivel.energia - 0.05) bajo = true;          // ya ha dejado la salida
    if (!bajo || nivel.energia - h - perdido >= -1e-9) continue;
    // sin energía para esta altura: ¿es una colina (luego baja) o la subida final?
    if (!pts.slice(i + 1).some(([, hh]) => hh < h - 0.3)) return null;
    const celda = celdas[i];
    let k = i + 1;
    for (let j = 0; j < pts.length - 1; j++) if (celdas[j] === celda && pts[j + 1][1] > pts[k][1]) k = j + 1;
    // pérdida hasta la cima de esa casilla
    let antes = 0;
    for (let j = 0; j < k; j++) antes += dens[j] * (s[j + 1] - s[j]);
    return { celda, cima: Math.round(pts[k][1] * 100) / 100, antes: Math.round(antes * 100) / 100 };
  }
  return null;
}

// ---------- simulación ----------
export function nuevaSimulacion(rec, nivel) {
  return {
    s: sDeX(rec, nivel.salidaX), dir: 1, perdido: 0, ganado: 0, t: 0, v: 0,
    perdidoCelda: {},     // julitos perdidos en cada casilla (para repartir las etiquetas −1)
    ganadoCelda: {},      // julitos ganados en cada casilla (etiquetas +1)
    estado: 'rodando',    // rodando | cayendo | meta | parado
    vueltas: 0, gracia: 1.0, caida: null,   // gracia: el empujoncito inicial
    E0: nivel.energia,
  };
}

export function energias(sim, rec) {
  const h = sim.caida ? sim.caida.h : muestra(rec, sim.s).h;
  const ep = Math.max(h, 0);
  return { ep, ec: Math.max(sim.E0 + sim.ganado - h - sim.perdido, 0), calor: sim.perdido, ganado: sim.ganado };
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
    const ec = sim.E0 + sim.ganado - m.h - sim.perdido;
    let v = Math.sqrt(2 * G * (Math.max(ec, 0) + 0.02));
    if (rec.motor[m.i]) v = Math.max(v, V_ESCALERA);   // la escalera lo lleva
    sim.v = v;
    const ns = sim.s + sim.dir * v * h;

    if (ns >= rec.total) {      // cruza la repisa y se sale por el precipicio
      sim.estado = 'cayendo';
      sim.caida = { x: m.x, h: m.h, vx: v, vh: 0, giro: 0, t0: sim.t };
      return;
    }
    const i = muestra(rec, (sim.s + Math.max(ns, 0)) / 2).i;
    // Una escalera mecánica solo sube: si Eme vuelve hacia atrás y llega a ella, se queda arriba
    if (sim.dir === -1 && rec.motor[i]) {
      sim.estado = 'parado';
      return;
    }
    const dl = rec.dens[i] * Math.abs(ns - sim.s);
    const mn = muestra(rec, ns);
    const ecn = sim.E0 + sim.ganado - mn.h - sim.perdido - dl;

    // Tolerancia de una centésima de julito: las cuentas del nivel son enteras, pero la
    // integración numérica deja restos minúsculos que no deben mover a Eme.
    if (ecn < 0.01 && sim.gracia <= 0 && !rec.motor[i]) {
      detener(sim, nivel, m);
      return;
    }
    sim.s = Math.max(ns, 0);
    const c = rec.celdas[i];
    if (dl > 0) {
      sim.perdido += dl;
      sim.perdidoCelda[c] = (sim.perdidoCelda[c] ?? 0) + dl;
    } else if (dl < 0) {
      sim.ganado -= dl;
      sim.ganadoCelda[c] = (sim.ganadoCelda[c] ?? 0) - dl;
    }
  }
}

function detener(sim, nivel, m) {
  // llega a la meta sin energía: se queda (en la subida final, no en una colina por el camino)
  if (sim.dir === 1 && m.h > nivel.meta.altura - 0.05 && m.x > inicioRepisa(nivel) - 0.5) {
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
