// Guardado robusto FASE 3 + offline FASE 4 — funciones puras + acceso a localStorage aislado aquí.
// Ni App.jsx ni los componentes hacen JSON.parse/stringify del save directamente.
//
// Versiones: el save original (sin campo version) es v1 implícita.
//   v1 -> v2: +version, +lastRaidAt, +shopCounts, +lastSeenAt,
//             unlockedLvl null (Infinity serializado) se recalcula.
//   v2 -> v3: +lastOfflineAt (marca anti-doble-cobro offline, FASE 4).
// Esquema v3 documentado en AGENTS.md.
import rebirthReq from "../components/rebirs/rebirthReq.js";
import MineriaX from "../components/upgrader/MineriaX.js";
import {
  MAX_CRIT,
  MAX_COLLECTOR,
  MAX_MURALLA,
  MAX_AYUNTA,
  MAX_GENERAL,
  MAX_FUERZA,
  MAX_DISCIPLINA,
  MAX_REFLEJOS,
  MAX_AUTO_CLICKER,
} from "./constants.js";

export const SAVE_VERSION = 3;
export const SAVE_KEY = "clicker-empire-save-v1";
export const BACKUP_PREFIX = "clicker-empire-backup-";
export const EXPORT_FORMAT = "clicker-empire-export";

const reqByLevel = new Map(rebirthReq.map((r) => [r.level, r]));
const RIG_IDS = new Set(MineriaX.map((r) => r.id));

// Tope esperado de tienda para un RB (o Infinity si ya terminó todo).
export const expectedUnlockedLvl = (rebirlvl) => {
  if (rebirlvl >= rebirthReq.length) return Infinity;
  return reqByLevel.get(rebirlvl)?.multiplier ?? reqByLevel.get(0).multiplier;
};

export const defaultState = () => ({
  version: SAVE_VERSION,
  money: 0,
  multiplier: 1,
  rebirlvl: 0,
  unlockedLvl: expectedUnlockedLvl(0),
  bonusActivo: false,
  autoClickSpeed: 1000,
  autoClickLevel: 0,
  clickBonus: 0,
  passiveRate: 0,
  autoPower: 4,
  imperioLvl: { exo: 0, fondo: 0, overclock: 0, crit: 0, collector: 0 },
  totalClicks: 0,
  cityRate: 0,
  cityClickBonus: 0,
  cityLvl: { casa: 0, mercado: 0, muralla: 0, ayunta: 0 },
  armyPower: 0,
  armyLvl: { soldado: 0, arquero: 0, caballero: 0, general: 0 },
  lastRaidAt: 0,
  trainClickBonus: 0,
  trainRate: 0,
  trainAutoBonus: 0,
  trainLvl: { fuerza: 0, disciplina: 0, reflejos: 0 },
  miningRate: 0,
  purchasedMinerIds: [],
  vault: 0,
  shopCounts: {},
  maxMoney: 0,
  totalCollected: 0,
  goldenCount: 0,
  totalRaids: 0,
  lastSeenAt: 0,
  // FASE 4: T0 (lastSeenAt anterior) ya cobrado offline. 0 = nada cobrado.
  // Aplicar dos veces con el mismo lastSeenAt es imposible (idempotente).
  lastOfflineAt: 0,
});

// --- Migraciones. Esqueleto para futuras: agregar v2->v3 en MIGRATIONS. ---
const migrateV1toV2 = (raw, warnings) => {
  const out = { ...defaultState(), ...raw, version: 2 };
  if (raw.lastRaidAt === undefined || raw.lastRaidAt === null) {
    warnings.push("lastRaidAt faltante (save v1): arranca en 0.");
  }
  if (raw.shopCounts === undefined || raw.shopCounts === null) {
    warnings.push("shopCounts faltante (save v1): arranca en {}.");
  }
  if (raw.lastSeenAt === undefined || raw.lastSeenAt === null) {
    warnings.push("lastSeenAt faltante (save v1): arranca en 0.");
  }
  if (raw.unlockedLvl === null || raw.unlockedLvl === undefined) {
    out.unlockedLvl = expectedUnlockedLvl(raw.rebirlvl ?? 0);
    warnings.push("unlockedLvl nulo (Infinity serializado): recalculado según rebirlvl.");
  }
  return out;
};

