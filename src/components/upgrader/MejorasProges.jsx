import "./Mejoras.css";
import upgrades from "./upgrades.js";

export const MejorasProges = ({
  money,
  multiplier,
  buyUpgrade,
  rebirlvl,
  unlockedLvl,
}) => {
  // 🎯 Filtrar nivel actual y anterior
  const currentLevelUpgrades = upgrades.filter(
    (up) => up.level === rebirlvl || up.level === rebirlvl
  ).sort((a, b) => a.level - b.level);

  const formatNumber = (num) => {
    if (num < 10000) return num.toLocaleString("es-AR");
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + "B";
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(0) + "K";
    return num;
  };

  return (
    <div className="shop-box">
      {/* --- Elementos recuperados --- */}
      <div className="shop-header">
        <div>
          <h2 className="shop-title">Tienda de aumento x$</h2>
          <p className="shop-hint">Sube tu multiplicador. Cada renacimiento desbloquea un nivel nuevo.</p>
        </div>
        <span className="shop-lvl-badge">Tienda del - Lvl: {rebirlvl}</span>
      </div>

      {/* 🔒 Aviso de límite recuperado */}
      {multiplier >= unlockedLvl && (
        <p className="limit-warning">
          ⚠️ Alcanzaste el límite, debes renacimiento
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
              <span className="up-cost">${formatNumber(up.cost)}</span>

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