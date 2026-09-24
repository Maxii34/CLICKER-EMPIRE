// Simulador de balance FASE 2 — Clicker Empire (Node, sin React).
// NO cambia ningún valor del juego: solo mide con economy.js/constants.js.
//
// Modelo del jugador (greedy por menor tiempo de retorno = costo / Δingreso):
//   - paso de 1s; clicks manuales a `cps` salvo que el auto rinda más;
//   - bonus x2 activo desde t=0 si `bonus` (es gratis e inmediato en el juego);
//   - bóveda manual cada `vaultEvery` s (floor, como en App.jsx);
//   - Recolector la vacía según su schedule cuando se compra;
//   - saqueo siempre cobrado (el juego lo auto-cobra cada 45s);
//   - crítico solo en click manual, como valor esperado (el auto nunca critica);
//   - dorados ignorados salvo `golden=avg` (frenesí como uptime + fortuna esperada).
//
// Uso:
//   node scripts/simulate.mjs [--cps=3] [--auto=1] [--bonus=1] [--vault=60]
//                             [--golden=none|avg] [--shop=A|B|C] [--growth=0.08]
//                             [--max-hours=48] [--matrix] [--md]
//
//   --matrix corre cps {1,3,6} x tienda {A,B,C} y escribe scripts/simulate.output.md
//   --md escribe el reporte de la corrida única en scripts/simulate.output.md
//
// Tiendas: A=recompra al mismo precio (actual), B=compra única por ítem,
//          C=recompra con costo*(1+growth) por compra previa del ítem.
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  moneyPerClick, moneyPerAuto, directPassivePerSec, raidLoot, critChance,
  collectorEverySec, goldenFortune, welcomeFactor, effectiveMiningRate,
  offlineGains,
  costExo, costFondo, costOverclock, costCrit, costCollector,
  costCasa, costMercado, costMuralla, costAyunta,
  costSoldado, costArquero, costCaballero, costGeneral,
  costFuerza, costDisciplina, costReflejos,
} from "../src/game/economy.js";
import {
  RAID_EVERY, CRIT_MULT, FRENZY_MULT, WELCOME_MULT,
  MAX_CRIT, MAX_COLLECTOR, MAX_MURALLA, MAX_AYUNTA, MAX_GENERAL,
  MAX_FUERZA, MAX_DISCIPLINA, MAX_REFLEJOS,
  TROOP_POWER, CLICK_FLAT, PASSIVE_FLAT, AUTO_FLAT,
  AUTO_CLICKER_LEVELS, MAX_AUTO_CLICKER, SHOP_GROWTH,
} from "../src/game/constants.js";
import upgrades from "../src/components/upgrader/upgrades.js";
import rebirthReq from "../src/components/rebirs/rebirthReq.js";
import MineriaX from "../src/components/upgrader/MineriaX.js";

const DIR = dirname(fileURLToPath(import.meta.url));
const OUT_MD = join(DIR, "simulate.output.md");

const reqByLevel = new Map(rebirthReq.map((r) => [r.level, r]));
const MAX_RB = rebirthReq.length - 1; // 19

const COST_FN = {
  exo: costExo, fondo: costFondo, overclock: costOverclock, crit: costCrit,
  collector: costCollector, casa: costCasa, mercado: costMercado, muralla: costMuralla,
  ayunta: costAyunta, soldado: costSoldado, arquero: costArquero, caballero: costCaballero,
  general: costGeneral, fuerza: costFuerza, disciplina: costDisciplina, reflejos: costReflejos,
};
const LVL_MAX = {
  exo: null, fondo: null, overclock: null, crit: MAX_CRIT, collector: MAX_COLLECTOR,
  casa: null, mercado: null, muralla: MAX_MURALLA, ayunta: MAX_AYUNTA,
  soldado: null, arquero: null, caballero: null, general: MAX_GENERAL,
  fuerza: MAX_FUERZA, disciplina: MAX_DISCIPLINA, reflejos: MAX_REFLEJOS,
};
// RB mínimo de cada mejora (mismo que los paneles).
const LVL_REQ = {
  exo: 0, fondo: 1, overclock: 2, crit: 1, collector: 2,
  casa: 0, mercado: 1, muralla: 2, ayunta: 3,
  soldado: 3, arquero: 4, caballero: 5, general: 6,
  fuerza: 2, disciplina: 2, reflejos: 3,
};
const lvlOf = (st, key) => {
  if (key in st.imperio) return st.imperio[key];
  if (key in st.city) return st.city[key];
  if (key in st.army) return st.army[key];
  return st.train[key];
};

