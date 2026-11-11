// Texto que se escribe letra a letra en un bocadillo.
//
// El texto entero está siempre puesto: lo que aún no se ha «escrito» va invisible. Así las
// líneas se parten desde el principio igual que al final y ninguna palabra salta de línea
// mientras se escribe.

/**
 * Une lo que no debe quedar en líneas distintas: cada número con la palabra que le sigue
 * («7 julitos»), las citas cortas entre comillas («sin rozamiento») y las dos últimas
 * palabras, para que la última línea nunca se quede con una palabra suelta.
 */
export function sinCortes(texto) {
  return texto
    .replace(/(\d+) /g, '$1 ')
    .replace(/«[^»]{1,24}»/g, (cita) => cita.replace(/ /g, ' '))
    .replace(/ (\S{1,14})$/, ' $1');
}

/** Prepara `el` para escribir `texto` (aún sin ninguna letra a la vista). */
export function prepararEscritura(el, texto) {
  el.innerHTML = '<span class="escrito-ya"></span><span class="escrito-falta"></span>';
  mostrarLetras(el, texto, 0);
}

/** Deja a la vista las `n` primeras letras de `texto`. */
export function mostrarLetras(el, texto, n) {
  el.firstChild.textContent = texto.slice(0, n);
  el.lastChild.textContent = texto.slice(n);
}
