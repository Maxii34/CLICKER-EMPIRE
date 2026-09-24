import "./Mejoras.css";
import upgrades from "./upgrades.js";
import { formatMoney as formatNumber } from "../../utils/format.js";
import { shopPrice } from "../../game/economy.js";
import { SHOP_GROWTH } from "../../game/constants.js";

export const MejorasProges = ({
  money,
  multiplier,
  buyUpgrade,
  rebirlvl,
  unlockedLvl,
  shopCounts = {},
}) => {
  // 🎯 Solo mejoras del nivel de tienda actual (con índice global para el contador C)
  const currentLevelUpgrades = upgrades
    .map((up, idx) => ({ up, idx }))
    .filter(({ up }) => up.level === rebirlvl)
    .sort((a, b) => a.up.cost - b.up.cost);

  // Modelo C: el precio crece +30% por compra previa del mismo ítem.
  const priceOf = ({ up, idx }) =>
    shopPrice(up.cost, shopCounts[idx] || 0, SHOP_GROWTH);

  // Comprable si aún no llegaste al tope (el aumento se redondea al tope)
  const capOf = ({ up }) => Math.min(up.max, unlockedLvl);
  const isBuyable = (it) => money >= priceOf(it) && multiplier < capOf(it);

  const affordCount = currentLevelUpgrades.filter(isBuyable).length;
  // La más barata comprable = mejor compra (resaltada)
  const bestCost = currentLevelUpgrades
    .filter(isBuyable)
    .reduce((min, it) => Math.min(min, priceOf(it)), Infinity);

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
        {currentLevelUpgrades.map(({ up, idx }) => {
          const it = { up, idx };
          const price = priceOf(it);
          const times = shopCounts[idx] || 0;
          const canBuy = isBuyable(it);
          const isBest = canBuy && price === bestCost && affordCount > 1;
          const cap = capOf(it);
          // Si el aumento supera el tope, se redondea y completa hasta el tope
          const fillsToCap = multiplier + up.value > cap;
          const landsOn = Math.min(multiplier + up.value, cap);
          const noMoney = money < price;

          return (
            <button
              key={idx}
              className={`upgrade-btn ${canBuy ? "active" : "disabled"} ${isBest ? "best" : ""}`}
              onClick={() => buyUpgrade(idx)}
              disabled={!canBuy}
              title={
                canBuy
                  ? `x${multiplier} → x${Number(landsOn.toFixed(2))} por $${formatNumber(price)}${times > 0 ? ` (recompra x${times + 1})` : ""}${fillsToCap ? " (completa al tope)" : ""}${isBest ? " — mejor compra" : ""}`
                  : noMoney
                    ? `Te faltan $${formatNumber(price - money)}`
                    : `Tope x${cap} alcanzado: debes renacer`
              }
            >
              <span className="up-value">+{up.value}</span>
              <span className="up-cost">${formatNumber(price)}</span>

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