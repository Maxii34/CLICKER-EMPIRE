// Fórmulas puras del juego (FASE 1).
// Extraídas tal cual de App.jsx (FASE 0.5). Sin estado, sin React:
// mismas entradas -> mismos números. No cambiar sin simulador (FASE 2).
import {
  RAID_EVERY,
  RAID_MULT,
  CRIT_CHANCE_PER_LVL,
  COLLECTOR_BASE_SEC,
  COLLECTOR_STEP_SEC,
  COLLECTOR_MIN_SEC,
  COLLECTOR_MINE_PCT,
  WELCOME_MULT,
  FRENZY_MULT,
  FORTUNE_CLICK_MULT,
  FORTUNE_MONEY_PCT,
  SHOP_GROWTH,
  OFFLINE_CAP_HOURS,
  OFFLINE_EFFICIENCY,
  OFFLINE_MIN_SECONDS,
  OFFLINE_INCLUDE_AUTO,
  COSTS,
} from "./constants.js";

// Bonus de bienvenida: 2 si está activo, 1 si no.
// Solo multiplica a `multiplier` (no a los bonos planos).
export const welcomeFactor = (bonusActivo) => (bonusActivo ? WELCOME_MULT : 1);

// Ganancia por click manual.
export const moneyPerClick = ({
  multiplier,
  bonusActivo = false,
  clickBonus = 0,
  cityClickBonus = 0,
  trainClickBonus = 0,
  frenzy = false,
}) =>
  (multiplier * welcomeFactor(bonusActivo) +
    clickBonus +
    cityClickBonus +
    trainClickBonus) *
  (frenzy ? FRENZY_MULT : 1);

// Ganancia por golpe automático (deriva del click).
export const moneyPerAuto = (perClick, { autoPower, trainAutoBonus = 0 }) =>
  perClick * autoPower + trainAutoBonus;

// Pasivo directo al dinero ($/s). La minería va aparte, a la bóveda.
export const directPassivePerSec = ({ passiveRate = 0, cityRate = 0, trainRate = 0 }) =>
  passiveRate + cityRate + trainRate;

// Botín de saqueo (entero). Caen cada RAID_EVERY segundos.
export const raidLoot = (armyPower) => Math.floor(armyPower * RAID_MULT);

// Chance de crítico (%) según nivel.
export const critChance = (critLvl) => (critLvl || 0) * CRIT_CHANCE_PER_LVL;

// Cada cuántos segundos el Recolector vacía la bóveda (0 = apagado).
export const collectorEverySec = (collectorLvl) =>
  collectorLvl > 0
    ? Math.max(COLLECTOR_MIN_SEC, COLLECTOR_BASE_SEC - collectorLvl * COLLECTOR_STEP_SEC)
    : 0;

// Minería efectiva: base de rigs +10% por nivel de Recolector (P5).
export const effectiveMiningRate = (baseRate, collectorLvl) =>
  (baseRate || 0) * (1 + COLLECTOR_MINE_PCT * (collectorLvl || 0));

// Premio Fortuna del evento dorado (entero).
// Nota: usa el click actual, por eso en frenesí paga el triple (#10).
export const goldenFortune = (perClick, money) =>
  Math.floor(Math.max(perClick * FORTUNE_CLICK_MULT, money * FORTUNE_MONEY_PCT));

// Cooldown restante del saqueo según el último timestamp (ms).
export const raidCooldownLeft = (lastRaidAt, armyPower, now = Date.now()) => {
  if (!lastRaidAt || armyPower <= 0) return 0;
  const elapsed = Math.floor((now - lastRaidAt) / 1000);
  return Math.max(0, Math.min(RAID_EVERY, RAID_EVERY - elapsed));
};

