import { useState } from "react";
import "./Clicker.css";

export const ClikerGamer = () => {
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
    <div className="container">
      <h1 className="title">💰 Clicker Game</h1>

      <div className="stats">
        <p className="dinero">
          Dinero: <strong>${money.toFixed(2)}</strong>
        </p>
        <p>
          Multiplicador: <strong>x{multiplier}</strong>
        </p>
      </div>

      {multiplier === 1 && (
        <div className="bonus-block">
        <h2>Bonus de Inicio 🎁</h2>
        <h3>Dale Megusta al juego: x2</h3>
        <span>permanente</span>
        <button className="button btn-green" onClick={() => setMultiplier(2)}>
          Activar Bonus
        </button>
      </div>)}

      <div className="card" onClick={handleClick}>
        <p>💥 Click para ganar dinero</p>
      </div>

      <div className="shop">
        <h2>Tienda de aumento de click 🛒</h2>

        {/* 🔥 upgrade progresivo */}
        <button
          className={`button ${money >= 55 && multiplier < 10 ? "btn-green" : "btn-disabled"}`}
          onClick={() => buyUpgrade(55, 0.1, 10)}
          disabled={money < 55 || multiplier >= 10}
        >
          +0.1 (Max x10) - 55
        </button>

        {money >= 200 && multiplier < 10 && (
          <button
            className={`button ${money >= 200 && multiplier < 10 ? "btn-green" : "btn-disabled"}`}
            onClick={() => buyUpgrade(200, 0.3, 10)}
            disabled={money < 200 || multiplier >= 10}
          >
            +0.3 (Max x10) - 200
          </button>
        )}

        {money >= 500 && multiplier < 10 && (
          <button
            className={`button ${money >= 500 && multiplier < 10 ? "btn-green" : "btn-disabled"}`}
            onClick={() => buyUpgrade(500, 1, 10)}
            disabled={money < 500 || multiplier >= 10}
          >
            +1 (Max x10) - 500
          </button>
        )}
      </div>

      <div className="rebirth">
        <h2>Renacimiento 🔧</h2>
        <span>Requerimiento lv 01:🎮</span>

        <div className="requirements">
          <p>
            Dinero: <strong>$ 5,000</strong>
          </p>
          <p>
            Multiplicador: <strong>x 5</strong>
          </p>
        </div>

        <div
          className={`bonus ${money >= 5000 && multiplier >= 5 ? "bonus-unlocked" : ""}`}
        >
          Bonus: <strong>Desbloqueo de multiplicador x20</strong>
        </div>

            {money >= 5000 && multiplier >= 5 && (
              <button className="button btn-blue" onClick={() => setMoney(0)}>
                Reiniciar Progreso
              </button>
            )}
      </div>
    </div>
  );
};
