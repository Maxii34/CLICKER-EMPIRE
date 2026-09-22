import { useEffect, useState } from "react";
import "./Clicker.css";

export const ClikerGamer = ({
  money,
  handleClick,
  addMoneyDev,
  removeMoney,
  resetSave,
  multiplier,
  autoClick,
  moneyPerClick,
  moneyPerAuto,
  passiveRate,
  autoPower,
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

  const perClick = moneyPerClick ?? multiplier;
  const perAuto = moneyPerAuto ?? multiplier * 4;

  return (
    <div className="game-center">
      {/* PANEL DE INFORMACIÓN CENTRAL */}
      <div className="main-display-box">
        <div className="game-eyebrow">
          <span className="live-dot"></span> TEMPORADA 1 • SERVIDOR LIVE
        </div>
        <h1 className="game-title">💰 CLICKER EMPIRE</h1>

        <div className="display-money">
          <span className="money-label">BALANCE ACTUAL</span>
          <h2 className="money-amount">${formatNumber(money)}</h2>
          <span className="money-sub">x{multiplier} base + bonos del Imperio</span>
        </div>

        <div className="stat-strip">
          <div className="sstat">
            <span className="sstat-label">Por click</span>
            <span className="sstat-value">+${formatNumber(perClick)}</span>
          </div>
          <div className="sstat">
            <span className="sstat-label">Auto x{autoPower ?? 4}</span>
            <span className="sstat-value auto">+${formatNumber(perAuto)}</span>
          </div>
          <div className="sstat">
            <span className="sstat-label">Pasivo</span>
            <span className="sstat-value passive">+${formatNumber(passiveRate ?? 0)}/s</span>
          </div>
        </div>

        {autoClick && (
          <div className="auto-banner">
            <span className="pulsing-dot"></span> AUTO-CLICKER ACTIVO — click manual en pausa
          </div>
        )}

        {/* ACCIONES SECUNDARIAS */}
        <details className="dev-tools">
          <summary>Herramientas DEV • 💾 autoguardado activo</summary>
          <div className="action-row">
            <button className="btn-dev text-success" onClick={addMoneyDev}>
              <b className=" fw-bold text-success">+$</b> DEV
            </button>
            <button className="btn-dev text-danger" onClick={removeMoney}>
              <b className=" fw-bold text-danger">-$</b> DEV
            </button>
            {resetSave && (
              <button
                className="btn-dev text-warning"
                onClick={() => {
                  if (window.confirm("¿Borrar partida guardada y empezar de cero?")) resetSave();
                }}
                title="Borra el localStorage y recarga"
              >
                🗑️ RESET
              </button>
            )}
          </div>
        </details>
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