// --- Progreso offline (FASE 4): función pura, no modifica el estado ---
// offlineGains(state, elapsedSeconds) -> desglose con todo en enteros (floor).
// No toca balance online: usa las mismas fórmulas madre (pasivo directo,
// minería efectiva con +10%/nv de Recolector, raidLoot) sobre un tiempo
// efectivo = min(elapsed, CAP) * EFFICIENCY.
//
// state acepta tanto campos planos (passiveRate, miningRate, collectorLvl...)
// como los objetos del save (imperioLvl.collector). Todo se sanea: cualquier
// valor no finito/negativo vale 0. Nunca devuelve NaN ni Infinity.
//
// Bóveda: si hay Recolector y el tiempo efectivo alcanza su intervalo,
// lo minado va a money (el Recolector lo habría vaciado); si no, a vault.
// Raids: floor(effectiveSec / RAID_EVERY) * raidLoot (0 sin tropas).
// Auto: 0 salvo OFFLINE_INCLUDE_AUTO (listo para activarlo sin tocar App).
const safeNum = (v, def = 0) =>
  typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : def;
const safeFloor = (v) => {
  if (typeof v !== "number" || !Number.isFinite(v) || v <= 0) return 0;
  const f = Math.floor(v);
  return Number.isFinite(f) ? Math.min(f, Number.MAX_SAFE_INTEGER) : 0;
};

// Segundos transcurridos desde lastSeenAt (ms) hasta now (ms).
// 0 si falta (save viejo/partida nueva), si es futuro o si es negativo.
export const offlineElapsedSec = (lastSeenAt, now = Date.now()) => {
  if (typeof lastSeenAt !== "number" || !Number.isFinite(lastSeenAt) || lastSeenAt <= 0) return 0;
  if (typeof now !== "number" || !Number.isFinite(now)) return 0;
  const diff = Math.floor((now - lastSeenAt) / 1000);
  return diff > 0 ? diff : 0;
};

export const offlineGains = (state = {}, elapsedSeconds = 0) => {
  const blank = (reason) => ({
    eligible: false,
    reason,
    elapsedSec: 0,
    effectiveSec: 0,
    capped: false,
    passive: 0,
    mining: 0,
    miningToMoney: 0,
    miningToVault: 0,
    collections: 0,
    collectorEverySec: 0,
    raids: 0,
    raidEach: 0,
    raidTotal: 0,
    auto: 0,
    totalToMoney: 0,
    totalToVault: 0,
    grandTotal: 0,
  });
  const rawElapsed =
    typeof elapsedSeconds === "number" && Number.isFinite(elapsedSeconds)
      ? Math.floor(elapsedSeconds)
      : 0;
  if (rawElapsed < OFFLINE_MIN_SECONDS) {
    return blank(rawElapsed <= 0 ? "sin-tiempo" : "muy-corto");
  }
  const capSec = Math.floor(safeNum(OFFLINE_CAP_HOURS, 8) * 3600);
  const eff = Number.isFinite(OFFLINE_EFFICIENCY) && OFFLINE_EFFICIENCY > 0 ? OFFLINE_EFFICIENCY : 0;
  const capped = rawElapsed > capSec;
  const billedSec = capped ? capSec : rawElapsed;
  const effectiveSec = safeFloor(billedSec * eff);
  if (effectiveSec <= 0) return blank("sin-efectivo");

  const passiveRate = safeNum(state.passiveRate);
  const cityRate = safeNum(state.cityRate);
  const trainRate = safeNum(state.trainRate);
  const miningRate = safeNum(state.miningRate);
  const armyPower = safeNum(state.armyPower);
  const collectorLvl =
    Number.isInteger(state.collectorLvl) && state.collectorLvl >= 0
      ? state.collectorLvl
      : safeFloor(state.imperioLvl?.collector);

  const passive = safeFloor(directPassivePerSec({ passiveRate, cityRate, trainRate }) * effectiveSec);
  const mining = safeFloor(effectiveMiningRate(miningRate, collectorLvl) * effectiveSec);

  const every = collectorEverySec(collectorLvl);
  let miningToMoney = 0;
  let miningToVault = mining;
  let collections = 0;
  if (collectorLvl > 0 && every > 0 && mining > 0) {
    collections = Math.floor(effectiveSec / every);
    if (collections > 0) {
      miningToMoney = mining;
      miningToVault = 0;
    }
  }

  let raids = 0;
  let raidEach = 0;
  let raidTotal = 0;
  if (armyPower > 0) {
    raidEach = raidLoot(armyPower);
    if (raidEach > 0) {
      raids = Math.floor(effectiveSec / RAID_EVERY);
      raidTotal = safeFloor(raids * raidEach);
      if (raidTotal <= 0) raids = 0;
    }
  }

  let auto = 0;
  if (OFFLINE_INCLUDE_AUTO) {
    const perClick = moneyPerClick({
      multiplier: safeNum(state.multiplier, 1) >= 1 ? safeNum(state.multiplier, 1) : 1,
      bonusActivo: state.bonusActivo === true,
      clickBonus: safeNum(state.clickBonus),
      cityClickBonus: safeNum(state.cityClickBonus),
      trainClickBonus: safeNum(state.trainClickBonus),
      frenzy: false,
    });
    const speed =
      typeof state.autoClickSpeed === "number" &&
      Number.isFinite(state.autoClickSpeed) &&
      state.autoClickSpeed >= 100 &&
      state.autoClickSpeed <= 10000
        ? state.autoClickSpeed
        : 1000;
    const perAuto = moneyPerAuto(perClick, {
      autoPower: Number.isInteger(state.autoPower) && state.autoPower >= 4 ? state.autoPower : 4,
      trainAutoBonus: safeNum(state.trainAutoBonus),
    });
    auto = safeFloor(perAuto * (1000 / speed) * effectiveSec);
  }

  const totalToMoney = passive + miningToMoney + raidTotal + auto;
  const totalToVault = miningToVault;
  const grandTotal = totalToMoney + totalToVault;
  if (grandTotal <= 0) return { ...blank("vacio"), elapsedSec: rawElapsed, effectiveSec, capped };
  return {
    eligible: true,
    reason: null,
    elapsedSec: rawElapsed,
    effectiveSec,
    capped,
    passive,
    mining,
    miningToMoney,
    miningToVault,
    collections,
    collectorEverySec: every,
    raids,
    raidEach,
    raidTotal,
    auto,
    totalToMoney,
    totalToVault,
    grandTotal,
  };
};

