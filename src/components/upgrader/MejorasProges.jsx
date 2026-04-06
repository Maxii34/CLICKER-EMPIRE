import "./Mejoras.css";

export const MejorasProges = ({ money, multiplier, buyUpgrade }) => {
  const upgrades = [
  // 🔹 TIER 1 (hasta x10)
  { cost: 50, value: 0.1, max: 10, unlock: 0 },
  { cost: 100, value: 0.2, max: 10, unlock: 0 },
  { cost: 300, value: 0.4, max: 10, unlock: 0 },

  // 🔹 TIER 2 (hasta x20)
  { cost: 1000, value: 1, max: 20, unlock: 10 },
  { cost: 2000, value: 2, max: 20, unlock: 10 },
  { cost: 5000, value: 4, max: 20, unlock: 10 },

  // 🔹 TIER 3 (hasta x30)
  { cost: 10000, value: 5, max: 30, unlock: 20 },
  { cost: 20000, value: 10, max: 30, unlock: 20 },
];

  return (
    <div className="shop">
      <h2>Tienda de aumento 🛒</h2>

      <div className="shop-grid">
        {upgrades.map((up, i) => {
          const isUnlocked = money >= up.unlock;
          const canBuy = money >= up.cost && multiplier < up.max; 

          if (!isUnlocked) return null; 

          return (
            <button
              key={i}
              className={`upgrade-btn ${canBuy ? "active" : "disabled"}`}
              onClick={() => buyUpgrade(up.cost, up.value, up.max)}
              disabled={!canBuy}
            >
              <span className="up-value">+{up.value}</span>
              <span className="up-cost">{up.cost}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
