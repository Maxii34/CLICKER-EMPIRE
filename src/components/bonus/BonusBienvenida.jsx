import "./Bonus.css";

export const BonusBienvenida = ({ multiplier, setMultiplier }) => {
  const activo = multiplier >= 2;

  return (
    <>
      {!activo ? (
        <div className="bonus-block">
          <h2 className="title">🎁 Bonus de Inicio</h2>

          <div className="bonus">
            <p className="text">Dale me gusta al juego</p>
            <p className="reward">x2 ganancias</p>
            <span className="text2">PERMANENTE</span>
          </div>

          <button
            className="btn-bonus"
            onClick={() => setMultiplier(2)}
          >
            Activar Bonus
          </button>
        </div>
      ) : (
        <div className="bonus-active">
          <span>🎁 Bonus x2, Activo de bienvenida.</span>
        </div>
      )}
    </>
  );
};