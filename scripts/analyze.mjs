// Análisis de riesgos de auditoría FASE 2 (solo lectura, sin cambiar el juego).
// Uso: node scripts/analyze.mjs  -> scripts/simulate.analysis.md
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { run } from "./simulate.mjs";
import rebirthReq from "../src/components/rebirs/rebirthReq.js";
import MineriaX from "../src/components/upgrader/MineriaX.js";

const DIR = dirname(fileURLToPath(import.meta.url));
const reqByLevel = new Map(rebirthReq.map((r) => [r.level, r]));
const fmtT = (s) => {
  if (!Number.isFinite(s)) return "—";
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m ${Math.floor(s % 60)}s`;
};

const base = { cps: 3, auto: true, bonus: true, vaultEvery: 60, golden: "none", shop: "A", growth: 0.08, matrix: false, md: false };
console.log("Corriendo base 48h (cps 1/3/6) + larga 200h (cps 3)... Solo lectura.");
const r1 = run({ ...base, cps: 1, maxHours: 48 });
const r3 = run({ ...base, cps: 3, maxHours: 48 });
const r6 = run({ ...base, cps: 6, maxHours: 48 });
const rLong = run({ ...base, cps: 3, maxHours: 200 });

const L = ["# Análisis de balance — Clicker Empire (FASE 2)", ""];
L.push("_Derivado del simulador greedy. Ningún valor del juego fue modificado._");
L.push("");

// ---- 1) Ejército: ¿cuándo se puede pagar cada tropa vs cuándo se desbloquea?
L.push("## 1. Ejército: desbloqueo vs primera compra real");
L.push("");
L.push("| Tropa | Desbloqueo | 1ª compra (cps3) | RB compra | Costo 1ª compra | Req dinero de ese RB |");
L.push("|---|---|---|---|---|---|");
const troops = [
  ["Soldado", 3, 25000], ["Arquero", 4, 70000],
  ["Caballero", 5, 200000], ["General", 6, 600000],
];
for (const [name, reqRb] of troops) {
  const fb = rLong.firstBuy.get(name);
  const buy = rLong.log.find((e) => e.label === name);
  const req = reqByLevel.get(fb ? fb.rb : reqRb);
  L.push(`| ${name} | RB${reqRb} | ${fb ? fmtT(fb.t) : "nunca"} | ${fb ? "RB" + fb.rb : "—"} | $${buy ? buy.cost.toLocaleString("es-AR") : "—"} | $${req.money.toLocaleString("es-AR")} (RB${fb ? fb.rb : reqRb}) |`);
}
L.push("");

// ---- 2) Minería T0: amortización y compra temprana
L.push("## 2. Minería T0: amortización (costo / $/s) y compra real");
L.push("");
L.push("| Rig | Costo | $/s | Amortización | 1ª compra (cps3) |");
L.push("|---|---|---|---|---|");
for (const rig of MineriaX.filter((r) => r.reqRebirth === 0)) {
  const fb = rLong.firstBuy.get("Mina " + rig.name);
  L.push(`| ${rig.name} | $${rig.cost.toLocaleString("es-AR")} | ${rig.value} | ${Math.round(rig.cost / rig.value)}s (~${(rig.cost / rig.value / 60).toFixed(0)} min) | ${fb ? `${fmtT(fb.t)} (RB${fb.rb})` : "nunca"} |`);
}
L.push("");

// ---- 3) Permanentes sin máximo: fracción del ingreso por RB
L.push("## 3. Fracción del ingreso por sistema al llegar a cada RB (cps3, 200h)");
L.push("");
L.push("| RB | Click% | Auto% | Pasivo% | Minería% | Saqueo% | Click: mult vs planos | Pasivo: fondo/ciudad/disc |");
L.push("|---|---|---|---|---|---|---|---|");
for (const r of rLong.rows) {
  if (!Number.isFinite(r.seg)) continue;
  const tot = r.clickPS + r.autoPS + r.passivePS + r.miningPS + r.raidPS || 1;
  const pct = (v) => ((100 * v) / tot).toFixed(1);
  const f = r.flats;
  const multPart = r.mult * (r.bonus ? 2 : 1);
  const flatPart = f.clickBonus + f.cityClickBonus + f.trainClickBonus;
  const pTot = f.passiveRate + f.cityRate + f.trainRate || 1;
  L.push(`| ${r.rb} | ${pct(r.clickPS)} | ${pct(r.autoPS)} | ${pct(r.passivePS)} | ${pct(r.miningPS)} | ${pct(r.raidPS)} | x${multPart} vs +${flatPart} planos | ${f.passiveRate}/${f.cityRate}/${f.trainRate} (de ${pTot}/s) |`);
}
L.push("");

// ---- 4) Mejoras muertas: nunca compradas por el greedy
L.push("## 4. Mejoras nunca compradas por el greedy (candidatas a 'muertas')");
L.push("");
const allLabels = new Set([...r1.firstBuy.keys(), ...r3.firstBuy.keys(), ...r6.firstBuy.keys(), ...rLong.firstBuy.keys()]);
const allCandidates = ["Exoesqueleto", "Fondo", "Overclock", "Crítico", "Recolector", "Casa", "Mercado", "Muralla", "Ayuntamiento", "Soldado", "Arquero", "Caballero", "General", "Fuerza", "Disciplina", "Reflejos", "Auto-Clicker nv 1", "Auto-Clicker nv 2", "Auto-Clicker nv 3", "Auto-Clicker nv 4", "Auto-Clicker nv 5"];
for (const c of allCandidates) {
  const buys = [r1, r3, r6, rLong].map((r) => (r.firstBuy.has(c) ? "sí" : "no")).join("/");
  L.push(`- ${c}: cps1/cps3/cps6/larga = ${buys}`);
}
const minersBought = MineriaX.filter((r) => allLabels.has("Mina " + r.name)).length;
L.push(`- Rigs mineros comprados (alguna corrida): ${minersBought}/${MineriaX.length}`);
L.push("");

// ---- 5) Primeras compras (orden de prioridad greedy en RB0, cps3)
L.push("## 5. Primeras 15 compras (cps3, tienda A)");
L.push("");
rLong.log.slice(0, 15).forEach((e, i) => {
  L.push(`${i + 1}. t=${fmtT(e.t)} RB${e.rb} — ${e.label} ($${e.cost.toLocaleString("es-AR")})`);
});
L.push("");

const md = L.join("\n");
writeFileSync(join(DIR, "simulate.analysis.md"), md + "\n");
console.log(md);
console.log("\nAnálisis escrito en scripts/simulate.analysis.md");
