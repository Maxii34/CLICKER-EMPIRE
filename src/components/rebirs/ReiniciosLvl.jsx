import "./Reinicio.css";

export const ReiniciosLvl = ({ money, multiplier, setMoney }) => {
  // Objeto con varios niveles de renacimiento
  const rebirthReq = [
    { level: 1, money: 1000, multiplier: 5, bonus: 10 },
    { level: 2, money: 5000, multiplier: 10, bonus: 15 },
    { level: 3, money: 15000, multiplier: 15, bonus: 20 },
    { level: 4, money: 50000, multiplier: 20, bonus: 30 },
    { level: 5, money: 150000, multiplier: 30, bonus: 50 },
    { level: 6, money: 500000, multiplier: 50, bonus: 100 },
  ];

  // Elegimos el nivel que el jugador puede reiniciar actualmente
  const currentLevel =
    rebirthReq
      .slice()
      .reverse()
      .find((req) => money >= req.money && multiplier >= req.multiplier) ||
    rebirthReq[0];

  const canRebirth = money >= currentLevel.money && multiplier >= currentLevel.multiplier;

  const handleRebirth = () => {
    if (!canRebirth) return;
    // desbloqueo de bonus, tienda lvl 2, etc se manejaría acá

    setMoney(0);
    // 👉 acá después podés resetear más cosas (multiplier, upgrades, etc)
  };

  return (
    <div className="rebirth-box">
      <h2 className="fs-4 text p-0 mark rounded-1 shadow-sm">Renacimiento</h2>
      <span className="rebirth-level text-muted">
        Nivel requerido: {currentLevel.level}
      </span>
      <span>Requisitos:</span>

      <div className="rebirth-req">
        <div
          className={`req-item shadow-lg ${money >= currentLevel.money ? "ok" : ""}`}
        >
          💰 ${currentLevel.money}
        </div>
        <div
          className={`req-item shadow-lg ${multiplier >= currentLevel.multiplier ? "ok" : ""}`}
        >
          ⚡ x{currentLevel.multiplier}
        </div>
      </div>

      {/* BONUS */}
      <div className={`rebirth-bonus ${canRebirth ? "active" : ""}`}>
        <h5 className="text-center fs-6">🎁 Desbloquea:</h5>
        <div className=" text-black text-capitalize text-center bg-light p-2 shadow-md rounded-1">
          <span className="bonus-text">+{currentLevel.bonus}% ganancias</span>
          <span>Tienda upgrades lvl 2 </span>
          <span className="bonus-text">¡Y más sorpresas!</span>
        </div>
      </div>

      
      {canRebirth && (
        <button
        className={`rebirth-btn ${canRebirth ? "active" : "disabled"}`}
        onClick={handleRebirth}
        disabled={!canRebirth}
      >
        {canRebirth ? "Reiniciar " : "Bloqueado 🔒"}
      </button>)}
    </div>
  );
};
