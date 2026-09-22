import { useEffect } from "react";
import "./Bonus.css";

export const BonusAutoClick = ({
  setAutoClickSpeed,
  money,
  setMoney,
  rebirlvl,
  autoClick,
  setAutoClick,
  level = 0,
  setLevel,
}) => {
  const maxLevels = 5;
  const upgraderClicker = [
    { level: 1, cost: 10000, speed: 900, reqRebirth: 2 },
    { level: 2, cost: 50000, speed: 800, reqRebirth: 4 },
    { level: 3, cost: 100000, speed: 700, reqRebirth: 6 },
    { level: 4, cost: 250000, speed: 600, reqRebirth: 8 },
    { level: 5, cost: 500000, speed: 500, reqRebirth: 10 },
  ];

  // Al cargar partida guardada, restaura la velocidad según el nivel.
  useEffect(() => {
    const current = upgraderClicker.find((u) => u.level === level);
    if (current) setAutoClickSpeed(current.speed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Nivel persistido en App (sobrevive a recargas).
  const nextUpgrade = upgraderClicker.find((u) => u.level === level + 1) || null;
  // Validar si el jugador puede comprar la mejora actual
  const canUpgrade = nextUpgrade && money >= nextUpgrade.cost && rebirlvl >= nextUpgrade.reqRebirth;

  // Función para manejar la compra de la mejora
  const handleUpgrade = () => {
    if (!canUpgrade) return;
    setMoney((prev) => prev - nextUpgrade.cost);
    setAutoClickSpeed(nextUpgrade.speed);
    setLevel((prev) => prev + 1);
  };

  return (
    <div className="upgrade-container">
      {/* HEADER: Nivel mejorado como badge */}
      <div className="upgrade-header">
        <div className="upgrade-title-group">
          <h5 className="upgrade-name">🤖 Auto-Clicker</h5>
          <span className="req-rebirth-tag">
            Clicks solos x{4} • Se desbloquea en RB 2 • Niveles en RB 2/4/6/8/10{nextUpgrade ? ` • Sig: RB ${nextUpgrade.reqRebirth}` : ""}
          </span>
        </div>
        <div className="level-badge-compact">
          Lvl {level}/{maxLevels}
        </div>
      </div>

      <div className="upgrade-progress-bar">
        {[...Array(maxLevels)].map((_, i) => (
          <div key={i} className={`progress-step ${i < level ? "step-filled" : ""}`} />
        ))}
      </div>

      <div className="upgrade-grid">
        <div className={`mini-req ${nextUpgrade && money >= nextUpgrade.cost ? "ok" : "locked"}`}>
          💰 ${nextUpgrade ? nextUpgrade.cost.toLocaleString() : "---"}
        </div>
        <div className={`mini-req ${nextUpgrade && rebirlvl >= nextUpgrade.reqRebirth ? "ok" : "locked"}`}>
           Rebirth Lvl {nextUpgrade ? nextUpgrade.reqRebirth : "---"}
        </div>
      </div>
        <div className="req-rebirth-tag text-center text-capitalize py-1 fw-bold">
        <span>Mejoras en Rebir: 02, 04, 06, 08, 10</span>
        </div>

      {/* FOOTER: Botones juntos sin división */}
      <div className="upgrade-actions-group">
        <button
          className={`main-upgrade-btn ${canUpgrade ? "ready" : "disabled"}`}
          onClick={handleUpgrade}
          disabled={!canUpgrade || level >= maxLevels}
        >
          {level >= maxLevels ? "MÁXIMO ✅" : canUpgrade ? "MEJORAR" : "BLOQUEADO"}
        </button>

        {level > 0 && (
          <button 
            className={`toggle-action-btn ${autoClick ? "active-on" : "active-off"}`}
            onClick={() => setAutoClick(!autoClick)}
          >
            <div className={`status-led ${autoClick ? "led-green" : ""}`}></div>
            {autoClick ? "OFF" : "ON"}
          </button>
        )}
      </div>
    </div>
  );
};