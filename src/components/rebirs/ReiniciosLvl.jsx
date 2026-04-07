import rebirthReq from "./rebirthReq.js";
import "./Reinicio.css";

export const ReiniciosLvl = ({
  money,
  multiplier,
  setMultiplier,
  setMoney,
  rebirlvl,
  setRebirLvl,
  setUnlockedLvl,
}) => {
  const currentLevel =
    rebirthReq.find((req) => req.level === rebirlvl) || 
    rebirthReq.find((req) => req.level === rebirlvl - 1) ||
    rebirthReq[0];

  const canRebirth =
    money >= currentLevel.money &&
    multiplier >= currentLevel.multiplier;

  const handleRebirth = () => {
    if (!canRebirth) return;
    const nextLevel = rebirthReq.find((r) => r.level === currentLevel.level + 1);
    setRebirLvl((prev) => prev + 1);
    setMoney(0);
    setMultiplier(1);
    setUnlockedLvl(nextLevel ? nextLevel.multiplier : Infinity);
  };

  return (
    <div className="rebirth-container">
      <div className="rebirth-header">
        <h2 className="rebirth-title">Renacimiento ✨</h2>
        <span className="req-lvl-tag">Req. Lvl: {currentLevel.level}</span>
      </div>

      <div className="rebirth-grid">
        {/* Requisitos Compactos */}
        <div className={`mini-req ${money >= currentLevel.money ? "ok" : ""}`}>
          💰 ${currentLevel.money.toLocaleString()}
        </div>
        <div className={`mini-req ${multiplier >= currentLevel.multiplier ? "ok" : ""}`}>
          ⚡ x{currentLevel.multiplier}
        </div>
      </div>

      {/* Caja de Bonus Compacta */}
      <div className={`mini-bonus-box ${canRebirth ? "unlocked" : ""}`}>
        <p className="bonus-label">🎁 DESBLOQUEA:</p>
        <div className="bonus-content">
          <span>+{currentLevel.bonus}% ganancias</span>
          <span>Tienda Lvl {currentLevel.level + 1}</span>
        </div>
      </div>

      <button
        className={`main-rebirth-btn ${canRebirth ? "ready" : "locked"}`}
        onClick={handleRebirth}
        disabled={!canRebirth}
      >
        {canRebirth ? "REINICIAR AHORA 🔄" : "BLOQUEADO 🔒"}
      </button>
    </div>
  );
};