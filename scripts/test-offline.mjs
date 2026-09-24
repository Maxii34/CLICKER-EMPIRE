// Tests de progreso offline FASE 4 (Node, sin React ni localStorage).
// Uso: node scripts/test-offline.mjs
import {
  offlineGains,
  offlineElapsedSec,
  directPassivePerSec,
  effectiveMiningRate,
  raidLoot,
} from "../src/game/economy.js";
import {
  OFFLINE_CAP_HOURS,
  OFFLINE_EFFICIENCY,
  OFFLINE_MIN_SECONDS,
  OFFLINE_INCLUDE_AUTO,
  RAID_EVERY,
} from "../src/game/constants.js";
import { applyOfflineResult, defaultState, deserialize } from "../src/game/save.js";

let pass = 0, fail = 0;
const ok = (cond, label, extra = "") => {
  if (cond) { pass++; console.log(`ok - ${label}`); }
  else { fail++; console.error(`FALLA - ${label} ${extra}`); }
};
const scan = (obj) => {
  const bad = [];
  const walk = (v, path) => {
    if (typeof v === "number") {
      if (Number.isNaN(v)) bad.push(`${path}=NaN`);
      else if (!Number.isFinite(v)) bad.push(`${path}=Inf`);
      else if (v < 0) bad.push(`${path}=negativo`);
    } else if (v && typeof v === "object") {
      for (const [k, x] of Object.entries(v)) walk(x, path ? `${path}.${k}` : k);
    }
  };
  walk(obj, "");
  return bad;
};

ok(OFFLINE_CAP_HOURS === 8, "OFFLINE_CAP_HOURS = 8");
ok(OFFLINE_EFFICIENCY === 0.5, "OFFLINE_EFFICIENCY = 0.5");
ok(OFFLINE_MIN_SECONDS === 60, "OFFLINE_MIN_SECONDS = 60");
ok(OFFLINE_INCLUDE_AUTO === false, "OFFLINE_INCLUDE_AUTO = false");

const base = {
  passiveRate: 50, cityRate: 120, trainRate: 32,
  miningRate: 116, imperioLvl: { collector: 2 }, collectorLvl: undefined,
  armyPower: 200, multiplier: 96, bonusActivo: true,
  clickBonus: 40, cityClickBonus: 10, trainClickBonus: 24,
  autoPower: 6, trainAutoBonus: 60, autoClickSpeed: 1000,
};
const CAP_SEC = OFFLINE_CAP_HOURS * 3600;

// 1) Sin tiempo: 0 ganancia, no elegible.
{
  const g = offlineGains(base, 0);
  ok(!g.eligible && g.grandTotal === 0, "sin tiempo: 0 ganancia");
  ok(scan(g).length === 0, "sin tiempo: sin NaN/Inf/negativos");
}

// 2) Menos de 60 s: nada ni modal.
{
  const g = offlineGains(base, OFFLINE_MIN_SECONDS - 1);
  ok(!g.eligible && g.grandTotal === 0, "menos de 60s: no se calcula");
}

// 3) Exactamente el tope: efectivo = tope * eficiencia, capped=false.
{
  const g = offlineGains(base, CAP_SEC);
  const eff = Math.floor(CAP_SEC * OFFLINE_EFFICIENCY);
  ok(g.eligible && !g.capped && g.effectiveSec === eff, `tope exacto: effectiveSec=${g.effectiveSec} (esperado ${eff})`);
  const expPassive = Math.floor(directPassivePerSec(base) * eff);
  ok(g.passive === expPassive, `tope exacto: pasivo=${g.passive} (esperado ${expPassive})`);
}

// 4) Más del tope: se recorta al tope.
{
  const gOver = offlineGains(base, CAP_SEC * 3);
  const gCap = offlineGains(base, CAP_SEC);
  ok(gOver.capped, "más del tope: capped=true");
  ok(gOver.effectiveSec === gCap.effectiveSec, "más del tope: se recorta al tope");
  ok(gOver.grandTotal === gCap.grandTotal, "más del tope: mismo total que en el tope");
}

// 5) Sin Recolector: lo minado va a la bóveda.
{
  const st = { ...base, imperioLvl: { collector: 0 } };
  const g = offlineGains(st, 3600);
  const eff = Math.floor(3600 * OFFLINE_EFFICIENCY);
  const expMining = Math.floor(effectiveMiningRate(st.miningRate, 0) * eff);
  ok(g.mining === expMining && g.miningToVault === expMining && g.miningToMoney === 0,
    `sin Recolector: ${g.mining} a bóveda`);
  ok(g.totalToVault === expMining, "sin Recolector: totalToVault = minado");
}

// 6) Con Recolector: lo minado pasa a money (intervalo alcanzado).
{
  const g = offlineGains(base, 3600); // collector 2 -> cada 25s; efectivo 1800s
  ok(g.collectorEverySec === 25, `Recolector nv2: intervalo=${g.collectorEverySec}s`);
  ok(g.collections === Math.floor(g.effectiveSec / 25), "Recolector: collections según intervalo");
  ok(g.miningToMoney === g.mining && g.miningToVault === 0, "con Recolector: minado al dinero");
}

