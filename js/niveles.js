// Pantalla de selección de niveles, agrupados por mundos (cuaderno → libro → pizarra → fuera).

import { MUNDOS, NIVELES_JUGABLES } from './nivel.js';
import { leerProgreso } from './progreso.js';
import { arrancar, restaurar } from './transicion.js';

const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Posiciones (en % de la tarjeta) de las casillas de un mundo: un zigzag de dos filas
const POSICIONES = {
  10: [[12, 16], [37, 13], [63, 16], [88, 13], [84, 50], [50, 47], [16, 50], [16, 84], [50, 81], [84, 84]],
  8: [[11, 24], [37, 18], [63, 24], [89, 18], [88, 74], [63, 80], [37, 74], [12, 80]],
  6: [[14, 26], [50, 19], [86, 28], [84, 74], [50, 81], [16, 72]],
  1: [[50, 46]],
};

const CANDADO = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/></svg>';

/**
 * Estado de cada nivel según el progreso: completado, siguiente o bloqueado; o «pronto» si ya
 * tocaría jugarlo pero aún no está hecho (se ve abierto, pero avisa de que llega pronto).
 */
function estadoNivel(n, progreso) {
  if (!NIVELES_JUGABLES.has(n)) return n === 1 || progreso[n - 1] ? 'pronto' : 'bloqueado';
  // se desbloquea al completar el nivel jugable anterior (los que aún no existen se saltan)
  const anterior = Math.max(0, ...[...NIVELES_JUGABLES].filter((k) => k < n));
  if (anterior && !progreso[anterior]) return 'bloqueado';
  return progreso[n] ? 'completado' : 'siguiente';
}

// Una estrella por nivel: llena si está superado
function estrellasHtml(n) {
  return `<i class="${n ? 'llena' : ''}"></i>`;
}

function construir(progreso, { recien, abre, escenaVista }) {
  let n = 0;
  return MUNDOS.map((m) => {
    const primero = n + 1;
    const pos = POSICIONES[m.niveles] ?? POSICIONES[6];
    // el primer nivel de un mundo con escena de entrada no se abre hasta ver la escena
    const faltaEscena = m.escena && !escenaVista?.(m.id);
    const casillas = pos.map(([x, y], i) => {
      const num = primero + i;
      let est = estadoNivel(num, progreso);
      const porEscena = i === 0 && faltaEscena && est !== 'bloqueado' && est !== 'completado';
      if (porEscena) est = 'bloqueado';
      const e = progreso[num] ?? 0;
      const etiqueta = m.id === 'fuera' ? '★' : num;
      const aria = est === 'bloqueado' ? `Nivel ${num}, bloqueado` : est === 'pronto' ? `Nivel ${num}, próximamente` : `Nivel ${num}${e ? ', superado' : ''}`;
      // `abre`: el nivel que se acaba de desbloquear; se pinta ya abierto y una animación le quita el candado
      const abriendo = num === abre && est !== 'bloqueado';
      return `<button class="nivel-btn ${est}${abriendo ? ' abriendo' : ''}" style="left:${x}%;top:${y}%" data-n="${num}"${porEscena ? ` data-escena="${m.id}"` : ''} aria-label="${aria}">
          <span class="nivel-num">${est === 'bloqueado' ? CANDADO : etiqueta}</span>
          ${abriendo ? `<span class="candado-suelto" aria-hidden="true">${CANDADO}</span>` : ''}
          ${est === 'bloqueado' || est === 'pronto' ? '' : `<span class="mini-estrellas" aria-hidden="true">${estrellasHtml(e)}</span>`}
        </button>`;
    }).join('');
    n += m.niveles;
    // Un mundo se abre al terminar el anterior (su último nivel). Si aún no tiene niveles
    // hechos, se ve abierto pero con «Próximamente».
    const anteriorHecho = primero === 1 || !!progreso[primero - 1];
    const sinNiveles = ![...NIVELES_JUGABLES].some((k) => k >= primero && k < primero + m.niveles);
    const bloqueado = !anteriorHecho || (!sinNiveles && estadoNivel(primero, progreso) === 'bloqueado');
    const pronto = !bloqueado && sinNiveles;
    const linea = pos.map(([x, y]) => `${x},${y}`).join(' ');
    return `
      <article class="mundo ${m.id}${bloqueado ? ' bloqueado' : ''}${pronto ? ' pronto' : ''}${m.id === recien ? ' recien' : ''}">
        <h3><span class="mundo-num">${m.id === 'fuera' ? 'Final' : `Mundo ${m.numero}`}</span>${m.nombre}
          ${bloqueado ? `<span class="mundo-candado" aria-label="bloqueado">${CANDADO}</span>` : ''}</h3>
        ${bloqueado ? '<p class="mundo-aviso">Termina el mundo anterior</p>' : ''}
        ${pronto ? '<p class="mundo-aviso">¡Desbloqueado! Sus niveles llegan pronto.</p>' : ''}
        ${!bloqueado && m.escena ? `<button class="mundo-escena" data-mundo="${m.id}">▶ ${m.escena}</button>` : ''}
        <div class="camino camino-${m.niveles}">
          ${m.niveles > 1 ? `<svg class="camino-linea" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <polyline points="${linea}" vector-effect="non-scaling-stroke"/></svg>` : ''}
          ${casillas}
        </div>
      </article>`;
  }).join('');
}

