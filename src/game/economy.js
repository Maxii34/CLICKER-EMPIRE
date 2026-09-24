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
