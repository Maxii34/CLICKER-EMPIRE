import { useEffect, useState } from "react";
import "./App.css";
import { Inicio } from "./components/pages/Inicio";
import { MenuNav } from "./components/shared/MenuNav";

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
  // Niveles comprados en el panel imperio { exo, fondo, overclock }
  const [imperioLvl, setImperioLvl] = useState(
    saved?.imperioLvl ?? { exo: 0, fondo: 0, overclock: 0 },
  );
  // Estadística total de clicks para el dashboard
  const [totalClicks, setTotalClicks] = useState(saved?.totalClicks ?? 0);

  // --- SISTEMA MINERÍA (panel derecho, ingreso pasivo permanente) ---
  // Declarado arriba: el autoguardado y passiveTotal lo usan.
  const [miningRate, setMiningRate] = useState(saved?.miningRate ?? 0);
  const [purchasedMinerIds, setPurchasedMinerIds] = useState(
    saved?.purchasedMinerIds ?? [],
  );

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
          miningRate,
          purchasedMinerIds,
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
    miningRate,
    purchasedMinerIds,
  ]);

  const resetSave = () => {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch {
      // ignorar
    }
    window.location.reload();
  };

  // Ganancias derivadas (para mostrar en UI sin recalcular en cada hijo)
  const moneyPerClick = multiplier + clickBonus;
  const moneyPerAuto = moneyPerClick * autoPower;

  // Función para manejar el clic principal del juego.
  const handleClick = () => {
    setMoney((prev) => prev + moneyPerClick);
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

  // Efecto para el ingreso pasivo (Fondo de Inversión + Minería).
  const passiveTotal = passiveRate + miningRate;
  useEffect(() => {
    if (passiveTotal <= 0) return;
    const interval = setInterval(() => {
      setMoney((prev) => prev + passiveTotal);
    }, 1000);
    return () => clearInterval(interval);
  }, [passiveTotal]);

  // Compra genérica del panel Imperio. key: 'exo' | 'fondo' | 'overclock'
  const buyImperio = (key, cost, apply) => {
    if (money < cost) return false;
    setMoney((prev) => prev - cost);
    setImperioLvl((prev) => ({ ...prev, [key]: prev[key] + 1 }));
    apply();
    return true;
  };

  const buyExo = (cost) =>
    buyImperio("exo", cost, () => setClickBonus((p) => p + 2));
  const buyFondo = (cost) =>
    buyImperio("fondo", cost, () => setPassiveRate((p) => p + 5));
  const buyOverclock = (cost) =>
    buyImperio("overclock", cost, () => setAutoPower((p) => p + 1));

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
  const buyUpgrade = (cost, increment, max) => {
    if (money < cost) return;
    // CALCULAR: Nuevo valor del multiplicador después de la compra
    const newValue = multiplier + increment;
    // VALIDAR: No permitir comprar si se supera el máximo o el nivel desbloqueado
    if (newValue > max || newValue > unlockedLvl) return;
    // ACTUALIZAR: Restar el costo y aumentar el multiplicador
    setMoney((prev) => prev - cost);
    // Asegurar que el nuevo multiplicador no supere el máximo ni el nivel desbloqueado
    setMultiplier((prev) =>
      Number(Math.min(prev + increment, max, unlockedLvl).toFixed(2)),
    );
  };
  return (
    <>
      <MenuNav
        money={money}
        multiplier={multiplier}
        bonusActivo={bonusActivo}
        rebirlvl={rebirlvl}
        moneyPerClick={moneyPerClick}
        passiveTotal={passiveRate + miningRate}
        autoClick={autoClick}
      />
      <main>
        <Inicio
          money={money}
          setMoney={setMoney}
          multiplier={multiplier}
          setMultiplier={setMultiplier}
          buyUpgrade={buyUpgrade}
          handleClick={handleClick}
          addMoneyDev={addMoneyDev}
          removeMoney={removeMoney}
          setRebirLvl={setRebirLvl}
          rebirlvl={rebirlvl}
          setUnlockedLvl={setUnlockedLvl}
          unlockedLvl={unlockedLvl}
          bonusActivo={bonusActivo}
          setBonusActivo={setBonusActivo}
          setAutoClickSpeed={setAutoClickSpeed}
          autoClick={autoClick}
          setAutoClick={setAutoClick}
          autoClickLevel={autoClickLevel}
          setAutoClickLevel={setAutoClickLevel}
          resetSave={resetSave}
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
          miningRate={miningRate}
          purchasedMinerIds={purchasedMinerIds}
          buyMiner={buyMiner}
        />
      </main>
    </>
  );
}

export default App;
