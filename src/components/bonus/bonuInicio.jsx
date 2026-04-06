export const BonuInicio = ({ multiplier, setMultiplier }) => {
  return (
    <>
      {multiplier <= 1.9 && (
        <div className="bonus-block">
          <h2>Bonus de Inicio 🎁</h2>
          <h3>Dale Megusta al juego: x2</h3>
          <span>permanente</span>
          <button className="button btn-green" onClick={() => setMultiplier(2)}>
            Activar Bonus
          </button>
        </div>
      )}
    </>
  );
};