const migrateV2toV3 = (raw, warnings) => {
  const out = { ...defaultState(), ...raw, version: 3 };
  if (raw.lastOfflineAt === undefined || raw.lastOfflineAt === null) {
    out.lastOfflineAt = 0;
    warnings.push("lastOfflineAt faltante (save v2): arranca en 0 (sin doble cobro).");
  }
  return out;
};

const MIGRATIONS = { 1: migrateV1toV2, 2: migrateV2toV3 };

export const migrate = (raw) => {
  const warnings = [];
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ok: false, reason: "formato", warnings };
  }
  const from = raw.version === undefined || raw.version === null ? 1 : raw.version;
  if (!Number.isInteger(from) || from < 1) {
    return { ok: false, reason: "version-invalida", warnings };
  }
  if (from > SAVE_VERSION) {
    return { ok: false, reason: "version-futura", warnings, found: from };
  }
  let state = { ...raw, version: from };
  while (state.version < SAVE_VERSION) {
    const step = MIGRATIONS[state.version];
    if (typeof step !== "function") {
      return { ok: false, reason: "sin-migracion", warnings };
    }
    state = step(state, warnings);
  }
  return { ok: true, state, warnings, migratedFrom: from };
};

// --- Validación campo por campo. Lo inválido vuelve a su default + aviso. ---
const isNum = (v) => typeof v === "number" && Number.isFinite(v);
const num = (v, def, min = 0) => (isNum(v) && v >= min ? v : null);
const int = (v, def, min = 0, max = null) => {
  if (!isNum(v) || !Number.isInteger(v) || v < min) return null;
  if (max !== null && v > max) return null;
  return v;
};
const lvlMap = (raw, spec, warnings, label) => {
  const out = {};
  for (const [key, cfg] of Object.entries(spec)) {
    const v = raw?.[key];
    const good = cfg.max === null ? int(v, 0, 0, null) : int(v, 0, 0, cfg.max);
    if (good === null) {
      warnings.push(`${label}.${key} inválido (${JSON.stringify(v)}): vuelve a 0.`);
      out[key] = 0;
    } else {
      out[key] = good;
    }
  }
  return out;
};

