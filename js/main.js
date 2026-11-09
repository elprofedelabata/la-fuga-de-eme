// La fuga de Eme · boceto jugable del nivel 1.

import { NIVEL, MATERIALES } from './nivel.js';
import { prepararRecorrido, nuevaSimulacion, avanzar, muestra, energias, analizar, sDeX } from './pista.js';
import {
  C, FUENTE, dibujarTablero, dibujarResaltes, dibujarBandera, dibujarMiniatura, dibujarEme,
  vistaTablero, cuadradito,
} from './dibujo.js';

const $ = (id) => document.getElementById(id);
const app = $('app');
const lienzo = $('lienzo');
const ctx = lienzo.getContext('2d');

const estado = {
  modo: 'montaje',            // montaje | directo | resultado
  colocadas: { 4: null, 8: null },
  seleccion: null,            // id de la pieza levantada
  huecoElegido: null,         // hueco tocado antes de elegir pieza
  aviso: 0,                   // segundos que parpadean los huecos vacíos
  intentos: 0,
  fallos: 0,
  mejor: 0,
  velocidad: 1,
  pausado: false,
  sim: null, rec: null, analisis: null,
  espera: 0, calorVisto: 0, metaVista: false,
};

const pieza = (id) => NIVEL.piezas.find((p) => p.id === id);
const W = () => lienzo.clientWidth;
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
  lienzo.height = Math.round(w * dpr);
  rehacerTablero();
}

function rehacerTablero() {
  const w = W();
  if (!w) return;
  cache = document.createElement('canvas');
  cache.width = Math.round(w * dpr);
  cache.height = Math.round(w * dpr);
  const c = cache.getContext('2d');
  c.scale(dpr, dpr);
  dibujarTablero(c, w, NIVEL, estado.colocadas);
}

// ---------- bandeja ----------
function crearBandeja() {
  const cont = $('piezas');
  cont.innerHTML = '';
  for (const p of NIVEL.piezas) {
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
    const celda = Number(Object.keys(NIVEL.huecos).find((k) => NIVEL.huecos[k] === p.forma));
    dibujarMiniatura(c, lado, celda, p);
    b.append(cv);
    b.insertAdjacentHTML('beforeend',
      `<span class="n1">${p.nombre[0]}</span><span class="n2">${p.nombre[1]}</span>` +
      `<span class="pegatina${pierde ? '' : ' cero'}">−${pierde}</span>`);
    b.addEventListener('click', () => tocarPieza(p.id));
    cont.append(b);
  }
}

function refrescar() {
  const colocadasIds = new Set(Object.values(estado.colocadas).filter(Boolean).map((p) => p.id));
  const formaFiltro = estado.huecoElegido ? NIVEL.huecos[estado.huecoElegido] : null;
  for (const b of document.querySelectorAll('.pieza')) {
    const p = pieza(b.dataset.id);
    b.classList.toggle('colocada', colocadasIds.has(p.id));
    b.classList.toggle('seleccionada', estado.seleccion === p.id);
    b.classList.toggle('no-encaja', !!formaFiltro && p.forma !== formaFiltro);
  }
  const completo = Object.keys(NIVEL.huecos).every((c) => estado.colocadas[c]);
  $('btn-lanzar').classList.toggle('atenuado', !completo);

  const ayuda = $('ayuda');
  ayuda.className = 'ayuda';
  if (estado.seleccion) {
    const p = pieza(estado.seleccion);
    ayuda.innerHTML = `<b>${p.nombre.join(' ')}</b> · ahora toca su hueco`;
    ayuda.classList.add('destaca');
  } else if (estado.huecoElegido) {
    ayuda.innerHTML = `<b>Hueco de ${NIVEL.huecos[estado.huecoElegido]}</b> · elige una pieza`;
    ayuda.classList.add('destaca');
  } else if (completo) {
    ayuda.innerHTML = '<b>¡Listo!</b> · pulsa LANZAR (toca una pieza del tablero para quitarla)';
  } else {
    ayuda.innerHTML = '<b>Piezas</b> · toca una y luego su hueco';
  }
  rehacerTablero();
}

