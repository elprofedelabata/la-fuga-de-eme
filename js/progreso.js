// Progreso del jugador guardado en el navegador: una estrella por nivel superado.
// (Versiones antiguas guardaban de 1 a 3 estrellas: cualquier número cuenta como superado.)

const CLAVE = 'fuga-eme-progreso';

export function leerProgreso() {
  try { return JSON.parse(localStorage.getItem(CLAVE)) ?? {}; } catch { return {}; }
}

/** 1 si el nivel está superado (tiene su estrella), 0 si no. */
export function estrellasDe(nivel) {
  return leerProgreso()[nivel] ? 1 : 0;
}

/** Marca el nivel como superado: se gana su estrella. */
export function guardarEstrellas(nivel) {
  const p = leerProgreso();
  if (p[nivel]) return;
  p[nivel] = 1;
  try { localStorage.setItem(CLAVE, JSON.stringify(p)); } catch { /* sin almacenamiento */ }
}
