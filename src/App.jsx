import "./App.css";
import { ClikerGamer } from "./components/ClikerGamer";

function App() {
  const [money, setMoney] = useState(0);
  const [multiplier, setMultiplier] = useState(1);

  const handleClick = () => {
    setMoney((prev) => prev + multiplier);
  };

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
      <ClikerGamer />
    </>
  );
}

export default App;