function ocultarBocadillo() { $('bocadillo').classList.add('oculto'); }

function tocarPieza(id) {
  if (estado.modo !== 'montaje') return;
  ocultarBocadillo();
  const p = pieza(id);
  if (estado.huecoElegido) {
    if (NIVEL.huecos[estado.huecoElegido] === p.forma) {
      estado.colocadas[estado.huecoElegido] = p;
      estado.huecoElegido = null;
      estado.seleccion = null;
    }
    refrescar();
    return;
  }
  estado.seleccion = estado.seleccion === id ? null : id;
  refrescar();
}

function tocarHueco(celda) {
  if (estado.modo !== 'montaje') return;
  ocultarBocadillo();
  const forma = NIVEL.huecos[celda];
  if (estado.seleccion) {
    const p = pieza(estado.seleccion);
    if (p.forma === forma) {
      estado.colocadas[celda] = p;    // si había otra, vuelve a la bandeja sola
      estado.seleccion = null;
    } else {
      const a = $('ayuda');
      a.innerHTML = `<b>No encaja</b> · ese hueco es de ${forma}`;
      a.className = 'ayuda error';
      return;
    }
  } else if (estado.colocadas[celda]) {
    estado.colocadas[celda] = null;  // quitar
  } else {
    estado.huecoElegido = estado.huecoElegido === celda ? null : celda;
  }
  refrescar();
}

function estadosHuecos() {
  const out = {};
  for (const [cs, forma] of Object.entries(NIVEL.huecos)) {
    const c = Number(cs);
    if (estado.aviso > 0 && !estado.colocadas[c]) out[c] = 'aviso';
    else if (estado.seleccion) out[c] = pieza(estado.seleccion).forma === forma ? 'activo' : 'apagado';
    else if (estado.huecoElegido) out[c] = estado.huecoElegido === c ? 'activo' : null;
  }
  return out;
}

