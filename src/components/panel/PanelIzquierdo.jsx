import { useState } from "react";
import {
  FaCrown,
  FaCity,
  FaShieldAlt,
  FaDumbbell,
} from "react-icons/fa";
import { ImperioMejoras } from "../imperio/ImperioMejoras";
import { CiudadMejoras } from "../ciudad/CiudadMejoras";
import { EjercitoMejoras } from "../ejercito/EjercitoMejoras";
import { EntrenamientoMejoras } from "../entrenamiento/EntrenamientoMejoras";
import "./PanelIzquierdo.css";

const TABS = [
  { key: "imperio", label: "Imperio", icon: FaCrown, desc: "Mejoras permanentes" },
  { key: "ciudad", label: "Ciudad", icon: FaCity, desc: "Edificios y territorio" },
  { key: "ejercito", label: "Ejército", icon: FaShieldAlt, desc: "Tropas y defensa" },
  { key: "entrenamiento", label: "Entrenamiento", icon: FaDumbbell, desc: "Sube tus stats" },
];

export const PanelIzquierdo = (props) => {
  const { rebirlvl = 0 } = props;
  const [tab, setTab] = useState("imperio");
  const active = TABS.find((t) => t.key === tab) || TABS[0];

  return (
    <div className="panelv-box">
      {/* Menú en columna: una opción por fila */}
      <nav className="panelv-menu" aria-label="Panel del imperio">
        {TABS.map((t) => {
          const Icon = t.icon;
          const isActive = t.key === tab;
          return (
            <button
              key={t.key}
              className={`panelv-item ${isActive ? "active" : ""}`}
              onClick={() => setTab(t.key)}
              aria-pressed={isActive}
              title={t.desc}
            >
              <span className="panelv-item-icon">
                <Icon />
              </span>
              <span className="panelv-item-text">
                <span className="panelv-item-label">{t.label}</span>
                <span className="panelv-item-desc">{t.desc}</span>
              </span>
              {t.key === "imperio" && (
                <span className="panelv-rb">x{rebirlvl} RB</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Contenido según la pestaña activa */}
      <div className="panelv-content" key={active.key}>
        {tab === "imperio" && <ImperioMejoras {...props} />}

        {tab === "ciudad" && <CiudadMejoras {...props} />}

        {tab === "ejercito" && <EjercitoMejoras {...props} />}

        {tab === "entrenamiento" && <EntrenamientoMejoras {...props} />}
      </div>
    </div>
  );
};
