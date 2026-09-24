import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import { Inicio } from "./components/pages/Inicio";
import { MenuNav } from "./components/shared/MenuNav";
import { ACHIEVEMENTS } from "./components/logros/achievements.js";
import rebirthReq from "./components/rebirs/rebirthReq.js";
import upgrades from "./components/upgrader/upgrades.js";
import {
  RAID_EVERY,
  CRIT_MULT,
  FRENZY_DURATION_SEC,
  GOLDEN_FIRST_DELAY_MS,
  GOLDEN_MIN_DELAY_MS,
  GOLDEN_MAX_EXTRA_MS,
  GOLDEN_VISIBLE_MS,
  DEV_MONEY,
  SHOP_GROWTH,
} from "./game/constants.js";
import {
  welcomeFactor,
  moneyPerClick as calcMoneyPerClick,
  moneyPerAuto as calcMoneyPerAuto,
  directPassivePerSec,
  raidLoot as calcRaidLoot,
  critChance as calcCritChance,
  collectorEverySec as calcCollectorEverySec,
  effectiveMiningRate as calcEffectiveMining,
  goldenFortune,
  raidCooldownLeft,
  isValidCost,
  canPay as canPayPure,
  shopPrice,
} from "./game/economy.js";

// #14: verificación automática de que rebirthReq.multiplier coincide con upgrades.max por nivel.
const verifyShopCap = () => {
  const maxByLevel = new Map();
  for (const up of upgrades) maxByLevel.set(up.level, up.max);
  for (const req of rebirthReq) {
    if (maxByLevel.get(req.level) !== req.multiplier) {
      console.error(
        `[balance] Desajuste RB${req.level}: upgrades.max=${maxByLevel.get(req.level)} vs rebirthReq.multiplier=${req.multiplier}`,
      );
    }
  }
};
verifyShopCap();

import {
  loadSave,
  persistSave,
  backupRaw,
  clearSave,
} from "./game/save.js";
import { SaveRecovery } from "./components/shared/SaveRecovery.jsx";

