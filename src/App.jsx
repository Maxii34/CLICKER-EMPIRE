import { useEffect, useState } from "react";
import "./App.css";
import { Inicio } from "./components/pages/Inicio";
import { MenuNav } from "./components/shared/MenuNav";

function App() {
  // Estado del dinero.
  const [money, setMoney] = useState(0);
  // Estado del multiplicador.
  const [multiplier, setMultiplier] = useState(1);
  // Estados para rebirths y niveles desbloqueados.
  const [rebirlvl, setRebirLvl] = useState(0);
  // Estado de los niveles desbloqueados.
  const [unlockedLvl, setUnlockedLvl] = useState(Infinity);
  // Estado para el bonus de bienvenida
  const [bonusActivo, setBonusActivo] = useState(false);
  // Estado para el bonus de autoclick
  const [isActive, setIsActive] = useState(false);
  //Estados para el autoclick
  const [autoClick, setAutoClick] = useState(false);
  // Estado para la velocidad del autoclick
  const [autoClickSpeed, setAutoClickSpeed] = useState(1000);

  // Función para manejar el clic principal del juego.
  const handleClick = () => {
    setMoney((prev) => prev + multiplier);
  };
  // Función para manejar el clic del autoclicker.
  const handleAutoClick = () => {
    setMoney((prev) => prev + (multiplier * 4));
  };

  // Efecto para manejar el autoclick.
  useEffect(() => {
    if (!autoClick) return;
    const interval = setInterval(() => {
      handleAutoClick(); // ← Usa la función con el x4
    }, autoClickSpeed);
    return () => clearInterval(interval);
  }, [autoClick, autoClickSpeed, multiplier]);

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
        />
      </main>
    </>
  );
}

export default App;
