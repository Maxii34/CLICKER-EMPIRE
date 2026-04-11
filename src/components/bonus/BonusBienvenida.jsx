import "./Bonus.css";

export const BonusBienvenida = ({
  setMultiplier,
  bonusActivo,
  setBonusActivo,
}) => {

  const handleBonus = () => {
    if (bonusActivo) return;
    setMultiplier((prev) => prev * 2);
    setBonusActivo(true);
  };

  return (
    <div className="bonus-wrapper">
      {!bonusActivo  && (
        <div className="bonus-card-compact">
          <div className="bonus-info">
            <span className="bonus-emoji">🎁</span>
            <div className="bonus-texts">
              <h5 className="bonus-title">Bonus Inicial</h5>
              <p className="bonus-subtitle">Like = <span className="highlight">x2 GANANCIAS</span></p>
            </div>
            <span className="badge-perm">PERMANENTE</span>
          </div>

          <button className="btn-activate-bonus" onClick={handleBonus}>
            ACTIVAR
          </button>
        </div>
      )}
    </div>
  );
};