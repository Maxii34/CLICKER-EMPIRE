import "./Mejoras.css";
import upgrades from "./upgrades.js";

export const MejorasProges = ({
  money,
  multiplier,
  buyUpgrade,
  rebirlvl,
  unlockedLvl,
}) => {
  // 🎯 Solo mejoras del nivel de tienda actual
  const currentLevelUpgrades = upgrades
    .filter((up) => up.level === rebirlvl)
    .sort((a, b) => a.cost - b.cost);

  // Comprable si aún no llegaste al tope (el aumento se redondea al tope)
  const capOf = (up) => Math.min(up.max, unlockedLvl);
  const isBuyable = (up) => money >= up.cost && multiplier < capOf(up);

  const affordCount = currentLevelUpgrades.filter(isBuyable).length;
  // La más barata comprable = mejor compra (resaltada)
  const bestCost = currentLevelUpgrades
    .filter(isBuyable)
    .reduce((min, up) => Math.min(min, up.cost), Infinity);

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
          <h2 className="shop-title">Shop Aumentos</h2>
          <p className="shop-hint text-capitalize">Cada renacimiento desbloquea un nivel.</p>
        </div>
        <span className="shop-lvl-badge" title={`Nivel ${rebirlvl} • ${affordCount} comprables`}>
          Nv: {rebirlvl}
        </span>
      </div>

      {/* 🔒 Aviso de límite recuperado */}
      {multiplier >= unlockedLvl && (
        <p className="limit-warning text-capitalize">
          ⚠️ Limite alcanzado, debes reiniciar. 
        </p>
      )}

      {/* Grid de botones compactos */}
      <div className="shop-grid">
        {currentLevelUpgrades.map((up, i) => {
          const canBuy = isBuyable(up);
          const isBest = canBuy && up.cost === bestCost && affordCount > 1;
          const cap = capOf(up);
          // Si el aumento supera el tope, se redondea y completa hasta el tope
          const fillsToCap = multiplier + up.value > cap;
          const landsOn = Math.min(multiplier + up.value, cap);
          const noMoney = money < up.cost;

          return (
            <button
              key={i}
              className={`upgrade-btn ${canBuy ? "active" : "disabled"} ${isBest ? "best" : ""}`}
              onClick={() => buyUpgrade(up.cost, up.value, up.max, up.level)}
              disabled={!canBuy}
              title={
                canBuy
                  ? `x${multiplier} → x${Number(landsOn.toFixed(2))} por $${formatNumber(up.cost)}${fillsToCap ? " (completa al tope)" : ""}${isBest ? " — mejor compra" : ""}`
                  : noMoney
                    ? `Te faltan $${formatNumber(up.cost - money)}`
                    : `Tope x${cap} alcanzado: debes renacer`
              }
            >
              <span className="up-value">+{up.value}</span>
              <span className="up-cost">${formatNumber(up.cost)}</span>

              {/* Punto: este aumento completa justo al tope */}
              {fillsToCap && multiplier < cap && (
                <div className="limit-dot"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};