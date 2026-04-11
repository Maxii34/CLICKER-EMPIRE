import { useEffect, useState } from "react";
import "./Clicker.css";

export const ClikerGamer = ({
  money,
  handleClick,
  addMoneyDev,
  removeMoney,
  multiplier,
  unlockedLvl,
  autoClick,
}) => {

  const [isAutoClickActive, setIsAutoClickActive] = useState(false);

  useEffect(() => {
    setIsAutoClickActive(autoClick);
  }, [autoClick]);

  const formatNumber = (num) => {
    if (num < 10000) return num.toLocaleString("es-AR");
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + "B";
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(0) + "K";
    return num;
  };

  const handleClickButton = () => {
    // Solo permite click manual si autoClick está desactivado
    if (!isAutoClickActive) {
      handleClick();
    }
  };

  return (
    <div className="game-center">
      {/* PANEL DE INFORMACIÓN CENTRAL */}
      <div className="main-display-box">
        <h1 className="game-title">💰 CLICKER EMPIRE</h1>
        
        <div className="display-money">
          <span className="money-label">BALANCE ACTUAL</span>
          <h2 className="money-amount">${formatNumber(money)}</h2>
          <div>
            <span className="money-label">Generador AutoClikc x4:</span>
            <span className="multiplier-value">${(money).toLocaleString("es-AR")}</span>
          </div>
        </div>

        {/* ACCIONES SECUNDARIAS */}
        <div className="action-row">
          <button className="btn-dev text-success" onClick={addMoneyDev}>
            <b className=" fw-bold text-success">+$</b> DEV
          </button>
          <button className="btn-dev text-danger" onClick={removeMoney}>
            <b className=" fw-bold text-danger">-$</b> DEV
          </button>
        </div>
      </div>

      {/* EL GRAN BOTÓN DE CLICK */}
      <div className="click-zone">
        <div className="click-circle-outer">
          <div 
            className={`click-circle-inner ${isAutoClickActive ? 'auto-clicking' : ''}`}
            onClick={handleClickButton}
            style={{
              cursor: isAutoClickActive ? 'not-allowed' : 'pointer',
              opacity: isAutoClickActive ? 0.7 : 1,
            }}
          >
            <div className="click-content">
              <span className="click-icon">💥</span>
              <span className="click-text">CLICK!</span>
            </div>
          </div>
        </div>
        {/* Efecto de sombra/reflejo en el suelo */}
        <div className="click-shadow"></div>
      </div>
    </div>
  );
};