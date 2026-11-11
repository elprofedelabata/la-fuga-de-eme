// La fuga de Eme · boceto jugable del nivel 1.

import { NIVEL, NIVELES, MATERIALES, NIVELES_JUGABLES, usarNivel } from './nivel.js';
import {
  prepararRecorrido, nuevaSimulacion, avanzar, muestra, energias, analizar, sDeX, etiquetasPerdida,
  columnas, anchoTablero, inicioRepisa,
} from './pista.js';
import {
  C, FUENTE, dibujarTablero, dibujarResaltes, dibujarBandera, dibujarMiniatura, dibujarEme,
  vistaTablero, cuadradito, rectCelda,
} from './dibujo.js';
import { Fantasma } from './arrastre.js';
import { mostrarHistoria, historiaVista } from './historia.js';
import { mostrarInicio } from './inicio.js';
import { arrancar } from './transicion.js';
import { abrirOpciones } from './opciones.js';
import { iniciarTutorial } from './tutorial.js';
import { mostrarFoco, quitarFoco } from './foco.js';
import { mostrarBienvenida, mostrarPrimerPlano, bienvenidaVista } from './bienvenida.js';
import { sinCortes, prepararEscritura, mostrarLetras } from './escritura.js';
import { mostrarNiveles } from './niveles.js';
import { estrellasDe, guardarEstrellas } from './progreso.js';

const $ = (id) => document.getElementById(id);
const app = $('app');
const lienzo = $('lienzo');
const ctx = lienzo.getContext('2d');
// Capa solo para Eme, por encima del oscurecimiento de la guía
const lienzoEme = $('lienzo-eme');
const ctxEme = lienzoEme.getContext('2d');
const marcador = $('regla-eme');
const DURACION_FIESTA = 1.1;   // segundos de saltitos hasta la bandera
const CUADRITOS = 9;   // cuadritos de alto del tablero (el tablero aún está hecho para 9)

const estado = {
  modo: 'montaje',            // montaje | directo | resultado
  colocadas: {},
  seleccion: null,            // id de la pieza levantada
  huecoElegido: null,         // hueco tocado antes de elegir pieza
  avisos: {},                 // casilla -> segundos que parpadea en rojo
  intentos: 0,
  fallos: 0,
  mejor: 0,
  velocidad: 1,
  pausado: false,
  sim: null, rec: null, analisis: null,
  espera: 0, etiquetas: {}, metaVista: false,
  fiesta: null,               // celebración al llegar a la meta: { t, x0, x1 }
  fuera: new Set(),           // piezas que no están en la bandeja (en la mano, volando o colocadas)
  arrastre: null, iman: null, vuelos: 0, mirada: null,
  guia: null,                 // guía del primer movimiento: { pieza, celda }
  encima: false,              // Eme y su bocadillo, por encima del oscurecimiento
  cara: null,                 // cara de Eme mientras habla en el tablero: { expr, px, py }
  huecosEnFoco: false,        // Eme está hablando de los huecos: laten todos
};

const pieza = (id) => NIVEL.piezas.find((p) => p.id === id);
const W = () => lienzo.clientWidth;    // ancho del tablero en píxeles
const H = () => lienzo.clientHeight;   // alto (9 cuadritos; el ancho depende de las columnas)
let dpr = 1;
let cache = null;          // tablero estático pre-dibujado
let reloj = 0;
const particulas = [];

// ---------- tamaño y caché del tablero ----------
function ajustar() {
  dpr = Math.min(window.devicePixelRatio || 1, 3);
  const w = W();
  if (!w) return;
  lienzo.width = Math.round(w * dpr);
  lienzo.height = Math.round(H() * dpr);
  lienzoEme.width = lienzo.width;
  lienzoEme.height = lienzo.height;
  rehacerTablero();
}

function rehacerTablero() {
  const w = W();
  if (!w) return;
  cache = document.createElement('canvas');
  cache.width = Math.round(w * dpr);
  cache.height = Math.round(H() * dpr);
  const c = cache.getContext('2d');
  c.scale(dpr, dpr);
  dibujarTablero(c, w, NIVEL, estado.colocadas);
}

// ---------- bandeja ----------
const celdaDeForma = (forma) => Number(Object.keys(NIVEL.huecos).find((k) => NIVEL.huecos[k] === forma));
const tarjeta = (id) => document.querySelector(`.pieza[data-id="${id}"]`);
const botonHueco = (c) => document.querySelector(`.hueco[data-celda="${c}"]`);
const rectHueco = (c) => botonHueco(c).getBoundingClientRect();
const rectMini = (id) => tarjeta(id).querySelector('canvas').getBoundingClientRect();
const centro = (r) => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
const celdaDePieza = (id) => Number(Object.keys(estado.colocadas).find((c) => estado.colocadas[c]?.id === id));
// Vibración corta en móviles que la admiten (solo tras un gesto real, si no Chrome la bloquea)
const vibrar = (ms) => { if (navigator.userActivation?.hasBeenActive) navigator.vibrate?.(ms); };
let suprimirClick = false;

/** Baraja las piezas (nunca en el orden en que están definidas, que es el de los huecos). */
function barajar(lista) {
  if (lista.length < 2) return [...lista];
  let r;
  do {
    r = [...lista];
    for (let i = r.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [r[i], r[j]] = [r[j], r[i]];
    }
  } while (r.every((p, i) => p === lista[i]));
  return r;
}

function crearBandeja() {
  const cont = $('piezas');
  cont.innerHTML = '';
  for (const p of barajar(NIVEL.piezas)) {
    const b = document.createElement('button');
    b.className = 'pieza';
    b.dataset.id = p.id;
    const pierde = MATERIALES[p.material].pierde;
    b.setAttribute('aria-label', `${p.nombre.join(' ')}: pierde ${pierde} julitos`);
    const cv = document.createElement('canvas');
    const lado = 60;
    cv.width = cv.height = lado * dpr;
    const c = cv.getContext('2d');
    c.scale(dpr, dpr);
    dibujarMiniatura(c, lado, celdaDeForma(p.forma), p);
    b.append(cv);
    b.insertAdjacentHTML('beforeend',
      `<span class="n1">${p.nombre[0]}</span><span class="n2">${p.nombre[1]}</span>` +
      `<span class="pegatina${pierde ? '' : ' cero'}">−${pierde}</span>`);
    b.addEventListener('pointerdown', (e) => posibleArrastre(e, { pieza: p, desde: 'bandeja' }));
    b.addEventListener('click', () => { if (!suprimirClick) tocarPieza(p.id); });
    cont.append(b);
  }
}

function refrescar() {
  const formaFiltro = estado.huecoElegido ? NIVEL.huecos[estado.huecoElegido] : null;
  for (const b of document.querySelectorAll('.pieza')) {
    const p = pieza(b.dataset.id);
    b.classList.toggle('fuera', estado.fuera.has(p.id));
    b.classList.toggle('seleccionada', estado.seleccion === p.id);
    b.classList.toggle('no-encaja', !!formaFiltro && p.forma !== formaFiltro);
    b.classList.toggle('bloqueada', !!estado.guia && p.id !== estado.guia.pieza);
    b.classList.toggle('guiada', !!estado.guia && p.id === estado.guia.pieza);
  }
  $('btn-lanzar').disabled = !!estado.guia;
  $('btn-vaciar').disabled = !!estado.guia;
  for (const c of Object.keys(NIVEL.huecos)) botonHueco(c).classList.toggle('lleno', !!estado.colocadas[c]);
  const completo = Object.keys(NIVEL.huecos).every((c) => estado.colocadas[c]);
  $('btn-lanzar').classList.toggle('atenuado', !completo);

  rehacerTablero();
}

