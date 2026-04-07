import "./Bonus.css";

export const BonusBienvenida = ({
  multiplier,
  setMultiplier,
  bonusActivo,
  setBonusActivo,
}) => {

  const handleBonus = () => {
    if (bonusActivo) return;

    setMultiplier((prev) => prev * 2); // 🔥 multiplicás, no seteás fijo
    setBonusActivo(true);
  };

  return (
    <>
      {!bonusActivo ? (
        <div className="bonus-block">
          <h2 className="title">🎁 Bonus de Inicio</h2>

          <div className="bonus">
            <p className="text">Dale me gusta al juego</p>
            <p className="reward">x2 ganancias</p>
            <span className="text2">PERMANENTE</span>
          </div>

          <button className="btn-bonus" onClick={handleBonus}>
            Activar Bonus
          </button>
        </div>
      ) : (
        <div className="bonus-active">
          <span>🎁 Bonus x2 activo</span>
        </div>
      )}
    </>
  );
};