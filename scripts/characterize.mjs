// Test de caracterización FASE 1 — Clicker Empire.
// Captura el comportamiento ACTUAL de las fórmulas para garantizar
// que el refactor a src/game/economy.js no cambie ningún número.
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
import { writeFileSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const DIR = dirname(fileURLToPath(import.meta.url));
const BASELINE = join(DIR, "characterize.baseline.json");

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

const mode = process.argv.includes("--check") ? "check" : "baseline";

if (mode === "baseline") {
  const results = compute(snap);
  writeFileSync(BASELINE, JSON.stringify(results, null, 2) + "\n");
  console.log(`Baseline escrito en scripts/characterize.baseline.json (${results.length} estados).`);
} else {
  const { welcomeFactor, moneyPerClick, moneyPerAuto, directPassivePerSec, raidLoot, critChance, collectorEverySec, goldenFortune } =
    await import("../src/game/economy.js");
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
  const actual = compute(fns);
  let fails = 0;
  for (let i = 0; i < expected.length; i++) {
    for (const key of Object.keys(expected[i])) {
      const e = expected[i][key];
      const a = actual[i][key];
      const same =
        typeof e === "number" && typeof a === "number"
          ? Math.abs(e - a) < 1e-9
          : e === a;
      if (!same) {
        fails++;
        console.error(`DIFIERE [${expected[i].state}] ${key}: baseline=${e} actual=${a}`);
      }
    }
  }
  if (fails > 0) {
    console.error(`CARACTERIZACIÓN FALLIDA: ${fails} diferencias.`);
    process.exit(1);
  }
  console.log(`Caracterización OK: ${actual.length} estados idénticos al baseline.`);
}