function ocultarBocadillo() { if (!estado.guia) $('bocadillo').classList.add('oculto'); }

// ---------- Eme habla en el tablero: el bocadillo se escribe letra a letra ----------
const LETRAS_POR_SEGUNDO = 38;
const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
let dicho = null;   // { texto, letras, alTocar }

/** Eme dice algo en su bocadillo. Con `alTocar`, sale «Haz clic para continuar» y tocarlo lo llama. */
function decir(texto, { alTocar = null } = {}) {
  const b = $('bocadillo');
  texto = sinCortes(texto);
  b.innerHTML = '<span class="boc-texto"></span>'
    + (alTocar ? '<span class="boc-seguir"><span class="con-raton">Haz clic para continuar</span><span class="con-dedo">Toca para continuar</span>&nbsp;▸</span>' : '');
  prepararEscritura(b.querySelector('.boc-texto'), texto);   // el texto entero, invisible: ni saltos ni cortes nuevos
  dicho = { texto, letras: reducido ? texto.length : 0, alTocar };
  b.classList.remove('oculto', 'escrito');
}

const escribiendo = () => !!dicho && dicho.letras < dicho.texto.length;

function avanzarEscritura(dt) {
  if (!dicho) return;
  const b = $('bocadillo'), el = b.querySelector('.boc-texto');
  if (!el) { dicho = null; return; }          // alguien ha cambiado el bocadillo
  if (b.classList.contains('escrito')) return;
  dicho.letras = Math.min(dicho.texto.length, dicho.letras + LETRAS_POR_SEGUNDO * dt);
  mostrarLetras(el, dicho.texto, Math.floor(dicho.letras));
  if (!escribiendo()) b.classList.add('escrito');
}

function tocarBocadillo() {
  if (escribiendo()) { dicho.letras = dicho.texto.length; return; }   // primero, completar
  if (dicho?.alTocar) { dicho.alTocar(); return; }
  ocultarBocadillo();
}

/** Durante la guía, lo que no toca tiembla y no responde. */
function temblar(el) {
  el.classList.remove('tiembla');
  void el.offsetWidth;
  el.classList.add('tiembla');
}
const bloqueadaPorGuia = (id) => estado.guia && id !== estado.guia.pieza;

const ocupado = () => estado.modo !== 'montaje' || estado.arrastre || estado.vuelos > 0;

function tocarPieza(id) {
  if (ocupado()) return;
  if (bloqueadaPorGuia(id)) { temblar(tarjeta(id)); return; }
  ocultarBocadillo();
  const p = pieza(id);
  if (estado.fuera.has(id)) {          // la silueta de una pieza colocada: devolverla
    const c = celdaDePieza(id);
    if (c) quitar(c);
    return;
  }
  if (estado.huecoElegido) {
    if (NIVEL.huecos[estado.huecoElegido] === p.forma) colocar(estado.huecoElegido, p);
    return;
  }
  estado.seleccion = estado.seleccion === id ? null : id;
  refrescar();
}

function tocarHueco(celda) {
  if (ocupado()) return;
  if (estado.guia && celda !== estado.guia.celda) { if (estado.guia.celda) estado.avisos[celda] = 0.6; return; }
  ocultarBocadillo();
  const forma = NIVEL.huecos[celda];
  if (estado.seleccion) {
    const p = pieza(estado.seleccion);
    if (p.forma === forma) {
      colocar(celda, p);
    } else {
      estado.avisos[celda] = 0.9;     // no encaja: ese hueco parpadea en rojo
    }
    return;
  }
  if (estado.colocadas[celda]) {
    quitar(celda);
    return;
  }
  estado.huecoElegido = estado.huecoElegido === celda ? null : celda;
  refrescar();
}

// ---------- vuelos animados entre bandeja y tablero ----------
const nuevoFantasma = (p, rect) => new Fantasma(p, celdaDeForma(p.forma), rectHueco(celdaDeForma(p.forma)).width, rect);

/** Lleva la pieza a un hueco (volando desde la bandeja o desde donde esté el fantasma). */
async function colocar(celda, p, f = null) {
  estado.vuelos++;
  estado.fuera.add(p.id);
  estado.seleccion = null;
  estado.huecoElegido = null;
  f ??= nuevoFantasma(p, rectMini(p.id));
  refrescar();
  f.decaerGiro = true;
  f.arco = true;
  f.ir(() => ({ ...centro(rectHueco(celda)), s: 1, r: 0, alto: 0 }), 18);
  await f.llegar();

  const previa = estado.colocadas[celda];
  if (previa && previa.id !== p.id) devolver(previa, nuevoFantasma(previa, rectHueco(celda)));
  estado.colocadas[celda] = p;
  if (estado.guia && p.id === estado.guia.pieza) primerMovimientoHecho(celda);
  // La pieza ya está en su sitio: se libera la interacción sin esperar al rebote, para que
  // una animación congelada (pestaña en segundo plano) nunca deje el tablero bloqueado.
  estado.vuelos--;
  refrescar();
  polvo(celda);
  vibrar(12);
  await f.rebote();
  f.quitar();
}

/** Devuelve la pieza a su sitio en la bandeja. */
async function devolver(p, f) {
  estado.vuelos++;
  const t = tarjeta(p.id);
  t.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
  f.decaerGiro = true;
  f.arco = true;
  f.ir(() => {
    const r = rectMini(p.id);
    return { ...centro(r), s: r.width / f.lado, r: 0, alto: 0 };
  }, 15);
  await f.llegar();
  estado.fuera.delete(p.id);
  refrescar();
  t.animate([{ transform: 'scale(1.08)' }, { transform: 'scale(1)' }], { duration: 220, easing: 'ease-out' });
  f.quitar(false);
  estado.vuelos--;
  refrescar();
}

function quitar(celda) {
  const p = estado.colocadas[celda];
  if (!p) return;
  const f = nuevoFantasma(p, rectHueco(celda));
  estado.colocadas[celda] = null;
  refrescar();
  devolver(p, f);
}

function vaciar() {
  if (ocupado() || estado.guia) return;
  estado.seleccion = null;
  estado.huecoElegido = null;
  Object.keys(estado.colocadas)
    .filter((c) => estado.colocadas[c])
    .forEach((c, i) => setTimeout(() => quitar(Number(c)), i * 110));
  refrescar();
}

// ---------- arrastrar ----------
function posibleArrastre(e, info) {
  if (ocupado() || e.button > 0) return;
  if (bloqueadaPorGuia(info.pieza.id)) { if (info.desde === 'bandeja') temblar(tarjeta(info.pieza.id)); return; }
  if (info.desde === 'bandeja' && estado.fuera.has(info.pieza.id)) return;
  const x0 = e.clientX, y0 = e.clientY, id = e.pointerId, tactil = e.pointerType === 'touch';
  const mover = (ev) => {
    if (ev.pointerId !== id) return;
    const dx = ev.clientX - x0, dy = ev.clientY - y0;
    // En la bandeja táctil, el gesto horizontal es para deslizarla: solo arrastra un tirón vertical
    const arranca = info.desde === 'bandeja' && tactil
      ? Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx)
      : Math.hypot(dx, dy) > 6;
    if (arranca) {
      limpiar();
      iniciarArrastre(ev, info, tactil);
    }
  };
  const limpiar = () => {
    removeEventListener('pointermove', mover);
    removeEventListener('pointerup', limpiar);
    removeEventListener('pointercancel', limpiar);
    if (!estado.arrastre) document.documentElement.classList.remove('arrastrando');
  };
  // Con ratón, la mano se cierra nada más pulsar, aunque la pieza aún no se haya movido
  if (!tactil) document.documentElement.classList.add('arrastrando');
  addEventListener('pointermove', mover);
  addEventListener('pointerup', limpiar);
  addEventListener('pointercancel', limpiar);
}

