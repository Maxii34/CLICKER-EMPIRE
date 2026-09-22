import MineriaX from "./MineriaX.js";

export const MinerProges = ({
  money,
  rebirlvl,
  miningRate = 0,
  purchasedMinerIds = [],
  buyMiner,
  vault = 0,
  collectVault,
}) => {
  const formatNumber = (num) => {
    if (num < 10000) return num.toLocaleString("es-AR");
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + "B";
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
    return `${num}`;
  };

  // Rigs desbloqueados con tu RB actual + siguiente tier bloqueado (preview)
  const unlocked = MineriaX.filter((up) => rebirlvl >= up.reqRebirth);
  const nextLocked = MineriaX.filter((up) => rebirlvl < up.reqRebirth).sort(
    (a, b) => a.reqRebirth - b.reqRebirth
  );
  const nextReq = nextLocked.length ? nextLocked[0].reqRebirth : null;
  const bought = purchasedMinerIds.length;
  const total = MineriaX.length;

  return (
    <div className="shop-box miner-box">
      <div className="shop-header">
        <div>
          <h2 className="shop-title">⛏️ Minería Pasiva</h2>
          <p className="shop-hint">Rigs de $/seg a la bóveda. Recauda para sumarlo a tu dinero.</p>
        </div>
        <span className="shop-lvl-badge">+${formatNumber(miningRate)}/s</span>
      </div>

      {/* Bóveda: lo minado se acumula aquí hasta recaudar */}
      <div className={`vault-box ${vault > 0 ? "full" : ""}`}>
        <div className="vault-info">
          <span className="vault-label">🏦 Bóveda minera</span>
          <span className="vault-amount">${formatNumber(Math.floor(vault))}</span>
          <span className="vault-rate">generando +${formatNumber(miningRate)}/s</span>
        </div>
        <button
          className={`vault-btn ${vault > 0 ? "ready" : ""}`}
          disabled={vault <= 0}
          onClick={() => collectVault && collectVault()}
          title="Suma lo minado a tu dinero total"
        >
          {vault > 0 ? "RECAUDAR" : "VACÍA"}
        </button>
      </div>

      <div className="miner-progress">
        <div className="miner-progress-track">
          <div
            className="miner-progress-fill"
            style={{ width: `${Math.round((bought / total) * 100)}%` }}
          />
        </div>
        <span className="miner-progress-label">
          {bought}/{total} rigs • RB {rebirlvl}
        </span>
      </div>

      {unlocked.length === 0 ? (
        <p className="miner-empty">🔒 Se desbloquea en RB {nextReq}</p>
      ) : (
        <div className="shop-grid miner-grid">
          {unlocked.map((up) => {
            const isBought = purchasedMinerIds.includes(up.id);
            const hasMoney = money >= up.cost;
            const state = isBought ? "bought" : hasMoney ? "active" : "disabled";
            return (
              <button
                key={up.id}
                className={`upgrade-btn miner-btn ${state}`}
                title={`${up.name} — +$${up.value}/s permanente${isBought ? " (adquirido)" : ` — cuesta $${up.cost.toLocaleString()}`}`}
                onClick={() => !isBought && buyMiner && buyMiner(up)}
                disabled={isBought || !hasMoney}
              >
                <span className="miner-name">{isBought ? `✓ ${up.name}` : up.name}</span>
                <span className="miner-data">
                  <span className="miner-rate">+{formatNumber(up.value)}/s</span>
                  {!isBought && (
                    <span className="miner-cost">${formatNumber(up.cost)}</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Mini descripción de desbloqueo del siguiente tier */}
      {nextReq !== null && (
        <p className="miner-next">
          🔒 Próximos rigs ({nextLocked.filter((u) => u.reqRebirth === nextReq).length}) se desbloquean en <b>RB {nextReq}</b>
          {nextReq === 2 && " — junto al Auto-Clicker y Overclock"}
          {nextReq === 4 && " — junto a Auto-Clicker lvl 2"}
          {nextReq === 6 && " — junto a Auto-Clicker lvl 3"}
          {nextReq === 8 && " — junto a Auto-Clicker lvl 4"}
          {nextReq === 10 && " — junto a Auto-Clicker lvl 5"}
          .
        </p>
      )}
    </div>
  );
};
