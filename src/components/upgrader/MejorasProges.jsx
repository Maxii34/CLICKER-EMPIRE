import "./Mejoras.css";
import upgrades from "./upgrades.js";

export const MejorasProges = ({
  money,
  multiplier,
  buyUpgrade,
  rebirlvl,
  unlockedLvl,
}) => {
  console.log("MejorasProges renderizado", {
    money,
    multiplier,
    rebirlvl,
    unlockedLvl,
  });

  // 🎯 FILTRAR POR NIVEL ACTUAL
  const currentLevelUpgrades = upgrades.filter(
    (up) => up.level === rebirlvl
  );

  return (
    <div className="shop">
      <h2>Tienda de aumento 🛒</h2>
      <span>shop lvl: {rebirlvl}</span>
      {/* 🔒 Aviso de límite alcanzado */}
      {multiplier >= unlockedLvl && (
        <p className="text-warning text-center">
          ⚠️ Alcanzaste el límite, hacé renacimiento
        </p>
      )}

      <div className="shop-grid">
        {currentLevelUpgrades.map((up, i) => {
          // 🔥 Validación simplificada (solo verificar nivel actual)
          const canBuy =
            money >= up.cost &&
            multiplier < up.max &&
            (multiplier + up.value) <= unlockedLvl;

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