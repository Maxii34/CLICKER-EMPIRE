// Test de caracterización FASE 1 (+ costos FASE 2) — Clicker Empire.
// Captura el comportamiento ACTUAL de fórmulas y costos para garantizar
// que los refactors no cambien ningún número.
//
// Uso:
//   node scripts/characterize.mjs            -> genera scripts/characterize.baseline.json
//   node scripts/characterize.mjs --check    -> importa economy.js y compara contra el baseline
//
// Las fórmulas inline de abajo son una copia literal de App.jsx (FASE 0.5):
//   welcomeFactor = bonusActivo ? 2 : 1
//   moneyPerClick = (multiplier * welcomeFactor + clickBonus + cityClickBonus + trainClickBonus) * (frenzy ? 3 : 1)
//   moneyPerAuto  = moneyPerClick * autoPower + trainAutoBonus
//   directPassive = passiveRate + cityRate + trainRate   (directo al dinero)
//   miningRate    -> vault                               (NO va directo)
//   raidLoot      = floor(armyPower * 8)  cada 45s
//   critChance    = critLvl * 3 (%)
//   collectEvery  = lvl>0 ? max(10, 35 - lvl*5) : 0
//   fortuna       = floor(max(moneyPerClick*30, money*15%))
// Los costos inline son copia literal de los paneles pre-FASE 1
// (verificado con `git show d5d7a49:...`, commit anterior a FASE 1).
import { writeFileSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const DIR = dirname(fileURLToPath(import.meta.url));
const BASELINE = join(DIR, "characterize.baseline.json");

// --- Copia literal de las curvas originales (NO TOCAR: es el snapshot) ---
// base/exp de cada panel + tope (null = sin máximo).
// Verificado pre-FASE 1 con `git show d5d7a49:...`.
// P4 (FASE 2-bis, intencional): ejército -40% en base, mismo exp.
const COST_SNAPSHOT = {
  exo: { base: 500, exp: 2.2, max: null },
  fondo: { base: 1500, exp: 2.5, max: null },
  overclock: { base: 5000, exp: 3, max: null },
  crit: { base: 3000, exp: 3, max: 10 },
  collector: { base: 8000, exp: 2.8, max: 5 },
  casa: { base: 600, exp: 2.1, max: null },
  mercado: { base: 3000, exp: 2.6, max: null },
  muralla: { base: 4000, exp: 2.8, max: 15 },
  ayunta: { base: 12000, exp: 3, max: 10 },
  soldado: { base: 15000, exp: 2.9, max: null },
  arquero: { base: 42000, exp: 3.0, max: null },
  caballero: { base: 120000, exp: 3.1, max: null },
  general: { base: 360000, exp: 3.2, max: 5 },
  fuerza: { base: 6000, exp: 2.6, max: 30 },
  disciplina: { base: 9000, exp: 2.6, max: 30 },
  reflejos: { base: 15000, exp: 2.8, max: 20 },
};
// Niveles verificados: 0 a 10 + el tope si queda fuera del rango.
const COST_LEVELS = (max) => {
  const lvls = Array.from({ length: 11 }, (_, i) => i);
  if (Number.isFinite(max) && max > 10) lvls.push(max);
  return lvls;
};
const snapCost = (key, lvl) =>
  Math.floor(COST_SNAPSHOT[key].base * Math.pow(COST_SNAPSHOT[key].exp, lvl));
// Snapshot tienda C (P2): precio = round(base * 1.3^n).
const snapShopPrice = (base, n) => Math.round(base * Math.pow(1.3, n));
const SHOP_PRICE_CASES = [
  [140, 0], [140, 1], [140, 5],
  [3170, 0], [3170, 3],
  [6616480, 0], [6616480, 2],
];

// --- Copia literal de las fórmulas actuales (NO TOCAR: es el snapshot) ---
const snap = {
  welcomeFactor: (bonusActivo) => (bonusActivo ? 2 : 1),
  moneyPerClick: (s) =>
    (s.multiplier * (s.bonusActivo ? 2 : 1) +
      s.clickBonus +
      s.cityClickBonus +
      s.trainClickBonus) *
    (s.frenzy ? 3 : 1),
  moneyPerAuto: (mpc, s) => mpc * s.autoPower + s.trainAutoBonus,
  directPassive: (s) => s.passiveRate + s.cityRate + s.trainRate,
  raidLoot: (s) => Math.floor(s.armyPower * 8),
  critChance: (s) => s.critLvl * 3,
  collectEvery: (s) => (s.collectorLvl > 0 ? Math.max(10, 35 - s.collectorLvl * 5) : 0),
  fortuna: (mpc, money) => Math.floor(Math.max(mpc * 30, money * 0.15)),
};

// Estados de ejemplo: RB0 / RB3 / RB10, con y sin bonus, con y sin frenesí.
const STATES = [
  {
    name: "RB0 arranque",
    multiplier: 1, bonusActivo: false, frenzy: false,
    clickBonus: 0, cityClickBonus: 0, trainClickBonus: 0,
    autoPower: 4, trainAutoBonus: 0,
    passiveRate: 0, cityRate: 0, trainRate: 0, miningRate: 0,
    armyPower: 0, critLvl: 0, collectorLvl: 0, money: 0,
  },
  {
    name: "RB0 con bonus, sin frenesi",
    multiplier: 30, bonusActivo: true, frenzy: false,
    clickBonus: 10, cityClickBonus: 0, trainClickBonus: 0,
    autoPower: 4, trainAutoBonus: 0,
    passiveRate: 15, cityRate: 8, trainRate: 0, miningRate: 26,
    armyPower: 0, critLvl: 0, collectorLvl: 0, money: 1200,
  },
  {
    name: "RB3 con bonus y frenesi",
    multiplier: 96, bonusActivo: true, frenzy: true,
    clickBonus: 40, cityClickBonus: 10, trainClickBonus: 24,
    autoPower: 6, trainAutoBonus: 60,
    passiveRate: 50, cityRate: 120, trainRate: 32, miningRate: 116,
    armyPower: 200, critLvl: 4, collectorLvl: 2, money: 500000,
  },
  {
    name: "RB10 con bonus, sin frenesi",
    multiplier: 250, bonusActivo: true, frenzy: false,
    clickBonus: 120, cityClickBonus: 30, trainClickBonus: 90,
    autoPower: 12, trainAutoBonus: 240,
    passiveRate: 200, cityRate: 800, trainRate: 120, miningRate: 5000,
    armyPower: 2500, critLvl: 10, collectorLvl: 5, money: 80000000,
  },
  {
    name: "RB10 sin bonus, con frenesi (combo crit x15)",
    multiplier: 250, bonusActivo: false, frenzy: true,
    clickBonus: 120, cityClickBonus: 30, trainClickBonus: 90,
    autoPower: 12, trainAutoBonus: 240,
    passiveRate: 200, cityRate: 800, trainRate: 120, miningRate: 5000,
    armyPower: 2500, critLvl: 10, collectorLvl: 5, money: 80000000,
  },
  {
    name: "RB3 decimales de tienda (mult 102.2)",
    multiplier: 102.2, bonusActivo: false, frenzy: false,
    clickBonus: 6, cityClickBonus: 4, trainClickBonus: 3,
    autoPower: 5, trainAutoBonus: 12,
    passiveRate: 25, cityRate: 30, trainRate: 12, miningRate: 40,
    armyPower: 47, critLvl: 3, collectorLvl: 1, money: 9999.99,
  },
];

function compute(fns) {
  return STATES.map((s) => {
    const wf = fns.welcomeFactor(s.bonusActivo);
    const mpc = fns.moneyPerClick(s);
    return {
      state: s.name,
      welcomeFactor: wf,
      moneyPerClick: mpc,
      moneyPerAuto: fns.moneyPerAuto(mpc, s),
      directPassive: fns.directPassive(s),
      miningPerSec: s.miningRate,
      raidLoot: fns.raidLoot(s),
      critChance: fns.critChance(s),
      critHit: mpc * 5,
      frenzyCritHit: mpc * 5, // mpc ya incluye frenesí si aplica
      collectEverySec: fns.collectEvery(s),
      fortuna: fns.fortuna(mpc, s.money),
    };
  });
}

function computeCosts(costFn) {
  const rows = [];
  for (const key of Object.keys(COST_SNAPSHOT)) {
    for (const lvl of COST_LEVELS(COST_SNAPSHOT[key].max)) {
      rows.push({ curve: key, lvl, cost: costFn(key, lvl) });
    }
  }
  for (const [base, n] of SHOP_PRICE_CASES) {
    rows.push({ curve: `shop:${base}x${n}`, lvl: n, cost: costFn(`shop:${base}`, n) });
  }
  return rows;
}

const mode = process.argv.includes("--check") ? "check" : "baseline";

if (mode === "baseline") {
  const baseline = {
    states: compute(snap),
    costs: computeCosts((key, lvl) =>
      key.startsWith("shop:")
        ? snapShopPrice(Number(key.split(":")[1]), lvl)
        : snapCost(key, lvl),
    ),
  };
  writeFileSync(BASELINE, JSON.stringify(baseline, null, 2) + "\n");
  console.log(
    `Baseline escrito en scripts/characterize.baseline.json (${baseline.states.length} estados, ${baseline.costs.length} costos).`,
  );
} else {
  const { welcomeFactor, moneyPerClick, moneyPerAuto, directPassivePerSec, raidLoot, critChance, collectorEverySec, goldenFortune } =
    await import("../src/game/economy.js");
  const eco = await import("../src/game/economy.js");
  const costFns = {
    exo: eco.costExo, fondo: eco.costFondo, overclock: eco.costOverclock,
    crit: eco.costCrit, collector: eco.costCollector, casa: eco.costCasa,
    mercado: eco.costMercado, muralla: eco.costMuralla, ayunta: eco.costAyunta,
    soldado: eco.costSoldado, arquero: eco.costArquero, caballero: eco.costCaballero,
    general: eco.costGeneral, fuerza: eco.costFuerza, disciplina: eco.costDisciplina,
    reflejos: eco.costReflejos,
  };
  const fns = {
    welcomeFactor,
    moneyPerClick: (s) =>
      moneyPerClick({
        multiplier: s.multiplier, bonusActivo: s.bonusActivo, frenzy: s.frenzy,
        clickBonus: s.clickBonus, cityClickBonus: s.cityClickBonus, trainClickBonus: s.trainClickBonus,
      }),
    moneyPerAuto: (mpc, s) => moneyPerAuto(mpc, { autoPower: s.autoPower, trainAutoBonus: s.trainAutoBonus }),
    directPassive: (s) =>
      directPassivePerSec({ passiveRate: s.passiveRate, cityRate: s.cityRate, trainRate: s.trainRate }),
    raidLoot: (s) => raidLoot(s.armyPower),
    critChance: (s) => critChance(s.critLvl),
    collectEvery: (s) => collectorEverySec(s.collectorLvl),
    fortuna: (mpc, money) => goldenFortune(mpc, money),
  };
  const expected = JSON.parse(readFileSync(BASELINE, "utf-8"));
  const actualStates = compute(fns);
  const actualCosts = computeCosts((key, lvl) =>
    key.startsWith("shop:")
      ? eco.shopPrice(Number(key.split(":")[1]), lvl)
      : costFns[key](lvl),
  );
  const actual = { states: actualStates, costs: actualCosts };
  let fails = 0;
  const cmp = (label, e, a) => {
    const same =
      typeof e === "number" && typeof a === "number"
        ? Math.abs(e - a) < 1e-9
        : e === a;
    if (!same) {
      fails++;
      console.error(`DIFIERE ${label}: baseline=${e} actual=${a}`);
    }
  };
  for (let i = 0; i < expected.states.length; i++) {
    for (const key of Object.keys(expected.states[i])) {
      cmp(`[${expected.states[i].state}] ${key}`, expected.states[i][key], actual.states[i][key]);
    }
  }
  for (let i = 0; i < expected.costs.length; i++) {
    cmp(
      `[costo ${expected.costs[i].curve} lvl ${expected.costs[i].lvl}]`,
      expected.costs[i].cost,
      actual.costs[i].cost,
    );
    if (expected.costs[i].curve !== actual.costs[i].curve || expected.costs[i].lvl !== actual.costs[i].lvl) {
      fails++;
      console.error(`DIFIERE orden de costos en fila ${i}`);
    }
  }
  if (fails > 0) {
    console.error(`CARACTERIZACIÓN FALLIDA: ${fails} diferencias.`);
    process.exit(1);
  }
  console.log(`Caracterización OK: ${actual.states.length} estados y ${actual.costs.length} costos idénticos al baseline.`);
}
