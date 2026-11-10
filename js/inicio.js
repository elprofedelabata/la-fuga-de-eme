// Pantalla de inicio: logo, Eme esperando y los botones JUGAR y OPCIONES.

import { C, dibujarEme, lapiz, trazar } from './dibujo.js';
import { arrancar, restaurar } from './transicion.js';

const AW = 240, AH = 200;   // tamaño lógico del dibujo de Eme
const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Tira de papel rasgada sobre la que está Eme. */
function tira(ctx) {
  const borde = [[30, 150], [210, 146], [214, 158], [206, 168], [212, 180], [36, 186], [28, 174], [34, 162]];
  ctx.save();
  ctx.fillStyle = 'rgba(80,70,60,0.12)';
  trazar(ctx, borde.map(([x, y]) => [x + 4, y + 5]), true);
  ctx.fill();
  ctx.fillStyle = '#fffef9';
  trazar(ctx, borde, true);
  ctx.fill();
  ctx.clip();
  ctx.strokeStyle = C.cuadri;
  ctx.lineWidth = 1;
  for (let x = 30; x < 215; x += 10) { ctx.beginPath(); ctx.moveTo(x, 140); ctx.lineTo(x, 190); ctx.stroke(); }
  for (let y = 155; y < 190; y += 10) { ctx.beginPath(); ctx.moveTo(25, y); ctx.lineTo(215, y); ctx.stroke(); }
  ctx.restore();
  lapiz(ctx, borde, { ancho: 2, cerrado: true, amp: 0.4 });
}

/**
 * Pose de Eme en un instante: respira, parpadea, mira a los botones de vez en cuando
 * y, cada cierto tiempo, se aburre un momento.
 */
function pose(t) {
  const o = { expr: 'idle', seed: 3 + (Math.floor(t * 8) % 3), lid: 0.12, px: 0.15, py: 0.15 };
  const br = reducido ? 0 : Math.sin(t * 2.6);
  o.sy = 1 + 0.03 * br;
  o.sx = 1 - 0.025 * br;
  const ciclo = t % 9;
  if (ciclo > 2.2 && ciclo < 3.6) { o.px = 0.55; o.py = 0.95; }          // mira los botones
  else if (ciclo > 5 && ciclo < 5.9) { o.px = -0.9; o.py = 0; }          // mira a un lado…
  else if (ciclo > 5.9 && ciclo < 6.7) { o.px = 0.9; o.py = 0; }         // …y al otro
  else if (ciclo > 7.3 && ciclo < 8.4) { o.expr = 'bored'; o.sy -= 0.03; o.sx += 0.02; }   // se aburre
  const parpadeo = [1.0, 1.25, 4.4, 8.7].some((p) => ciclo > p && ciclo < p + 0.13);
  if (parpadeo && o.expr === 'idle') o.lid = 1;
  return o;
}

export function mostrarInicio({ alJugar } = {}) {
  const $ = (id) => document.getElementById(id);
  const raiz = $('inicio');
  const lienzo = $('inicio-eme');
  const ctx = lienzo.getContext('2d');
  let vivo = true, t = 0, ultimo = performance.now(), tPronto = null;

  restaurar(raiz);
  raiz.hidden = false;

  const ajustar = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const w = lienzo.clientWidth || 240;
    lienzo.width = Math.round(w * dpr);
    lienzo.height = Math.round(w * (AH / AW) * dpr);
  };
  ajustar();
  window.addEventListener('resize', ajustar);

  $('btn-opciones').onclick = () => {
    const p = $('pronto');
    p.hidden = false;
    p.style.animation = 'none';
    void p.offsetWidth;          // reinicia la animación
    p.style.animation = '';
    clearTimeout(tPronto);
    tPronto = setTimeout(() => { p.hidden = true; }, 1600);
  };

  $('btn-jugar').onclick = () => {
    if (!vivo) return;
    vivo = false;
    window.removeEventListener('resize', ajustar);
    arrancar(raiz, { antes: alJugar });   // la siguiente queda debajo y esta hoja se arranca
  };

  const fotograma = (ahora) => {
    if (!vivo) return;
    t += Math.min(0.05, (ahora - ultimo) / 1000);
    ultimo = ahora;
    const w = lienzo.width, s = w / AW;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, w, lienzo.height);
    ctx.setTransform(s, 0, 0, s, 0, 0);
    tira(ctx);
    const B = 104, o = pose(t);
    // sombra
    ctx.fillStyle = 'rgba(80,70,60,0.14)';
    ctx.beginPath(); ctx.ellipse(120, 152, 50 * o.sx, 6, 0, 0, 6.29); ctx.fill();
    dibujarEme(ctx, 120, 150 - (B * o.sy) / 2, B, o);
    requestAnimationFrame(fotograma);
  };
  requestAnimationFrame(fotograma);
}