function iniciarArrastre(ev, info, tactil) {
  ocultarBocadillo();
  suprimirClick = true;
  const p = info.pieza;
  let f;
  if (info.desde === 'bandeja') {
    f = nuevoFantasma(p, rectMini(p.id));
    estado.fuera.add(p.id);
  } else {
    f = nuevoFantasma(p, rectHueco(info.desde));
    estado.colocadas[info.desde] = null;
  }
  f.decaerGiro = true;
  estado.seleccion = null;
  estado.huecoElegido = null;
  estado.arrastre = { pieza: p, f, tactil, id: ev.pointerId, vx: 0, lx: ev.clientX, lt: performance.now() };
  document.documentElement.classList.add('arrastrando');
  refrescar();
  vibrar(8);
  seguir(ev);
  addEventListener('pointermove', seguir);
  addEventListener('pointerup', soltar);
  addEventListener('pointercancel', soltar);
}

function seguir(ev) {
  const a = estado.arrastre;
  if (!a || ev.pointerId !== a.id) return;
  ev.preventDefault?.();
  const ahora = performance.now();
  const dt = Math.max(8, ahora - a.lt);
  a.vx = 0.6 * a.vx + 0.4 * (((ev.clientX - a.lx) / dt) * 1000);
  a.lx = ev.clientX;
  a.lt = ahora;

  // imán: si el dedo está cerca de un hueco compatible, la pieza se engancha a él
  let iman = null;
  for (const [cs, forma] of Object.entries(NIVEL.huecos)) {
    if (forma !== a.pieza.forma) continue;
    const r = rectHueco(cs);
    const m = r.width * 0.3;
    if (ev.clientX > r.left - m && ev.clientX < r.right + m && ev.clientY > r.top - m && ev.clientY < r.bottom + m) {
      iman = Number(cs);
    }
  }
  if (iman !== estado.iman && iman) vibrar(5);
  estado.iman = iman;
  a.f.enganchar(!!iman);
  if (iman) {
    a.f.ir({ ...centro(rectHueco(iman)), s: 1.04, r: 0, alto: 8 }, 24);
  } else {
    const s = 0.84;
    const encima = a.tactil ? (a.f.lado * s) / 2 + 14 : 0;   // en móvil, por encima del dedo
    a.f.ir({ x: ev.clientX, y: ev.clientY - encima, s, r: Math.max(-14, Math.min(14, a.vx * 0.012)), alto: 18 }, 28);
  }
  estado.mirada = { x: ev.clientX, y: ev.clientY };
}

function soltar(ev) {
  const a = estado.arrastre;
  if (!a || ev.pointerId !== a.id) return;
  removeEventListener('pointermove', seguir);
  removeEventListener('pointerup', soltar);
  removeEventListener('pointercancel', soltar);
  const iman = ev.type === 'pointerup' ? estado.iman : null;
  estado.arrastre = null;
  estado.iman = null;
  estado.mirada = null;
  document.documentElement.classList.remove('arrastrando');
  a.f.enganchar(false);
  refrescar();
  if (iman) colocar(iman, a.pieza, a.f);
  else devolver(a.pieza, a.f);
  setTimeout(() => { suprimirClick = false; }, 0);
}

function estadosHuecos() {
  const out = {};
  if (estado.guia && !estado.arrastre) {
    for (const c of Object.keys(NIVEL.huecos)) {
      out[c] = Number(c) === estado.guia.celda || estado.huecosEnFoco ? 'activo' : 'apagado';
    }
    return out;
  }
  const forma = estado.arrastre?.pieza.forma ?? (estado.seleccion ? pieza(estado.seleccion).forma : null);
  for (const [cs, f] of Object.entries(NIVEL.huecos)) {
    const c = Number(cs);
    if (estado.avisos[c] > 0) out[c] = 'aviso';
    else if (forma) out[c] = f !== forma ? 'apagado' : estado.iman === c ? 'iman' : 'activo';
    else if (estado.huecoElegido) out[c] = estado.huecoElegido === c ? 'activo' : null;
  }
  return out;
}

/** Nubecilla de polvo al encajar una pieza. */
function polvo(celda) {
  const [x, y, L] = rectCelda(W(), celda);
  for (let i = 0; i < 12; i++) {
    const lado = i % 4;
    const u = Math.random();
    const px = lado === 0 ? x + u * L : lado === 1 ? x + L : lado === 2 ? x + u * L : x;
    const py = lado === 0 ? y : lado === 1 ? y + u * L : lado === 2 ? y + L : y + u * L;
    const ang = Math.atan2(py - (y + L / 2), px - (x + L / 2));
    const v = 40 + Math.random() * 50;
    particula(px, py, '#E8DFCB', { vx: Math.cos(ang) * v, vy: Math.sin(ang) * v, vida: 0.55, lado: 7 + Math.random() * 7, forma: 'polvo' });
  }
}

// ---------- lanzamiento ----------
function lanzar() {
  if (ocupado() || estado.guia) return;
  ocultarBocadillo();
  const faltan = Object.keys(NIVEL.huecos).filter((c) => !estado.colocadas[c]);
  if (faltan.length) {
    for (const c of faltan) estado.avisos[c] = 1.4;   // los huecos vacíos parpadean en rojo
    return;
  }
  estado.seleccion = null;
  estado.huecoElegido = null;
  estado.intentos++;
  estado.rec = prepararRecorrido(NIVEL, estado.colocadas);
  estado.sim = nuevaSimulacion(estado.rec, NIVEL);
  estado.analisis = analizar(NIVEL, estado.colocadas);
  estado.espera = 0;
  estado.etiquetas = {};
  estado.metaVista = false;
  estado.fiesta = null;
  estado.pausado = false;
  $('btn-pausa').classList.remove('pausado');
  ponerModo('directo');
  refrescar();
}

function volverAMontar() {
  estado.sim = null;
  estado.rec = null;
  particulas.length = 0;
  $('hoja').hidden = true;
  ponerModo('montaje');
  actualizarEnergia({ ep: NIVEL.energia, ec: 0, calor: 0 });
  refrescar();
}

function ponerModo(m) {
  estado.modo = m;
  app.dataset.modo = m;
  const montaje = m === 'montaje';
  $('bandeja').hidden = !montaje;
  $('acciones-montaje').hidden = !montaje;
  $('directo').hidden = montaje;
  $('acciones-directo').hidden = montaje;
}

function ponerVelocidad(v) {
  estado.velocidad = v;
  $('btn-lento').setAttribute('aria-pressed', String(v === 0.5));
  $('btn-normal').setAttribute('aria-pressed', String(v === 1));
}

// ---------- energía en pantalla ----------
function enteros({ ep, ec, calor }) {
  const E = NIVEL.energia;
  const c = Math.min(Math.round(calor), E);
  const p = Math.min(Math.max(Math.round(ep), 0), E - c);
  return { ep: p, ec: Math.max(E - p - c, 0), calor: c };
}