function parseArgs(argv) {
  const cfg = {
    cps: 3, auto: true, bonus: true, vaultEvery: 60,
    golden: "none", shop: "A", growth: SHOP_GROWTH, maxHours: 48,
    matrix: false, md: false, offlineHours: 0,
  };
  for (const a of argv) {
    if (a.startsWith("--cps=")) cfg.cps = Number(a.split("=")[1]);
    else if (a.startsWith("--auto=")) cfg.auto = a.split("=")[1] === "1";
    else if (a.startsWith("--bonus=")) cfg.bonus = a.split("=")[1] === "1";
    else if (a.startsWith("--vault=")) cfg.vaultEvery = Number(a.split("=")[1]);
    else if (a.startsWith("--golden=")) cfg.golden = a.split("=")[1];
    else if (a.startsWith("--shop=")) cfg.shop = a.split("=")[1];
    else if (a.startsWith("--growth=")) cfg.growth = Number(a.split("=")[1]);
    else if (a.startsWith("--max-hours=")) cfg.maxHours = Number(a.split("=")[1]);
    else if (a.startsWith("--offline-hours=")) cfg.offlineHours = Number(a.split("=")[1]);
    else if (a.startsWith("--offline=")) cfg.offlineHours = Number(a.split("=")[1]);
    else if (a === "--matrix") cfg.matrix = true;
    else if (a === "--md") cfg.md = true;
  }
  return cfg;
}

function freshState(cfg) {
  return {
    t: 0, money: 0, multiplier: 1, rebirlvl: 0,
    unlockedLvl: reqByLevel.get(0).multiplier,
    bonusActivo: cfg.bonus, // gratis e inmediato en el juego
    clickBonus: 0, passiveRate: 0, autoPower: 4,
    imperio: { exo: 0, fondo: 0, overclock: 0, crit: 0, collector: 0 },
    cityRate: 0, cityClickBonus: 0, city: { casa: 0, mercado: 0, muralla: 0, ayunta: 0 },
    armyPower: 0, army: { soldado: 0, arquero: 0, caballero: 0, general: 0 },
    trainClickBonus: 0, trainRate: 0, trainAutoBonus: 0,
    train: { fuerza: 0, disciplina: 0, reflejos: 0 },
    miningRate: 0, vault: 0, miners: new Set(),
    autoLevel: 0, autoSpeed: 1000, autoOn: false,
    shopCounts: new Map(), shopBought: new Set(),
    vaultTimer: 0, collectorTimer: 0, costHint: null,
    segStart: 0, segDelta: new Map(), log: [], firstBuy: new Map(),
  };
}