/**
 * `recien`: id de un mundo que se acaba de desbloquear (se destaca con una animación).
 * `abre`: número de un nivel que se acaba de desbloquear (se le cae el candado).
 * `ir`: id de un mundo al que llevar la vista.
 * `escenaVista(id)`: si ya se ha visto la escena de entrada de un mundo (si no, su primer nivel sigue cerrado).
 */
export function mostrarNiveles({ alElegir, alVolver, alEscena, recien, abre, ir, escenaVista } = {}) {
  const $ = (id) => document.getElementById(id);
  const raiz = $('niveles');
  const progreso = leerProgreso();
  const total = MUNDOS.reduce((a, m) => a + m.niveles, 0);          // una estrella por nivel
  const conseguidas = Object.values(progreso).filter(Boolean).length;
  $('niveles-total').innerHTML = `<i class="estrella-mini"></i>${conseguidas} / ${total}`;
  $('mundos').innerHTML = construir(progreso, { recien, abre, escenaVista });
  const destino = raiz.querySelector('.mundo.recien') ?? raiz.querySelector('.nivel-btn.abriendo') ?? (ir && raiz.querySelector(`.mundo.${ir}`));
  if (destino) requestAnimationFrame(() => destino.scrollIntoView({ block: 'center', behavior: reducido ? 'auto' : 'smooth' }));
  // al acabar de abrirse, el nivel vuelve a su animación de siempre
  raiz.querySelector('.nivel-btn.abriendo')?.addEventListener('animationend', (e) => {
    if (e.animationName === 'abre-nivel') e.currentTarget.classList.remove('abriendo');
  });
  restaurar(raiz);
  raiz.hidden = false;
  raiz.scrollTop = 0;

  // Salir: la pantalla siguiente se coloca debajo y esta hoja se arranca
  let vivo = true;
  const salir = (siguiente) => {
    if (!vivo) return;
    vivo = false;
    arrancar(raiz, { antes: siguiente });
  };

  $('btn-niveles-volver').onclick = () => salir(alVolver);
  $('mundos').onclick = (e) => {
    const esc = e.target.closest('.mundo-escena');     // la escena de entrada de un mundo
    if (esc) { salir(() => alEscena?.(esc.dataset.mundo)); return; }
    const b = e.target.closest('.nivel-btn');
    if (!b) return;
    if (b.dataset.escena) { salir(() => alEscena?.(b.dataset.escena)); return; }   // primero, la escena del mundo
    if (b.classList.contains('pronto')) {          // aún no está hecho
      b.classList.remove('avisa');
      void b.offsetWidth;
      b.classList.add('avisa');
      return;
    }
    if (b.classList.contains('bloqueado')) {
      b.classList.remove('tiembla');
      void b.offsetWidth;            // reinicia la animación
      b.classList.add('tiembla');
      return;
    }
    salir(() => alElegir?.(Number(b.dataset.n)));
  };
}
