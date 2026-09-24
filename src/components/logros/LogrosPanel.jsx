import { useState } from "react";
import { FaTrophy, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { ACHIEVEMENTS } from "./achievements.js";
import "./Logros.css";

export const LogrosPanel = ({ unlockedIds = [] }) => {
  const [open, setOpen] = useState(false);
  const [tip, setTip] = useState(null);
  const unlocked = new Set(unlockedIds);

  const showTip = (e, a, has) => {
    setTip({ id: a.id, x: e.clientX, y: e.clientY, name: a.name, desc: a.desc, has });
  };
  const moveTip = (e) => {
    setTip((t) => (t ? { ...t, x: e.clientX, y: e.clientY } : t));
  };
  const hideTip = () => setTip(null);

  return (
    <div className="logros-box">
      <button
        className="logros-head"
        onClick={() => setOpen((o) => !o)}
        title={open ? "Contraer" : "Expandir"}
        aria-expanded={open}
      >
        <span className="logros-icon">
          <FaTrophy />
        </span>
        <span className="logros-head-text">
          <span className="logros-title">Logros</span>
          <span className="logros-sub">{unlockedIds.length}/{ACHIEVEMENTS.length} desbloqueados</span>
        </span>
        <span className="collapse-chevron">{open ? <FaChevronUp /> : <FaChevronDown />}</span>
      </button>

      <div className={`collapse-body ${open ? "open" : ""}`}>
        <div className="collapse-inner">
          <div className="logros-grid">
            {ACHIEVEMENTS.map((a) => {
              const has = unlocked.has(a.id);
              const Icon = a.icon;
              return (
                <span
                  key={a.id}
                  className={`logro-tile ${has ? "has" : ""}`}
                  aria-label={has ? `${a.name} — ${a.desc}` : `Bloqueado — ${a.desc}`}
                  onMouseEnter={(e) => showTip(e, a, has)}
                  onMouseMove={moveTip}
                  onMouseLeave={hideTip}
                >
                  <Icon />
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {tip && (
        <div
          className={`logro-tip ${tip.has ? "has" : ""} ${tip.y < 150 ? "below" : ""}`}
          style={{ left: tip.x, top: tip.y }}
        >
          <strong className="logro-tip-name">
            {tip.has ? tip.name : "Logro bloqueado"}
          </strong>
          <span className="logro-tip-desc">{tip.desc}</span>
          <span className="logro-tip-state">
            {tip.has ? "Desbloqueado" : "Bloqueado"}
          </span>
        </div>
      )}
    </div>
  );
};
