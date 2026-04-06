import "./Mejoras.css";

export const MejorasProges = ({ money, multiplier, buyUpgrade }) => {
  const upgrades = [
    { cost: 50, value: 0.1, max: 10, unlock: 0 },
    { cost: 100, value: 0.2, max: 10, unlock: 0 },
    { cost: 300, value: 0.4, max: 10, unlock: 0 },
    { cost: 500, value: 1, max: 10, unlock: 0 },
    { cost: 1000, value: 2, max: 10, unlock: 0 },
    { cost: 1500, value: 3, max: 10, unlock: 0 },
  ];

  return (
    <div className="shop">
      <h2>Tienda de aumento 🛒</h2>

      <div className="shop-grid">
        {upgrades.map((up, i) => {
          const isUnlocked = money >= up.unlock;
          const canBuy = money >= up.cost; // 🔥 SOLO dinero

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
