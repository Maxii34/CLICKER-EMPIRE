// Tests de guardado FASE 3 (Node, sin React ni localStorage).
// Uso: node scripts/test-save.mjs
import {
  SAVE_VERSION, defaultState, migrate, validate, serialize, deserialize,
  exportGame, importGame, checksum,
} from "../src/game/save.js";

let pass = 0, fail = 0;
const ok = (cond, label, extra = "") => {
  if (cond) { pass++; console.log(`ok - ${label}`); }
  else { fail++; console.error(`FALLA - ${label} ${extra}`); }
};

// 1) Save v1 real (estructura vieja: sin version, sin lastRaidAt/shopCounts/lastSeenAt, unlockedLvl null)
const v1 = {
  money: 12345, multiplier: 96, rebirlvl: 3, unlockedLvl: null, bonusActivo: true,
  autoClickSpeed: 800, autoClickLevel: 2, clickBonus: 40, passiveRate: 50, autoPower: 6,
  imperioLvl: { exo: 20, fondo: 10, overclock: 2, crit: 4, collector: 1 },
  totalClicks: 500, cityRate: 120, cityClickBonus: 10,
  cityLvl: { casa: 5, mercado: 3, muralla: 2, ayunta: 1 },
  armyPower: 200, armyLvl: { soldado: 5, arquero: 2, caballero: 0, general: 0 },
  trainClickBonus: 24, trainRate: 32, trainAutoBonus: 60,
  trainLvl: { fuerza: 8, disciplina: 8, reflejos: 5 },
  miningRate: 116, purchasedMinerIds: ["m0_1", "m1_1"], vault: 999,
  maxMoney: 20000, totalCollected: 5000, goldenCount: 2, totalRaids: 9,
};
const r1 = deserialize(JSON.stringify(v1));
ok(r1.ok, "v1 migra a v2");
ok(r1.state.version === SAVE_VERSION, "v1 queda en version 2");
ok(r1.state.lastRaidAt === 0 && typeof r1.state.lastSeenAt === "number", "v1 completa campos nuevos");
ok(JSON.stringify(r1.state.shopCounts) === "{}", "v1 shopCounts arranca en {}");
ok(r1.state.unlockedLvl === 115, `v1 unlockedLvl recalculado a 115 (fue ${r1.state.unlockedLvl})`);
ok(r1.state.money === 12345 && r1.state.multiplier === 96, "v1 conserva progreso");
ok(r1.migratedFrom === 1, "v1 reporta migratedFrom=1");

// 2) Campos corruptos
const r2 = deserialize(JSON.stringify({
  ...v1, money: "x", multiplier: -5, unlockedLvl: null,
  shopCounts: { a: "x" }, imperioLvl: { exo: 1.5, crit: 99 },
  purchasedMinerIds: ["m0_1", "no-existe", 42], rebirlvl: 3,
}));
ok(r2.ok, "corrupto no rompe la carga");
ok(r2.state.money === 0, "money 'x' -> 0");
ok(r2.state.multiplier === 1, "multiplier -5 -> 1");
ok(JSON.stringify(r2.state.shopCounts) === "{}", "shopCounts {a:'x'} -> {}");
ok(r2.state.imperioLvl.crit === 0, "crit 99 (>max 10) -> 0");
ok(r2.state.purchasedMinerIds.join() === "m0_1", "rigs desconocidos filtrados");
ok(r2.warnings.length >= 5, `hay avisos (${r2.warnings.length})`);

// 3) Round-trip sin pérdida
const full = { ...defaultState(), money: 777.5, multiplier: 102.2, rebirlvl: 5, unlockedLvl: 150, shopCounts: { 3: 2 }, purchasedMinerIds: ["m0_1"], lastSeenAt: 1727000000000 };
const rt = deserialize(serialize(full));
ok(rt.ok, "round-trip ok");
ok(JSON.stringify(rt.state) === JSON.stringify({ ...full, version: SAVE_VERSION }), "round-trip sin pérdida");

// 4) Infinity (unlockedLvl en MAX, rebirlvl 20)
const maxed = { ...defaultState(), rebirlvl: 20, unlockedLvl: Infinity, money: 1 };
const ser = serialize(maxed);
ok(ser.includes('"unlockedLvl":null'), "Infinity se serializa como null");
const r4 = deserialize(ser);
ok(r4.ok && r4.state.unlockedLvl === Infinity, "null vuelve a Infinity en MAX");

// 5) Versión futura no rompe
const r5 = deserialize(JSON.stringify({ ...defaultState(), version: SAVE_VERSION + 97 }));
ok(!r5.ok && r5.reason === "version-futura", "versión futura se rechaza sin cargar");

// 6) JSON roto
const r6 = deserialize("{esto no es json");
ok(!r6.ok && r6.reason === "json-invalido", "JSON roto se detecta");

// 7) Export/import feliz + resumen
const exp = exportGame(full);
const imp = importGame(exp.text);
ok(imp.ok, "export/import ok");
ok(imp.summary.rebirlvl === 5 && imp.summary.money === 777.5, "resumen correcto");
ok(JSON.stringify(imp.state.shopCounts) === '{"3":2}', "import conserva shopCounts");

// 8) Checksum alterado se rechaza
const tampered = exp.text.slice(0, -4) + "AAAA";
const r8 = importGame(tampered);
ok(!r8.ok, "checksum alterado se rechaza");

// 9) Barrido: sin NaN/Infinity/negativos (salvo unlockedLvl en MAX)
const scan = (st, allowInfUnlock) => {
  const bad = [];
  const walk = (v, path) => {
    if (typeof v === "number") {
      if (Number.isNaN(v)) bad.push(`${path}=NaN`);
      else if (!Number.isFinite(v) && !(allowInfUnlock && path === "unlockedLvl")) bad.push(`${path}=Inf`);
      else if (v < 0) bad.push(`${path}=negativo`);
    } else if (v && typeof v === "object") {
      for (const [k, x] of Object.entries(v)) walk(x, path ? `${path}.${k}` : k);
    }
  };
  walk(st, "");
  return bad;
};
ok(scan(r1.state).length === 0, "v1 migrado sin valores inválidos");
ok(scan(r2.state).length === 0, "corrupto saneado sin valores inválidos");
ok(scan(r4.state, true).length === 0, "MAX solo con Infinity en unlockedLvl");
ok(checksum("abc") === checksum("abc") && checksum("abc") !== checksum("abd"), "checksum determinista");

console.log(`\n${pass} ok, ${fail} fallas.`);
process.exit(fail > 0 ? 1 : 0);
