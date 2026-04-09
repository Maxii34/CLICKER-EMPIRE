import "./Mejoras.css";
import MineriaX from "./MineriaX.js";

export const MinerProges = ({
  money,
  multiplier,
  buyUpgrade,
  rebirlvl,
  unlockedLvl,
}) => {

  // 🧠 Formateador de números
  const formatNumber = (num) => {
    if (num < 10000) return num.toLocaleString("es-AR");
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + "B";
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
    return num;
  };

  return (
    <div className="shop-box">
      <div className="shop-header">
        <h2 className="shop-title">Tienda De Mineria</h2>
        <span className="shop-lvl-badge">Tienda - lvl: {rebirlvl}</span>
      </div>

      {multiplier >= unlockedLvl && (
        <p className="limit-warning">
          ⚠️ Alcanzaste el límite, hacé renacimiento
        </p>
      )}

      <div className="shop-grid">
        {MineriaX.map((up, i) => {
          // 🧠 Estados
          const unlocked = rebirlvl >= up.reqRebirth;
          const hasMoney = money >= up.cost;
          const notMaxed = multiplier < up.max;
          const notExceed = multiplier + up.value <= unlockedLvl;

          let state = "locked";

          if (unlocked) {
            if (!hasMoney) state = "no-money";
            else if (!notMaxed || !notExceed) state = "maxed";
            else state = "available";
          }

          const canBuy = state === "available";
          const willExceed = multiplier + up.value > unlockedLvl;

          return (
            <button
              key={i}
              className={`upgrade-btn ${state}`}
              onClick={() =>
                buyUpgrade(up.cost, up.value, up.max, up.level)
              }
              disabled={!canBuy}
            >
              <span className="up-value">
                +{formatNumber(up.value)}
              </span>

              <span className="up-cost">
                ${formatNumber(up.cost)}
              </span>

              {state === "no-money" && (
                <span className="req-text">
                  💸 Falta dinero
                </span>
              )}

              {state === "maxed" && (
                <span className="req-text">
                  🚫 Límite alcanzado
                </span>
              )}

              {/* Indicador visual */}
              {willExceed && multiplier < unlockedLvl && (
                <div className="limit-dot"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};