// ---------- lanzamiento ----------
function lanzar() {
  if (estado.modo !== 'montaje') return;
  ocultarBocadillo();
  const faltan = Object.keys(NIVEL.huecos).filter((c) => !estado.colocadas[c]);
  if (faltan.length) {
    estado.aviso = 1.4;
    const a = $('ayuda');
    a.innerHTML = `<b>Faltan piezas</b> · ${faltan.length === 1 ? 'queda un hueco vacío' : 'quedan huecos vacíos'}`;
    a.className = 'ayuda error';
    return;
  }
  estado.seleccion = null;
  estado.huecoElegido = null;
  estado.intentos++;
  estado.rec = prepararRecorrido(NIVEL, estado.colocadas);
  estado.sim = nuevaSimulacion(estado.rec, NIVEL);
  estado.analisis = analizar(NIVEL, estado.colocadas);
  estado.espera = 0;
  estado.calorVisto = 0;
  estado.metaVista = false;
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

function crearFichas() {
  const f = $('fichas');
  f.innerHTML = '';
  for (let i = 0; i < NIVEL.energia; i++) f.append(Object.assign(document.createElement('i'), { className: 'ficha ep' }));
}

function actualizarEnergia(e) {
  const n = enteros(e);
  const fichas = $('fichas').children;
  for (let i = 0; i < fichas.length; i++) {
    fichas[i].className = 'ficha ' + (i < n.ep ? 'ep' : i < n.ep + n.ec ? 'ec' : 'calor');
  }
  $('n-ep').textContent = n.ep;
  $('n-ec').textContent = n.ec;
  $('n-calor').textContent = n.calor;
  const E = NIVEL.energia;
  const [sEp, sEc, sCal] = $('barra-e').children;
  for (const [el, val, nom] of [[sEp, n.ep, 'Ep'], [sEc, n.ec, 'Ec'], [sCal, n.calor, 'calor']]) {
    el.style.width = `${(100 * val) / E}%`;
    el.textContent = val >= 2 ? `${nom} · ${val}` : val === 1 ? String(val) : '';
  }
}

// ---------- resultado ----------
const TEXTOS = {
  meta: { titulo: '¡Conseguido!', cita: '«Ni más, ni menos.»' },
  pasaste: { titulo: '¡Te pasaste!', cita: '«¡Frenoooo!»' },
  borde: { titulo: '¡Por los pelos!', cita: '«Esto… no llego.»' },
  nollega: { titulo: '¡No llega!', cita: '«¿Eso era todo?»' },
};

function grupo(n, clase, etiqueta) {
  const g = document.createElement('div');
  g.className = 'grupo';
  const fs = document.createElement('div');
  fs.className = 'fs';
  for (let i = 0; i < n; i++) fs.append(Object.assign(document.createElement('i'), { className: `ficha ${clase}` }));
  g.append(fs, Object.assign(document.createElement('small'), { textContent: `${etiqueta} · ${n}` }));
  return g;
}

function mostrarResultado() {
  const { tipo, perdidas, llegada, piezas } = estado.analisis;
  const E = NIVEL.energia, hm = NIVEL.meta.altura, fe = NIVEL.meta.pierdeFelpudo;
  const t = TEXTOS[tipo];
  estado.modo = 'resultado';
  app.dataset.modo = 'resultado';
  $('hoja-titulo').textContent = t.titulo;
  $('cita').textContent = t.cita;

  let estrellas = 0;
  if (tipo === 'meta') {
    estrellas = estado.fallos === 0 ? 3 : estado.fallos === 1 ? 2 : 1;
    estado.mejor = Math.max(estado.mejor, estrellas);
  } else {
    estado.fallos++;
  }
  pintarEstrellas($('hoja-estrellas'), estrellas);
  pintarEstrellas($('estrellas'), estado.mejor);

  const bal = $('balance');
  bal.innerHTML = '';
  const conPerdida = piezas.filter((p) => MATERIALES[p.material].pierde > 0);
  const piezasGrupos = () => conPerdida.forEach((p) => bal.append(grupo(MATERIALES[p.material].pierde, 'calor', MATERIALES[p.material].nombre)));
  let msg, ecu;
  if (tipo === 'meta') {
    msg = `Eme se para justo en la bandera. ${estado.fallos === 0 ? '¡A la primera!' : ''}`;
    bal.append(grupo(hm, 'ep', 'altura meta'));
    piezasGrupos();
    bal.append(grupo(fe, 'calor', 'felpudo'));
    ecu = `${E} = ${[hm, ...conPerdida.map((p) => MATERIALES[p.material].pierde), fe].join(' + ')}`;
  } else if (tipo === 'pasaste') {
    const sobran = llegada - fe;
    msg = `Llegó a la repisa con ${llegada} julitos de Ec, pero el felpudo solo frena ${fe}. ` +
      (sobran === 1 ? 'El otro lo mandó al precipicio.' : `Los otros ${sobran} lo mandaron al precipicio.`);
    bal.append(grupo(hm, 'ep', 'altura meta'));
    piezasGrupos();
    bal.append(grupo(fe, 'calor', 'felpudo'));
    bal.append(grupo(llegada - fe, 'ec', 'sobran'));
    ecu = `${E} = ${[hm, ...conPerdida.map((p) => MATERIALES[p.material].pierde), fe, llegada - fe].join(' + ')}`;
  } else if (tipo === 'borde') {
    msg = 'Llegó a la repisa con 0 julitos de Ec: se quedó en el borde y volvió a caer. Le faltó 1 para el felpudo.';
    bal.append(grupo(hm, 'ep', 'altura meta'));
    piezasGrupos();
    ecu = `${E} = ${[hm, ...conPerdida.map((p) => MATERIALES[p.material].pierde)].join(' + ')}`;
  } else {
    msg = `Por el camino perdió ${perdidas} julitos: solo le quedaban ${E - perdidas} para subir, y la repisa está a altura ${hm}.`;
    bal.append(grupo(E - perdidas, 'ep', 'altura máx.'));
    piezasGrupos();
    ecu = `${E} = ${[E - perdidas, ...conPerdida.map((p) => MATERIALES[p.material].pierde)].join(' + ')}`;
  }
  $('hoja-msg').textContent = msg;
  $('ecuacion').textContent = ecu;
  const pista = $('pista-ayuda');
  pista.hidden = !(tipo !== 'meta' && estado.fallos >= 2);
  pista.textContent = `Pista: ${E} = ${hm} (altura de la meta) + ${fe} (felpudo) + ¿? (lo que pierden las piezas)`;
  $('hoja').hidden = false;
  $('btn-reintentar').focus({ preventScroll: true });
}

function pintarEstrellas(cont, n) {
  [...cont.children].forEach((s, i) => s.classList.toggle('llena', i < n));
  cont.setAttribute?.('aria-label', `${n} de 3 estrellas`);
}

function comprobarResultado(dt) {
  if (estado.modo !== 'directo') return;
  const s = estado.sim;
  const tipo = estado.analisis.tipo;
  let listo = s.t > 14 || s.estado === 'parado';
  if (tipo === 'meta') listo ||= s.estado === 'meta';
  if (tipo === 'pasaste') listo ||= s.estado === 'cayendo';
  if (tipo === 'borde') listo ||= s.estado === 'tambaleo' || s.vueltas > 0;
  if (tipo === 'nollega') listo ||= s.vueltas > 0;
  if (!listo) return;
  estado.espera += dt;
  const retardo = tipo === 'meta' ? 0.6 : tipo === 'borde' ? 1.6 : 1.1;
  if (estado.espera > retardo) mostrarResultado();
}

// ---------- partículas ----------
function particula(x, y, color, { vx = 0, vy = -30, vida = 1.2, lado = 8 } = {}) {
  particulas.push({ x, y, vx, vy, vida, t: 0, color, lado, ang: Math.random() * 1.2 - 0.6, va: (Math.random() - 0.5) * 6 });
}

function moverParticulas(dt) {
  for (let i = particulas.length - 1; i >= 0; i--) {
    const p = particulas[i];
    p.t += dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += (p.color === C.julito ? 90 : -10) * dt;
    p.ang += p.va * dt;
    if (p.t > p.vida) particulas.splice(i, 1);
  }
}

// ---------- pintado ----------
function poseEme(w) {
  const v = vistaTablero(w);
  const B = v.k * 1.02;
  const o = { seed: 3 + (Math.floor(reloj * 8) % 3), expr: 'idle' };
  let x, h, tx = 1, th = 0;

  if (!estado.sim) {
    const rec = estado.recMontaje;
    const m = muestra(rec, sDeX(rec, NIVEL.salidaX));
    ({ x, h, tx, th } = m);
    const completo = Object.keys(NIVEL.huecos).every((c) => estado.colocadas[c]);
    if (completo) o.expr = 'gulp';
    else {
      const ciclo = reloj % 4.2;
      o.lid = ciclo > 3.9 && ciclo < 4.05 ? 1 : 0.12;
      o.px = Math.sin(reloj * 0.7) > 0.85 ? 0.8 : 0.3;
      o.py = 0.3;
    }
    o.sy = 1 + 0.025 * Math.sin(reloj * 3.1);
    o.sx = 2 - o.sy;
  } else {
    const s = estado.sim;
    if (s.estado === 'cayendo') {
      ({ x, h } = s.caida);
      o.expr = 'fast';
      o.extraAng = s.caida.giro;
    } else {
      const m = muestra(estado.rec, s.s);
      ({ x, h, tx, th } = m);
      const dens = estado.rec.dens[m.i];
      const { ec } = energias(s, estado.rec);
      const mat = estado.rec.mats[m.i];
      if (s.estado === 'meta') { o.expr = 'win'; o.bandera = true; o.sy = 1.04; o.sx = 0.96; }
      else if (s.estado === 'tambaleo') { o.expr = 'edge'; o.extraAng = Math.sin(s.t * 18) * 0.12; }
      else if (s.estado === 'parado') o.expr = 'bored';
      else if (dens > 0) o.expr = 'effort';
      else if (ec > 3) { o.expr = 'fast'; o.px = s.dir * 0.6; }
      else if (mat === 'hielo') o.expr = 'ice';
      else { o.expr = 'idle'; o.px = s.dir * 0.7; o.lid = 0.15; }
    }
  }
  // colocar a Eme apoyado sobre la pista
  const [px, py] = v.px(x, h);
  const tl = Math.hypot(tx, th) || 1;
  const ux = tx / tl, uy = -th / tl;        // tangente en píxeles (y hacia abajo)
  const nx = uy, ny = -ux;                  // normal hacia fuera del terreno
  const ang = Math.atan2(uy, ux) + (o.extraAng ?? 0);
  return { cx: px + nx * B / 2 * (o.sy ?? 1), cy: py + ny * B / 2 * (o.sy ?? 1), B, ang, o };
}

function pintar() {
  const w = W();
  if (!w || !cache) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, w);
  ctx.drawImage(cache, 0, 0, w, w);
  if (estado.modo === 'montaje') dibujarResaltes(ctx, w, estadosHuecos(), reloj);

  const pose = poseEme(w);
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

  dibujarEme(ctx, pose.cx, pose.cy, pose.B, { ...pose.o, ang: pose.ang });

  for (const p of particulas) {
    ctx.globalAlpha = Math.max(0, 1 - p.t / p.vida);
    cuadradito(ctx, p.x, p.y, p.lado, p.color, p.ang);
  }
  ctx.globalAlpha = 1;

  if (s && s.estado === 'cayendo') {
    ctx.fillStyle = C.suave;
    ctx.font = `${Math.round(w * 0.06)}px ${FUENTE}`;
    ctx.textAlign = 'right';
    ctx.fillText('¡Aaaah!', w - 8, w * 0.42);
  }
  return pose;
}

