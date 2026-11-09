// Validador de niveles: prueba todas las combinaciones de piezas, simula cada una y
// comprueba que el final de la simulación coincide con las cuentas en julitos.
// Uso: node herramientas/validar-nivel.mjs

import { NIVEL } from '../js/nivel.js';
import { prepararRecorrido, nuevaSimulacion, avanzar, analizar, muestra } from '../js/pista.js';

const huecos = Object.entries(NIVEL.huecos).map(([c, forma]) => [Number(c), NIVEL.piezas.filter((p) => p.forma === forma)]);

function combinaciones(i = 0, acc = {}) {
  if (i === huecos.length) return [{ ...acc }];
  const [c, opciones] = huecos[i];
  return opciones.flatMap((p) => combinaciones(i + 1, { ...acc, [c]: p }));
}

function simular(colocadas) {
  const rec = prepararRecorrido(NIVEL, colocadas);
  const sim = nuevaSimulacion(rec, NIVEL);
  const dt = 1 / 60;
  let maxH = 0, primerGiroX = null;
  let llegoRepisa = false;
  while (sim.t < 25) {
    const vueltas = sim.vueltas;
    avanzar(sim, rec, NIVEL, dt);
    if (sim.estado === 'rodando' || sim.estado === 'tambaleo') {
      const m = muestra(rec, sim.s);
      if (m.x > 6.5) maxH = Math.max(maxH, m.h);
      if (m.h > NIVEL.meta.altura - 0.05 && m.x > 7.3) llegoRepisa = true;
    }
    if (sim.vueltas > vueltas && primerGiroX === null) primerGiroX = muestra(rec, sim.s).x;
    if (sim.estado === 'meta') return { fin: 'meta', sim, x: muestra(rec, sim.s).x };
    if (sim.estado === 'cayendo') return { fin: 'pasaste', sim };
    if (sim.vueltas > 0 && !llegoRepisa) return { fin: 'nollega', sim, maxH };
    if (sim.estado === 'parado') return { fin: 'parado', sim };
  }
  return { fin: 'tiempo', sim };
}

let errores = 0, soluciones = 0;
console.log(`Nivel ${NIVEL.numero} · ${NIVEL.titulo}\n`);
for (const comb of combinaciones()) {
  const a = analizar(NIVEL, comb);
  const r = simular(comb);
  const ok = a.tipo === r.fin;
  if (!ok) errores++;
  if (a.tipo === 'meta') soluciones++;
  const nombres = Object.values(comb).map((p) => p.nombre.join(' ')).join(' + ');
  console.log(`${ok ? '✓' : '✗'} ${nombres.padEnd(42)} pierde ${a.perdidas} · llega con ${String(a.llegada).padStart(2)} → ${a.tipo.padEnd(8)} simulación: ${r.fin} (t=${r.sim.t.toFixed(1)} s${r.x ? `, se para en x=${r.x.toFixed(2)}` : ''})`);
}
console.log(`\n${soluciones} solución(es) · ${errores} discrepancia(s)`);
process.exit(errores || soluciones !== 1 ? 1 : 0);
