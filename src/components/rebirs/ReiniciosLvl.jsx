import rebirthReq from "./rebirthReq.js";
import "./Reinicio.css";

const fmt = (num) => {
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + "B";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num.toLocaleString("es-AR");
};

// Desbloqueos extra al llegar al siguiente nivel (además de tienda + bonus)
const EXTRA = {
  2: ["🤖 Auto-Clicker lvl 1", "⛏️ Minería tier 1", "⚙️ Overclock del Imperio"],
  4: ["🤖 Auto-Clicker lvl 2", "⛏️ Minería tier 2"],
  6: ["🤖 Auto-Clicker lvl 3", "⛏️ Minería tier 3"],
  8: ["🤖 Auto-Clicker lvl 4", "⛏️ Minería tier 4"],
  10: ["🤖 Auto-Clicker lvl 5 MAX", "⛏️ Minería tier 5"],
};

export const ReiniciosLvl = ({
  money,
  multiplier,
  setMultiplier,
  setMoney,
  rebirlvl,
  setRebirLvl,
  setUnlockedLvl,
}) => {
  const maxed = rebirlvl >= rebirthReq.length;
  const req =
    rebirthReq.find((r) => r.level === rebirlvl) ||
    rebirthReq[rebirthReq.length - 1];

  if (maxed) {
    return (
      <div className="rb-box">
        <div className="rb-head">
          <span className="rb-icon">🏆</span>
          <div className="rb-head-text">
            <h2 className="rb-title">Renacimiento</h2>
            <p className="rb-sub">Nivel máximo alcanzado</p>
          </div>
        </div>
        <p className="rb-max">👑 Eres leyenda del imperio. No hay más renacimientos.</p>
      </div>
    );
  }

  const moneyOk = money >= req.money;
  const multOk = multiplier >= req.multiplier;
  const canRebirth = moneyOk && multOk;
  const moneyPct = Math.min(100, (money / req.money) * 100);
  const multPct = Math.min(100, (multiplier / req.multiplier) * 100);

  const faltaDinero = Math.max(0, req.money - money);
  const faltaMult = Number(Math.max(0, req.multiplier - multiplier).toFixed(2));

  const handleRebirth = () => {
    if (!canRebirth) return;
    const nextLevel = rebirthReq.find((r) => r.level === req.level + 1);
    setRebirLvl((prev) => prev + 1);
    setMoney(0);
    setMultiplier(req.bonus || 0);
    setUnlockedLvl(nextLevel ? nextLevel.multiplier : Infinity);
  };

  const rewards = [
    `🚀 Empiezas en x${req.bonus}`,
    `🏪 Tienda lvl ${req.level + 1}`,
    ...(EXTRA[req.level + 1] || []),
  ];

  return (
    <div className="rb-box">
      <div className="rb-head">
        <span className="rb-icon">🔄</span>
        <div className="rb-head-text">
          <h2 className="rb-title">Renacimiento</h2>
          <p className="rb-sub">Resetea y vuelve más fuerte</p>
        </div>
        <span className="rb-lvl">RB {req.level}</span>
      </div>

      {/* Requisitos con progreso */}
      <div className="rb-req">
        <div className="rb-req-top">
          <span>💰 Dinero</span>
          <span className={moneyOk ? "ok" : ""}>
            ${fmt(money)} / ${fmt(req.money)}
          </span>
        </div>
        <div className="rb-bar">
          <div className="rb-fill money" style={{ width: `${moneyPct}%` }} />
        </div>
      </div>

      <div className="rb-req">
        <div className="rb-req-top">
          <span>⚡ Multiplicador</span>
          <span className={multOk ? "ok" : ""}>
            x{multiplier} / x{req.multiplier}
          </span>
        </div>
        <div className="rb-bar">
          <div className="rb-fill mult" style={{ width: `${multPct}%` }} />
        </div>
      </div>

      {/* Recompensas */}
      <div className={`rb-rewards ${canRebirth ? "ready" : ""}`}>
        <p className="rb-rewards-title">🎁 Al renacer obtienes:</p>
        <ul>
          {rewards.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </div>

      <p className="rb-warn">⚠️ Resetea tu dinero y multiplicador actual.</p>

      <button
        className={`rb-btn ${canRebirth ? "ready" : ""}`}
        onClick={handleRebirth}
        disabled={!canRebirth}
        title={
          canRebirth
            ? "Renacer ahora"
            : `Te faltan $${fmt(faltaDinero)} y x${faltaMult}`
        }
      >
        {canRebirth
          ? "🔄 RENACER AHORA"
          : !moneyOk
            ? `🔒 FALTAN $${fmt(faltaDinero)}`
            : `🔒 FALTA x${faltaMult}`}
      </button>
    </div>
  );
};
