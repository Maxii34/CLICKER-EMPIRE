export const Reinicio = ({ money, setMoney, multiplier }) => {
  return (
    <>
      <div className="rebirth">
        <h2>Renacimiento 🔧</h2>
        <span>Requerimiento lv 01:🎮</span>

        <div className="requirements">
          <p>
            Dinero: <strong>$ 1,000</strong>
          </p>
          <p>
            Multiplicador: <strong>x 5</strong>
          </p>
        </div>

        <div
          className={`bonus ${money >= 1000 && multiplier >= 5 ? "bonus-unlocked" : ""}`}
        >
          Bonus: <strong>Desbloqueo de multiplicador x20</strong>
        </div>

        {money >= 1000 && multiplier >= 5 && (
          <button className="button btn-blue" onClick={() => setMoney(0)}>
            Reiniciar Progreso
          </button>
        )}
      </div>
    </>
  );
};