// Ingresos/s del estado.
// P3: el auto SUMA al click manual (ya no lo pausa).
function income(st, cfg) {
  const wf = welcomeFactor(st.bonusActivo);
  const base = st.multiplier * wf + st.clickBonus + st.cityClickBonus + st.trainClickBonus;
  const p = critChance(st.imperio.crit) / 100;
  const gMult = cfg.golden === "avg" ? 1 + (20 / 210) * (FRENZY_MULT - 1) : 1;
  const expClick = base * (1 + 4 * p) * gMult; // manual, con crítico esperado
  const autoHit = (base * st.autoPower + st.trainAutoBonus) * gMult; // sin crítico
  const hitsPerSec = 1000 / st.autoSpeed;
  const clickPS = expClick * cfg.cps;
  const autoOn = cfg.auto && st.autoLevel > 0;
  const autoPS = autoOn ? autoHit * hitsPerSec : 0;
  const passivePS = directPassivePerSec({
    passiveRate: st.passiveRate, cityRate: st.cityRate, trainRate: st.trainRate,
  });
  const miningPS = effectiveMiningRate(st.miningRate, st.imperio.collector); // P5
  const raidPS = raidLoot(st.armyPower) / RAID_EVERY;
  let goldenPS = 0;
  if (cfg.golden === "avg") {
    // fortuna esperada: 50% de los spawns (~cada 105s)
    goldenPS = (0.5 * Math.max(base * FRENZY_MULT * 30, st.money * 0.15)) / 105;
  }
  return { clickPS, autoPS, passivePS, miningPS, raidPS, goldenPS, base, p };
}
const totalPS = (inc) => inc.clickPS + inc.autoPS + inc.passivePS + inc.miningPS + inc.raidPS + inc.goldenPS;

function shopCost(st, cfg, idx) {
  const up = upgrades[idx];
  if (cfg.shop === "A") return up.cost;
  const n = st.shopCounts.get(idx) || 0;
  if (cfg.shop === "B") return n > 0 ? Infinity : up.cost;
  return Math.round(up.cost * Math.pow(1 + cfg.growth, n));
}

