import { useState } from "react";
import {
  FaRedo,
  FaTrophy,
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
  setShopCounts,
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
          <div className="rb-head-text">
            <div className="rb-title">Renacimiento</div>
            <div className="rb-meta-row">
              <span className="rb-sub">Nivel máximo alcanzado</span>
            </div>
          </div>
        </div>
        <p className="rb-max">Eres leyenda del imperio. No hay más renacimientos.</p>
      </div>
    );
  }

  const moneyOk = money >= req.money;
  const multOk = multiplier >= req.multiplier;
  const canRebirth = moneyOk && multOk;

  const faltaDinero = Math.max(0, req.money - money);
  const faltaMult = Number(Math.max(0, req.multiplier - multiplier).toFixed(2));

  const handleRebirth = () => {
    if (!canRebirth) return;
    const nextLevel = rebirthReq.find((r) => r.level === req.level + 1);
    setRebirLvl((prev) => prev + 1);
    setMoney(0);
    setMultiplier(req.bonus || 0);
    setUnlockedLvl(nextLevel ? nextLevel.multiplier : Infinity);
    // P2: el contador de recompras de tienda se resetea al renacer.
    if (setShopCounts) setShopCounts({});
  };

  const rewards = [
    { icon: FaRocket, label: `Empiezas en x${req.bonus}` },
    { icon: FaStore, label: `Tienda lvl ${req.level + 1}` },
    ...(REBIRTH_EXTRA[req.level + 1] || []).map((r) => ({
      icon: EXTRA_ICONS[r.icon] || FaGift,
      label: r.label,
    })),
  ];

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
        <div className="rb-head-text">
          <div className="rb-title">Renacimiento</div>
          <div className="rb-meta-row">
            {canRebirth && (
              <span className="rb-sub ready">
                <FaCheck /> Listo
              </span>
            )}
            <span className="rb-lvl">RB {req.level}</span>
          </div>
        </div>
        <div className="rb-head-right">
          <span className="collapse-chevron">{open ? <FaChevronUp /> : <FaChevronDown />}</span>
        </div>
      </button>

      {/* Modo compacto: botón renacer debajo, chico. Al expandir se oculta y vuelve a su lugar dentro de acciones. */}
      {!open && (
        <div className="rb-compact-action">
          <button
            className={`rb-btn compact ${canRebirth ? "ready" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              handleRebirth();
            }}
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
            ) : (
              <>
                <FaLock /> BLOQUEADO
              </>
            )}
          </button>
        </div>
      )}

      <div className={`collapse-body ${open ? "open" : ""}`}>
        <div className="collapse-inner rb-detail">
          {/* Recompensas */}
          <div className="rb-section rb-rewards-section">
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
          </div>

          <div className="rb-section rb-warn-section">
            <p className="rb-warn">
              <FaExclamationTriangle /> Resetea dinero y multiplicador.
            </p>
          </div>

          <div className="rb-section rb-actions-section">
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
              ) : (
                <>
                  <FaLock /> BLOQUEADO
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
