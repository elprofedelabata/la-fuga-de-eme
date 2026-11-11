// Validador de niveles: para cada nivel, prueba todas las combinaciones de piezas, simula
// cada una y comprueba que el final de la simulación coincide con las cuentas en julitos
// que hay exactamente una solución (o las que diga el nivel en `soluciones`) y que cada
// nivel empieza a la altura a la que acabó el anterior.
// Uso: node herramientas/validar-nivel.mjs        (todos los niveles)
//      node herramientas/validar-nivel.mjs 3      (solo el nivel 3)

import { NIVELES, usarNivel } from '../js/nivel.js';
import { prepararRecorrido, nuevaSimulacion, avanzar, analizar, muestra, inicioRepisa } from '../js/pista.js';

function combinaciones(nivel) {
  const huecos = Object.entries(nivel.huecos).map(([c, forma]) => [Number(c), nivel.piezas.filter((p) => p.forma === forma)]);
  const rec = (i, acc) => {
    if (i === huecos.length) return [{ ...acc }];
    const [c, opciones] = huecos[i];
    // una misma pieza no puede estar en dos huecos
    return opciones.filter((p) => !Object.values(acc).includes(p)).flatMap((p) => rec(i + 1, { ...acc, [c]: p }));
  };
  return rec(0, {});
}

function simular(nivel, colocadas) {
  const rec = prepararRecorrido(nivel, colocadas);
  const sim = nuevaSimulacion(rec, nivel);
  let llegoRepisa = false;
  while (sim.t < 25) {
    avanzar(sim, rec, nivel, 1 / 60);
    if (sim.estado === 'rodando') {
      const m = muestra(rec, sim.s);
      if (m.h > nivel.meta.altura - 0.05 && m.x > inicioRepisa(nivel) - 0.1) llegoRepisa = true;
    }
    if (sim.estado === 'meta') return { fin: 'meta', sim, x: muestra(rec, sim.s).x };
    if (sim.estado === 'cayendo') return { fin: 'pasaste', sim };
    if (sim.vueltas > 0 && !llegoRepisa) return { fin: 'nollega', sim };
    if (sim.estado === 'parado') return { fin: 'nollega', sim };   // se para en llano sin llegar
  }
  return { fin: 'tiempo', sim };
}

const pedido = Number(process.argv[2]);
let fallos = 0;
for (const nivel of Object.values(NIVELES)) {
  if (pedido && nivel.numero !== pedido) continue;
  usarNivel(nivel.numero);
  let errores = 0, soluciones = 0;
  console.log(`\nNivel ${nivel.numero} · ${nivel.titulo}  (sale con ${nivel.energia}, meta a altura ${nivel.meta.altura})`);
  for (const comb of combinaciones(nivel)) {
    const a = analizar(nivel, comb);
    const r = simular(nivel, comb);
    const ok = a.tipo === r.fin;
    if (!ok) errores++;
    if (a.tipo === 'meta') soluciones++;
    const nombres = Object.values(comb).map((p) => p.nombre.join(' ')).join(' + ');
    console.log(`${ok ? '✓' : '✗'} ${nombres.padEnd(48)} pierde ${a.perdidas} · llega con ${String(a.llegada).padStart(2)} → ${a.tipo.padEnd(8)} simulación: ${r.fin} (t=${r.sim.t.toFixed(1)} s${r.x ? `, se para en x=${r.x.toFixed(2)}` : ''})`);
  }
  // Continuidad: empieza donde acabó el nivel anterior
  const anterior = NIVELES[nivel.numero - 1];
  const continua = !anterior || anterior.meta.altura === nivel.energia;
  if (!continua) console.log(`✗ No empieza donde acabó el nivel ${anterior.numero}: sale de ${nivel.energia} y aquel acababa en ${anterior.meta.altura}`);
  const esperadas = nivel.soluciones ?? 1;
  const bien = errores === 0 && soluciones === esperadas && continua;
  if (!bien) fallos++;
  console.log(`${bien ? 'OK' : 'REVISAR'}: ${soluciones} solución(es), se esperaban ${esperadas} · ${errores} discrepancia(s)`);
}
process.exit(fallos ? 1 : 0);