// Candidatos de compra con su Δingreso/s. Devuelve {key,label,cost,delta,apply}.
function candidates(st, cfg, inc) {
  const out = [];
  const add = (key, label, req, max, cost, delta, apply) => {
    if (st.rebirlvl < req) return;
    if (max !== null && lvlOf(st, key) >= max) return;
    if (!(delta > 0)) return;
    out.push({ key, label, cost, delta, payback: cost / delta, apply });
  };
  const wf = welcomeFactor(st.bonusActivo);
  const gAvg = cfg.golden === "avg" ? 1 + (20 / 210) * (FRENZY_MULT - 1) : 1;
  const autoOn = cfg.auto && st.autoLevel > 0;
  // P3: el auto suma al manual -> cada punto de multiplier rinde en ambos.
  const ratePerMult =
    cfg.cps * (1 + 4 * inc.p) * gAvg + (autoOn ? (1000 / st.autoSpeed) * st.autoPower * gAvg : 0);

  add("exo", "Exoesqueleto", 0, null, costExo(st.imperio.exo), CLICK_FLAT.exo * ratePerMult, () => {
    st.imperio.exo++; st.clickBonus += CLICK_FLAT.exo;
  });
  add("fondo", "Fondo", 1, null, costFondo(st.imperio.fondo), PASSIVE_FLAT.fondo, () => {
    st.imperio.fondo++; st.passiveRate += PASSIVE_FLAT.fondo;
  });
  add("overclock", "Overclock", 2, null, costOverclock(st.imperio.overclock),
    autoOn ? inc.base * (1000 / st.autoSpeed) : 0, () => {
      st.imperio.overclock++; st.autoPower++;
    });
  // Crítico: SOLO existe en click manual (handleAutoClick nunca critica).
  // P3: el manual nunca se pausa, así que siempre vale.
  add("crit", "Crítico", 1, MAX_CRIT, costCrit(st.imperio.crit),
    inc.base * cfg.cps * 0.03 * (CRIT_MULT - 1), () => {
      st.imperio.crit++;
    });
  // P5: el Recolector da +10% a lo minado por nivel (además de automatizar).
  add("collector", "Recolector", 2, MAX_COLLECTOR, costCollector(st.imperio.collector),
    0.1 * st.miningRate, () => {
      st.imperio.collector++;
    });
  add("casa", "Casa", 0, null, costCasa(st.city.casa), PASSIVE_FLAT.casa, () => {
    st.city.casa++; st.cityRate += PASSIVE_FLAT.casa;
  });
  add("mercado", "Mercado", 1, null, costMercado(st.city.mercado), PASSIVE_FLAT.mercado, () => {
    st.city.mercado++; st.cityRate += PASSIVE_FLAT.mercado;
  });
  add("muralla", "Muralla", 2, MAX_MURALLA, costMuralla(st.city.muralla), CLICK_FLAT.muralla * ratePerMult, () => {
    st.city.muralla++; st.cityClickBonus += CLICK_FLAT.muralla;
  });
  add("ayunta", "Ayuntamiento", 3, MAX_AYUNTA, costAyunta(st.city.ayunta), PASSIVE_FLAT.ayunta, () => {
    st.city.ayunta++; st.cityRate += PASSIVE_FLAT.ayunta;
  });
  for (const [key, req] of [["soldado", 3], ["arquero", 4], ["caballero", 5]]) {
    const fn = { soldado: costSoldado, arquero: costArquero, caballero: costCaballero }[key];
    add(key, key[0].toUpperCase() + key.slice(1), req, null, fn(st.army[key]),
      (TROOP_POWER[key] * 8) / RAID_EVERY, () => {
        st.army[key]++; st.armyPower += TROOP_POWER[key];
      });
  }
  add("general", "General", 6, MAX_GENERAL, costGeneral(st.army.general),
    (TROOP_POWER.general * 8) / RAID_EVERY, () => {
      st.army.general++; st.armyPower += TROOP_POWER.general;
    });
  add("fuerza", "Fuerza", 2, MAX_FUERZA, costFuerza(st.train.fuerza), CLICK_FLAT.fuerza * ratePerMult, () => {
    st.train.fuerza++; st.trainClickBonus += CLICK_FLAT.fuerza;
  });
  add("disciplina", "Disciplina", 2, MAX_DISCIPLINA, costDisciplina(st.train.disciplina), PASSIVE_FLAT.disciplina, () => {
    st.train.disciplina++; st.trainRate += PASSIVE_FLAT.disciplina;
  });
  add("reflejos", "Reflejos", 3, MAX_REFLEJOS, costReflejos(st.train.reflejos),
    autoOn ? (1000 / st.autoSpeed) * AUTO_FLAT.reflejos : 0, () => {
      st.train.reflejos++; st.trainAutoBonus += AUTO_FLAT.reflejos;
    });
  // Minería disponible por RB.
  for (const rig of MineriaX) {
    if (st.rebirlvl < rig.reqRebirth || st.miners.has(rig.id)) continue;
    out.push({
      key: "min:" + rig.id, label: "Mina " + rig.name, cost: rig.cost, delta: rig.value,
      payback: rig.cost / rig.value,
      apply: () => { st.miners.add(rig.id); st.miningRate += rig.value; },
    });
  }
  // Auto-clicker por nivel.
  const nextAuto = AUTO_CLICKER_LEVELS.find((l) => l.level === st.autoLevel + 1);
  if (nextAuto && st.rebirlvl >= nextAuto.reqRebirth && st.autoLevel < MAX_AUTO_CLICKER) {
    const cur = totalPS(inc);
    const probe = { ...st, autoLevel: nextAuto.level, autoSpeed: nextAuto.speed };
    const incNew = income(probe, cfg);
    const delta = totalPS(incNew) - cur;
    if (delta > 0) {
      out.push({
        key: "auto", label: `Auto-Clicker nv ${nextAuto.level}`, cost: nextAuto.cost,
        delta, payback: nextAuto.cost / delta,
        apply: () => { st.autoLevel = nextAuto.level; st.autoSpeed = nextAuto.speed; st.autoOn = true; },
      });
    }
  }
  // Tienda del nivel actual.
  const cap = Math.min(
    ...upgrades.filter((u) => u.level === st.rebirlvl).map((u) => u.max),
    st.unlockedLvl,
  );
  upgrades.forEach((up, idx) => {
    if (up.level !== st.rebirlvl) return;
    if (cfg.shop === "B" && st.shopBought.has(idx)) return;
    const eff = Math.min(up.value, cap - st.multiplier);
    if (!(eff > 0)) return;
    const cost = shopCost(st, cfg, idx);
    const delta = eff * wf * ratePerMult;
    if (!(delta > 0)) return;
    out.push({
      key: "shop:" + idx, label: `Tienda +${up.value} ($${up.cost})`, cost, delta,
      payback: cost / delta,
      apply: () => {
        st.multiplier = Math.min(st.multiplier + up.value, cap);
        st.multiplier = Number(st.multiplier.toFixed(2));
        st.shopCounts.set(idx, (st.shopCounts.get(idx) || 0) + 1);
        st.shopBought.add(idx);
      },
    });
  });
  return out.filter((c) => Number.isFinite(c.cost) && c.cost >= 0 && c.cost <= st.money);
}

