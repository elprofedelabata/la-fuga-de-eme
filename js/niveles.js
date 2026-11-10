// Pantalla de selección de niveles, agrupados por mundos (cuaderno → libro → pizarra → fuera).

import { MUNDOS, NIVELES_JUGABLES } from './nivel.js';
import { leerProgreso } from './progreso.js';

const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Posiciones (en % de la tarjeta) de las casillas de un mundo: un zigzag de dos filas
const POSICIONES = {
  6: [[14, 26], [50, 19], [86, 28], [84, 74], [50, 81], [16, 72]],
  1: [[50, 46]],
};

const CANDADO = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/></svg>';

/** Estado de cada nivel según el progreso: completado, siguiente, disponible o bloqueado. */
function estadoNivel(n, progreso) {
  if (!NIVELES_JUGABLES.has(n)) return 'bloqueado';
  if (n > 1 && !progreso[n - 1]) return 'bloqueado';
  return progreso[n] ? 'completado' : 'siguiente';
}

function estrellasHtml(n) {
  return [0, 1, 2].map((i) => `<i class="${i < n ? 'llena' : ''}"></i>`).join('');
}

function construir(progreso) {
  let n = 0;
  return MUNDOS.map((m) => {
    const primero = n + 1;
    const pos = POSICIONES[m.niveles] ?? POSICIONES[6];
    const casillas = pos.map(([x, y], i) => {
      const num = primero + i;
      const est = estadoNivel(num, progreso);
      const e = progreso[num] ?? 0;
      const etiqueta = m.id === 'fuera' ? '★' : num;
      const aria = est === 'bloqueado' ? `Nivel ${num}, bloqueado` : `Nivel ${num}${e ? `, ${e} de 3 estrellas` : ''}`;
      return `<button class="nivel-btn ${est}" style="left:${x}%;top:${y}%" data-n="${num}" aria-label="${aria}">
          <span class="nivel-num">${est === 'bloqueado' ? CANDADO : etiqueta}</span>
          ${est === 'bloqueado' ? '' : `<span class="mini-estrellas" aria-hidden="true">${estrellasHtml(e)}</span>`}
        </button>`;
    }).join('');
    n += m.niveles;
    const bloqueado = estadoNivel(primero, progreso) === 'bloqueado';
    const linea = pos.map(([x, y]) => `${x},${y}`).join(' ');
    return `
      <article class="mundo ${m.id}${bloqueado ? ' bloqueado' : ''}">
        <h3><span class="mundo-num">${m.id === 'fuera' ? 'Final' : `Mundo ${m.numero}`}</span>${m.nombre}
          ${bloqueado ? `<span class="mundo-candado" aria-label="bloqueado">${CANDADO}</span>` : ''}</h3>
        ${bloqueado ? '<p class="mundo-aviso">Termina el mundo anterior</p>' : ''}
        <div class="camino camino-${m.niveles}">
          ${m.niveles > 1 ? `<svg class="camino-linea" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <polyline points="${linea}" vector-effect="non-scaling-stroke"/></svg>` : ''}
          ${casillas}
        </div>
      </article>`;
  }).join('');
}

export function mostrarNiveles({ alElegir, alVolver } = {}) {
  const $ = (id) => document.getElementById(id);
  const raiz = $('niveles');
  const progreso = leerProgreso();
  const total = MUNDOS.reduce((a, m) => a + m.niveles, 0) * 3;
  const conseguidas = Object.values(progreso).reduce((a, b) => a + b, 0);
  $('niveles-total').innerHTML = `<i class="estrella-mini"></i>${conseguidas} / ${total}`;
  $('mundos').innerHTML = construir(progreso);
  raiz.classList.remove('saliendo');
  raiz.hidden = false;
  raiz.scrollTop = 0;

  // Salir: la pantalla siguiente se coloca debajo antes del fundido, para que no asome nada
  let vivo = true;
  const salir = (siguiente) => {
    if (!vivo) return;
    vivo = false;
    siguiente?.();
    raiz.classList.add('saliendo');
    setTimeout(() => { raiz.hidden = true; raiz.classList.remove('saliendo'); }, reducido ? 0 : 350);
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
