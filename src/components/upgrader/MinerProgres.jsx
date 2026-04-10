import "./Mejoras.css";
import MineriaX from "./MineriaX.js";

export const MinerProges = ({
  money,
  multiplier,
  buyUpgrade,
  rebirlvl,
  unlockedLvl,
  purchasedIds = [],
  rebirths = 0,
}) => {
  
  // FILTRAR: Solo mejoras del nivel actual Y que cumplas los rebirths necesarios
  const currentLevelMineria = MineriaX.filter((up) => 
    up.level === rebirlvl && rebirths >= up.reqRebirth
  );

  const formatNumber = (num) => {
    if (num < 10000) return num.toLocaleString("es-AR");
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + "B";
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M"; 
    return num;
  };

  return (
    <div className="shop-box">
      <div className="shop-header">
        <h2 className="shop-title">Tienda De Minería</h2>
        <span className="shop-lvl-badge">Nivel: {rebirlvl}</span>
      </div>

      <div className="shop-grid">
        {currentLevelMineria.map((up) => {
          // VALIDAR: Verificar si se puede comprar
          const isPurchased = purchasedIds.includes(up.id);
          const hasMoney = money >= up.cost;
          const notExceed = multiplier + up.value <= unlockedLvl;

          // DESBLOQUEAR: Asignar estado visual
          let state = "locked";
          if (isPurchased) {
            state = "bought";
          } else if (!hasMoney) {
            state = "no-money";
          } else if (!notExceed) {
            state = "maxed";
          } else {
            state = "available";
          }

          return (
            <button
              key={up.id}
              className={`upgrade-btn ${state}`}
              onClick={() => !isPurchased && buyUpgrade(up)}
              disabled={isPurchased || state === "no-money" || state === "maxed"}
            >
              <span className="up-value">
                {isPurchased ? "ADQUIRIDO" : `+${formatNumber(up.value)}`}
              </span>

              {!isPurchased && (
                <span className="up-cost">
                  ${formatNumber(up.cost)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};