// Cota barata del candidato más barato (sin Δ): si money no la alcanza,
// el scan greedy completo de este tick se saltea. Se invalida con cada compra/RB.
function minCostHint(st, cfg) {
  let m = Infinity;
  const consider = (req, max, key, cost) => {
    if (st.rebirlvl < req) return;
    if (max !== null && lvlOf(st, key) >= max) return;
    if (cost < m) m = cost;
  };
  consider(0, null, "exo", costExo(st.imperio.exo));
  consider(1, null, "fondo", costFondo(st.imperio.fondo));
  consider(2, null, "overclock", costOverclock(st.imperio.overclock));
  consider(1, MAX_CRIT, "crit", costCrit(st.imperio.crit));
  consider(2, MAX_COLLECTOR, "collector", costCollector(st.imperio.collector));
  consider(0, null, "casa", costCasa(st.city.casa));
  consider(1, null, "mercado", costMercado(st.city.mercado));
  consider(2, MAX_MURALLA, "muralla", costMuralla(st.city.muralla));
  consider(3, MAX_AYUNTA, "ayunta", costAyunta(st.city.ayunta));
  consider(3, null, "soldado", costSoldado(st.army.soldado));
  consider(4, null, "arquero", costArquero(st.army.arquero));
  consider(5, null, "caballero", costCaballero(st.army.caballero));
  consider(6, MAX_GENERAL, "general", costGeneral(st.army.general));
  consider(2, MAX_FUERZA, "fuerza", costFuerza(st.train.fuerza));
  consider(2, MAX_DISCIPLINA, "disciplina", costDisciplina(st.train.disciplina));
  consider(3, MAX_REFLEJOS, "reflejos", costReflejos(st.train.reflejos));
  for (const rig of MineriaX) {
    if (st.rebirlvl >= rig.reqRebirth && !st.miners.has(rig.id) && rig.cost < m) m = rig.cost;
  }
  const nextAuto = AUTO_CLICKER_LEVELS.find((l) => l.level === st.autoLevel + 1);
  if (nextAuto && st.rebirlvl >= nextAuto.reqRebirth && nextAuto.cost < m) m = nextAuto.cost;
  const lvlUps = upgrades.map((u, i) => ({ u, i })).filter(({ u }) => u.level === st.rebirlvl);
  for (const { u, i } of lvlUps) {
    if (cfg.shop === "B" && st.shopBought.has(i)) continue;
    const c = shopCost(st, cfg, i);
    if (c < m) m = c;
  }
  return m;
}

