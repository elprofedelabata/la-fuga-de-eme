// Pone a cada archivo del juego su «versión» en index.html, para que al publicar los
// navegadores no se queden con copias viejas guardadas en caché.
//
// La versión es un trozo del hash del contenido del archivo: solo cambia cuando cambia el
// archivo, así que el navegador vuelve a descargar lo que se ha tocado y nada más.
//
// - La hoja de estilos, los modulepreload y main.js llevan «?v=…» en la dirección.
// - Un import map traduce cada «js/x.js» a «js/x.js?v=…», así que los import entre módulos
//   (que no llevan versión) también piden la versión nueva.
//
// Uso (antes de cada commit que toque js/ o css/):  node herramientas/versionar.mjs

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const version = (ruta) => createHash('sha1').update(readFileSync(join(raiz, ruta))).digest('hex').slice(0, 8);

const modulos = readdirSync(join(raiz, 'js')).filter((f) => f.endsWith('.js')).sort();
const v = Object.fromEntries(modulos.map((f) => [`js/${f}`, version(`js/${f}`)]));

let html = readFileSync(join(raiz, 'index.html'), 'utf8');

// hoja de estilos
html = html.replace(/href="css\/estilos\.css(\?v=\w+)?"/, `href="css/estilos.css?v=${version('css/estilos.css')}"`);
// modulepreload y main.js
html = html.replace(/(href|src)="(js\/[\w-]+\.js)(\?v=\w+)?"/g, (m, attr, ruta) => (v[ruta] ? `${attr}="${ruta}?v=${v[ruta]}"` : m));

// el import map (va antes del primer modulepreload)
const mapa = JSON.stringify({ imports: Object.fromEntries(modulos.map((f) => [`./js/${f}`, `./js/${f}?v=${v[`js/${f}`]}`])) }, null, 2)
  .split('\n').map((l) => `  ${l}`).join('\n');
const bloque = `<!-- versiones: lo escribe herramientas/versionar.mjs -->\n  <script type="importmap">\n${mapa}\n  </script>\n  <!-- /versiones -->`;
if (html.includes('<!-- versiones')) {
  html = html.replace(/<!-- versiones[\s\S]*?<!-- \/versiones -->/, bloque);
} else {
  html = html.replace(/(\s*)<link rel="modulepreload"/, `$1${bloque}$1<link rel="modulepreload"`);
}

writeFileSync(join(raiz, 'index.html'), html);
console.log(`Versionados ${modulos.length} módulos y la hoja de estilos.`);
