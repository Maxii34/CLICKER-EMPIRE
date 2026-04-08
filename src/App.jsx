import { useEffect, useState } from "react";
import "./App.css";
import { Inicio } from "./components/pages/Inicio";
import { menu } from "./components/shared/menu";


function App() {
  const [money, setMoney] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [rebirlvl, setRebirLvl] = useState(0);
  const [unlockedLvl, setUnlockedLvl] = useState(Infinity);
  const [bonusActivo, setBonusActivo] = useState(false);


  const handleClick = () => {
    setMoney((prev) => prev + multiplier);
  };

  const addMoneyDev = () => {
    setMoney((prev) => prev + 500000);
  }

  // 🔥 nueva lógica progresiva
  const buyUpgrade = (cost, increment, max) => {
  if (money < cost) return;

  const newValue = multiplier + increment;

  // 🔒 VALIDACIÓN TOTAL
  if (
    multiplier >= max ||
    newValue > unlockedLvl
  ) return;

  // ✅ aplicar cambios
  setMoney((prev) => prev - cost);

  setMultiplier((prev) =>
    Number(Math.min(prev + increment, max, unlockedLvl).toFixed(2))
  );
};
  return (
    <>
      <Inicio
        money={money}
        setMoney={setMoney}
        multiplier={multiplier}
        setMultiplier={setMultiplier}
        buyUpgrade={buyUpgrade}
        handleClick={handleClick}
        addMoneyDev={addMoneyDev}
        setRebirLvl={setRebirLvl}
        rebirlvl={rebirlvl}
        setUnlockedLvl={setUnlockedLvl}
        unlockedLvl={unlockedLvl}
        bonusActivo={bonusActivo}
        setBonusActivo={setBonusActivo}
      />
    </>
  );
}

export default App;