// Iconos de la energía (trazo en currentColor): montaña = altura (Ep),
// velocímetro = rapidez (Ec), llama = calor.
const ICONOS = {
  Ep: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 20 L9.5 7 L13.5 13.5 L16.5 9.5 L22 20 Z"/><path d="M7.6 10.4 L9.5 12 L11.4 10.4" class="nieve"/></svg>',
  Ec: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.2 17.5 A9 9 0 1 1 20.8 17.5"/><path d="M5.6 10.2 L7.2 11.2 M12 5.5 V7.4 M18.4 10.2 L16.8 11.2"/><path d="M12 15.5 L16.6 9.4"/><circle cx="12" cy="15.5" r="1.6" class="nucleo"/></svg>',
  calor: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5 C12.5 6.5 18.5 9 18.5 14.5 A6.5 6.5 0 0 1 5.5 14.5 C5.5 11 8 9.5 8.5 7 C10 9 10.5 10 10.5 11.5 C12.5 9.5 12.5 6 12 2.5 Z"/><path d="M12 21 A2.6 2.6 0 0 1 9.4 18.4 C9.4 16.5 11.5 15.8 12 13.8 C12.8 15.8 14.6 16.6 14.6 18.4 A2.6 2.6 0 0 1 12 21 Z" class="nucleo"/></svg>',
};

// Cómo se escriben: E con subíndice para las energías; «Calor» con mayúscula.
const NOMBRES = { Ep: 'E<sub>p</sub>', Ec: 'E<sub>c</sub>', calor: 'Calor' };
const NOMBRES_LARGOS = { Ep: 'Energía potencial', Ec: 'Energía cinética', calor: 'Calor' };
const EC = 'E<sub>c</sub>';

function actualizarEnergia(e) {
  const n = enteros(e);
  const E = NIVEL.energia;
  const [sEp, sEc, sCal] = $('barra-e').children;
  for (const [el, val, nom] of [[sEp, n.ep, 'Ep'], [sEc, n.ec, 'Ec'], [sCal, n.calor, 'calor']]) {
    el.style.width = `${(100 * val) / E}%`;
    if (el.dataset.v === String(val)) continue;     // solo se rehace cuando cambia
    el.dataset.v = val;
    el.innerHTML = val >= 2 ? `${ICONOS[nom]}<span>${NOMBRES[nom]} · ${val}</span>`
      : val === 1 ? `${ICONOS[nom]}<span>1</span>` : '';
    el.title = `${NOMBRES_LARGOS[nom]}: ${val} ${val === 1 ? 'julito' : 'julitos'}`;
  }
}

// ---------- resultado ----------
const TEXTOS = {
  meta: { titulo: '¡Conseguido!', cita: '«Ni más, ni menos.»' },
  pasaste: { titulo: '¡Te pasaste!', cita: '«¡Frenoooo!»' },
  nollega: { titulo: '¡No llega!', cita: '«¿Eso era todo?»' },
};

function grupo(n, clase, etiqueta) {
  const g = document.createElement('div');
  g.className = `grupo ${clase}`;
  const fs = document.createElement('div');
  fs.className = 'fs';
  for (let i = 0; i < n; i++) fs.append(Object.assign(document.createElement('i'), { className: `ficha ${clase}` }));
  const icono = ICONOS[{ ep: 'Ep', ec: 'Ec', calor: 'calor' }[clase]];
  const txt = document.createElement('small');
  txt.innerHTML = `${icono}<span>${etiqueta} · ${n}</span>`;
  g.append(fs, txt);
  return g;
}

function mostrarResultado() {
  const { tipo, perdidas, llegada, piezas, atasco } = estado.analisis;
  const E = NIVEL.energia, hm = NIVEL.meta.altura;
  const t = TEXTOS[tipo];
  estado.modo = 'resultado';
  app.dataset.modo = 'resultado';
  $('hoja-titulo').textContent = t.titulo;
  $('cita').textContent = t.cita;

  let estrellas = 0;
  if (tipo === 'meta') {
    estrellas = estado.fallos === 0 ? 3 : estado.fallos === 1 ? 2 : 1;
    estado.mejor = Math.max(estado.mejor, estrellas);
    guardarEstrellas(NIVEL.numero, estrellas);
  } else {
    estado.fallos++;
  }
  pintarEstrellas($('hoja-estrellas'), estrellas);
  pintarEstrellas($('estrellas'), estado.mejor);

  const bal = $('balance');
  bal.innerHTML = '';
  const conPerdida = piezas.filter((p) => MATERIALES[p.material].pierde > 0);
  const piezasGrupos = () => conPerdida.forEach((p) => bal.append(grupo(MATERIALES[p.material].pierde, 'calor', MATERIALES[p.material].nombre)));
  const perdidasPiezas = conPerdida.map((p) => MATERIALES[p.material].pierde);
  let msg, ecu;
  if (tipo === 'meta') {
    msg = `Llega a la meta con 0 julitos de ${EC} y se queda justo en la bandera. ${estado.fallos === 0 ? '¡A la primera!' : ''}`;
    bal.append(grupo(hm, 'ep', 'altura meta'));
    piezasGrupos();
    ecu = `${E} = ${[hm, ...perdidasPiezas].join(' + ')}`;
  } else if (tipo === 'pasaste') {
    msg = `Llegó a la meta con ${llegada} ${llegada === 1 ? 'julito' : 'julitos'} de ${EC}: le sobraba energía, ` +
      'cruzó la repisa y cayó por el precipicio.';
    bal.append(grupo(hm, 'ep', 'altura meta'));
    piezasGrupos();
    bal.append(grupo(llegada, 'ec', 'sobran'));
    ecu = `${E} = ${[hm, ...perdidasPiezas, llegada].join(' + ')}`;
  } else if (atasco) {
    // se quedó en una colina: perdió demasiado antes de llegar a la cima
    const julitos = (x) => `${String(x).replace('.', ',')} ${x === 1 ? 'julito' : 'julitos'}`;
    msg = `No pudo subir la colina. Su cima está a altura ${atasco.cima}: para pasarla tenía que llegar arriba ` +
      `habiendo perdido menos de ${julitos(E - atasco.cima)}, y perdió ${julitos(atasco.antes)}.` +
      (llegada === 0 ? ' Las cuentas cuadraban… ¡pero el orden de las piezas importa!' : '');
    bal.append(grupo(Math.round(atasco.cima), 'ep', 'cima'));
    bal.append(grupo(E - Math.round(atasco.cima), 'ec', 'margen'));
    ecu = `${E} = ${atasco.cima} (cima) + ${E - atasco.cima} (lo que podía perder antes)`;
  } else {
    msg = `Por el camino perdió ${perdidas} julitos: solo le quedaban ${E - perdidas} para subir, y la meta está a altura ${hm}.`;
    bal.append(grupo(E - perdidas, 'ep', 'altura máx.'));
    piezasGrupos();
    ecu = `${E} = ${[E - perdidas, ...perdidasPiezas].join(' + ')}`;
  }
  $('hoja-msg').innerHTML = msg;
  $('ecuacion').textContent = ecu;
  const pista = $('pista-ayuda');
  pista.hidden = !(tipo !== 'meta' && estado.fallos >= 2);
  pista.textContent = `Pista: ${E} = ${hm} (altura de la meta) + ¿? (lo que tienen que perder las piezas)`;
  const sig = siguienteNivel();
  const puedeSeguir = !!sig && (tipo === 'meta' || estrellasDe(NIVEL.numero) > 0);
  $('btn-siguiente').disabled = !puedeSeguir;
  $('btn-siguiente').title = puedeSeguir ? `Ir al nivel ${sig}` : sig ? 'Supera este nivel para seguir' : 'Próximamente';
  $('hoja').hidden = false;
  $('btn-reintentar').focus({ preventScroll: true });
}

