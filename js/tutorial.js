// Mano fantasma del tutorial: enseña a arrastrar cada pieza a su hueco y, cuando están
// todas, a pulsar LANZAR. Se repite en bucle mientras haga falta y se esconde en cuanto
// el jugador hace algo (arrastrar, abrir un menú, lanzar…).

const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
const PUNTA = [16, 6];   // punta del dedo dentro de la imagen de 46 px (en el SVG de 32 px está en 11, 4)

/**
 * @param activo     () => bool: si ahora toca enseñar algo
 * @param siguiente  () => { desde, hasta } (arrastrar) | { pulsar } (rectángulos) | null
 */
export function iniciarTutorial({ activo, siguiente }) {
  const mano = document.createElement('img');
  mano.src = 'img/cursores/dedo.svg';
  mano.alt = '';
  mano.className = 'tutorial-mano';
  mano.hidden = true;
  document.body.append(mano);

  let animacion = null;
  const centro = (r) => [r.left + r.width / 2 - PUNTA[0], r.top + r.height / 2 - PUNTA[1]];
  const en = ([x, y], extra = '') => `translate(${x}px, ${y}px) ${extra}`;

  const parar = () => {
    animacion?.cancel();
    animacion = null;
    mano.hidden = true;
  };

  const ciclo = () => {
    if (reducido || !activo()) {
      parar();
      setTimeout(ciclo, 700);
      return;
    }
    const paso = siguiente();
    if (!paso) {
      parar();
      setTimeout(ciclo, 700);
      return;
    }
    mano.hidden = false;
    if (paso.pulsar) {
      const p = centro(paso.pulsar);
      animacion = mano.animate([
        { transform: en([p[0] + 30, p[1] + 40]), opacity: 0 },
        { transform: en(p), opacity: 1, offset: 0.25 },
        { transform: en(p, 'scale(0.82)'), offset: 0.36 },
        { transform: en(p), offset: 0.46 },
        { transform: en(p, 'scale(0.82)'), offset: 0.58 },
        { transform: en(p), opacity: 1, offset: 0.7 },
        { transform: en(p), opacity: 0 },
      ], { duration: 2200, easing: 'ease-in-out' });
    } else {
      const a = centro(paso.desde), b = centro(paso.hasta);
      animacion = mano.animate([
        { transform: en(a), opacity: 0 },
        { transform: en(a), opacity: 1, offset: 0.12 },
        { transform: en(a, 'scale(0.84)'), offset: 0.22 },          // coge la pieza
        { transform: en(b, 'scale(0.84)'), offset: 0.7 },           // la lleva a su hueco
        { transform: en(b), opacity: 1, offset: 0.8 },              // la suelta
        { transform: en(b), opacity: 0 },
      ], { duration: 2600, easing: 'ease-in-out' });
    }
    animacion.finished.then(() => setTimeout(ciclo, 500), () => setTimeout(ciclo, 500));
  };

  // si el jugador se pone a hacer cosas, la mano se aparta enseguida
  addEventListener('pointerdown', () => { if (!mano.hidden) parar(); }, true);
  setTimeout(ciclo, 1200);
}

