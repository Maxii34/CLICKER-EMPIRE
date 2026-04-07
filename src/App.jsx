import { useEffect, useState } from "react";
import "./App.css";
import { Inicio } from "./components/pages/Inicio";


function App() {
  const [money, setMoney] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [rebirlvl, setRebirLvl] = useState(0);
  const [unlockedLvl, setUnlockedLvl] = useState(Infinity);


  const handleClick = () => {
    setMoney((prev) => prev + multiplier);
  };

  const addMoneyDev = () => {
    setMoney((prev) => prev + 10000);
  }

  // 🔥 nueva lógica progresiva
  const buyUpgrade = (cost, increment, max) => {
  setMultiplier((prev) => {
    const newValue = prev + increment;

    // 🔒 VALIDACIÓN REAL
    if (
      money < cost ||
      prev >= max ||
      newValue > unlockedLvl
    ) {
      return prev;
    }

    setMoney((m) => m - cost);

    return Number(Math.min(newValue, max, unlockedLvl).toFixed(2));
  });
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
      />
    </>
  );
}

export default App;
