// Capa de foco: oscurece toda la pantalla salvo unas zonas (huecos redondeados con el
// borde suave). Las zonas se recalculan en cada fotograma, así que siguen a sus elementos
// aunque cambie el tamaño de la ventana. No captura toques: lo que no se puede usar se
// bloquea en la lógica del juego.

const SVG = 'http://www.w3.org/2000/svg';
let capa = null, mascara = null, vivo = false, zonasActuales = () => [];

function crear() {
  capa = document.createElementNS(SVG, 'svg');
  capa.classList.add('foco');
  capa.setAttribute('aria-hidden', 'true');
  capa.innerHTML = `
    <defs>
      <filter id="foco-suave"><feGaussianBlur stdDeviation="5"/></filter>
      <mask id="foco-mascara" maskUnits="userSpaceOnUse"><rect width="100%" height="100%" fill="#fff"/><g filter="url(#foco-suave)"></g></mask>
    </defs>
    <rect width="100%" height="100%" fill="rgb(30,26,22)" mask="url(#foco-mascara)"/>`;
  mascara = capa.querySelector('mask g');
  document.body.append(capa);
}

/**
 * Muestra el foco. `zonas()` devuelve una lista de rectángulos de pantalla
 * ({ left, top, width, height }) que quedan iluminados.
 */
export function mostrarFoco(zonas) {
  if (!capa) crear();
  zonasActuales = zonas;
  capa.classList.add('visible');
  if (vivo) return;          // ya está a la vista: solo cambian las zonas
  vivo = true;
  const pintar = () => {
    if (!vivo) return;
    mascara.innerHTML = zonasActuales().filter(Boolean).map((r) => {
      const m = 8;
      return `<rect x="${r.left - m}" y="${r.top - m}" width="${r.width + 2 * m}" height="${r.height + 2 * m}" rx="16" fill="#000"/>`;
    }).join('');
    requestAnimationFrame(pintar);
  };
  pintar();
}

export function quitarFoco() {
  vivo = false;
  capa?.classList.remove('visible');
}
