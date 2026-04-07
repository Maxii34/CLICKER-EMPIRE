import "./Mejoras.css";
import upgrades from "./upgrades.js";

export const MejorasProges = ({
  money,
  multiplier,
  buyUpgrade,
  rebirlvl,
  unlockedLvl,
}) => {
  return (
    <div className="shop">
      <h2>Tienda de aumento 🛒</h2>

      {/* 🔒 Aviso de límite alcanzado */}
      {multiplier >= unlockedLvl && (
        <p className="text-warning text-center">
          ⚠️ Alcanzaste el límite, hacé renacimiento
        </p>
      )}

      <div className="shop-grid">
        {upgrades.map((up, i) => {
          const isUnlocked = up.tier === 1 || rebirlvl >= up.tier;

          // 🔥 Validación completa (incluye overshoot)
          const canBuy =
            money >= up.cost &&
            multiplier < up.max &&
            (multiplier + up.value) <= unlockedLvl &&
            isUnlocked;

          if (!isUnlocked) return null;

          const willExceed = multiplier + up.value > unlockedLvl;

          return (
            <button
              key={i}
              className={`upgrade-btn ${canBuy ? "active" : "disabled"}`}
              onClick={() => buyUpgrade(up.cost, up.value, up.max)}
              disabled={!canBuy}
            >
              <span className="up-value">+{up.value}</span>
              <span className="up-cost">${up.cost}</span>

              {/* 🔴 Mensaje cuando ese upgrade rompe el límite */}
              {willExceed && multiplier < unlockedLvl && (
                <span className="text-danger small d-block">
                  Límite
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};