function pintarEstrellas(cont, n) {
  [...cont.children].forEach((s, i) => s.classList.toggle('llena', i < n));
  cont.setAttribute?.('aria-label', `${n} de 3 estrellas`);
}

// Vueltas (cambios de sentido) tras las que, si no se ha parado, se da por mareado:
// dos ciclos completos de ida y vuelta.
const VUELTAS_MAREO = 4;
const mareado = (s) => s.estado === 'rodando' && s.vueltas >= VUELTAS_MAREO;

function comprobarResultado(dt) {
  if (estado.modo !== 'directo') return;
  const s = estado.sim;
  const tipo = estado.analisis.tipo;
  let listo = s.t > 90 || s.estado === 'parado';
  if (tipo === 'meta') listo ||= s.estado === 'meta';
  if (tipo === 'pasaste') listo ||= s.estado === 'cayendo';
  if (tipo === 'nollega') listo ||= mareado(s);   // se para solo, o se marea tras dos ciclos
  if (!listo) return;
  estado.espera += dt;
  const retardo = tipo === 'meta' ? DURACION_FIESTA + 0.6
    : tipo === 'pasaste' ? 1.7
      : mareado(s) ? 1.4 : 0.9;
  if (estado.espera > retardo) mostrarResultado();
}

// ---------- partículas ----------
function particula(x, y, color, { vx = 0, vy = -30, vida = 1.2, lado = 8, forma = 'cuadro' } = {}) {
  particulas.push({ x, y, vx, vy, vida, t: 0, color, lado, forma, ang: Math.random() * 1.2 - 0.6, va: (Math.random() - 0.5) * 6 });
}

function moverParticulas(dt) {
  for (let i = particulas.length - 1; i >= 0; i--) {
    const p = particulas[i];
    p.t += dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.forma === 'cambio') {         // la etiqueta ±1 sube despacio y frena
      const f = Math.exp(-1.6 * dt);
      p.vx *= f;
      p.vy *= f;
    } else if (p.forma === 'polvo') {   // el polvo frena enseguida y se hincha
      const f = Math.exp(-5 * dt);
      p.vx *= f;
      p.vy *= f;
      p.lado *= 1 + 0.9 * dt;
    } else {
      p.vy += (p.color === C.julito ? 90 : -10) * dt;
    }
    p.ang += p.va * dt;
    if (p.t > p.vida) particulas.splice(i, 1);
  }
}

// ---------- pintado ----------
function poseEme(w) {
  const v = vistaTablero(w);
  const B = v.k * 1.02;
  const o = { seed: 3 + (Math.floor(reloj * 8) % 3), expr: 'idle' };
  let x, h, tx = 1, th = 0, salto = 0;

  if (!estado.sim) {
    const rec = estado.recMontaje;
    const m = muestra(rec, sDeX(rec, NIVEL.salidaX));
    ({ x, h, tx, th } = m);
    const completo = Object.keys(NIVEL.huecos).every((c) => estado.colocadas[c]);
    if (estado.mirada) {
      // Eme sigue con la mirada la pieza que arrastras
      const r = lienzo.getBoundingClientRect();
      const [ex, ey] = v.px(x, h + 0.6);
      const dx = estado.mirada.x - r.left - ex, dy = estado.mirada.y - r.top - ey;
      const d = Math.hypot(dx, dy) || 1;
      o.px = (dx / d) * 0.95;
      o.py = (dy / d) * 0.95;
      o.lid = 0;
    } else if (completo) o.expr = 'gulp';
    else if (estado.seleccion) {
      o.px = 0.2;
      o.py = 0.95;      // mira hacia la bandeja
    } else {
      const ciclo = reloj % 4.2;
      o.lid = ciclo > 3.9 && ciclo < 4.05 ? 1 : 0.12;
      o.px = Math.sin(reloj * 0.7) > 0.85 ? 0.8 : 0.3;
      o.py = 0.3;
    }
    o.sy = 1 + 0.025 * Math.sin(reloj * 3.1);
    o.sx = 2 - o.sy;
    // Mientras habla: la cara de lo que dice, y mueve la boca al escribirse el bocadillo
    if (estado.cara && !estado.mirada) {
      Object.assign(o, estado.cara);
      if (o.expr === 'idle') {
        const ciclo = reloj % 4.2;
        o.lid = ciclo > 3.9 && ciclo < 4.05 ? 1 : 0.12;
        if (escribiendo()) { o.habla = 0.35 + 0.65 * Math.abs(Math.sin(reloj * 15)); o.lid = 0.12; }
      }
    }
  } else {
    const s = estado.sim;
    if (s.estado === 'cayendo') {
      ({ x, h } = s.caida);
      o.expr = 'fast';
      o.susto = true;
      o.extraAng = s.caida.giro;
    } else {
      const m = muestra(estado.rec, s.s);
      ({ x, h, tx, th } = m);
      const dens = estado.rec.dens[m.i];
      const { ec } = energias(s, estado.rec);
      const mat = estado.rec.mats[m.i];
      if (s.estado === 'meta') {
        // Celebración: se ha parado en el borde con 0 de Ec; ahora avanza a saltitos hasta la
        // bandera (la repisa es plana: la Ep no cambia) y se la pone de sombrero.
        tx = 1; th = 0;
        const f = estado.fiesta;
        const p = f ? Math.min(1, f.t / DURACION_FIESTA) : 0;
        const u = p * p * (3 - 2 * p);
        if (f) x = f.x0 + (f.x1 - f.x0) * u;
        const brinco = Math.abs(Math.sin(2 * Math.PI * p));   // dos saltitos
        salto = 0.45 * brinco;
        if (p < 1) { o.expr = 'ice'; o.sy = 1 + 0.07 * brinco; o.sx = 2 - o.sy; }
        else { o.expr = 'win'; o.bandera = true; o.sy = 1.04; o.sx = 0.96; }
      }
      else if (s.estado === 'parado') o.expr = 'bored';
      else if (mareado(s)) { o.expr = 'mareado'; o.giro = reloj * 7; }
      else if (dens > 0) o.expr = 'effort';
      else if (ec > 3) { o.expr = 'fast'; o.px = s.dir * 0.6; }
      else if (mat === 'hielo') o.expr = 'ice';
      else { o.expr = 'idle'; o.px = s.dir * 0.7; o.lid = 0.15; }
    }
  }
  // colocar a Eme apoyado sobre la pista
  const [px, py] = v.px(x, h + salto);
  const tl = Math.hypot(tx, th) || 1;
  const ux = tx / tl, uy = -th / tl;        // tangente en píxeles (y hacia abajo)
  const nx = uy, ny = -ux;                  // normal hacia fuera del terreno
  const ang = Math.atan2(uy, ux) + (o.extraAng ?? 0);
  return { cx: px + nx * B / 2 * (o.sy ?? 1), cy: py + ny * B / 2 * (o.sy ?? 1), B, ang, o, h };
}

