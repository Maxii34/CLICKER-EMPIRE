import { useState } from "react";
import { FaTrophy, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { ACHIEVEMENTS } from "./achievements.js";
import "./Logros.css";

export const LogrosPanel = ({ unlockedIds = [] }) => {
  const [open, setOpen] = useState(false);
  const unlocked = new Set(unlockedIds);

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
                  title={has ? `${a.name} — ${a.desc}` : `? — ${a.desc}`}
                >
                  <Icon />
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
