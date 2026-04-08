import { useEffect, useState } from "react";
import "./Clicker.css";

export const ClikerGamer = ({
  money,
  multiplier,
  handleClick,
  addMoneyDev,
}) => {

  return (
    <div className="game-center">
      {/* PANEL DE INFORMACIÓN CENTRAL */}
      <div className="main-display-box">
        <h1 className="game-title">💰 CLICKER EMPIRE</h1>
        
        <div className="display-money">
          <span className="money-label">BALANCE ACTUAL</span>
          <h2 className="money-amount">${money.toFixed(2)}</h2>
        </div>

        {/* ACCIONES SECUNDARIAS */}
        <div className="action-row">
          <button className="btn-dev" onClick={addMoneyDev}>
            +$ DEV
          </button>
        </div>
      </div>

      {/* EL GRAN BOTÓN DE CLICK */}
      <div className="click-zone">
        <div className="click-circle-outer">
          <div className="click-circle-inner" onClick={handleClick}>
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