import { useEffect, useState } from "react";
import "./Clicker.css";

export const ClikerGamer = ({
  money,
  multiplier,
  handleClick,
  addMoneyDev,
}) => {
  const [autoClick, setAutoClick] = useState(false);

  // 🔥 autoclicker
  useEffect(() => {
    if (!autoClick) return;

    const interval = setInterval(() => {
      handleClick();
    }, 1000); // 1 click por segundo

    return () => clearInterval(interval);
  }, [autoClick, handleClick]);

  return (
    <div className="clicker-container">
      <h1 className="clicker-title">💰 Clicker Game</h1>

      {/* STATS */}
      <div className="clicker-stats">
        <div className="stat-box money">
          <span>Dinero</span>
          <strong>🤑 ${money.toFixed(2)}</strong>
        </div>

        <div className="stat-box">
          <span>Multiplicador</span>
          <strong>⚡ x{multiplier}</strong>
        </div>
      </div>

      {/* BOTÓN PRINCIPAL */}
      <div className="clicker-card" onClick={handleClick}>
        <p>💥 Click</p>
      </div>

      {/* ACCIONES */}
      <div className="clicker-actions">
        <button className="dev-btn" onClick={addMoneyDev}>
          +$ Dev
        </button>

        <button
          className={`auto-btn ${autoClick ? "active" : ""}`}
          onClick={() => setAutoClick(!autoClick)}
        >
          {autoClick ? "Auto ON ⚡" : "Auto OFF"}
        </button>
      </div>
    </div>
  );
};