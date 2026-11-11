// Eme en primer plano: la pantalla se oscurece y Eme sube a hablar con el jugador.
// Se usa para la bienvenida del primer nivel (Eme se presenta) y para felicitarlo cuando
// hace su primer movimiento.
//
// Habla con bocadillos que se escriben letra a letra (mientras, mueve la boca). Al tocar el
// bocadillo se completa el texto o se pasa al siguiente. La bienvenida se recuerda en
// localStorage para no repetirla (el «Restablecer datos» de las opciones la borra con lo demás).

import { dibujarEme } from './dibujo.js';
import { mostrarFoco } from './foco.js';
import { sinCortes, prepararEscritura, mostrarLetras } from './escritura.js';

const CLAVE = 'fuga-eme-bienvenida-vista';
const LETRAS_POR_SEGUNDO = 38;
const AW = 240, AH = 210;          // tamaño lógico del dibujo de Eme
const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;

export function bienvenidaVista() {
  try { return localStorage.getItem(CLAVE) === '1'; } catch { return false; }
}
function marcarVista() {
  try { localStorage.setItem(CLAVE, '1'); } catch { /* sin almacenamiento: da igual */ }
}

/** Pose de Eme mientras habla o escucha: respira, parpadea y mueve la boca al hablar. */
function pose(t, frase, hablando) {
  const o = { expr: frase.expr ?? 'idle', seed: 7 + (Math.floor(t * 8) % 3), lid: 0.1, px: frase.px ?? 0, py: frase.py ?? 0.1 };
  const br = reducido ? 0 : Math.sin(t * 2.6);
  o.sy = 1 + 0.03 * br;
  o.sx = 1 - 0.025 * br;
  if (o.expr === 'idle') {
    if (hablando) o.habla = 0.35 + 0.65 * Math.abs(Math.sin(t * 15));
    else if ([0.4, 3.1, 5.6].some((p) => t % 6 > p && t % 6 < p + 0.13)) o.lid = 1;   // parpadeo
  }
  return o;
}

/** La bienvenida: Eme se presenta (solo la primera vez). */
export function mostrarBienvenida({ frases, alTerminar }) {
  mostrarPrimerPlano({
    frases,
    etiqueta: 'Eme te da la bienvenida',
    alTerminar: () => { marcarVista(); alTerminar?.(); },
  });
}

/**
 * Eme en primer plano. `frases` es una lista de { texto, expr?, px?, py? }.
 * Al terminar, llama a `alTerminar` con la pantalla aún oscurecida.
 */
export function mostrarPrimerPlano({ frases, alTerminar, etiqueta = 'Eme te habla' }) {
  const $ = (id) => document.getElementById(id);
  const raiz = $('bienvenida');
  const lienzo = $('bienvenida-eme');
  const bocadillo = $('bienvenida-bocadillo');
  const visible = $('bienvenida-texto');
  const ctx = lienzo.getContext('2d');
  let n = 0, letras = 0, t = 0, ultimo = performance.now(), vivo = true, saliendo = false;
  let salto = 0;   // botecito al cambiar de frase

  const frase = () => frases[n];
  const texto = () => sinCortes(frase().texto);
  const escrita = () => letras >= frase().texto.length;

  const ajustar = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const w = lienzo.clientWidth || AW;
    lienzo.width = Math.round(w * dpr);
    lienzo.height = Math.round(w * (AH / AW) * dpr);
  };

  const ponerFrase = (i) => {
    n = i;
    letras = reducido ? frase().texto.length : 0;
    prepararEscritura(visible, texto());   // el texto entero, invisible: ni saltos ni cortes nuevos
    bocadillo.setAttribute('aria-label', frase().texto);
    salto = 1;
    raiz.classList.remove('escrita');
  };

  const avanzar = () => {
    if (saliendo) return;
    if (!escrita()) { letras = frase().texto.length; return; }   // primero, completar
    if (n < frases.length - 1) { ponerFrase(n + 1); return; }
    // Fin: Eme baja del primer plano y la pantalla sigue oscura para lo que venga
    saliendo = true;
    raiz.classList.remove('dentro');
    raiz.classList.add('fuera');
    setTimeout(() => {
      vivo = false;
      raiz.hidden = true;
      raiz.classList.remove('fuera', 'escrita');
      $('app').inert = false;
      window.removeEventListener('resize', ajustar);
      alTerminar?.();
    }, reducido ? 50 : 450);
  };

  bocadillo.onclick = avanzar;

  // Entrada: se oscurece todo y Eme sube al primer plano
  mostrarFoco(() => []);
  raiz.setAttribute('aria-label', etiqueta);
  $('app').inert = true;
  raiz.hidden = false;
  ajustar();
  window.addEventListener('resize', ajustar);
  ponerFrase(0);
  void raiz.offsetWidth;
  raiz.classList.add('dentro');
  bocadillo.focus({ preventScroll: true });
  const empiezaAEscribir = reducido ? 0 : 0.9;   // tras la subida de Eme

  const fotograma = (ahora) => {
    if (!vivo) return;
    const dt = Math.min(0.05, (ahora - ultimo) / 1000);
    ultimo = ahora;
    t += dt;
    if (t > empiezaAEscribir && !escrita()) {
      letras = Math.min(frase().texto.length, letras + LETRAS_POR_SEGUNDO * dt);
      mostrarLetras(visible, texto(), Math.floor(letras));
    }
    if (escrita() && !raiz.classList.contains('escrita')) {
      mostrarLetras(visible, texto(), texto().length);
      raiz.classList.add('escrita');      // aparece «Haz clic para continuar»
    }
    salto = Math.max(0, salto - dt * 3.5);

    const w = lienzo.width, s = w / AW;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, w, lienzo.height);
    ctx.setTransform(s, 0, 0, s, 0, 0);
    const B = 150, o = pose(t, frase(), !escrita() && t > empiezaAEscribir);
    const alto = reducido ? 0 : Math.sin(salto * Math.PI) * 14;
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath(); ctx.ellipse(120, 196, 70 * o.sx * (1 - alto / 60), 8, 0, 0, 6.29); ctx.fill();
    dibujarEme(ctx, 120, 194 - (B * o.sy) / 2 - alto, B, o);
    requestAnimationFrame(fotograma);
  };
  requestAnimationFrame(fotograma);
}
