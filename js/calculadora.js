// Calculadora del libro de texto: un panel pequeño que flota sobre el juego (no lo tapa ni lo
// bloquea), para hacer las cuentas de μ · m · g · d con decimales. Escribe con coma decimal y
// entiende + − × ÷ y paréntesis. No usa eval: tiene su propio analizador de expresiones.

const $ = (id) => document.getElementById(id);
const TECLAS = ['C', '(', ')', '÷', '7', '8', '9', '×', '4', '5', '6', '−', '1', '2', '3', '+', '0', ',', '⌫', '='];
const OPS = '+−×÷';

/** Valor de una expresión como «0,25 × 9,8 × (3 − 1,5)». Lanza un error si no se entiende. */
export function evaluar(txt) {
  const t = txt.replace(/\s+/g, '');
  let i = 0;
  const ver = () => t[i];
  function numero() {
    const m = /^[0-9]+(,[0-9]*)?|^,[0-9]+/.exec(t.slice(i));
    if (!m) throw new Error('número');
    i += m[0].length;
    return Number(m[0].replace(',', '.'));
  }
  function factor() {
    if (ver() === '−' || ver() === '-') { i++; return -factor(); }
    if (ver() === '(') {
      i++;
      const v = suma();
      if (ver() !== ')') throw new Error('paréntesis');
      i++;
      return v;
    }
    return numero();
  }
  function producto() {
    let v = factor();
    while (ver() === '×' || ver() === '÷') {
      const op = t[i++];
      const w = factor();
      v = op === '×' ? v * w : v / w;
    }
    return v;
  }
  function suma() {
    let v = producto();
    while (ver() === '+' || ver() === '−' || ver() === '-') {
      const op = t[i++];
      const w = producto();
      v = op === '+' ? v + w : v - w;
    }
    return v;
  }
  const v = suma();
  if (i < t.length || !Number.isFinite(v)) throw new Error('sobra');
  return v;
}

/** Un resultado, con coma y sin ruido de decimales (como mucho 6). */
export function formatear(v) {
  const r = Math.round(v * 1e6) / 1e6;
  return String(Object.is(r, -0) ? 0 : r).replace('.', ',').replace('-', '−');
}

/**
 * Pone en marcha el botón y el panel de la calculadora. `junto()` da el rectángulo del tablero:
 * la primera vez se abre a su derecha si cabe (si no, centrada abajo). Se mueve arrastrándola
 * por la cabecera y se queda donde la deje el jugador.
 */
export function iniciarCalculadora({ junto } = {}) {
  const boton = $('btn-calculadora'), panel = $('calculadora'), pantalla = $('calc-pantalla');
  const teclas = panel.querySelector('.calc-teclas');
  teclas.innerHTML = TECLAS.map((k) => `<button type="button" data-t="${k}" class="${OPS.includes(k) || k === '=' ? 'op' : ''}${k === '=' ? ' igual' : ''}"
    aria-label="${{ '⌫': 'Borrar', C: 'Borrar todo', '÷': 'entre', '×': 'por', '−': 'menos', '+': 'más', '=': 'igual' }[k] ?? k}">${k}</button>`).join('');
  let expr = '', hecho = false;    // hecho: se acaba de calcular (un número empieza de nuevo)
  const pintar = (txt = expr || '0') => { pantalla.textContent = txt; };

  function pulsar(k) {
    if (k === 'C') { expr = ''; hecho = false; pintar(); return; }
    if (k === '⌫') { expr = hecho ? '' : expr.slice(0, -1); hecho = false; pintar(); return; }
    if (k === '=') {
      if (!expr) return;
      try { expr = formatear(evaluar(expr)); pintar(); } catch { pintar('Error'); expr = ''; }
      hecho = true;
      return;
    }
    if (hecho && !OPS.includes(k)) expr = '';     // tras «=», un número empieza una cuenta nueva
    hecho = false;
    if (OPS.includes(k) && OPS.includes(expr.slice(-1)) && k !== '−') expr = expr.slice(0, -1);   // cambia el operador
    if (k === ',' && /[0-9]*,[0-9]*$/.test(expr.split(/[+−×÷()]/).pop() ?? '')) return;          // una coma por número
    expr += k;
    pintar();
  }

  teclas.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (b) pulsar(b.dataset.t);
  });
  let movida = false;          // el jugador la ha colocado: se respeta su sitio
  const ponerEn = (x, y) => {
    const w = panel.offsetWidth, h = panel.offsetHeight;
    panel.style.left = `${Math.max(4, Math.min(innerWidth - w - 4, x))}px`;
    panel.style.top = `${Math.max(4, Math.min(innerHeight - h - 4, y))}px`;
  };
  function colocar() {
    const t = junto?.(), w = panel.offsetWidth, h = panel.offsetHeight;
    if (t && t.right + 16 + w <= innerWidth - 8) ponerEn(t.right + 16, t.top + Math.max(0, (t.height - h) / 2));   // a la derecha del tablero
    else ponerEn((innerWidth - w) / 2, innerHeight - h - 110);                                                     // centrada, encima de los botones
  }
  const abrir = () => {
    panel.hidden = false;
    boton.setAttribute('aria-expanded', 'true');
    if (!movida) colocar();
    else ponerEn(parseFloat(panel.style.left), parseFloat(panel.style.top));   // (por si ha cambiado la ventana)
  };
  // arrastrar por la cabecera
  const cab = panel.querySelector('.calc-cab');
  let agarre = null;
  cab.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button')) return;
    const r = panel.getBoundingClientRect();
    agarre = { dx: e.clientX - r.left, dy: e.clientY - r.top };
    cab.setPointerCapture(e.pointerId);
    panel.classList.add('arrastrando');
  });
  cab.addEventListener('pointermove', (e) => {
    if (!agarre) return;
    ponerEn(e.clientX - agarre.dx, e.clientY - agarre.dy);
    movida = true;
  });
  const soltar = () => { agarre = null; panel.classList.remove('arrastrando'); };
  cab.addEventListener('pointerup', soltar);
  cab.addEventListener('pointercancel', soltar);
  addEventListener('resize', () => { if (!panel.hidden) (movida ? abrir : colocar)(); });
  const cerrar = () => { panel.hidden = true; boton.setAttribute('aria-expanded', 'false'); };
  boton.addEventListener('click', () => (panel.hidden ? abrir() : cerrar()));
  panel.querySelector('.calc-cerrar').addEventListener('click', cerrar);
  // con teclado (solo con el panel abierto y sin estar escribiendo en otro sitio)
  document.addEventListener('keydown', (e) => {
    if (panel.hidden || e.ctrlKey || e.metaKey || e.altKey) return;
    const k = { '*': '×', x: '×', '/': '÷', '-': '−', '.': ',', Enter: '=', Backspace: '⌫', Delete: 'C', Escape: null }[e.key] ?? e.key;
    if (e.key === 'Escape') { cerrar(); return; }
    if (TECLAS.includes(k)) { e.preventDefault(); pulsar(k); }
  });
  pintar();
  return { cerrar };
}
