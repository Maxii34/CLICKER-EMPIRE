import "./Bonus.css";

export const BonusAutoClick = ({ level = 0, cost = 1000, isActive, setIsActive }) => {
  const maxLevels = 5;

  return (
    <div className="upgrade-container">
      {/* HEADER: Título y Nivel */}
      <div className="upgrade-header">
        <div className="upgrade-title-section">
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
        
        {/* Badge dinámico: Solo aparece si el nivel es > 0 y está encendido */}
        {level > 0 && isActive && (
          <div className="upgrade-active-badge">
            <div className="dot-blink"></div>
            TRABAJANDO
          </div>
        )}
      </div>

      {/* BODY: Barra de progreso */}
      <div className="upgrade-progress-bar">
        {[...Array(maxLevels)].map((_, i) => (
          <div
            key={i}
            className={`progress-step ${i < level ? "step-filled" : ""}`}
          />
        ))}
      </div>

      {/* FOOTER: Compra de niveles */}
      <div className="upgrade-footer">
        <div className="upgrade-price">
          <span className="price-tag">Costo:</span>
          <span className="price-value">${cost.toLocaleString()}</span>
        </div>

        <button
          className={`upgrade-buy-btn ${level >= maxLevels ? "maxed" : ""}`}
          disabled={level >= maxLevels}
        >
          {level >= maxLevels ? "MAX" : "MEJORAR"}
        </button>
      </div>

      {/* SECCIÓN DE ACTIVACIÓN (SOLO SI TIENE NIVEL) */}
      <div className="upgrade-toggle-section">
        {level > 0 ? (
          <button 
            onClick={() => setIsActive(!isActive)}
            className={`toggle-btn ${isActive ? "btn-on" : "btn-off"}`}
          >
            <div className="toggle-indicator"></div>
            {isActive ? "DESACTIVAR AUTOCLICK" : "ACTIVAR AUTOCLICK"}
          </button>
        ) : (
          <p className="unlock-message">Activable desde el reinicio 2</p>
        )}
      </div>
    </div>
  );
};