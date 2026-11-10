// Transición entre pantallas: arrancar la hoja.
//
// La pantalla que se va se rasga por una línea irregular junto al borde izquierdo (como una
// hoja arrancada de un cuaderno de espiral) y sale volando girando, mientras debajo ya está
// la siguiente. A la izquierda queda un momento la tira rota con los agujeros de la espiral.

const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
const SVG = 'http://www.w3.org/2000/svg';
const DURACION = 720;

let contador = 0;

/** Línea de rotura irregular, de arriba abajo, en píxeles. */
function lineaDeRotura(alto) {
  const n = Math.max(18, Math.round(alto / 24));
  const pts = [];
  for (let i = 0; i <= n; i++) pts.push([17 + Math.random() * 15, (alto * i) / n]);
  return pts;
}

function elementoSvg(ancho, alto, estilo) {
  const svg = document.createElementNS(SVG, 'svg');
  svg.setAttribute('width', ancho);
  svg.setAttribute('height', alto);
  svg.setAttribute('aria-hidden', 'true');
  Object.assign(svg.style, { position: 'absolute', pointerEvents: 'none', overflow: 'visible', ...estilo });
  return svg;
}

/** Tira que queda en el cuaderno: papel cuadriculado, borde roto y agujeros de la espiral. */
function crearTira(pts, alto) {
  const svg = elementoSvg(60, alto, { position: 'fixed', left: '0', top: '0', zIndex: '56' });
  const id = `cuadri-${contador}`;
  const borde = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  let agujeros = '';
  for (let y = 16; y < alto; y += 26) agujeros += `<circle cx="8.5" cy="${y}" r="3.6"/>`;
  svg.innerHTML = `
    <defs><pattern id="${id}" width="20" height="20" patternUnits="userSpaceOnUse">
      <rect width="20" height="20" fill="#f7f2e4"/><path d="M0 0.5H20M0.5 0V20" stroke="#d9e6f3" stroke-width="1"/>
    </pattern></defs>
    <polygon points="0,0 ${borde} 0,${alto}" fill="url(#${id})"/>
    <polyline points="${borde}" fill="none" stroke="#3a3530" stroke-width="1.8" stroke-linejoin="round"/>
    <g fill="#3a3530" opacity="0.75">${agujeros}</g>`;
  return svg;
}

/** Trazo del borde roto que viaja con la hoja arrancada. */
function crearBorde(pts, alto, arriba) {
  const svg = elementoSvg(60, alto, { left: '0', top: `${arriba}px`, zIndex: '100' });
  const borde = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  svg.innerHTML = `<polyline points="${borde}" fill="none" stroke="#3a3530" stroke-width="2" stroke-linejoin="round"/>`;
  return svg;
}

/** Deshace una transición a medias (por si se vuelve a abrir la pantalla mientras se arranca). */
export function restaurar(el) {
  el.dataset.arranque = '';
  el.getAnimations?.().forEach((a) => { if (a.id === 'arrancar') a.cancel(); });
  el.style.clipPath = '';
  el.style.zIndex = '';
  el.querySelectorAll(':scope > .borde-roto').forEach((b) => b.remove());
}

/**
 * Arranca la pantalla `el`. Primero llama a `antes()` (para colocar debajo la pantalla
 * siguiente) y, al terminar, oculta `el`. Devuelve una promesa.
 */
export function arrancar(el, { antes } = {}) {
  return new Promise((listo) => {
    antes?.();
    if (reducido) {
      el.hidden = true;
      listo();
      return;
    }
    const marca = String(++contador);
    el.dataset.arranque = marca;
    const W = el.clientWidth || innerWidth, H = el.clientHeight || innerHeight;
    const pts = lineaDeRotura(H);
    const px = ([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`;
    el.style.clipPath = `polygon(${px(pts[0])}, ${W}px 0px, ${W}px ${H}px, ${pts.slice().reverse().map(px).join(', ')})`;
    el.style.zIndex = '55';

    const borde = crearBorde(pts, H, el.scrollTop);
    borde.classList.add('borde-roto');
    el.append(borde);
    const tira = crearTira(pts, H);
    document.body.append(tira);

    const vuelo = el.animate([
      { transform: 'translate(0, 0) rotate(0deg)', offset: 0 },
      { transform: 'translate(8px, -5px) rotate(-1.4deg)', offset: 0.16 },
      { transform: `translate(${W * 0.85}px, ${-H * 0.2}px) rotate(21deg) scale(0.94)`, opacity: 1, offset: 0.78 },
      { transform: `translate(${W * 1.15}px, ${-H * 0.3}px) rotate(27deg) scale(0.9)`, opacity: 0, offset: 1 },
    ], { duration: DURACION, easing: 'cubic-bezier(0.5, 0, 0.75, 0.25)', fill: 'forwards', id: 'arrancar' });

    tira.animate([
      { transform: 'translateX(0)', opacity: 1 },
      { transform: 'translateX(-70px)', opacity: 0 },
    ], { duration: 320, delay: DURACION - 220, easing: 'ease-in', fill: 'forwards' });

    const terminar = () => {
      setTimeout(() => tira.remove(), 120);
      if (el.dataset.arranque !== marca) return;    // se volvió a abrir mientras tanto
      el.hidden = true;
      vuelo.cancel();
      restaurar(el);
      listo();
    };
    vuelo.finished.then(terminar, terminar);
  });
}
