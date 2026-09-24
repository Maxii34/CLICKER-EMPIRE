import { useEffect, useState } from "react";
import { FaCoins } from "react-icons/fa";
import "./Clicker.css";
import { formatMoney as formatNumber } from "../utils/format.js";

export const ClikerGamer = ({
  money,
  handleClick,
  multiplier,
  bonusActivo = false,
  autoClick,
  moneyPerClick,
  moneyPerAuto,
  passivePerSec = 0,
  autoPower,
  golden,
  frenzyLeft = 0,
  goldenMsg = "",
  collectGolden,
}) => {

  const [isAutoClickActive, setIsAutoClickActive] = useState(false);

  useEffect(() => {
    setIsAutoClickActive(autoClick);
  }, [autoClick]);

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
          <span className="money-sub">x{multiplier} base{bonusActivo ? " x2" : ""} + bonos del Imperio</span>
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
            <span className="sstat-value passive">+${formatNumber(passivePerSec)}/s</span>
          </div>
        </div>

        {autoClick && (
          <div className="auto-banner">
            <span className="pulsing-dot"></span> AUTO-CLICKER ACTIVO — click manual en pausa
          </div>
        )}

        {frenzyLeft > 0 && (
          <div className="frenzy-banner" title="Tus clicks valen el triple">
            ⚡ FRENESÍ x3 — {frenzyLeft}s
          </div>
        )}

      </div>

      {/* EL GRAN BOTÓN DE CLICK */}
      <div className="click-zone">
        {golden && (
          <button
            key={golden.id}
            className="golden-btn"
            style={{ left: `${golden.x}%`, top: `${golden.y}%` }}
            onClick={collectGolden}
            title="¡Click dorado! Fortuna (usa tu click actual, mayor en frenesí) o frenesí x3"
          >
            <FaCoins />
          </button>
        )}
        {goldenMsg && <div className="golden-msg">{goldenMsg}</div>}
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