// ---------- bucle ----------
let ultimo = performance.now();
function fotograma(ahora) {
  const dt = Math.min(0.05, (ahora - ultimo) / 1000);
  ultimo = ahora;
  reloj += dt;
  estado.aviso = Math.max(0, estado.aviso - dt);

  const s = estado.sim;
  const paso = estado.pausado ? 0 : dt * estado.velocidad;
  if (s && paso > 0) {
    avanzar(s, estado.rec, NIVEL, paso);
    comprobarResultado(paso);
  }
  moverParticulas(paso || (estado.sim ? 0 : dt));

  const pose = pintar();

  if (s) {
    const e = energias(s, estado.rec);
    actualizarEnergia(e);
    // un julito rojo sale volando cada vez que se pierde uno entero
    const calor = Math.floor(s.perdido + 1e-6);
    while (pose && estado.calorVisto < calor) {
      estado.calorVisto++;
      particula(pose.cx, pose.cy - pose.B * 0.3, C.calor, { vx: -s.dir * 20, vy: -45, lado: pose.B * 0.28 });
    }
    if (pose && s.estado === 'meta' && !estado.metaVista) {
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
function iniciar() {
  estado.recMontaje = prepararRecorrido(NIVEL, { 4: null, 8: null });
  $('titulo-nivel').textContent = `Nivel ${NIVEL.numero} · ${NIVEL.titulo}`;
  $('bocadillo').textContent = NIVEL.frase;
  $('bocadillo').addEventListener('click', ocultarBocadillo);
  crearFichas();
  actualizarEnergia({ ep: NIVEL.energia, ec: 0, calor: 0 });
  for (const b of document.querySelectorAll('.hueco')) b.addEventListener('click', () => tocarHueco(Number(b.dataset.celda)));
  $('btn-lanzar').addEventListener('click', lanzar);
  $('btn-vaciar').addEventListener('click', () => {
    if (estado.modo !== 'montaje') return;
    estado.colocadas = { 4: null, 8: null };
    estado.seleccion = null;
    estado.huecoElegido = null;
    refrescar();
  });
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
  $('btn-menu').addEventListener('click', () => $('acerca').showModal());

  ajustar();
  crearBandeja();
  refrescar();
  new ResizeObserver(() => ajustar()).observe($('tablero'));
  requestAnimationFrame(fotograma);
}

// Espera a la fuente manuscrita (sin bloquear si no llega)
Promise.race([document.fonts.load(`20px ${FUENTE}`), new Promise((r) => setTimeout(r, 1500))])
  .catch(() => {})
  .finally(iniciar);
