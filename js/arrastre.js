// Pieza flotante ("fantasma") que se arrastra o vuela entre la bandeja y el tablero.
//
// Se mueve con un seguimiento suavizado (sin duraciones fijas): cada fotograma recorre
// una fracción de la distancia que le queda hasta su objetivo. Eso le da inercia al
// arrastrarla y hace que los vuelos frenen solos al llegar.

import { dibujarMiniatura, casillasMini } from './dibujo.js';

const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
const PROPS = ['x', 'y', 's', 'r', 'alto'];

export class Fantasma {
  /**
   * @param pieza  pieza del nivel
   * @param celda  casilla del tablero cuya forma dibuja
   * @param lado   lado de una casilla del tablero en píxeles CSS (tamaño a escala 1)
   * @param rect   rectángulo de pantalla desde el que sale (miniatura o hueco)
   * Las piezas dobles miden dos casillas de ancho (horizontales) o de alto (verticales).
   */
  constructor(pieza, celda, lado, rect) {
    this.pieza = pieza;
    const { nx, ny } = casillasMini(pieza);
    this.lado = lado * nx;       // ancho a escala 1 (la escala se mide por el ancho)
    this.altoPx = lado * ny;
    const el = document.createElement('div');
    el.className = 'fantasma';
    el.style.width = `${this.lado}px`;
    el.style.height = `${this.altoPx}px`;
    const cv = document.createElement('canvas');
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    cv.width = Math.round(this.lado * dpr);
    cv.height = Math.round(this.altoPx * dpr);
    const c = cv.getContext('2d');
    c.scale(dpr, dpr);
    dibujarMiniatura(c, lado, celda, pieza);
    el.append(cv);
    document.body.append(el);
    this.el = el;
    this.cv = cv;

    this.x = rect.left + rect.width / 2;
    this.y = rect.top + rect.height / 2;
    this.s = rect.width / this.lado;
    this.r = 0;
    this.alto = 0;
    this.obj = { x: this.x, y: this.y, s: this.s, r: 0, alto: 0 };
    this.objFn = null;
    this.k = 26;
    this.decaerGiro = false;
    this.arco = false;
    this.esperas = [];
    this.vivo = true;
    this.ultimo = performance.now();
    this.aplicar();
    requestAnimationFrame((t) => this.paso(t));
  }

  /** Nuevo objetivo: valores fijos o una función que se evalúa en cada fotograma. */
  ir(obj, k = 26) {
    if (typeof obj === 'function') this.objFn = obj;
    else {
      this.objFn = null;
      Object.assign(this.obj, obj);
    }
    this.k = k;
  }

  /** Promesa que se cumple cuando alcanza el objetivo actual. */
  llegar() {
    return new Promise((res) => this.esperas.push(res));
  }

  paso(t) {
    if (!this.vivo) return;
    const dt = Math.min(0.05, Math.max(0, (t - this.ultimo) / 1000));
    this.ultimo = t;
    if (this.objFn) Object.assign(this.obj, this.objFn());
    if (this.decaerGiro) this.obj.r *= Math.exp(-6 * dt);
    // en los vuelos, la pieza "sube" (más sombra) mientras le queda camino y se posa al llegar
    if (this.arco) this.obj.alto = Math.min(22, Math.hypot(this.obj.x - this.x, this.obj.y - this.y) * 0.12);
    const a = reducido ? 1 : 1 - Math.exp(-this.k * dt);
    for (const p of PROPS) this[p] += (this.obj[p] - this[p]) * a;
    const cerca = Math.abs(this.obj.x - this.x) + Math.abs(this.obj.y - this.y) < 0.8
      && Math.abs(this.obj.s - this.s) < 0.006;
    if (cerca && this.esperas.length) {
      for (const p of PROPS) this[p] = this.obj[p];
      const e = this.esperas;
      this.esperas = [];
      e.forEach((f) => f());
    }
    this.aplicar();
    requestAnimationFrame((tt) => this.paso(tt));
  }

  aplicar() {
    const mx = this.lado / 2, my = this.altoPx / 2;
    this.el.style.transform =
      `translate(${(this.x - mx).toFixed(2)}px, ${(this.y - my).toFixed(2)}px) rotate(${this.r.toFixed(2)}deg) scale(${this.s.toFixed(4)})`;
    this.el.style.setProperty('--alto', this.alto.toFixed(1));
  }

  /** Marca la pieza como enganchada a un hueco (borde naranja). */
  enganchar(si) {
    this.el.classList.toggle('enganchada', si);
  }

  /** Pequeño rebote al encajar. */
  rebote() {
    if (reducido) return Promise.resolve();
    return this.cv.animate(
      [{ transform: 'scale(1.1)' }, { transform: 'scale(0.95)' }, { transform: 'scale(1.02)' }, { transform: 'scale(1)' }],
      { duration: 280, easing: 'ease-out' },
    ).finished.catch(() => {});
  }

  /** Desaparece (con un fundido corto o al instante). */
  async quitar(fundido = true) {
    if (fundido && !reducido) {
      await this.el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 140, fill: 'forwards' }).finished.catch(() => {});
    }
    this.vivo = false;
    this.el.remove();
  }
}