/** Coloca el bocadillo de modo que su pico salga de la boca de Eme. */
function bocadilloEnLaBoca(pose) {
  const b = $('bocadillo');
  const x = pose.cx + pose.B / 2 + 17;     // a la derecha de Eme, lo que mide el pico y un poco más
  const y = pose.cy + 0.18 * pose.B;       // a la altura de la boca
  // (solo si se ha movido de verdad: la respiración de Eme no debe hacerlo temblar)
  if (Math.abs(x - (b._x ?? -99)) < 2 && Math.abs(y - (b._y ?? -99)) < 2) return;
  b._x = x; b._y = y;
  b.style.setProperty('--bx', `${x.toFixed(1)}px`);
  b.style.setProperty('--by', `${y.toFixed(1)}px`);
}

function pintar() {
  const w = W();
  if (!w || !cache) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, H());
  ctx.drawImage(cache, 0, 0, w, H());
  if (estado.modo === 'montaje') dibujarResaltes(ctx, w, estadosHuecos(), reloj);

  const pose = poseEme(w);
  if (!estado.sim) bocadilloEnLaBoca(pose);
  marcador.style.setProperty('--h', Math.max(-0.4, Math.min(CUADRITOS + 0.4, pose.h)).toFixed(3));
  if (!pose.o.bandera) dibujarBandera(ctx, w, NIVEL);

  // líneas de velocidad
  const s = estado.sim;
  if (s && s.estado === 'rodando' && s.v > 4) {
    ctx.save();
    ctx.translate(pose.cx, pose.cy);
    ctx.rotate(pose.ang);
    ctx.strokeStyle = 'rgba(110,104,98,0.7)';
    ctx.lineWidth = 1.6;
    ctx.lineCap = 'round';
    const d = -s.dir;
    for (const k of [-0.25, 0.05, 0.3]) {
      ctx.beginPath();
      ctx.moveTo(d * pose.B * 0.7, k * pose.B);
      ctx.lineTo(d * pose.B * (0.7 + 0.25 * s.v / 3), k * pose.B);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Durante la guía, Eme se pinta en su capa, que queda por encima del oscurecimiento
  if (estado.encima || lienzoEme.dataset.sucio) {
    ctxEme.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctxEme.clearRect(0, 0, w, H());
    lienzoEme.dataset.sucio = estado.encima ? '1' : '';
  }
  dibujarEme(estado.encima ? ctxEme : ctx, pose.cx, pose.cy, pose.B, { ...pose.o, ang: pose.ang });

  for (const p of particulas) {
    ctx.globalAlpha = Math.max(0, 1 - p.t / p.vida);
    if (p.forma === 'cambio') {
      dibujarCambio(p);
      continue;
    }
    if (p.forma === 'polvo') {
      ctx.fillStyle = p.color;
      ctx.strokeStyle = 'rgba(110,104,98,0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.lado / 2, 0, 6.29);
      ctx.fill();
      ctx.stroke();
    } else {
      cuadradito(ctx, p.x, p.y, p.lado, p.color, p.ang);
    }
  }
  ctx.globalAlpha = 1;

  if (s && s.estado === 'cayendo') gritar(w, s, pose);
  return pose;
}

/** Etiqueta flotante «−1 ■» / «+1 ■» junto a Eme. */
function cambioJulitos(n, pose, dir = 1) {
  particulas.push({
    forma: 'cambio', n,
    x: pose.cx + dir * pose.B * 0.15, y: pose.cy - pose.B * 0.95,
    vx: -dir * 6, vy: -26, t: 0, vida: 1.5, lado: pose.B * 0.38, color: n < 0 ? C.calor : C.julito, ang: 0, va: 0,
  });
}

function dibujarCambio(p) {
  // aparece con un «pop», se mantiene y se desvanece suavemente
  const entrada = Math.min(1, p.t / 0.18);
  const pop = 0.6 + 0.4 * (1 - (1 - entrada) ** 3) + 0.12 * Math.sin(Math.min(1, p.t / 0.3) * Math.PI);
  const salida = p.t < 0.55 ? 1 : Math.max(0, 1 - (p.t - 0.55) / (p.vida - 0.55));
  ctx.save();
  ctx.globalAlpha = Math.min(entrada * 1.5, 1) * salida * salida * (3 - 2 * salida);
  ctx.translate(p.x, p.y);
  ctx.scale(pop, pop);
  const tam = p.lado * 1.25;
  const texto = (p.n < 0 ? '−' : '+') + Math.abs(p.n);
  ctx.font = `${tam}px ${FUENTE}`;
  ctx.textBaseline = 'middle';
  const ancho = ctx.measureText(texto).width;
  const total = ancho + 4 + p.lado;
  const x0 = -total / 2;
  ctx.lineJoin = 'round';
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(255,254,249,0.95)';
  ctx.strokeText(texto, x0, 0);
  ctx.fillStyle = p.n < 0 ? C.calor : '#3C8D3C';
  ctx.fillText(texto, x0, 0);
  cuadradito(ctx, x0 + ancho + 4 + p.lado / 2, 0, p.lado, p.color, 0);
  ctx.restore();
}

/** «¡Aaaaah!» que se alarga mientras cae, tiembla, se aleja y se desvanece. */
function gritar(w, s, pose) {
  const t = s.t - s.caida.t0;
  const alfa = Math.max(0, Math.min(1, 1.6 - t));
  if (alfa <= 0) return;
  const texto = '¡A' + 'a'.repeat(Math.min(9, 1 + Math.floor(t * 9))) + 'h!';
  const tam = w * 0.07 * (1 - 0.3 * Math.min(t, 1.4) / 1.4);
  ctx.save();
  ctx.globalAlpha = alfa;
  ctx.font = `${tam}px ${FUENTE}`;
  ctx.fillStyle = C.lapiz;
  ctx.textBaseline = 'middle';
  const ancho = ctx.measureText(texto).width;
  // sigue a Eme, pero sin salirse del tablero
  const x1 = Math.min(Math.max(pose.cx + pose.B * 0.2, ancho + 8), w - 8);
  const y = Math.min(Math.max(pose.cy - pose.B * 1.1, tam), w - tam);
  let x = x1 - ancho;
  [...texto].forEach((letra, i) => {
    const temblor = Math.sin(reloj * 40 + i * 1.7) * tam * 0.08;
    ctx.fillText(letra, x, y + temblor + i * tam * 0.035);
    x += ctx.measureText(letra).width;
  });
  ctx.restore();
}

// ---------- bucle ----------
let ultimo = performance.now();
function fotograma(ahora) {
  const dt = Math.min(0.05, (ahora - ultimo) / 1000);
  ultimo = ahora;
  reloj += dt;
  avanzarEscritura(dt);
  for (const c in estado.avisos) estado.avisos[c] = Math.max(0, estado.avisos[c] - dt);

  const s = estado.sim;
  const paso = estado.pausado ? 0 : dt * estado.velocidad;
  if (s && paso > 0) {
    avanzar(s, estado.rec, NIVEL, paso);
    if (s.estado === 'meta') {
      estado.fiesta ??= { t: 0, x0: muestra(estado.rec, s.s).x, x1: NIVEL.meta.bandera - 0.25 };
      estado.fiesta.t += paso;
    }
    comprobarResultado(paso);
  }
  moverParticulas(paso || (estado.sim ? 0 : dt));

  const pose = pintar();

  if (s) {
    const e = energias(s, estado.rec);
    actualizarEnergia(e);
    // cada julito perdido aparece como «−1 ■» junto a Eme, repartidos a lo largo de la pieza
    for (const [c, L] of Object.entries(s.perdidoCelda)) {
      const n = MATERIALES[estado.colocadas[c]?.material ?? 'fijo'].pierde;
      const deben = etiquetasPerdida(L, n);
      while (pose && (estado.etiquetas[c] ?? 0) < deben) {
        estado.etiquetas[c] = (estado.etiquetas[c] ?? 0) + 1;
        cambioJulitos(-1, pose, s.dir);
      }
    }
    if (pose && estado.fiesta?.t >= DURACION_FIESTA && !estado.metaVista) {
      estado.metaVista = true;
      for (let i = 0; i < 26; i++) {
        particula(pose.cx, pose.cy - pose.B, C.julito,
          { vx: (Math.random() - 0.5) * 220, vy: -80 - Math.random() * 160, vida: 1.8, lado: pose.B * 0.22 });
      }
    }
  }
  requestAnimationFrame(fotograma);
}

// ---------- arranque ----------
// ---------- guía del primer movimiento ----------
let temporizadorGuia = null;
let manoTutorial = null;     // la mano fantasma (se aparta al terminar la guía)

const FUNDIDO_GUIA = 800;     // ms del fundido del oscurecimiento (como en el CSS)

/** Eme y su bocadillo, por encima del oscurecimiento (o de vuelta a su sitio). */
function ponerEncima(si) {
  estado.encima = si;
  $('tablero').classList.toggle('guiado', si);
}

/** ¿Tiene este nivel algo que contar o enseñar al empezar? */
const hayGuia = (n) => !!NIVELES[n].guia && !estrellasDe(n);
const hayCharla = (n) => !!NIVELES[n].charla && !visto(`charla-${n}`);

/**
 * Ayuda al empezar un nivel, por orden y solo cuando toca: la bienvenida de Eme en primer
 * plano, su charla desde el tablero y la guía del primer movimiento.
 */
function empezarAyuda() {
  const tapado = ['inicio', 'niveles', 'historia'].some((id) => !$(id).hidden) || $('cargando') || document.querySelector('dialog[open]');
  if (estado.modo !== 'montaje' || estado.arrastre || estado.vuelos || tapado) {
    temporizadorGuia = setTimeout(empezarAyuda, 500);   // aún no se ve el nivel: esperar
    return;
  }
  if (Object.values(estado.colocadas).some(Boolean)) return;   // ya ha empezado solo: no hace falta
  const n = NIVEL.numero;
  const guia = () => (hayGuia(n) ? guiarPrimerMovimiento() : terminarGuia());
  const charlaYGuia = () => (hayCharla(n) ? charlar(NIVEL.charla, guia) : guia());
  if (NIVEL.bienvenida && !bienvenidaVista()) {
    mostrarBienvenida({ frases: NIVEL.bienvenida, alTerminar: charlaYGuia });
    return;
  }
  charlaYGuia();
}

const visto = (k) => { try { return localStorage.getItem(`fuga-eme-${k}-vista`) === '1'; } catch { return false; } };
const marcarVisto = (k) => { try { localStorage.setItem(`fuga-eme-${k}-vista`, '1'); } catch { /* da igual */ } };

/** Lo que se puede iluminar mientras Eme habla (uno o varios rectángulos de pantalla). */
function zona(nombre) {
  if (nombre === 'huecos') return Object.keys(NIVEL.huecos).map((c) => rectHueco(c));
  if (nombre === 'pegatinas') return [...$('piezas').querySelectorAll('.pegatina')].map((el) => el.getBoundingClientRect());
  if (nombre === 'bandera') {
    // la repisa de la meta con su bandera
    const v = vistaTablero(W()), r = lienzo.getBoundingClientRect();
    const [x0, y0] = v.px(inicioRepisa() - 0.3, NIVEL.meta.altura + 2.6), [x1, y1] = v.px(anchoTablero(), NIVEL.meta.altura - 1.1);
    return { left: r.left + x0, top: r.top + y0, width: x1 - x0, height: y1 - y0 };
  }
  const el = {
    regla: $('regla'),
    salida: $('objetivo-salida').parentElement,
    meta: $('objetivo-meta').parentElement,
    bandeja: $('piezas'),
    lanzar: $('btn-lanzar'),
    vaciar: $('btn-vaciar'),
  }[nombre];
  return el ? el.getBoundingClientRect() : null;
}

/**
 * Eme habla desde su sitio en el tablero, por encima del oscurecimiento. Cada frase
 * ({ texto, expr?, px?, py?, zonas? }) avanza al tocar el bocadillo; todo lo demás está bloqueado.
 */
function charlar(frases, alTerminar) {
  estado.guia = { pieza: null, celda: null };
  estado.seleccion = null;
  estado.huecoElegido = null;
  ponerEncima(true);
  refrescar();
  let n = -1;
  const siguiente = () => {
    n++;
    if (n >= frases.length) {
      estado.huecosEnFoco = false;
      marcarVisto(`charla-${NIVEL.numero}`);
      alTerminar();
      return;
    }
    const f = frases[n];
    estado.cara = { expr: f.expr ?? 'idle', px: f.px ?? 0.3, py: f.py ?? 0.3 };
    estado.huecosEnFoco = !!f.zonas?.includes('huecos');   // los huecos laten mientras se habla de ellos
    mostrarFoco(() => (f.zonas ?? []).flatMap(zona));
    decir(f.texto, { alTocar: siguiente });
  };
  siguiente();
}

/** Oscurece todo salvo Eme, su bocadillo, el primer hueco y su pieza, y bloquea lo demás. */
function guiarPrimerMovimiento() {
  const p = pieza(NIVEL.guia.pieza);
  estado.guia = { pieza: p.id, celda: celdaDeForma(p.forma) };
  estado.seleccion = null;
  estado.huecoElegido = null;
  tarjeta(p.id).scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  estado.cara = { expr: 'idle', px: 0.2, py: 0.95 };   // mira hacia la bandeja
  decir(NIVEL.guia.texto);
  refrescar();
  ponerEncima(true);
  mostrarFoco(() => [rectHueco(estado.guia?.celda ?? 4),
    estado.guia ? tarjeta(estado.guia.pieza).getBoundingClientRect() : null]);
}

/** El jugador ha colocado la pieza de la guía: Eme vuelve en primer plano a felicitarlo. */
function primerMovimientoHecho(celda) {
  if (!NIVEL.felicitacion) { terminarGuia(); return; }
  // Todo sigue bloqueado; se ve un momento cómo encaja la pieza y llega Eme
  estado.guia = { pieza: null, celda: null };
  estado.cara = null;
  manoTutorial?.parar();
  $('bocadillo').classList.add('oculto');
  ponerEncima(false);
  refrescar();
  mostrarFoco(() => [rectHueco(celda)]);
  setTimeout(() => mostrarPrimerPlano({
    frases: NIVEL.felicitacion,
    etiqueta: 'Eme te felicita',
    alTerminar: terminarGuia,     // se va el oscurecimiento y el juego sigue
  }), 700);
}

function terminarGuia() {
  if (!estado.guia) return;
  estado.guia = null;
  estado.cara = null;
  manoTutorial?.parar();
  quitarFoco();
  $('bocadillo').classList.add('oculto');
  // Eme y el bocadillo bajan a su capa cuando el oscurecimiento ya se ha ido
  setTimeout(() => { if (!estado.guia) ponerEncima(false); }, FUNDIDO_GUIA);
  refrescar();
}

/** Prepara todo lo que depende del nivel: textos, huecos, bandeja, estrellas… */
function cargarNivel(n) {
  usarNivel(n);
  $('tablero').style.setProperty('--cols', columnas());   // 3 filas y las columnas del nivel
  estado.colocadas = Object.fromEntries(Object.keys(NIVEL.huecos).map((c) => [c, null]));
  estado.seleccion = null;
  estado.huecoElegido = null;
  estado.fuera = new Set();
  estado.avisos = {};
  estado.intentos = 0;
  estado.fallos = 0;
  estado.mejor = estrellasDe(n);
  estado.recMontaje = prepararRecorrido(NIVEL, estado.colocadas);
  $('titulo-nivel').textContent = `Nivel ${NIVEL.numero} · ${NIVEL.titulo}`;
  terminarGuia();
  clearTimeout(temporizadorGuia);
  $('bocadillo').textContent = sinCortes(NIVEL.frase);
  // Con algo que contar, el nivel arranca limpio (sin bocadillo) y al segundo llega la ayuda:
  // la bienvenida (la primera vez), la charla de Eme y la guía del primer movimiento
  const conAyuda = hayGuia(n) || hayCharla(n);
  $('bocadillo').classList.toggle('oculto', conAyuda);
  if (conAyuda) temporizadorGuia = setTimeout(empezarAyuda, 1000);
  $('objetivo-salida').innerHTML = `Sale con <b class="salida">${NIVEL.energia}</b>&nbsp;julitos`;
  $('objetivo-meta').innerHTML = `Meta: pararse a altura&nbsp;<b class="meta">${NIVEL.meta.altura}</b>`;
  $('directo-pie').textContent = `Total: ${NIVEL.energia} julitos. Siempre.`;
  $('objetivo').setAttribute('aria-label', `Eme sale con ${NIVEL.energia} julitos. Meta: que se pare en la bandera, a altura ${NIVEL.meta.altura}`);
  for (const r of $('regla').querySelectorAll('.regla-n')) {
    r.classList.toggle('meta', Number(r.style.getPropertyValue('--h')) === NIVEL.meta.altura);
  }
  crearHuecos();
  crearBandeja();
  pintarEstrellas($('estrellas'), estado.mejor);
  volverAMontar();
}

/** Botones invisibles sobre las casillas vacías del nivel (para tocar y arrastrar). */
function crearHuecos() {
  $('tablero').querySelectorAll('.hueco').forEach((b) => b.remove());
  for (const [cs, forma] of Object.entries(NIVEL.huecos)) {
    const celda = Number(cs);
    const b = document.createElement('button');
    b.className = 'hueco';
    b.dataset.celda = celda;
    b.setAttribute('aria-label', `Hueco de ${forma}, casilla ${celda}`);
    const cols = columnas();
    b.style.left = `${((celda - 1) % cols) * (100 / cols)}%`;
    b.style.top = `${Math.floor((celda - 1) / cols) * (100 / 3)}%`;
    b.style.width = `${100 / cols}%`;
    b.addEventListener('click', () => { if (!suprimirClick) tocarHueco(celda); });
    b.addEventListener('pointerdown', (e) => {
      const p = estado.colocadas[celda];
      if (p) posibleArrastre(e, { pieza: p, desde: celda });
    });
    $('bocadillo').before(b);
  }
}

/** Siguiente nivel que ya existe, o null. */
function siguienteNivel() {
  return [...NIVELES_JUGABLES].filter((k) => k > NIVEL.numero).sort((a, b) => a - b)[0] ?? null;
}

function iniciar() {
  $('bocadillo').addEventListener('click', tocarBocadillo);
  // Regla de alturas: un número por cuadrito, todos iguales
  const regla = $('regla');
  regla.style.setProperty('--n', CUADRITOS);
  regla.setAttribute('aria-label', `Regla de alturas en julitos, de 0 a ${CUADRITOS}`);
  for (let h = 0; h <= CUADRITOS; h++) {
    const n = document.createElement('span');
    n.className = 'regla-n';
    n.style.setProperty('--h', h);
    n.textContent = h;
    regla.append(n);
  }
  $('btn-lanzar').addEventListener('click', lanzar);
  $('btn-vaciar').addEventListener('click', vaciar);
  $('btn-pausa').addEventListener('click', () => {
    estado.pausado = !estado.pausado;
    $('btn-pausa').classList.toggle('pausado', estado.pausado);
    $('btn-pausa').setAttribute('aria-label', estado.pausado ? 'Seguir' : 'Pausa');
    $('btn-pausa').querySelector('small').textContent = estado.pausado ? 'seguir' : 'pausa';
  });
  $('btn-lento').addEventListener('click', () => ponerVelocidad(0.5));
  $('btn-normal').addEventListener('click', () => ponerVelocidad(1));
  $('btn-parar').addEventListener('click', volverAMontar);
  $('btn-reintentar').addEventListener('click', volverAMontar);
  $('btn-siguiente').addEventListener('click', () => { const s = siguienteNivel(); if (s) entrarNivel(s); });
  $('btn-menu').addEventListener('click', () => { $('acerca').returnValue = ''; $('acerca').showModal(); });
  $('acerca').addEventListener('close', () => {
    if ($('acerca').returnValue === 'historia') mostrarHistoria();
    if ($('acerca').returnValue === 'niveles') abrirNiveles();
    if ($('acerca').returnValue === 'opciones') abrirOpciones();
  });

  ajustar();
  cargarNivel(1);
  new ResizeObserver(() => ajustar()).observe($('tablero'));
  requestAnimationFrame(fotograma);
  // Tutorial: una mano fantasma enseña a colocar las piezas y a lanzar
  manoTutorial = iniciarTutorial({
    activo: () => !!estado.guia?.pieza && estado.modo === 'montaje' && !estado.arrastre && !estado.vuelos
      && !estado.fuera.has(estado.guia.pieza),
    siguiente: () => (estado.guia ? { desde: rectMini(estado.guia.pieza), hasta: rectHueco(estado.guia.celda) } : null),
  });
  // carga → inicio → (JUGAR) → historia, solo la primera vez → elige nivel → nivel
  // La portada se coloca debajo de la pantalla de carga y la hoja de la carga se arranca.
  quitarCarga(abrirInicio);
}

// ---------- pantallas: inicio → niveles → nivel ----------
function abrirInicio() {
  // JUGAR: la primera vez, la historia (que termina contando el plan) y luego el mapa de niveles
  mostrarInicio({ alJugar: () => (historiaVista() ? abrirNiveles() : mostrarHistoria({ alTerminar: abrirNiveles })) });
}

function abrirNiveles() {
  mostrarNiveles({ alElegir: entrarNivel, alVolver: abrirInicio });
}

/** Entra en un nivel. */
function entrarNivel(n) {
  cargarNivel(n);
}

// La pantalla de carga se queda al menos 2 s (contados desde que empezó a cargar la página)
const CARGA_MINIMA = 2000;
function quitarCarga(antes) {
  const pantalla = $('cargando');
  setTimeout(() => {
    arrancar(pantalla, { antes }).then(() => pantalla.remove());
  }, Math.max(0, CARGA_MINIMA - performance.now()));
}

// Espera a la fuente manuscrita (sin bloquear si no llega)
Promise.race([document.fonts.load(`20px ${FUENTE}`), new Promise((r) => setTimeout(r, 1500))])
  .catch(() => {})
  .finally(iniciar);
