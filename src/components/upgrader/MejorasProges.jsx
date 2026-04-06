import "./Mejoras.css";
import upgrades from "./upgrades.js";

export const MejorasProges = ({ money, multiplier, buyUpgrade, rebirlvl }) => {
  
  return (
    <div className="shop">
      <h2>Tienda de aumento 🛒</h2>
      <div className="shop-grid">
        {upgrades.map((up, i) => {
          // Tier 1 siempre desbloqueado
          const isUnlocked = up.tier === 1 || rebirlvl >= up.tier;
          const canBuy = money >= up.cost && multiplier < up.max && isUnlocked;

          if (!isUnlocked) return null;

          return (
            <button
              key={i}
              className={`upgrade-btn ${canBuy ? "active" : "disabled"}`}
              onClick={() => buyUpgrade(up.cost, up.value, up.max)}
              disabled={!canBuy}
            >
              <span className="up-value">+{up.value}</span>
              <span className="up-cost">${up.cost}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};