export const validate = (state) => {
  const warnings = [];
  const d = defaultState();
  const fix = (key, value, fallback) => {
    if (value === null || value === undefined) {
      if (fallback !== undefined) {
        warnings.push(`${key} inválido: se usa valor por defecto.`);
        return fallback;
      }
    }
    return value;
  };
  const s = { ...d, ...(state || {}) };

  const checkNum = (key, min = 0) => {
    const v = num(s[key], d[key], min);
    if (v === null) {
      warnings.push(`${key} inválido (${JSON.stringify(s[key])}): vuelve a ${d[key]}.`);
      return d[key];
    }
    return v;
  };
  const checkInt = (key, min = 0, max = null, fallback = null) => {
    const v = int(s[key], d[key], min, max);
    if (v === null) {
      warnings.push(`${key} inválido (${JSON.stringify(s[key])}): vuelve a ${fallback ?? d[key]}.`);
      return fallback ?? d[key];
    }
    return v;
  };

  const out = { ...d };
  out.money = checkNum("money");
  out.multiplier = checkNum("multiplier", 1);
  if (out.multiplier > 1e6) {
    warnings.push(`multiplier absurdo (${s.multiplier}): vuelve a 1.`);
    out.multiplier = 1;
  }
  out.rebirlvl = checkInt("rebirlvl", 0, rebirthReq.length);
  out.bonusActivo = s.bonusActivo === true;
  if (s.bonusActivo !== undefined && s.bonusActivo !== true && s.bonusActivo !== false) {
    warnings.push(`bonusActivo inválido (${JSON.stringify(s.bonusActivo)}): vuelve a false.`);
  }
  out.autoClickSpeed = checkNum("autoClickSpeed", 100);
  if (out.autoClickSpeed > 10000) {
    warnings.push(`autoClickSpeed absurda (${s.autoClickSpeed}): vuelve a 1000.`);
    out.autoClickSpeed = 1000;
  }
  out.autoClickLevel = checkInt("autoClickLevel", 0, MAX_AUTO_CLICKER);
  out.clickBonus = checkNum("clickBonus");
  out.passiveRate = checkNum("passiveRate");
  out.autoPower = checkInt("autoPower", 4);
  out.imperioLvl = lvlMap(s.imperioLvl, {
    exo: { max: null }, fondo: { max: null }, overclock: { max: null },
    crit: { max: MAX_CRIT }, collector: { max: MAX_COLLECTOR },
  }, warnings, "imperioLvl");
  out.totalClicks = checkInt("totalClicks");
  out.cityRate = checkNum("cityRate");
  out.cityClickBonus = checkNum("cityClickBonus");
  out.cityLvl = lvlMap(s.cityLvl, {
    casa: { max: null }, mercado: { max: null },
    muralla: { max: MAX_MURALLA }, ayunta: { max: MAX_AYUNTA },
  }, warnings, "cityLvl");
  out.armyPower = checkNum("armyPower");
  out.armyLvl = lvlMap(s.armyLvl, {
    soldado: { max: null }, arquero: { max: null }, caballero: { max: null },
    general: { max: MAX_GENERAL },
  }, warnings, "armyLvl");
  out.lastRaidAt = checkNum("lastRaidAt");
  out.trainClickBonus = checkNum("trainClickBonus");
  out.trainRate = checkNum("trainRate");
  out.trainAutoBonus = checkNum("trainAutoBonus");
  out.trainLvl = lvlMap(s.trainLvl, {
    fuerza: { max: MAX_FUERZA }, disciplina: { max: MAX_DISCIPLINA },
    reflejos: { max: MAX_REFLEJOS },
  }, warnings, "trainLvl");
  out.miningRate = checkNum("miningRate");
  if (Array.isArray(s.purchasedMinerIds)) {
    const seen = new Set();
    out.purchasedMinerIds = s.purchasedMinerIds.filter((id) => {
      if (typeof id !== "string" || !RIG_IDS.has(id) || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
    if (out.purchasedMinerIds.length !== s.purchasedMinerIds.length) {
      warnings.push("purchasedMinerIds con ids desconocidos o duplicados: se filtraron.");
    }
  } else {
    warnings.push("purchasedMinerIds inválido: vuelve a [].");
    out.purchasedMinerIds = [];
  }
  out.vault = checkNum("vault");
  if (s.shopCounts && typeof s.shopCounts === "object" && !Array.isArray(s.shopCounts)) {
    out.shopCounts = {};
    for (const [k, v] of Object.entries(s.shopCounts)) {
      if (isNum(v) && Number.isInteger(v) && v > 0) out.shopCounts[k] = v;
    }
    if (Object.keys(out.shopCounts).length !== Object.keys(s.shopCounts).length) {
      warnings.push("shopCounts con entradas inválidas: se filtraron.");
    }
  } else {
    if (s.shopCounts !== undefined) warnings.push("shopCounts inválido: vuelve a {}.");
    out.shopCounts = {};
  }
  out.maxMoney = checkNum("maxMoney");
  out.totalCollected = checkInt("totalCollected");
  out.goldenCount = checkInt("goldenCount");
  out.totalRaids = checkInt("totalRaids");
  out.lastSeenAt = checkNum("lastSeenAt");
  out.lastOfflineAt = checkNum("lastOfflineAt");

  // unlockedLvl: el único campo que admite Infinity (solo si terminó todo).
  // Se serializa como null y se recalcula al cargar.
  const maxed = out.rebirlvl >= rebirthReq.length;
  if (s.unlockedLvl === null || s.unlockedLvl === undefined) {
    out.unlockedLvl = expectedUnlockedLvl(out.rebirlvl);
    warnings.push("unlockedLvl nulo: recalculado según rebirlvl.");
  } else if (maxed) {
    out.unlockedLvl = Infinity;
    if (s.unlockedLvl !== null && !(typeof s.unlockedLvl === "number" && !Number.isFinite(s.unlockedLvl))) {
      warnings.push("unlockedLvl con juego terminado: vuelve a Infinity.");
    }
  } else if (isNum(s.unlockedLvl) && s.unlockedLvl >= 1) {
    out.unlockedLvl = s.unlockedLvl;
  } else {
    out.unlockedLvl = expectedUnlockedLvl(out.rebirlvl);
    warnings.push(`unlockedLvl inválido (${JSON.stringify(s.unlockedLvl)}): recalculado.`);
  }

  out.version = SAVE_VERSION;
  void fix;
  return { state: out, warnings };
};

// Infinity (unlockedLvl en MAX) se serializa como null explícito.
export const serialize = (state) =>
  JSON.stringify(state, (_key, value) =>
    typeof value === "number" && !Number.isFinite(value) ? null : value,
  );

export const deserialize = (text) => {
  let raw;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, reason: "json-invalido", warnings: [] };
  }
  const mig = migrate(raw);
  if (!mig.ok) return mig;
  const val = validate(mig.state);
  return { ok: true, state: val.state, warnings: [...mig.warnings, ...val.warnings], migratedFrom: mig.migratedFrom };
};

// --- Acceso a localStorage (solo aquí, perezoso para poder importar en Node) ---
const storage = () =>
  typeof localStorage !== "undefined" ? localStorage : null;

export const loadSave = () => {
  const ls = storage();
  if (!ls) return { status: "sin-storage", state: defaultState(), warnings: [] };
  let raw = null;
  try {
    raw = ls.getItem(SAVE_KEY);
  } catch {
    return { status: "sin-storage", state: defaultState(), warnings: [] };
  }
  if (raw === null || raw === undefined || raw === "") {
    return { status: "fresh", state: defaultState(), warnings: [] };
  }
  const res = deserialize(raw);
  if (res.ok) return { status: "ok", ...res };
  return { status: "recovery", reason: res.reason, found: res.found, rawText: raw };
};

export const persistSave = (state) => {
  const ls = storage();
  if (!ls) return false;
  try {
    ls.setItem(SAVE_KEY, serialize(state));
    return true;
  } catch {
    return false;
  }
};

export const backupRaw = (text) => {
  const ls = storage();
  const key = `${BACKUP_PREFIX}${new Date().toISOString().replace(/[:.]/g, "-")}`;
  if (!ls) return null;
  try {
    ls.setItem(key, text);
    return key;
  } catch {
    return null;
  }
};

export const clearSave = () => {
  const ls = storage();
  if (!ls) return;
  try {
    ls.removeItem(SAVE_KEY);
  } catch {
    // ignorar
  }
};

export const readBackup = (key) => {
  const ls = storage();
  if (!ls || !key) return null;
  try {
    return ls.getItem(key);
  } catch {
    return null;
  }
};

// --- Offline FASE 4: aplicación pura + cobro atómico entre pestañas ---
// applyOfflineResult(state, gains, { now, claimedFrom }): devuelve el estado
// con money/vault/totalCollected/totalRaids/lastSeenAt/lastRaidAt/lastOfflineAt
// actualizados. Pura (no toca storage). Idempotente: si claimedFrom ya fue
// cobrado (state.lastOfflineAt === claimedFrom) o gains no es elegible,
// devuelve { state, applied: false }.
export const applyOfflineResult = (state, gains, { now = Date.now(), claimedFrom = 0 } = {}) => {
  if (!state || typeof state !== "object") return { state, applied: false };
  if (!gains || gains.eligible !== true) return { state, applied: false };
  if (typeof claimedFrom !== "number" || !Number.isFinite(claimedFrom) || claimedFrom <= 0) {
    return { state, applied: false };
  }
  if (state.lastOfflineAt === claimedFrom) return { state, applied: false };
  const safeAdd = (base, add) => {
    const b = typeof base === "number" && Number.isFinite(base) && base >= 0 ? base : 0;
    const a = typeof add === "number" && Number.isFinite(add) && add > 0 ? Math.floor(add) : 0;
    const r = b + a;
    return Number.isFinite(r) ? Math.min(r, Number.MAX_SAFE_INTEGER) : b;
  };
  const t = typeof now === "number" && Number.isFinite(now) && now > 0 ? Math.floor(now) : Date.now();
  return {
    state: {
      ...state,
      money: safeAdd(state.money, gains.totalToMoney),
      vault: safeAdd(state.vault, gains.miningToVault),
      totalCollected: safeAdd(state.totalCollected, gains.miningToMoney),
      totalRaids: safeAdd(state.totalRaids, gains.raids),
      lastRaidAt: gains.raids > 0 ? t : (state.lastRaidAt ?? 0),
      lastSeenAt: t,
      lastOfflineAt: Math.floor(claimedFrom),
    },
    applied: true,
  };
};

// tryClaimOffline(oldSeenAt, newState): solo una pestaña cobra.
// Lee el save persistido y lo compara con el T0 que se quiere cobrar:
//   - si el persistido ya marcó lastOfflineAt === T0 -> otra pestaña cobró.
//   - si el persistido ya avanzó lastSeenAt !== T0 -> ya se cobró/movió.
// Solo entonces persiste newState. Sin storage (Node/tests) devuelve ok:true
// sin persistir. Devuelve { ok, reason? }.
export const tryClaimOffline = (oldSeenAt, newState) => {
  const ls = storage();
  if (!ls) return { ok: true, reason: "sin-storage" };
  let persisted = null;
  try {
    const raw = ls.getItem(SAVE_KEY);
    if (raw) persisted = JSON.parse(raw);
  } catch {
    persisted = null;
  }
  if (persisted && typeof persisted === "object") {
    if (persisted.lastOfflineAt === oldSeenAt) {
      return { ok: false, reason: "already-claimed" };
    }
    if (persisted.lastSeenAt !== undefined && persisted.lastSeenAt !== oldSeenAt) {
      return { ok: false, reason: "already-updated" };
    }
  }
  const ok = persistSave(newState);
  return ok ? { ok: true } : { ok: false, reason: "persist-failed" };
};

// --- Checksum FNV-1a (simple, no criptográfico) ---
export const checksum = (str) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
};