// 6b) Con Recolector pero tiempo menor a su intervalo: queda en bóveda.
{
  // collector 5 -> cada 10s; efectivo mínimo útil: 60s*0.5=30s >= 10s, siempre alcanza.
  // Se fuerza con collector 1 (30s) y 60s de ausencia (efectivo 30s): 30/30 = 1 colección.
  const st = { ...base, imperioLvl: { collector: 1 }, armyPower: 0, passiveRate: 0, cityRate: 0, trainRate: 0, miningRate: 10 };
  const g = offlineGains(st, 60);
  ok(g.collectorEverySec === 30 && g.effectiveSec === 30, "intervalo límite: 30s efectivo");
  ok(g.collections === 1 && g.miningToMoney === g.mining, "en el límite del intervalo sí recolecta");
}

// 7) Con tropas: floor(tiempo / RAID_EVERY) saqueos con raidLoot.
{
  const g = offlineGains(base, 3600);
  const expRaids = Math.floor(g.effectiveSec / RAID_EVERY);
  const expEach = raidLoot(base.armyPower);
  ok(g.raids === expRaids, `con tropas: raids=${g.raids} (esperado ${expRaids})`);
  ok(g.raidEach === expEach && g.raidTotal === expRaids * expEach, "con tropas: botín = raids × raidLoot");
}

// 8) Sin tropas: 0 saqueos.
{
  const g = offlineGains({ ...base, armyPower: 0 }, 3600);
  ok(g.raids === 0 && g.raidTotal === 0, "sin tropas: 0 saqueos");
}

// 9) lastSeenAt en el futuro: 0.
{
  const now = 1_700_000_000_000;
  ok(offlineElapsedSec(now + 60_000, now) === 0, "lastSeenAt futuro: 0");
}

// 10) lastSeenAt en 0 (save viejo/partida nueva): 0.
{
  const now = Date.now();
  ok(offlineElapsedSec(0, now) === 0, "lastSeenAt 0: sin progreso");
  ok(offlineElapsedSec(undefined, now) === 0, "lastSeenAt ausente: sin progreso");
  ok(offlineElapsedSec(now - 5000, now) === 5, "caso normal: 5s");
  ok(offlineElapsedSec(now, now) === 0, "tiempo negativo/cero: 0");
}

// 11) Auto por defecto en 0.
{
  const g = offlineGains(base, 3600);
  ok(g.auto === 0, "auto offline = 0 por defecto");
}

// 12) Valores extremos: sin NaN ni Infinity.
{
  const crazy = {
    passiveRate: Infinity, cityRate: NaN, trainRate: -50, miningRate: 1e308,
    imperioLvl: { collector: 99 }, armyPower: Number.MAX_VALUE,
    multiplier: Infinity, clickBonus: NaN, autoPower: -3,
  };
  const g = offlineGains(crazy, 1e12);
  ok(scan(g).length === 0, `extremos saneados (${scan(g).join(",") || "limpio"})`);
  ok(g.capped && g.effectiveSec === Math.floor(CAP_SEC * OFFLINE_EFFICIENCY), "extremos: tope respeta igual");
  const gNeg = offlineGains(base, -100);
  ok(!gNeg.eligible && scan(gNeg).length === 0, "tiempo negativo: 0 limpio");
}

// 13) Pureza: no modifica el estado de entrada.
{
  const st = { ...base, imperioLvl: { collector: 2 } };
  const before = JSON.stringify(st);
  offlineGains(st, 3600);
  ok(JSON.stringify(st) === before, "offlineGains no muta el estado");
}

// 14) Idempotencia: aplicar dos veces con el mismo lastSeenAt es imposible.
{
  const st = { ...defaultState(), money: 100, vault: 50, lastSeenAt: 1000, lastOfflineAt: 0 };
  const gains = offlineGains({ ...base }, 3600);
  ok(gains.eligible, "idempotencia: gains elegible de base");
  const r1 = applyOfflineResult(st, gains, { now: 5000, claimedFrom: 1000 });
  ok(r1.applied, "idempotencia: primera aplicación ok");
  ok(r1.state.lastOfflineAt === 1000 && r1.state.lastSeenAt === 5000, "idempotencia: marcas actualizadas");
  ok(r1.state.money === 100 + gains.totalToMoney, "idempotencia: money suma una vez");
  const r2 = applyOfflineResult(r1.state, gains, { now: 6000, claimedFrom: 1000 });
  ok(!r2.applied, "idempotencia: segunda vez con mismo lastSeenAt imposible");
  // lastRaidAt coherente: con saqueos avanza a now (no duplica el próximo).
  if (gains.raids > 0) {
    ok(r1.state.lastRaidAt === 5000, "lastRaidAt avanza a now tras saqueos offline");
  }
  ok(r1.state.totalRaids === gains.raids, "totalRaids suma los saqueos offline");
}

// 15) Save v2 real migra a v3 sin perder nada.
{
  const v2 = { ...defaultState(), version: 2, money: 500, lastSeenAt: 123 };
  delete v2.lastOfflineAt;
  const r = deserialize(JSON.stringify(v2));
  ok(r.ok && r.state.version === 3, "save v2 migra a v3");
  ok(r.state.lastOfflineAt === 0 && r.state.money === 500, "v2 conserva progreso + lastOfflineAt=0");
}

console.log(`\n${pass} ok, ${fail} fallas.`);
process.exit(fail > 0 ? 1 : 0);
