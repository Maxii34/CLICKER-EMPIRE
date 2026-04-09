import "./Mejoras.css";
import upgrades from "./upgrades.js";

export const MejorasProges = ({
  money,
  multiplier,
  buyUpgrade,
  rebirlvl,
  unlockedLvl,
}) => {
  // 🎯 Tu lógica de filtrado original
  const currentLevelUpgrades = upgrades.filter(
    (up) => up.level === rebirlvl
  );

  return (
    <div className="shop-box">
      {/* --- Elementos recuperados --- */}
      <div className="shop-header">
        <h2 className="shop-title">Tienda de aumento x$</h2>
        <span className="shop-lvl-badge">Tienda - lvl: {rebirlvl}</span>
      </div>

      {/* 🔒 Aviso de límite recuperado */}
      {multiplier >= unlockedLvl && (
        <p className="limit-warning">
          ⚠️ Alcanzaste el límite, hacé renacimiento
        </p>
      )}

      {/* Grid de botones compactos */}
      <div className="shop-grid">
        {currentLevelUpgrades.map((up, i) => {
          const canBuy =
            money >= up.cost &&
            multiplier < up.max &&
            (multiplier + up.value) <= unlockedLvl;

          const willExceed = multiplier + up.value > unlockedLvl;

          return (
            <button
              key={i}
              className={`upgrade-btn ${canBuy ? "active" : "disabled"}`}
              onClick={() => buyUpgrade(up.cost, up.value, up.max, up.level)}
              disabled={!canBuy}
            >
              <span className="up-value">+{up.value}</span>
              <span className="up-cost">${up.cost}</span>

              {/* Punto de límite */}
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