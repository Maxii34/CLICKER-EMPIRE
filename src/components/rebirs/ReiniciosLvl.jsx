import "./Reinicio.css"

export const ReiniciosLvl = ({ money, multiplier, setMoney }) => {
  const reqMoney = 1000;
  const reqMulti = 5;

  const canRebirth = money >= reqMoney && multiplier >= reqMulti;

  const handleRebirth = () => {
    if (!canRebirth) return;

    setMoney(0);
    // 👉 acá después podés resetear más cosas (multiplier, upgrades, etc)
  };

  return (
    <div className="rebirth-box">
      <h2>🔧 Renacimiento</h2>

      <span className="rebirth-level">Nivel requerido: 01</span>

      {/* REQUISITOS */}
      <div className="rebirth-req">
        <div className={`req-item ${money >= reqMoney ? "ok" : ""}`}>
          💰 ${reqMoney}
        </div>
        <div className={`req-item ${multiplier >= reqMulti ? "ok" : ""}`}>
          ⚡ x{reqMulti}
        </div>
      </div>

      {/* BONUS */}
      <div className={`rebirth-bonus ${canRebirth ? "active" : ""}`}>
        🎁 Desbloquea: <strong>Multiplicador x20</strong>
      </div>

      {/* BOTÓN */}
      <button
        className={`rebirth-btn ${canRebirth ? "active" : "disabled"}`}
        onClick={handleRebirth}
        disabled={!canRebirth}
      >
        {canRebirth ? "Reiniciar progreso 🔄" : "Bloqueado 🔒"}
      </button>
    </div>
  );
};