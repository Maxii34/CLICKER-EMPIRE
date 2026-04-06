import { useEffect, useState } from "react";
import "./App.css";
import { Inicio } from "./components/pages/Inicio";


function App() {
  const [money, setMoney] = useState(0);
  const [multiplier, setMultiplier] = useState(1);

  const handleClick = () => {
    setMoney((prev) => prev + multiplier);
  };

  const addMoneyDev = () => {
    setMoney((prev) => prev + 10000);
  }

  // 🔥 nueva lógica progresiva
  const buyUpgrade = (cost, increment, max) => {
    if (money >= cost && multiplier < max) {
      setMoney((prev) => prev - cost);

      setMultiplier((prev) => {
        const newValue = prev + increment;
        return Number((newValue > max ? max : newValue).toFixed(2));
      });
    }
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
      />
    </>
  );
}

export default App;
