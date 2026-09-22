import { UNLOCKS } from "./unlocks.js";
import "./Guia.css";

export const GuiaDesbloqueos = ({ rebirlvl = 0 }) => {
  return (
    <details className="guia-box">
      <summary className="guia-summary">
        🗺️ Guía de desbloqueos <span className="guia-rb">RB {rebirlvl}</span>
        <span className="guia-hint">qué se desbloquea en cada nivel</span>
      </summary>
      <div className="guia-list">
        {UNLOCKS.map((u, i) => {
          const done = rebirlvl >= u.rb;
          const next = !done && rebirlvl + 1 >= u.rb;
          return (
            <div key={i} className={`guia-item ${done ? "done" : ""} ${next ? "next" : ""}`}>
              <span className="guia-icon">{done ? "✅" : u.icon}</span>
              <div className="guia-text">
                <strong>{u.title}</strong>
                <small>{u.desc}</small>
              </div>
              <span className="guia-side">
                {u.side}
                <em>RB {u.rb}+</em>
              </span>
            </div>
          );
        })}
      </div>
    </details>
  );
};
