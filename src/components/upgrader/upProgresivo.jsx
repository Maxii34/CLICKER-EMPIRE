
export const upProgresivo = () => {
    return (
        <>
        <div className="shop">
        <h2>Tienda de aumento de click 🛒</h2>

        {/* 🔥 upgrade progresivo */}
        <button
          className={`button ${money >= 50 && multiplier < 10 ? "btn-green" : "btn-disabled"}`}
          onClick={() => buyUpgrade(50, 0.1, 10)}
          disabled={money < 50 || multiplier >= 10}
        >
          +0.1 (Max x10) - 50
        </button>

        {money >= 200 && multiplier < 10 && (
          <button
            className={`button ${money >= 300 && multiplier < 10 ? "btn-green" : "btn-disabled"}`}
            onClick={() => buyUpgrade(300, 0.5, 10)}
            disabled={money < 300 || multiplier >= 10}
          >
            +0.5 (Max x10) - 300
          </button>
        )}

        {money >= 500 && multiplier < 10 && (
          <button
            className={`button ${money >= 600 && multiplier < 10 ? "btn-green" : "btn-disabled"}`}
            onClick={() => buyUpgrade(600, 1, 10)}
            disabled={money < 600 || multiplier >= 10}
          >
            +1 (Max x10) - 600
          </button>
        )}
      </div>
        </>
    );
};