import { useState } from "react";
import {
  FaRedo,
  FaTrophy,
  FaCoins,
  FaBolt,
  FaGift,
  FaStore,
  FaLock,
  FaCheck,
  FaRobot,
  FaHardHat,
  FaCogs,
  FaRocket,
  FaExclamationTriangle,
  FaChevronDown,
  FaChevronUp,
  FaShieldAlt,
  FaDumbbell,
} from "react-icons/fa";
import rebirthReq from "./rebirthReq.js";
import { REBIRTH_EXTRA } from "../shared/unlocks.js";
import { formatMoney as fmt } from "../../utils/format.js";
import "./Reinicio.css";

// Iconos para las recompensas extra (los datos viven en unlocks.js).
const EXTRA_ICONS = {
  robot: FaRobot,
  hardhat: FaHardHat,
  cogs: FaCogs,
  dumbbell: FaDumbbell,
  shield: FaShieldAlt,
  bolt: FaBolt,
};

export const ReiniciosLvl = ({
  money,
  multiplier,
  setMultiplier,
  setMoney,
  rebirlvl,
  setRebirLvl,
  setUnlockedLvl,
}) => {
  // Colapsado por defecto: solo resumen visible, clic para expandir
  const [open, setOpen] = useState(false);

  const maxed = rebirlvl >= rebirthReq.length;
  const req =
    rebirthReq.find((r) => r.level === rebirlvl) ||
    rebirthReq[rebirthReq.length - 1];

  if (maxed) {
    return (
      <div className="rb-box">
        <div className="rb-head">
          <span className="rb-icon">
            <FaTrophy />
          </span>
          <span className="rb-head-text">
            <span className="rb-title">Renacimiento</span>
            <span className="rb-sub">Nivel máximo alcanzado</span>
          </span>
        </div>
        <p className="rb-max">Eres leyenda del imperio. No hay más renacimientos.</p>
      </div>
    );
  }

  const moneyOk = money >= req.money;
  const multOk = multiplier >= req.multiplier;
  const canRebirth = moneyOk && multOk;
  const moneyPct = Math.min(100, (money / req.money) * 100);
  const multPct = Math.min(100, (multiplier / req.multiplier) * 100);

  const faltaDinero = Math.max(0, req.money - money);
  const faltaMult = Number(Math.max(0, req.multiplier - multiplier).toFixed(2));

  const handleRebirth = () => {
    if (!canRebirth) return;
    const nextLevel = rebirthReq.find((r) => r.level === req.level + 1);
    setRebirLvl((prev) => prev + 1);
    setMoney(0);
    setMultiplier(req.bonus || 0);
    setUnlockedLvl(nextLevel ? nextLevel.multiplier : Infinity);
  };

  const rewards = [
    { icon: FaRocket, label: `Empiezas en x${req.bonus}` },
    { icon: FaStore, label: `Tienda lvl ${req.level + 1}` },
    ...(REBIRTH_EXTRA[req.level + 1] || []).map((r) => ({
      icon: EXTRA_ICONS[r.icon] || FaGift,
      label: r.label,
    })),
  ];

  const progress = Math.round((moneyPct + multPct) / 2);

  return (
    <div className="rb-box">
      <button
        className="rb-collapse-head"
        onClick={() => setOpen((o) => !o)}
        title={open ? "Contraer" : "Expandir"}
        aria-expanded={open}
      >
        <span className="rb-icon">
          <FaRedo />
        </span>
        <span className="rb-head-text">
          <span className="rb-title">Renacimiento</span>
          <span className={`rb-sub ${canRebirth ? "ready" : ""}`}>
            {canRebirth ? (
              <>
                <FaCheck /> Listo
              </>
            ) : (
              `${progress}%`
            )}
          </span>
        </span>
        <span className="rb-head-right">
          <span className="rb-lvl">RB {req.level}</span>
          <span className="collapse-chevron">{open ? <FaChevronUp /> : <FaChevronDown />}</span>
        </span>
      </button>

      <div className={`collapse-body ${open ? "open" : ""}`}>
        <div className="collapse-inner rb-detail">
          {/* Requisitos con progreso */}
          <div className="rb-req">
            <div className="rb-req-top">
              <span>
                <FaCoins /> Dinero
              </span>
              <span className={moneyOk ? "ok" : ""}>
                ${fmt(money)} / ${fmt(req.money)}
              </span>
            </div>
            <div className="rb-bar">
              <div className="rb-fill money" style={{ width: `${moneyPct}%` }} />
            </div>
          </div>

          <div className="rb-req">
            <div className="rb-req-top">
              <span>
                <FaBolt /> Multiplicador
              </span>
              <span className={multOk ? "ok" : ""}>
                x{multiplier} / x{req.multiplier}
              </span>
            </div>
            <div className="rb-bar">
              <div className="rb-fill mult" style={{ width: `${multPct}%` }} />
            </div>
          </div>

          {/* Recompensas */}
          <div className={`rb-rewards ${canRebirth ? "ready" : ""}`}>
            <p className="rb-rewards-title">
              <FaGift /> Al renacer obtienes:
            </p>
            <ul>
              {rewards.map((r, i) => (
                <li key={i}>
                  <r.icon /> {r.label}
                </li>
              ))}
            </ul>
          </div>

          <p className="rb-warn">
            <FaExclamationTriangle /> Resetea tu dinero y multiplicador actual.
          </p>

          <button
            className={`rb-btn ${canRebirth ? "ready" : ""}`}
            onClick={handleRebirth}
            disabled={!canRebirth}
            title={
              canRebirth
                ? "Renacer ahora"
                : `Te faltan $${fmt(faltaDinero)} y x${faltaMult}`
            }
          >
            {canRebirth ? (
              <>
                <FaRedo /> RENACER AHORA
              </>
            ) : !moneyOk ? (
              <>
                <FaLock /> FALTAN ${fmt(faltaDinero)}
              </>
            ) : (
              <>
                <FaLock /> FALTA x{faltaMult}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
