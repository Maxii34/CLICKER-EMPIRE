// Versión visible del juego (se muestra en el pie).
export const GAME_VERSION = "1.0.0";

// Constantes centrales del juego (FASE 1).
// Antes vivían dispersas en App.jsx y en cada panel de mejoras.
// No cambiar números sin pasar por el simulador (FASE 2) y confirmación.

export const RAID_EVERY = 45; // segundos entre saqueos
export const RAID_MULT = 8; // botín = armyPower * RAID_MULT

export const CRIT_MULT = 5; // golpe crítico x5
export const CRIT_CHANCE_PER_LVL = 3; // % por nivel
export const MAX_CRIT = 10; // 30% máximo

export const MAX_COLLECTOR = 5;
export const COLLECTOR_BASE_SEC = 35;
export const COLLECTOR_STEP_SEC = 5;
export const COLLECTOR_MIN_SEC = 10;
// P5: cada nivel de Recolector suma +10% a lo minado (además de automatizar).
export const COLLECTOR_MINE_PCT = 0.1;

// Bonus de bienvenida: factor aparte SOLO sobre multiplier (FASE 0.5).
export const WELCOME_MULT = 2;

export const FRENZY_MULT = 3;
export const FRENZY_DURATION_SEC = 20;

// Fortuna del evento dorado: max(click*30, money*15%).
export const FORTUNE_CLICK_MULT = 30;
export const FORTUNE_MONEY_PCT = 0.15;

// Evento dorado: primero a los 25s, luego cada 60-150s, visible 12s.
export const GOLDEN_FIRST_DELAY_MS = 25000;
export const GOLDEN_MIN_DELAY_MS = 60000;
export const GOLDEN_MAX_EXTRA_MS = 90000;
export const GOLDEN_VISIBLE_MS = 12000;

// Auto-clicker: solo acelera la frecuencia (el daño lo da el click).
export const AUTO_CLICKER_SPEEDS = [1000, 900, 800, 700, 600, 500];
export const AUTO_CLICKER_LEVELS = [
  { level: 1, cost: 10000, speed: 900, reqRebirth: 2 },
  { level: 2, cost: 50000, speed: 800, reqRebirth: 4 },
  { level: 3, cost: 100000, speed: 700, reqRebirth: 6 },
  { level: 4, cost: 250000, speed: 600, reqRebirth: 8 },
  { level: 5, cost: 500000, speed: 500, reqRebirth: 10 },
];
export const MAX_AUTO_CLICKER = 5;

// Topes de niveles por mejora.
export const MAX_MURALLA = 15;
export const MAX_AYUNTA = 10;
export const MAX_GENERAL = 5;
export const MAX_FUERZA = 30;
export const MAX_DISCIPLINA = 30;
export const MAX_REFLEJOS = 20;

// Aportes planos por nivel (los mismos números de siempre).
export const TROOP_POWER = { soldado: 12, arquero: 35, caballero: 100, general: 300 };
export const CLICK_FLAT = { exo: 2, muralla: 2, fuerza: 3 };
export const PASSIVE_FLAT = { fondo: 5, casa: 2, mercado: 7, ayunta: 25, disciplina: 4 };
export const AUTO_FLAT = { reflejos: 12 };

// Curvas de costo: costo(lvl) = floor(base * exp^lvl). No tocar (FASE 2).
export const COSTS = {
  exo: { base: 500, exp: 2.2 },
  fondo: { base: 1500, exp: 2.5 },
  overclock: { base: 5000, exp: 3 },
  crit: { base: 3000, exp: 3 },
  collector: { base: 8000, exp: 2.8 },
  casa: { base: 600, exp: 2.1 },
  mercado: { base: 3000, exp: 2.6 },
  muralla: { base: 4000, exp: 2.8 },
  ayunta: { base: 12000, exp: 3 },
  soldado: { base: 15000, exp: 2.9 },
  arquero: { base: 42000, exp: 3.0 },
  caballero: { base: 120000, exp: 3.1 },
  general: { base: 360000, exp: 3.2 },
  fuerza: { base: 6000, exp: 2.6 },
  disciplina: { base: 9000, exp: 2.6 },
  reflejos: { base: 15000, exp: 2.8 },
};

// Tienda modelo C (FASE 2-bis): cada recompra del mismo ítem cuesta
// +(SHOP_GROWTH*100)% sobre el precio base. El contador es por ítem
// y se resetea al renacer. Los saves viejos arrancan en 0.
export const SHOP_GROWTH = 0.3;

// Dinero de prueba del botón DEV (solo en import.meta.env.DEV).
export const DEV_MONEY = 50000000;
