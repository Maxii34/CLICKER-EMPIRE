import rebirthReq from "./rebirthReq.js";
import "./Reinicio.css";

export const ReiniciosLvl = ({
  money,
  multiplier,
  setMoney,
  rebirlvl,
  setRebirLvl,
  setUnlockedLvl,
}) => {
  // Mostrar el nivel correspondiente al rebirlvl actual
  const currentLevel =
    rebirthReq.find((req) => req.level === rebirlvl) || rebirthReq[0];

  const canRebirth =
    money >= currentLevel.money && multiplier <= currentLevel.multiplier;

  const handleRebirth = () => {
    if (!canRebirth) return;

    setRebirLvl(currentLevel.level + 1); // subimos el nivel de renacimiento
    setMoney(0);
    //mandamos el limite de multiplier, para bloquear las mejoras si ya llego al nivel requerido, hasta que haga el rebirth y se desbloquee el siguiente nivel de mejoras
    setUnlockedLvl(currentLevel.multiplier);
  };

  return (
    <div className="rebirth-box">
      <h2 className="fs-4 text p-0 mark rounded-1 shadow-sm">Renacimiento</h2>
      <span className="rebirth-level text-muted">
        Nivel requerido: {currentLevel.level}
      </span>
      <span>Requisitos:</span>

      <div className="rebirth-req">
        <div
          className={`req-item shadow-lg ${money >= currentLevel.money ? "ok" : ""}`}
        >
          💰 ${currentLevel.money}
        </div>
        <div
          className={`req-item shadow-lg ${multiplier >= currentLevel.multiplier ? "ok" : ""}`}
        >
          ⚡ x{currentLevel.multiplier}
        </div>
      </div>

      {/* BONUS */}
      <div className={`rebirth-bonus ${canRebirth ? "active" : ""}`}>
        <h5 className="text-center fs-6">🎁 Desbloquea:</h5>
        <div className="text-black text-capitalize text-center bg-light p-2 shadow-md rounded-1">
          <span className="bonus-text">+{currentLevel.bonus}% ganancias</span>
          <span>Tienda upgrades lvl {currentLevel.level + 1}</span>
          <span className="bonus-text">¡Y más sorpresas!</span>
        </div>
      </div>

      <button
        className={`rebirth-btn ${canRebirth ? "active" : "disabled"}`}
        onClick={handleRebirth}
        disabled={!canRebirth}
      >
        {canRebirth ? "Reiniciar 🔄" : "Bloqueado 🔒"}
      </button>
    </div>
  );
};
