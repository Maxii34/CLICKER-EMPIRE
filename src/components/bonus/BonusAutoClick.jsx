import "./Bonus.css";

export const BonusAutoClick = ({ level = 0, cost = 1000 }) => {
  const maxLevels = 5;

  return (
    <div className="upgrade-container">
      {/* HEADER: Título y Nivel */}
      <div className="upgrade-header">
        <div className="upgrade-title-section">
          <span className="upgrade-icon">🤖</span>
          <div>
            <h5 className="upgrade-name">Auto-Clicker Pro</h5>
            <p className="upgrade-level-text">
              Nivel{" "}
              <span className="level-number">
                {level}/{maxLevels}
              </span>
            </p>
          </div>
        </div>
        {level > 0 && (
          <div className="upgrade-active-badge">
            <div className="dot-blink"></div>
            ACTIVO
          </div>
        )}
      </div>

      {/* BODY: Barra de progreso de niveles */}
      <div className="upgrade-progress-bar">
        {[...Array(maxLevels)].map((_, i) => (
          <div
            key={i}
            className={`progress-step ${i < level ? "step-filled" : ""}`}
          />
        ))}
      </div>

      {/* FOOTER: Precio y Botón */}
      <div className="upgrade-footer">
        <div className="upgrade-price">
          <span className="price-tag">Costo:</span>
          <span className="price-value">${cost.toLocaleString()}</span>
        </div>

        <button
          className={`upgrade-buy-btn ${level >= maxLevels ? "maxed" : ""}`}
          disabled={level >= maxLevels}
        >
          {level >= maxLevels ? "NIVEL MÁXIMO" : "MEJORAR"}
        </button>
      </div>
    </div>
  );
};