function buyPhase(st, cfg) {
  for (;;) {
    if (st.money < st.costHint) return;
    const inc = income(st, cfg);
    const cands = candidates(st, cfg, inc).filter((c) => c.cost <= st.money);
    if (cands.length === 0) return;
    cands.sort((a, b) => a.payback - b.payback);
    const best = cands[0];
    st.money -= best.cost;
    best.apply();
    st.costHint = null; // los costos/Δ cambiaron: recalcular próximo tick
    st.segDelta.set(best.label, (st.segDelta.get(best.label) || 0) + best.delta);
    st.log.push({ t: st.t, rb: st.rebirlvl, label: best.label, cost: best.cost });
    if (!st.firstBuy.has(best.label)) st.firstBuy.set(best.label, { t: st.t, rb: st.rebirlvl });
  }
}

function fmtTime(sec) {
  if (!Number.isFinite(sec)) return "—";
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = Math.floor(sec % 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function run(cfg) {
  const st = freshState(cfg);
  const maxT = cfg.maxHours * 3600;
  const rows = [];
  st.costHint = minCostHint(st, cfg);
  buyPhase(st, cfg);
  while (st.t < maxT) {
    st.t++;
    const inc = income(st, cfg);
    // 1) ingresos del segundo (P3: click manual + auto suman)
    st.money += inc.clickPS + inc.autoPS + inc.passivePS + inc.goldenPS;
    st.money += raidLoot(st.armyPower) / RAID_EVERY;
    st.vault += inc.miningPS;
    // 2) bóveda: recolector o manual
    const collEvery = collectorEverySec(st.imperio.collector);
    if (collEvery > 0) {
      st.collectorTimer++;
      if (st.collectorTimer >= collEvery) {
        st.collectorTimer = 0;
        const v = Math.floor(st.vault);
        if (v > 0) { st.money += v; st.vault = 0; }
      }
    } else {
      st.vaultTimer++;
      if (st.vaultTimer >= cfg.vaultEvery) {
        st.vaultTimer = 0;
        const v = Math.floor(st.vault);
        if (v > 0) { st.money += v; st.vault = 0; }
      }
    }
    // 3) ¿renace?
    const req = reqByLevel.get(st.rebirlvl);
    if (st.money >= req.money && st.multiplier >= req.multiplier) {
      const incNow = income(st, cfg);
      rows.push({
        rb: st.rebirlvl, tArrive: st.t, seg: st.t - st.segStart,
        clickPS: incNow.clickPS, autoPS: incNow.autoPS, passivePS: incNow.passivePS,
        miningPS: incNow.miningPS, raidPS: incNow.raidPS,
        mult: st.multiplier, bonus: st.bonusActivo,
        flats: {
          clickBonus: st.clickBonus, cityClickBonus: st.cityClickBonus,
          trainClickBonus: st.trainClickBonus, autoPower: st.autoPower,
          trainAutoBonus: st.trainAutoBonus, passiveRate: st.passiveRate,
          cityRate: st.cityRate, trainRate: st.trainRate,
          armyPower: st.armyPower, crit: st.imperio.crit,
        },
        lvls: {
          ...st.imperio, ...st.city, ...st.army, ...st.train,
          autoLevel: st.autoLevel, miners: st.miners.size,
        },
        top: [...st.segDelta.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3),
      });
      if (st.rebirlvl >= MAX_RB) { st.rebirlvl++; break; }
      const next = reqByLevel.get(st.rebirlvl + 1);
      st.rebirlvl++;
      st.money = 0;
      st.multiplier = req.bonus;
      st.unlockedLvl = next ? next.multiplier : Infinity;
      // P2: el contador de recompras de tienda se resetea al renacer.
      st.shopCounts = new Map();
      st.segStart = st.t;
      st.segDelta = new Map();
      st.vaultTimer = 0; st.collectorTimer = 0; st.costHint = null;
      buyPhase(st, cfg);
      continue;
    }
    // 4) compras greedy con lo disponible (con cota barata previa)
    if (st.costHint === null) st.costHint = minCostHint(st, cfg);
    if (st.money >= st.costHint) buyPhase(st, cfg);
    // 5) ¿tienda B imposible? (todo comprado 1 vez y mult bajo el req)
    if (cfg.shop === "B") {
      const lvlItems = upgrades.map((u, i) => ({ u, i })).filter(({ u }) => u.level === st.rebirlvl);
      const allBought = lvlItems.length > 0 && lvlItems.every(({ i }) => st.shopBought.has(i));
      if (allBought && st.multiplier < req.multiplier) {
        rows.push({
          rb: st.rebirlvl, tArrive: Infinity, seg: Infinity,
          clickPS: 0, autoPS: 0, passivePS: 0, miningPS: 0, raidPS: 0, top: [],
          impossible: true,
          faltaMult: Number((req.multiplier - st.multiplier).toFixed(2)),
        });
        break;
      }
    }
  }
  return { cfg, rows, log: st.log, firstBuy: st.firstBuy, finished: st.rebirlvl > MAX_RB, tEnd: st.t };
}

function flagAnomalies(rows) {
  return rows.map((r, i) => {
    if (!Number.isFinite(r.seg)) return "imposible";
    const prev = rows[i - 1]?.seg, next = rows[i + 1]?.seg;
    const flags = [];
    for (const [lbl, v] of [["ant", prev], ["sig", next]]) {
      if (Number.isFinite(v) && v > 0) {
        if (r.seg > 3 * v) flags.push(`lento vs ${lbl}`);
        if (r.seg < v / 3) flags.push(`rápido vs ${lbl}`);
      }
    }
    return flags.join(", ");
  });
}

function reportRun(res) {
  const { cfg, rows } = res;
  const flags = flagAnomalies(rows);
  const L = [];
  L.push(`## cps=${cfg.cps} auto=${cfg.auto ? "sí" : "no"} bonus=${cfg.bonus ? "x2" : "no"} bóveda=${cfg.vaultEvery}s dorados=${cfg.golden} tienda=${cfg.shop}${cfg.shop === "C" ? ` (+${cfg.growth * 100}%/compra)` : ""}`);
  L.push(`Resultado: ${res.finished ? `RB19 en ${fmtTime(res.tEnd)}` : `NO terminó (corte ${fmtTime(res.tEnd)})`}`);
  L.push("");
  L.push("| RB | T total | Tramo | Click/s | Auto/s | Pasivo/s | Minería/s | Saqueo/s | Top-3 compras | Alerta |");
  L.push("|---|---|---|---|---|---|---|---|---|---|---|");
  rows.forEach((r, i) => {
    const top = r.top.length
      ? r.top.map(([l, d]) => `${l} (+${d >= 100 ? Math.round(d) : d.toFixed(1)}/s)`).join("<br>")
      : (r.impossible ? `falta x${r.faltaMult}` : "—");
    const f = (v) => (v >= 100 ? Math.round(v).toLocaleString("es-AR") : v.toFixed(1));
    L.push(`| ${r.rb} | ${fmtTime(r.tArrive)} | ${fmtTime(r.seg)} | ${f(r.clickPS)} | ${f(r.autoPS)} | ${f(r.passivePS)} | ${f(r.miningPS)} | ${f(r.raidPS)} | ${top} | ${flags[i] || ""} |`);
  });
  return L.join("\n");
}

// Modo opcional --offline-hours=N: con las stats de cada RB ya alcanzado,
// muestra cuánto daría dormir N horas con el juego cerrado (offlineGains:
// tope 8h, 50% eficiencia, sin clicks/auto). No cambia la simulación.
function reportOffline(rows, hours) {
  const L = [];
  L.push(`## Offline: dormir ${hours}h con el juego cerrado (tope 8h, 50% ritmo)`);
  L.push("");
  L.push("| RB | Pasivo | Minería | Saqueos | Al dinero | A bóveda | Equivale a (jugando) |");
  L.push("|---|---|---|---|---|---|---|");
  for (const r of rows) {
    if (!Number.isFinite(r.seg)) continue;
    const collector = r.lvls.collector || 0;
    const baseMining = r.miningPS / (1 + 0.1 * collector);
    const g = offlineGains({
      passiveRate: r.flats.passiveRate, cityRate: r.flats.cityRate, trainRate: r.flats.trainRate,
      miningRate: baseMining, imperioLvl: { collector }, armyPower: r.flats.armyPower,
    }, hours * 3600);
    const f = (v) => (v >= 100 ? Math.round(v).toLocaleString("es-AR") : v.toFixed(0));
    const activePS = r.clickPS + r.autoPS + r.passivePS + r.miningPS + r.raidPS;
    const equiv = activePS > 0 && g.grandTotal > 0 ? `${(g.grandTotal / activePS / 60).toFixed(0)} min` : "—";
    L.push(`| ${r.rb} | +$${f(g.passive)} | +$${f(g.mining)}${g.miningToVault > 0 ? " (bóveda)" : ""} | ${g.raids} × $${f(g.raidEach)} | +$${f(g.totalToMoney)} | +$${f(g.totalToVault)} | ${equiv} |`);
  }
  return L.join("\n");
}

function main() {
  const cfg = parseArgs(process.argv.slice(2));
  if (cfg.matrix) {
    const out = ["# Simulación de balance — Clicker Empire (FASE 2)", ""];
    out.push("_Jugador greedy por menor payback, paso 1s, tope 48h. Dorados ignorados salvo que se indique. No se cambió ningún valor del juego._");
    out.push("");
    const results = {};
    for (const cps of [1, 3, 6]) {
      for (const shop of ["A", "B", "C"]) {
        const c = { ...cfg, cps, shop, matrix: false, md: false };
        const res = run(c);
        results[`cps${cps}-${shop}`] = res;
        out.push(reportRun(res));
        out.push("");
      }
    }
    // Comparativa compacta de tiempos por RB
    out.push("## Comparativa de tiempos por RB (tramo, minutos)");
    const header = "| RB | cps1-A | cps3-A | cps6-A | cps1-B | cps3-B | cps6-B | cps1-C | cps3-C | cps6-C |";
    out.push(header);
    out.push("|---|" + "---|".repeat(9));
    for (let rb = 0; rb <= MAX_RB; rb++) {
      const cells = [];
      for (const cps of [1, 3, 6]) {
        for (const shop of ["A", "B", "C"]) {
          const r = results[`cps${cps}-${shop}`].rows.find((x) => x.rb === rb);
          cells.push(!r || !Number.isFinite(r.seg) ? "X" : (r.seg / 60).toFixed(1));
        }
      }
      // reordenar a columnas por tienda: A(1,3,6) B(1,3,6) C(1,3,6)
      const byShop = [];
      for (const shop of ["A", "B", "C"]) {
        for (const cps of [1, 3, 6]) {
          const r = results[`cps${cps}-${shop}`].rows.find((x) => x.rb === rb);
          byShop.push(!r || !Number.isFinite(r.seg) ? "X" : (r.seg / 60).toFixed(1));
        }
      }
      void cells;
      out.push(`| ${rb} | ${byShop.join(" | ")} |`);
    }
    const md = out.join("\n");
    writeFileSync(OUT_MD, md + "\n");
    console.log(md);
    console.log(`\nReporte escrito en scripts/simulate.output.md`);
    return results;
  }
  const res = run(cfg);
  let md = `# Simulación — cps=${cfg.cps} tienda=${cfg.shop}\n\n${reportRun(res)}\n`;
  if (cfg.offlineHours > 0) md += `\n${reportOffline(res.rows, cfg.offlineHours)}\n`;
  console.log(md);
  if (cfg.md) writeFileSync(OUT_MD, md + "\n");
}

if (process.argv[1] && process.argv[1].endsWith("simulate.mjs")) main();

export { run, freshState, income, candidates, parseArgs, MAX_RB };
