// Progreso del jugador guardado en el navegador: mejores estrellas por nivel.

const CLAVE = 'fuga-eme-progreso';

export function leerProgreso() {
  try { return JSON.parse(localStorage.getItem(CLAVE)) ?? {}; } catch { return {}; }
}

export function estrellasDe(nivel) {
  return leerProgreso()[nivel] ?? 0;
}

/** Guarda las estrellas de un nivel si mejoran las anteriores. */
export function guardarEstrellas(nivel, estrellas) {
  const p = leerProgreso();
  if (estrellas <= (p[nivel] ?? 0)) return;
  p[nivel] = estrellas;
  try { localStorage.setItem(CLAVE, JSON.stringify(p)); } catch { /* sin almacenamiento */ }
}
