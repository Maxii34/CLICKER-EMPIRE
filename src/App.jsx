import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import { Inicio } from "./components/pages/Inicio";
import { MenuNav } from "./components/shared/MenuNav";
import { ACHIEVEMENTS } from "./components/logros/achievements.js";

const SAVE_KEY = "clicker-empire-save-v1";

const loadSave = () => {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

function App() {
  // Carga inicial una sola vez (lazy) para no romper el primer render.
  const [saved] = useState(loadSave);

  // Estado del dinero.
  const [money, setMoney] = useState(saved?.money ?? 0);
  // Estado del multiplicador.
  const [multiplier, setMultiplier] = useState(saved?.multiplier ?? 1);
  // Estados para rebirths y niveles desbloqueados.
  const [rebirlvl, setRebirLvl] = useState(saved?.rebirlvl ?? 0);
  // Estado de los niveles desbloqueados. (Infinity se serializa como null → vuelve a Infinity)
  const [unlockedLvl, setUnlockedLvl] = useState(saved?.unlockedLvl ?? Infinity);
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
  // Niveles comprados en el panel imperio.
  // Merge con defaults para partidas viejas que no tienen crit/collector.
  const [imperioLvl, setImperioLvl] = useState({
    exo: 0,
    fondo: 0,
    overclock: 0,
    crit: 0,
    collector: 0,
    ...saved?.imperioLvl,
  });
  // Estadística total de clicks para el dashboard
  const [totalClicks, setTotalClicks] = useState(saved?.totalClicks ?? 0);

  // --- SISTEMA CIUDAD (panel izquierdo, pestaña Ciudad) ---
  // Renta pasiva de edificios: Casa + Mercado + Ayuntamiento → directo al dinero.
  const [cityRate, setCityRate] = useState(saved?.cityRate ?? 0);
  // Bonus plano al click por Murallas: ganancia = multiplier + clickBonus + cityClickBonus
  const [cityClickBonus, setCityClickBonus] = useState(saved?.cityClickBonus ?? 0);
  // Niveles de edificios. Merge con defaults para partidas viejas.
  const [cityLvl, setCityLvl] = useState({
    casa: 0,
    mercado: 0,
    muralla: 0,
    ayunta: 0,
    ...saved?.cityLvl,
  });

  // --- SISTEMA EJÉRCITO (panel izquierdo, pestaña Ejército) ---
  // Poder de saqueo: cada tropa suma poder. El botín = poder * RAID_MULT
  // y cae solo cada RAID_EVERY segundos o con el botón SAQUEAR.
  const [armyPower, setArmyPower] = useState(saved?.armyPower ?? 0);
  const [armyLvl, setArmyLvl] = useState({
    soldado: 0,
    arquero: 0,
    caballero: 0,
    general: 0,
    ...saved?.armyLvl,
  });
  // Cooldown del saqueo en segundos (no se persiste: arranca listo).
  const [raidCooldown, setRaidCooldown] = useState(0);

  // --- SISTEMA ENTRENAMIENTO (panel izquierdo, pestaña Entrenamiento) ---
  // Stats base permanentes: fuerza → click, disciplina → pasivo, reflejos → auto.
  const [trainClickBonus, setTrainClickBonus] = useState(
    saved?.trainClickBonus ?? 0,
  );
  const [trainRate, setTrainRate] = useState(saved?.trainRate ?? 0);
  const [trainAutoBonus, setTrainAutoBonus] = useState(
    saved?.trainAutoBonus ?? 0,
  );
  const [trainLvl, setTrainLvl] = useState({
    fuerza: 0,
    disciplina: 0,
    reflejos: 0,
    ...saved?.trainLvl,
  });

  // --- SISTEMA MINERÍA (panel derecho, ingreso pasivo permanente) ---
  // Declarado arriba: el autoguardado y passiveTotal lo usan.
  const [miningRate, setMiningRate] = useState(saved?.miningRate ?? 0);
  const [purchasedMinerIds, setPurchasedMinerIds] = useState(
    saved?.purchasedMinerIds ?? [],
  );
  // Bóveda minera: lo minado se acumula aquí hasta RECAUDAR.
  const [vault, setVault] = useState(saved?.vault ?? 0);

  // --- ESTADÍSTICAS PARA LOGROS (persistidas) ---
  const [maxMoney, setMaxMoney] = useState(saved?.maxMoney ?? 0);
  const [totalCollected, setTotalCollected] = useState(saved?.totalCollected ?? 0);
  const [goldenCount, setGoldenCount] = useState(saved?.goldenCount ?? 0);
  const [totalRaids, setTotalRaids] = useState(saved?.totalRaids ?? 0);

  // Récord de dinero (solo sube, las compras no lo bajan).
  useEffect(() => {
    setMaxMoney((m) => Math.max(m, money));
  }, [money]);

  // Autoguardado en cada cambio relevante.
  useEffect(() => {
    try {
      localStorage.setItem(
        SAVE_KEY,
        JSON.stringify({
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
          trainClickBonus,
          trainRate,
          trainAutoBonus,
          trainLvl,
          miningRate,
          purchasedMinerIds,
          vault,
          maxMoney,
          totalCollected,
          goldenCount,
          totalRaids,
        }),
      );
    } catch {
      // almacenamiento lleno o bloqueado: el juego sigue funcionando sin guardar
    }
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
    trainClickBonus,
    trainRate,
    trainAutoBonus,
    trainLvl,
    miningRate,
    purchasedMinerIds,
    vault,
    maxMoney,
    totalCollected,
    goldenCount,
    totalRaids,
  ]);

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
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch {
      // ignorar
    }
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
          schedule(60000 + Math.random() * 90000);
        }, 12000);
      }, delay);
    };
    schedule(25000);
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

  // Ganancias derivadas (para mostrar en UI sin recalcular en cada hijo)
  // Frenesí: x3 al click (y por ende al auto, que deriva del click).
  // Entrenamiento suma base: fuerza al click, reflejos al auto.
  const moneyPerClick =
    (multiplier + clickBonus + cityClickBonus + trainClickBonus) *
    (frenzyLeft > 0 ? 3 : 1);
  const moneyPerAuto = moneyPerClick * autoPower + trainAutoBonus;

  // --- SAQUEO DEL EJÉRCITO: botín = poder x multiplicador ---
  const RAID_EVERY = 45;
  const RAID_MULT = 8;
  const raidLoot = armyPower * RAID_MULT;

  const doRaid = () => {
    if (armyPower <= 0 || raidCooldown > 0) return false;
    setMoney((m) => m + raidLoot);
    setTotalRaids((c) => c + 1);
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
    setRaidCooldown(RAID_EVERY);
  }, [armyPower, raidCooldown]);

  // Recoger el dorado: 50% frenesí x3 (20s) / 50% fortuna instantánea.
  const collectGolden = () => {
    if (!golden) return;
    setGolden(null);
    setGoldenCount((c) => c + 1);
    beep();
    if (Math.random() < 0.5) {
      setFrenzyLeft(20);
      setGoldenMsg("FRENESÍ x3 por 20s");
    } else {
      const bonus = Math.floor(Math.max(moneyPerClick * 30, money * 0.15));
      setMoney((m) => m + bonus);
      setGoldenMsg(`+$${bonus.toLocaleString("es-AR")}`);
    }
  };

  // --- Críticos: +3% chance por nivel (MAX 10 = 30%), golpe x5 ---
  const CRIT_MULT = 5;
  const critChance = (imperioLvl.crit || 0) * 3;

  // --- Recolector: recauda la bóveda solo cada N segundos ---
  const collectorLvl = imperioLvl.collector || 0;
  const collectEverySec = collectorLvl > 0 ? Math.max(10, 35 - collectorLvl * 5) : 0;

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
  // Fondo + Ciudad + Disciplina → directo al dinero. Minería → a la bóveda.
  const passiveTotal = passiveRate + miningRate + cityRate + trainRate;
  const directPassive = passiveRate + cityRate + trainRate;
  useEffect(() => {
    if (passiveTotal <= 0) return;
    const interval = setInterval(() => {
      if (directPassive > 0) setMoney((prev) => prev + directPassive);
      if (miningRate > 0) setVault((prev) => prev + miningRate);
    }, 1000);
    return () => clearInterval(interval);
  }, [directPassive, miningRate, passiveTotal]);

  // Recaudar bóveda: mueve lo minado al dinero total.
  const collectVault = () => {
    if (vault <= 0) return;
    setMoney((prev) => prev + vault);
    setTotalCollected((c) => c + Math.floor(vault));
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

  // Compra genérica del panel Imperio.
  const buyImperio = (key, cost, apply) => {
    if (money < cost) return false;
    setMoney((prev) => prev - cost);
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
    if (money < cost) return false;
    setMoney((prev) => prev - cost);
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
    if (money < cost) return false;
    setMoney((prev) => prev - cost);
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
    if (money < cost) return false;
    setMoney((prev) => prev - cost);
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
    if (money < up.cost) return false;
    setMoney((prev) => prev - up.cost);
    setPurchasedMinerIds((prev) => [...prev, up.id]);
    setMiningRate((prev) => prev + up.value);
    return true;
  };

  // Función para agregar dinero de desarrollo (testing).
  const addMoneyDev = () => {
    setMoney((prev) => prev + 50000000);
  };
  const removeMoney = () => {
    setMoney(0);
  };


  // Función para comprar mejoras.
  // REDONDEO AL TOPE: si el aumento supera el máximo del nivel o el tope
  // desbloqueado, se completa justo hasta el tope en vez de bloquearse.
  // Así nunca quedas trabado a pocos puntos del renacimiento (ej: 102/105).
  const buyUpgrade = (cost, increment, max) => {
    if (money < cost) return;
    const cap = Math.min(max, unlockedLvl);
    if (multiplier >= cap) return;
    const newValue = Math.min(multiplier + increment, cap);
    if (newValue <= multiplier) return;
    setMoney((prev) => prev - cost);
    setMultiplier(Number(newValue.toFixed(2)));
  };
  return (
    <>
      <MenuNav
        money={money}
        multiplier={multiplier}
        bonusActivo={bonusActivo}
        rebirlvl={rebirlvl}
        moneyPerClick={moneyPerClick}
        passiveTotal={passiveRate + cityRate + trainRate}
        autoClick={autoClick}
        addMoneyDev={addMoneyDev}
        removeMoney={removeMoney}
        resetSave={resetSave}
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
          passiveTotal={passiveRate + cityRate + trainRate}
          miningRate={miningRate}
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