// --- Costos: costo(lvl) = floor(base * exp^lvl), idénticos a los paneles ---
const costFor = (key, lvl) => Math.floor(COSTS[key].base * Math.pow(COSTS[key].exp, lvl));

export const costExo = (lvl) => costFor("exo", lvl);
export const costFondo = (lvl) => costFor("fondo", lvl);
export const costOverclock = (lvl) => costFor("overclock", lvl);
export const costCrit = (lvl) => costFor("crit", lvl);
export const costCollector = (lvl) => costFor("collector", lvl);
export const costCasa = (lvl) => costFor("casa", lvl);
export const costMercado = (lvl) => costFor("mercado", lvl);
export const costMuralla = (lvl) => costFor("muralla", lvl);
export const costAyunta = (lvl) => costFor("ayunta", lvl);
export const costSoldado = (lvl) => costFor("soldado", lvl);
export const costArquero = (lvl) => costFor("arquero", lvl);
export const costCaballero = (lvl) => costFor("caballero", lvl);
export const costGeneral = (lvl) => costFor("general", lvl);
export const costFuerza = (lvl) => costFor("fuerza", lvl);
export const costDisciplina = (lvl) => costFor("disciplina", lvl);
export const costReflejos = (lvl) => costFor("reflejos", lvl);

// --- Validaciones de compra (FASE 0.5), versión pura ---
export const isValidCost = (cost) => Number.isFinite(cost) && cost >= 0;
export const canPay = (money, cost) =>
  isValidCost(cost) && Number.isFinite(money) && money >= cost;

// Precio de tienda modelo C: base * (1+growth)^vecesComprado (redondeado).
// Con tope en MAX_SAFE_INTEGER para no propagar Infinity (canPay lo rechaza igual).
export const shopPrice = (baseCost, timesBought, growth = SHOP_GROWTH) => {
  const n = Number.isFinite(timesBought) && timesBought > 0 ? Math.floor(timesBought) : 0;
  if (!isValidCost(baseCost)) return NaN;
  const p = Math.round(baseCost * Math.pow(1 + growth, n));
  return Number.isFinite(p) ? p : Number.MAX_SAFE_INTEGER;
};