// Exportar: base64 con formato, versión, fecha y checksum del estado canónico.
export const exportGame = (state) => {
  const val = validate(state);
  const canonical = serialize(val.state);
  const payload = {
    format: EXPORT_FORMAT,
    version: SAVE_VERSION,
    exportedAt: new Date().toISOString(),
    checksum: checksum(canonical),
    state: JSON.parse(canonical),
  };
  const text = JSON.stringify(payload);
  const b64 = typeof Buffer !== "undefined"
    ? Buffer.from(text, "utf-8").toString("base64")
    : btoa(unescape(encodeURIComponent(text)));
  return { text: b64, warnings: val.warnings };
};

// Importar: valida todo sin tocar la partida actual. Devuelve resumen o error.
export const importGame = (b64text) => {
  let text;
  try {
    text = typeof Buffer !== "undefined"
      ? Buffer.from(String(b64text).trim(), "base64").toString("utf-8")
      : decodeURIComponent(escape(atob(String(b64text).trim())));
  } catch {
    return { ok: false, error: "No es base64 válido." };
  }
  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    return { ok: false, error: "El contenido no es una exportación válida (JSON roto)." };
  }
  if (!payload || payload.format !== EXPORT_FORMAT || typeof payload.state !== "object") {
    return { ok: false, error: "No es una exportación de Clicker Empire." };
  }
  if (payload.version > SAVE_VERSION) {
    return { ok: false, error: `Exportación de versión futura (v${payload.version}): actualizá el juego.` };
  }
  const canonical = JSON.stringify(payload.state);
  if (checksum(canonical) !== payload.checksum) {
    return { ok: false, error: "Checksum inválido: el texto está alterado o incompleto." };
  }
  const mig = migrate(payload.state);
  if (!mig.ok) return { ok: false, error: `Migración fallida (${mig.reason}).` };
  const val = validate(mig.state);
  const st = val.state;
  return {
    ok: true,
    state: st,
    warnings: [...mig.warnings, ...val.warnings],
    summary: {
      version: payload.version,
      exportedAt: payload.exportedAt,
      rebirlvl: st.rebirlvl,
      money: st.money,
      multiplier: st.multiplier,
      rigs: st.purchasedMinerIds.length,
      lastSeenAt: st.lastSeenAt,
    },
  };
};