function App() {
  // Carga inicial una sola vez (save.js: migrate + validate + defaults).
  // Si el save está grave (JSON roto, versión futura), se ofrece recovery.
  const [initial] = useState(loadSave);
  const saved = initial.status === "recovery" ? null : initial.state;
  const loadWarnings = initial.status === "recovery" ? [] : (initial.warnings ?? []);

  // Respaldo del texto original si la carga falló (una sola vez).
  const [backupKey, setBackupKey] = useState(null);
  const backedUpRef = useRef(false);
  useEffect(() => {
    if (initial.status === "recovery" && !backedUpRef.current) {
      backedUpRef.current = true;
      setBackupKey(backupRaw(initial.rawText));
    }
  }, [initial]);
  // Avisos de validación/migración a consola (no se pierde nada).
  useEffect(() => {
    for (const w of loadWarnings) console.warn(`[save] ${w}`);
  }, [loadWarnings]);

  // Estado del dinero (validado en save.js: finito y >= 0).
  const [money, setMoney] = useState(saved?.money ?? 0);
  // Estado del multiplicador (validado: finito y >= 1).
  const [multiplier, setMultiplier] = useState(saved?.multiplier ?? 1);
  // Estados para rebirths y niveles desbloqueados.
  const [rebirlvl, setRebirLvl] = useState(saved?.rebirlvl ?? 0);
  // Tope de tienda (validado; Infinity solo si terminó todo).
  const [unlockedLvl, setUnlockedLvl] = useState(
    saved?.unlockedLvl ?? Infinity,
  );
  // Estado para el bonus de bienvenida
  const [bonusActivo, setBonusActivo] = useState(saved?.bonusActivo ?? false);
  //Estados para el autoclick (no se persiste encendido: siempre arranca apagado)
  const [autoClick, setAutoClick] = useState(false);
  // Estado para la velocidad del autoclick
  const [autoClickSpeed, setAutoClickSpeed] = useState(saved?.autoClickSpeed ?? 1000);
  // Nivel del autoclicker (antes vivía dentro de BonusAutoClick y se perdía al recargar)
  const [autoClickLevel, setAutoClickLevel] = useState(saved?.autoClickLevel ?? 0);

  // --- SISTEMA IMPERIO (panel izquierdo) ---
  // Bono plano que se suma a cada click: ganancia = multiplier + clickBonus
  const [clickBonus, setClickBonus] = useState(saved?.clickBonus ?? 0);
  // Ingreso pasivo en $/seg (Fondo de Inversión)
  const [passiveRate, setPassiveRate] = useState(saved?.passiveRate ?? 0);
  // Potencia del autoclicker: ganancia = (multiplier + clickBonus) * autoPower
  const [autoPower, setAutoPower] = useState(saved?.autoPower ?? 4);
  // Niveles comprados en el panel imperio (validados en save.js).
  const [imperioLvl, setImperioLvl] = useState(
    saved?.imperioLvl ?? { exo: 0, fondo: 0, overclock: 0, crit: 0, collector: 0 },
  );
  // Estadística total de clicks para el dashboard
  const [totalClicks, setTotalClicks] = useState(saved?.totalClicks ?? 0);

  // --- SISTEMA CIUDAD (panel izquierdo, pestaña Ciudad) ---
  // Renta pasiva de edificios: Casa + Mercado + Ayuntamiento → directo al dinero.
  const [cityRate, setCityRate] = useState(saved?.cityRate ?? 0);
  // Bonus plano al click por Murallas: ganancia = multiplier + clickBonus + cityClickBonus
  const [cityClickBonus, setCityClickBonus] = useState(saved?.cityClickBonus ?? 0);
  // Niveles de edificios (validados en save.js).
  const [cityLvl, setCityLvl] = useState(
    saved?.cityLvl ?? { casa: 0, mercado: 0, muralla: 0, ayunta: 0 },
  );

  // --- SISTEMA EJÉRCITO (panel izquierdo, pestaña Ejército) ---
  // Poder de saqueo: cada tropa suma poder. El botín = poder * RAID_MULT
  // y cae solo cada RAID_EVERY segundos o con el botón SAQUEAR.
  const [armyPower, setArmyPower] = useState(saved?.armyPower ?? 0);
  const [armyLvl, setArmyLvl] = useState(
    saved?.armyLvl ?? { soldado: 0, arquero: 0, caballero: 0, general: 0 },
  );
  // Timestamp del último saqueo (persistido). Recargar ya no regala uno gratis:
  // el cooldown inicial se recalcula desde este timestamp.
  const [lastRaidAt, setLastRaidAt] = useState(saved?.lastRaidAt ?? 0);
  // Cooldown del saqueo en segundos (derivado de lastRaidAt al cargar).
  const [raidCooldown, setRaidCooldown] = useState(() =>
    raidCooldownLeft(lastRaidAt, saved?.armyPower ?? 0),
  );

  // --- SISTEMA ENTRENAMIENTO (panel izquierdo, pestaña Entrenamiento) ---
  // Stats base permanentes: fuerza → click, disciplina → pasivo, reflejos → auto.
  const [trainClickBonus, setTrainClickBonus] = useState(saved?.trainClickBonus ?? 0);
  const [trainRate, setTrainRate] = useState(saved?.trainRate ?? 0);
  const [trainAutoBonus, setTrainAutoBonus] = useState(saved?.trainAutoBonus ?? 0);
  const [trainLvl, setTrainLvl] = useState(
    saved?.trainLvl ?? { fuerza: 0, disciplina: 0, reflejos: 0 },
  );

  // --- SISTEMA MINERÍA (panel derecho, ingreso pasivo permanente) ---
  // Declarado arriba: el autoguardado y passiveTotal lo usan.
  const [miningRate, setMiningRate] = useState(saved?.miningRate ?? 0);
  const [purchasedMinerIds, setPurchasedMinerIds] = useState(
    saved?.purchasedMinerIds ?? [],
  );
  // Bóveda minera: lo minado se acumula aquí hasta RECAUDAR.
  const [vault, setVault] = useState(saved?.vault ?? 0);
  // P2 (tienda C): veces comprado cada ítem (índice en upgrades.js).
  // Se resetea al renacer. Saves viejos (sin campo) arrancan en {}.
  const [shopCounts, setShopCounts] = useState(saved?.shopCounts ?? {});
  // FASE 4 (offline): última vez visto. Por ahora solo se guarda.
  const [lastSeenAt, setLastSeenAt] = useState(saved?.lastSeenAt ?? 0);

  // --- ESTADÍSTICAS PARA LOGROS (persistidas) ---
  const [maxMoney, setMaxMoney] = useState(saved?.maxMoney ?? 0);
  const [totalCollected, setTotalCollected] = useState(saved?.totalCollected ?? 0);
  const [goldenCount, setGoldenCount] = useState(saved?.goldenCount ?? 0);
  const [totalRaids, setTotalRaids] = useState(saved?.totalRaids ?? 0);

  // Récord de dinero (solo sube, las compras no lo bajan).
  useEffect(() => {
    setMaxMoney((m) => Math.max(m, money));
  }, [money]);

  // Foto del estado para guardar (JSON puro, esquema en AGENTS.md).
  const buildSnapshot = () => ({
    version: 2,
    money,
    multiplier,
    rebirlvl,
    unlockedLvl,
    bonusActivo,
    autoClickSpeed,
    autoClickLevel,
    clickBonus,
    passiveRate,
    autoPower,
    imperioLvl,
    totalClicks,
    cityRate,
    cityClickBonus,
    cityLvl,
    armyPower,
    armyLvl,
    lastRaidAt,
    trainClickBonus,
    trainRate,
    trainAutoBonus,
    trainLvl,
    miningRate,
    purchasedMinerIds,
    vault,
    shopCounts,
    maxMoney,
    totalCollected,
    goldenCount,
    totalRaids,
    lastSeenAt,
  });

  // Espejo siempre fresco para guardar al ocultar/cerrar la pestaña.
  const snapshotRef = useRef(null);
  snapshotRef.current = buildSnapshot();

  // Autoguardado en cada cambio relevante (vía save.js, con lastSeenAt fresco).
  useEffect(() => {
    persistSave({ ...snapshotRef.current, lastSeenAt: Date.now() });
  }, [
    money,
    multiplier,
    rebirlvl,
    unlockedLvl,
    bonusActivo,
    autoClickSpeed,
    autoClickLevel,
    clickBonus,
    passiveRate,
    autoPower,
    imperioLvl,
    totalClicks,
    cityRate,
    cityClickBonus,
    cityLvl,
    armyPower,
    armyLvl,
    lastRaidAt,
    trainClickBonus,
    trainRate,
    trainAutoBonus,
    trainLvl,
    miningRate,
    purchasedMinerIds,
    vault,
    shopCounts,
    maxMoney,
    totalCollected,
    goldenCount,
    totalRaids,
    lastSeenAt,
  ]);

  // Guardar al ocultar o cerrar la pestaña (FASE 4 usará lastSeenAt).
  useEffect(() => {
    const saveNow = () => {
      setLastSeenAt(Date.now());
      persistSave({ ...snapshotRef.current, lastSeenAt: Date.now() });
    };
    const onVis = () => {
      if (document.visibilityState === "hidden") saveNow();
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pagehide", saveNow);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pagehide", saveNow);
    };
  }, []);

  // --- LOGROS: desbloqueo derivado + toast solo para los nuevos ---
  const achStats = {
    totalClicks,
    maxMoney,
    rebirlvl,
    rigs: purchasedMinerIds.length,
    bonusActivo,
    autoClickLevel,
    crit: imperioLvl.crit || 0,
    collector: imperioLvl.collector || 0,
    totalCollected,
    goldenCount,
    cityBuildings:
      (cityLvl.casa || 0) +
      (cityLvl.mercado || 0) +
      (cityLvl.muralla || 0) +
      (cityLvl.ayunta || 0),
    armyTroops:
      (armyLvl.soldado || 0) +
      (armyLvl.arquero || 0) +
      (armyLvl.caballero || 0) +
      (armyLvl.general || 0),
    trainStats:
      (trainLvl.fuerza || 0) +
      (trainLvl.disciplina || 0) +
      (trainLvl.reflejos || 0),
    totalRaids,
  };
  const unlockedIds = useMemo(
    () => ACHIEVEMENTS.filter((a) => a.test(achStats)).map((a) => a.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      totalClicks,
      maxMoney,
      rebirlvl,
      purchasedMinerIds.length,
      bonusActivo,
      autoClickLevel,
      imperioLvl.crit,
      imperioLvl.collector,
      totalCollected,
      goldenCount,
      cityLvl.casa,
      cityLvl.mercado,
      cityLvl.muralla,
      cityLvl.ayunta,
      armyLvl.soldado,
      armyLvl.arquero,
      armyLvl.caballero,
      armyLvl.general,
      trainLvl.fuerza,
      trainLvl.disciplina,
      trainLvl.reflejos,
      totalRaids,
    ],
  );
  const seenAchRef = useRef(null);
  const [achToast, setAchToast] = useState(null);

  useEffect(() => {
    // Primera vez: marca la base sin avisar (partida ya avanzada).
    if (seenAchRef.current === null) {
      seenAchRef.current = new Set(unlockedIds);
      return;
    }
    const fresh = unlockedIds.filter((id) => !seenAchRef.current.has(id));
    if (fresh.length > 0) {
      fresh.forEach((id) => seenAchRef.current.add(id));
      setAchToast(ACHIEVEMENTS.find((a) => a.id === fresh[0]));
    }
  }, [unlockedIds]);

  // El toast se oculta solo a los 4s.
  useEffect(() => {
    if (!achToast) return;
    const id = setTimeout(() => setAchToast(null), 4000);
    return () => clearTimeout(id);
  }, [achToast]);

  const resetSave = () => {
    clearSave();
    window.location.reload();
  };

  // --- EVENTO DORADO (estilo Cookie Clicker) ---
  // golden: botón dorado visible en la zona de click {id, x, y} | null
  const [golden, setGolden] = useState(null);
  // frenzyLeft: segundos restantes de frenesí x3 (0 = inactivo, no se persiste)
  const [frenzyLeft, setFrenzyLeft] = useState(0);
  // goldenMsg: texto del último premio, se muestra unos segundos
  const [goldenMsg, setGoldenMsg] = useState("");

  // Aparición: primera a los 25s, luego cada 60-150s. Dura 12s visible.
  useEffect(() => {
    let alive = true;
    let tSpawn;
    let tDespawn;
    const schedule = (delay) => {
      tSpawn = setTimeout(() => {
        if (!alive) return;
        setGolden({
          id: Date.now(),
          x: 8 + Math.random() * 76,
          y: 2 + Math.random() * 60,
        });
        tDespawn = setTimeout(() => {
          if (!alive) return;
          setGolden(null);
          schedule(GOLDEN_MIN_DELAY_MS + Math.random() * GOLDEN_MAX_EXTRA_MS);
        }, GOLDEN_VISIBLE_MS);
      }, delay);
    };
    schedule(GOLDEN_FIRST_DELAY_MS);
    return () => {
      alive = false;
      clearTimeout(tSpawn);
      clearTimeout(tDespawn);
    };
  }, []);

  // Descuento del frenesí, segundo a segundo.
  useEffect(() => {
    if (frenzyLeft <= 0) return;
    const id = setTimeout(() => setFrenzyLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [frenzyLeft]);

  // Limpia el mensaje del premio a los 4s.
  useEffect(() => {
    if (!goldenMsg) return;
    const id = setTimeout(() => setGoldenMsg(""), 4000);
    return () => clearTimeout(id);
  }, [goldenMsg]);

  const beep = () => {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.type = "sine";
      o.frequency.value = 880;
      g.gain.setValueAtTime(0.08, ctx.currentTime);
      o.start();
      o.stop(ctx.currentTime + 0.25);
      setTimeout(() => ctx.close(), 400);
    } catch {
      // sin audio disponible: el juego sigue igual
    }
  };

  // Ganancias derivadas (economy.js, funciones puras — mismo cálculo que antes).
  const moneyPerClick = calcMoneyPerClick({
    multiplier,
    bonusActivo,
    clickBonus,
    cityClickBonus,
    trainClickBonus,
    frenzy: frenzyLeft > 0,
  });
  const moneyPerAuto = calcMoneyPerAuto(moneyPerClick, { autoPower, trainAutoBonus });

  // --- SAQUEO DEL EJÉRCITO: botín entero cada RAID_EVERY segundos ---
  const raidLoot = calcRaidLoot(armyPower);

  const doRaid = () => {
    if (armyPower <= 0 || raidCooldown > 0) return false;
    const loot = Math.floor(raidLoot);
    if (loot <= 0) return false;
    setMoney((m) => m + loot);
    setTotalRaids((c) => c + 1);
    setLastRaidAt(Date.now());
    setRaidCooldown(RAID_EVERY);
    return true;
  };

  // Descuento del cooldown + saqueo automático al llegar a 0.
  const raidLootRef = useRef(raidLoot);
  useEffect(() => {
    raidLootRef.current = raidLoot;
  }, [raidLoot]);

  useEffect(() => {
    if (armyPower <= 0) return;
    if (raidCooldown > 0) {
      const id = setTimeout(() => setRaidCooldown((s) => s - 1), 1000);
      return () => clearTimeout(id);
    }
    // Cooldown en 0 con tropas → saqueo automático.
    const loot = Math.floor(raidLootRef.current);
    if (loot > 0) setMoney((m) => m + loot);
    setTotalRaids((c) => c + 1);
    setLastRaidAt(Date.now());
    setRaidCooldown(RAID_EVERY);
  }, [armyPower, raidCooldown]);

  // Recoger el dorado: 50% frenesí x3 (20s) / 50% fortuna instantánea.
  const collectGolden = () => {
    if (!golden) return;
    setGolden(null);
    setGoldenCount((c) => c + 1);
    beep();
    if (Math.random() < 0.5) {
      setFrenzyLeft(FRENZY_DURATION_SEC);
      setGoldenMsg("FRENESÍ x3 por 20s");
    } else {
      const bonus = goldenFortune(moneyPerClick, money);
      setMoney((m) => m + bonus);
      setGoldenMsg(`+$${bonus.toLocaleString("es-AR")}`);
    }
  };

  // --- Críticos: +3% chance por nivel (MAX 10 = 30%), golpe x5 ---
  const critChance = calcCritChance(imperioLvl.crit || 0);

  // --- Recolector: recauda la bóveda solo cada N segundos ---
  const collectorLvl = imperioLvl.collector || 0;
  const collectEverySec = calcCollectorEverySec(collectorLvl);

  // Función para manejar el clic principal del juego.
  const handleClick = () => {
    const isCrit = critChance > 0 && Math.random() * 100 < critChance;
    const gain = isCrit ? moneyPerClick * CRIT_MULT : moneyPerClick;
    setMoney((prev) => prev + gain);
    setTotalClicks((prev) => prev + 1);
  };
  // Función para manejar el clic del autoclicker.
  const handleAutoClick = () => {
    setMoney((prev) => prev + moneyPerAuto);
  };

  // Efecto para manejar el autoclick.
  useEffect(() => {
    if (!autoClick) return;
    const interval = setInterval(() => {
      handleAutoClick(); // ← Usa la potencia mejorable del imperio
    }, autoClickSpeed);
    return () => clearInterval(interval);
  }, [autoClick, autoClickSpeed, moneyPerAuto]);

  // Efecto para el ingreso pasivo.
  // passivePerSec = Fondo + Ciudad + Disciplina → directo al dinero.
  // Minería efectiva (base +10%/nv Recolector) → a la bóveda, NO directo.
  const passivePerSec = directPassivePerSec({ passiveRate, cityRate, trainRate });
  const directPassive = passivePerSec;
  const miningPerSec = calcEffectiveMining(miningRate, collectorLvl);
  useEffect(() => {
    if (directPassive + miningPerSec <= 0) return;
    const interval = setInterval(() => {
      if (directPassive > 0) setMoney((prev) => prev + directPassive);
      if (miningPerSec > 0) setVault((prev) => prev + miningPerSec);
    }, 1000);
    return () => clearInterval(interval);
  }, [directPassive, miningPerSec]);

  // Recaudar bóveda: mueve lo minado al dinero total (siempre entero).
  const collectVault = () => {
    const v = Math.floor(vault);
    if (v <= 0) return;
    setMoney((prev) => prev + v);
    setTotalCollected((c) => c + v);
    setVault(0);
  };

  // Espejo de la bóveda para el recolector (evita setters anidados).
  const vaultRef = useRef(vault);
  useEffect(() => {
    vaultRef.current = vault;
  }, [vault]);

  // Recolector automático: si hay algo en la bóveda, la vacía cada N seg.
  useEffect(() => {
    if (collectorLvl <= 0) return;
    const id = setInterval(() => {
      const v = Math.floor(vaultRef.current);
      if (v > 0) {
        setVault(0);
        setMoney((m) => m + v);
        setTotalCollected((c) => c + v);
      }
    }, collectEverySec * 1000);
    return () => clearInterval(id);
  }, [collectorLvl, collectEverySec]);

  // #12: validación pura (economy.js) + descuento con clamp anti stale.
  const canPay = (cost) => canPayPure(money, cost);
  const spendMoney = (cost) =>
    setMoney((prev) => {
      if (!Number.isFinite(prev)) return 0;
      return Math.max(0, prev - cost);
    });

  // Compra genérica del panel Imperio.
  const buyImperio = (key, cost, apply) => {
    if (!canPay(cost)) return false;
    spendMoney(cost);
    setImperioLvl((prev) => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
    apply();
    return true;
  };

  const buyExo = (cost) =>
    buyImperio("exo", cost, () => setClickBonus((p) => p + 2));
  const buyFondo = (cost) =>
    buyImperio("fondo", cost, () => setPassiveRate((p) => p + 5));
  const buyOverclock = (cost) =>
    buyImperio("overclock", cost, () => setAutoPower((p) => p + 1));
  // Crítico y recolector se derivan del nivel: no hace falta efecto extra.
  const buyCrit = (cost) => buyImperio("crit", cost, () => {});
  const buyCollector = (cost) => buyImperio("collector", cost, () => {});

  // Compra genérica del panel Ciudad (misma idea que Imperio).
  const buyCiudad = (key, cost, apply) => {
    if (!canPay(cost)) return false;
    spendMoney(cost);
    setCityLvl((prev) => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
    apply();
    return true;
  };

  const buyCasa = (cost) => buyCiudad("casa", cost, () => setCityRate((p) => p + 2));
  const buyMercado = (cost) =>
    buyCiudad("mercado", cost, () => setCityRate((p) => p + 7));
  const buyMuralla = (cost) =>
    buyCiudad("muralla", cost, () => setCityClickBonus((p) => p + 2));
  const buyAyunta = (cost) =>
    buyCiudad("ayunta", cost, () => setCityRate((p) => p + 25));

  // Compra genérica del panel Ejército.
  const buyEjercito = (key, cost, power) => {
    if (!canPay(cost)) return false;
    if (!Number.isFinite(power) || power <= 0) return false;
    spendMoney(cost);
    setArmyLvl((prev) => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
    setArmyPower((p) => p + power);
    return true;
  };

  const buySoldado = (cost) => buyEjercito("soldado", cost, 12);
  const buyArquero = (cost) => buyEjercito("arquero", cost, 35);
  const buyCaballero = (cost) => buyEjercito("caballero", cost, 100);
  const buyGeneral = (cost) => buyEjercito("general", cost, 300);

  // Compra genérica del panel Entrenamiento.
  const buyEntreno = (key, cost, apply) => {
    if (!canPay(cost)) return false;
    spendMoney(cost);
    setTrainLvl((prev) => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
    apply();
    return true;
  };

  const buyFuerza = (cost) =>
    buyEntreno("fuerza", cost, () => setTrainClickBonus((p) => p + 3));
  const buyDisciplina = (cost) =>
    buyEntreno("disciplina", cost, () => setTrainRate((p) => p + 4));
  const buyReflejos = (cost) =>
    buyEntreno("reflejos", cost, () => setTrainAutoBonus((p) => p + 12));

  const buyMiner = (up) => {
    if (!up || purchasedMinerIds.includes(up.id)) return false;
    if (!isValidCost(up?.cost)) return false;
    if (!Number.isFinite(up?.value)) return false;
    if (!canPay(up.cost)) return false;
    spendMoney(up.cost);
    setPurchasedMinerIds((prev) => [...prev, up.id]);
    setMiningRate((prev) => prev + up.value);
    return true;
  };

  // Función para agregar dinero de desarrollo (testing, solo DEV).
  const addMoneyDev = () => {
    setMoney((prev) => prev + DEV_MONEY);
  };
  const removeMoney = () => {
    setMoney(0);
  };


  // Función para comprar mejoras (tienda modelo C: precio crece +30%
  // por compra previa del mismo ítem; el contador se resetea al renacer).
  // REDONDEO AL TOPE: si el aumento supera el máximo del nivel o el tope
  // desbloqueado, se completa justo hasta el tope en vez de bloquearse.
  // Así nunca quedas trabado a pocos puntos del renacimiento (ej: 102/105).
  const buyUpgrade = (shopIdx) => {
    const up = upgrades[shopIdx];
    if (!up) return;
    const times = Number.isFinite(shopCounts[shopIdx]) ? shopCounts[shopIdx] : 0;
    const cost = shopPrice(up.cost, times, SHOP_GROWTH);
    if (!canPay(cost)) return;
    if (!Number.isFinite(up.value) || !Number.isFinite(up.max)) return;
    const cap = Math.min(up.max, unlockedLvl);
    if (!Number.isFinite(cap)) return;
    if (multiplier >= cap) return;
    const newValue = Math.min(multiplier + up.value, cap);
    if (newValue <= multiplier) return;
    spendMoney(cost);
    setMultiplier(Number(newValue.toFixed(2)));
    setShopCounts((prev) => ({ ...prev, [shopIdx]: (prev[shopIdx] || 0) + 1 }));
  };
  // Save grave: no se toca nada sin avisar. Pantalla de recovery con
  // el respaldo ya guardado en otra clave.
  if (initial.status === "recovery") {
    return (
      <SaveRecovery
        reason={initial.reason}
        found={initial.found}
        backupKey={backupKey}
      />
    );
  }

  return (
    <>
      <MenuNav
        money={money}
        multiplier={multiplier}
        bonusActivo={bonusActivo}
        rebirlvl={rebirlvl}
        moneyPerClick={moneyPerClick}
        passivePerSec={passivePerSec}
        autoClick={autoClick}
        addMoneyDev={addMoneyDev}
        removeMoney={removeMoney}
        resetSave={resetSave}
        saveSnapshot={snapshotRef.current}
        saveWarnings={loadWarnings}
      />
      <main>
        <Inicio
          money={money}
          setMoney={setMoney}
          multiplier={multiplier}
          setMultiplier={setMultiplier}
          buyUpgrade={buyUpgrade}
          handleClick={handleClick}
          setRebirLvl={setRebirLvl}
          rebirlvl={rebirlvl}
          setUnlockedLvl={setUnlockedLvl}
          unlockedLvl={unlockedLvl}
          shopCounts={shopCounts}
          setShopCounts={setShopCounts}
          bonusActivo={bonusActivo}
          setBonusActivo={setBonusActivo}
          setAutoClickSpeed={setAutoClickSpeed}
          autoClickSpeed={autoClickSpeed}
          autoClick={autoClick}
          setAutoClick={setAutoClick}
          autoClickLevel={autoClickLevel}
          setAutoClickLevel={setAutoClickLevel}
          clickBonus={clickBonus}
          passiveRate={passiveRate}
          autoPower={autoPower}
          imperioLvl={imperioLvl}
          totalClicks={totalClicks}
          moneyPerClick={moneyPerClick}
          moneyPerAuto={moneyPerAuto}
          buyExo={buyExo}
          buyFondo={buyFondo}
          buyOverclock={buyOverclock}
          critChance={critChance}
          critMult={CRIT_MULT}
          collectEverySec={collectEverySec}
          buyCrit={buyCrit}
          buyCollector={buyCollector}
          cityLvl={cityLvl}
          cityRate={cityRate}
          cityClickBonus={cityClickBonus}
          buyCasa={buyCasa}
          buyMercado={buyMercado}
          buyMuralla={buyMuralla}
          buyAyunta={buyAyunta}
          armyLvl={armyLvl}
          armyPower={armyPower}
          raidLoot={raidLoot}
          raidCooldown={raidCooldown}
          raidEvery={RAID_EVERY}
          totalRaids={totalRaids}
          buySoldado={buySoldado}
          buyArquero={buyArquero}
          buyCaballero={buyCaballero}
          buyGeneral={buyGeneral}
          doRaid={doRaid}
          trainLvl={trainLvl}
          trainClickBonus={trainClickBonus}
          trainRate={trainRate}
          trainAutoBonus={trainAutoBonus}
          buyFuerza={buyFuerza}
          buyDisciplina={buyDisciplina}
          buyReflejos={buyReflejos}
          passivePerSec={passivePerSec}
          miningRate={miningPerSec}
          purchasedMinerIds={purchasedMinerIds}
          buyMiner={buyMiner}
          vault={vault}
          collectVault={collectVault}
          golden={golden}
          frenzyLeft={frenzyLeft}
          goldenMsg={goldenMsg}
          collectGolden={collectGolden}
          unlockedIds={unlockedIds}
        />
      </main>

      {/* Toast de logro desbloqueado */}
      {achToast && (
        <div className="ach-toast" key={achToast.id}>
          <span className="ach-toast-icon">
            <achToast.icon />
          </span>
          <span className="ach-toast-text">
            <strong>¡Logro desbloqueado!</strong>
            <small>{achToast.name}</small>
          </span>
        </div>
      )}
    </>
  );
}

export default App;
