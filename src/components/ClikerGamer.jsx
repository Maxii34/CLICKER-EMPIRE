import { useState } from "react";
import "./Clicker.css";

export const ClikerGamer = () => {
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

      <div className="card" onClick={handleClick}>
        <p>💥 Click para ganar dinero</p>
      </div>
    </div>
  );
};
