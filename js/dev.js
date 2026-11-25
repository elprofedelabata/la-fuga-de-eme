// Herramientas de desarrollo: solo aparecen con «?dev» en la dirección.
//
// Un botón «DEV» flotante abre un panel para trastear con el progreso sin borrarlo todo:
// por cada nivel, jugarlo directamente, marcarlo o desmarcarlo como superado, o dejarlo
// «como nuevo» (sin estrella y con sus ayudas: charla, bienvenida y guía); y acciones
// generales para todos los niveles y para volver a ver las escenas.

import { NIVELES, NIVELES_JUGABLES } from './nivel.js';
import { leerProgreso } from './progreso.js';

const CLAVE_PROGRESO = 'fuga-eme-progreso';
const leer = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const quitar = (k) => { try { localStorage.removeItem(k); } catch { /* da igual */ } };
const poner = (k, v) => { try { localStorage.setItem(k, v); } catch { /* da igual */ } };

function guardarProgreso(p) { poner(CLAVE_PROGRESO, JSON.stringify(p)); }

function marcar(n, superado) {
  const p = leerProgreso();
  if (superado) p[n] = 1; else delete p[n];
  guardarProgreso(p);
}

/** Deja un nivel como la primera vez: sin estrella y con todas sus ayudas. */
function comoNuevo(n) {
  marcar(n, false);
  quitar(`fuga-eme-charla-${n}-vista`);
  if (NIVELES[n]?.bienvenida) quitar('fuga-eme-bienvenida-vista');
}

const niveles = () => [...NIVELES_JUGABLES].sort((a, b) => a - b);

/**
 * Pone el botón y el panel. Recibe del juego cómo jugar un nivel, abrir el mapa y ver las
 * escenas, y avisa con `alCambiar` cuando cambia el progreso (para repintar lo que haga falta).
 */
export function iniciarDev({ jugar, abrirMapa, verHistoria, verFin }) {
  const boton = document.createElement('button');
  boton.className = 'dev-boton';
  boton.textContent = 'DEV';
  boton.title = 'Herramientas de desarrollo';

  const panel = document.createElement('dialog');
  panel.className = 'dev-panel';
  panel.setAttribute('aria-label', 'Herramientas de desarrollo');
  document.body.append(boton, panel);

  const aviso = (txt) => {
    const el = panel.querySelector('.dev-aviso');
    if (!el) return;
    el.textContent = txt;
    el.classList.remove('visto'); void el.offsetWidth; el.classList.add('visto');
  };

  const pintar = () => {
    const p = leerProgreso();
    const filas = niveles().map((n) => {
      const ayuda = NIVELES[n].charla || NIVELES[n].bienvenida || NIVELES[n].guia;
      return `<tr>
        <th>${n}</th>
        <td class="dev-titulo">${NIVELES[n].titulo}</td>
        <td><button data-accion="jugar" data-n="${n}" title="Jugar este nivel">▶</button></td>
        <td><button data-accion="estrella" data-n="${n}" class="${p[n] ? 'si' : ''}" title="Superado (sí o no)">★</button></td>
        <td><button data-accion="nuevo" data-n="${n}" title="Como nuevo: sin estrella${ayuda ? ' y con sus ayudas' : ''}">↺</button></td>
      </tr>`;
    }).join('');
    panel.innerHTML = `
      <header><h2>Desarrollo</h2><button data-accion="cerrar" aria-label="Cerrar">✕</button></header>
      <p class="dev-ayuda">▶ jugar · ★ superado (sí/no) · ↺ como nuevo (sin estrella y con sus ayudas)</p>
      <table>${filas}</table>
      <div class="dev-generales">
        <button data-accion="todos">★ Superar todos</button>
        <button data-accion="ninguno">☆ Quitar todas las estrellas</button>
        <button data-accion="ayudas">↺ Volver a ver todas las ayudas</button>
        <button data-accion="mapa">Abrir el mapa</button>
        <button data-accion="historia">Ver la historia</button>
        <button data-accion="fin">Ver el final del cuaderno</button>
      </div>
      <p class="dev-aviso" aria-live="polite"></p>`;
  };

  boton.addEventListener('click', () => { pintar(); panel.showModal(); });
  panel.addEventListener('click', (e) => {
    if (e.target === panel) { panel.close(); return; }      // clic fuera del panel
    const b = e.target.closest('button');
    if (!b) return;
    const n = Number(b.dataset.n);
    switch (b.dataset.accion) {
      case 'cerrar': panel.close(); return;
      case 'jugar': panel.close(); jugar(n); return;
      case 'estrella': marcar(n, !leerProgreso()[n]); pintar(); aviso(`Nivel ${n}: ${leerProgreso()[n] ? 'superado' : 'sin superar'}`); return;
      case 'nuevo': comoNuevo(n); pintar(); aviso(`Nivel ${n} como nuevo`); return;
      case 'todos': guardarProgreso(Object.fromEntries(niveles().map((k) => [k, 1]))); pintar(); aviso('Todos superados'); return;
      case 'ninguno': guardarProgreso({}); pintar(); aviso('Sin estrellas'); return;
      case 'ayudas':
        niveles().forEach((k) => quitar(`fuga-eme-charla-${k}-vista`));
        quitar('fuga-eme-bienvenida-vista');
        aviso('Las ayudas volverán a salir');
        return;
      case 'mapa': panel.close(); abrirMapa(); return;
      case 'historia': panel.close(); verHistoria(); return;
      case 'fin': panel.close(); verFin(); return;
      default:
    }
  });
  // (para depurar desde la consola)
  window.feme = { marcar, comoNuevo, leer };
}
