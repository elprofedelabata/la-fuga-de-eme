// Ventana de opciones.
//
// De momento solo es interfaz: las opciones se recuerdan en el navegador pero aún no se
// aplican. La excepción es «Borrar progreso», que borra todo lo guardado del juego.

const CLAVE = 'fuga-eme-opciones';
const PREFIJO = 'fuga-eme-';          // todo lo que guarda el juego empieza así
const POR_DEFECTO = { calidad: 'alta', tema: 'claro', volumen: 80, musica: 70, efectos: 80 };

export function leerOpciones() {
  try { return { ...POR_DEFECTO, ...JSON.parse(localStorage.getItem(CLAVE)) }; } catch { return { ...POR_DEFECTO }; }
}

function guardar(opciones) {
  try { localStorage.setItem(CLAVE, JSON.stringify(opciones)); } catch { /* sin almacenamiento */ }
}

/** Borra todo lo que el juego guarda en este navegador. */
export function borrarProgreso() {
  try {
    Object.keys(localStorage).filter((k) => k.startsWith(PREFIJO)).forEach((k) => localStorage.removeItem(k));
  } catch { /* sin almacenamiento */ }
}

let preparado = false;

function preparar(dialogo) {
  if (preparado) return;
  preparado = true;
  const $ = (id) => document.getElementById(id);

  const pintarDeslizador = (input) => {
    input.style.setProperty('--lleno', `${input.value}%`);
    input.nextElementSibling.value = `${input.value} %`;
  };

  dialogo.addEventListener('input', (e) => {
    const el = e.target;
    if (!el.name) return;
    const opciones = leerOpciones();
    opciones[el.name] = el.type === 'range' ? Number(el.value) : el.value;
    guardar(opciones);
    if (el.type === 'range') pintarDeslizador(el);
  });

  $('opciones-cerrar').onclick = () => dialogo.close();
  // tocar fuera de la ventana la cierra
  dialogo.addEventListener('click', (e) => { if (e.target === dialogo) dialogo.close(); });

  const confirmar = $('borrar-confirmar');
  $('btn-borrar').onclick = () => {
    $('btn-borrar').hidden = true;
    confirmar.hidden = false;
    $('btn-borrar-no').focus();
  };
  $('btn-borrar-no').onclick = () => {
    confirmar.hidden = true;
    $('btn-borrar').hidden = false;
  };
  $('btn-borrar-si').onclick = () => {
    borrarProgreso();
    confirmar.hidden = true;
    $('borrar-hecho').hidden = false;
    setTimeout(() => location.reload(), 900);   // vuelve a empezar como la primera vez
  };
  dialogo.addEventListener('close', () => {
    confirmar.hidden = true;
    $('btn-borrar').hidden = false;
  });

  dialogo._pintar = pintarDeslizador;
}

export function abrirOpciones() {
  const dialogo = document.getElementById('opciones');
  preparar(dialogo);
  const opciones = leerOpciones();
  for (const [nombre, valor] of Object.entries(opciones)) {
    const campos = dialogo.querySelectorAll(`[name="${nombre}"]`);
    campos.forEach((c) => {
      if (c.type === 'radio') c.checked = c.value === valor;
      else { c.value = valor; dialogo._pintar(c); }
    });
  }
  dialogo.showModal();
}
