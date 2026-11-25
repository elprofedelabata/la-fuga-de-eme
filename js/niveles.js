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

/** Estado de cada nivel según el progreso: completado, siguiente, disponible o bloqueado. */
function estadoNivel(n, progreso) {
  if (!NIVELES_JUGABLES.has(n)) return 'bloqueado';
  // se desbloquea al completar el nivel jugable anterior (los que aún no existen se saltan)
  const anterior = Math.max(0, ...[...NIVELES_JUGABLES].filter((k) => k < n));
  if (anterior && !progreso[anterior]) return 'bloqueado';
  return progreso[n] ? 'completado' : 'siguiente';
}

// Una estrella por nivel: llena si está superado
function estrellasHtml(n) {
  return `<i class="${n ? 'llena' : ''}"></i>`;
}

function construir(progreso, recien) {
  let n = 0;
  return MUNDOS.map((m) => {
    const primero = n + 1;
    const pos = POSICIONES[m.niveles] ?? POSICIONES[6];
    const casillas = pos.map(([x, y], i) => {
      const num = primero + i;
      const est = estadoNivel(num, progreso);
      const e = progreso[num] ?? 0;
      const etiqueta = m.id === 'fuera' ? '★' : num;
      const aria = est === 'bloqueado' ? `Nivel ${num}, bloqueado` : `Nivel ${num}${e ? ', superado' : ''}`;
      return `<button class="nivel-btn ${est}" style="left:${x}%;top:${y}%" data-n="${num}" aria-label="${aria}">
          <span class="nivel-num">${est === 'bloqueado' ? CANDADO : etiqueta}</span>
          ${est === 'bloqueado' ? '' : `<span class="mini-estrellas" aria-hidden="true">${estrellasHtml(e)}</span>`}
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
        <div class="camino camino-${m.niveles}">
          ${m.niveles > 1 ? `<svg class="camino-linea" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <polyline points="${linea}" vector-effect="non-scaling-stroke"/></svg>` : ''}
          ${casillas}
        </div>
      </article>`;
  }).join('');
}

/** `recien`: id de un mundo que se acaba de desbloquear (se destaca con una animación). */
export function mostrarNiveles({ alElegir, alVolver, recien } = {}) {
  const $ = (id) => document.getElementById(id);
  const raiz = $('niveles');
  const progreso = leerProgreso();
  const total = MUNDOS.reduce((a, m) => a + m.niveles, 0);          // una estrella por nivel
  const conseguidas = Object.values(progreso).filter(Boolean).length;
  $('niveles-total').innerHTML = `<i class="estrella-mini"></i>${conseguidas} / ${total}`;
  $('mundos').innerHTML = construir(progreso, recien);
  if (recien) requestAnimationFrame(() => raiz.querySelector('.mundo.recien')?.scrollIntoView({ block: 'center', behavior: 'smooth' }));
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
    const b = e.target.closest('.nivel-btn');
    if (!b) return;
    if (b.classList.contains('bloqueado')) {
      b.classList.remove('tiembla');
      void b.offsetWidth;            // reinicia la animación
      b.classList.add('tiembla');
      return;
    }
    salir(() => alElegir?.(Number(b.dataset.n)));
  };
}
