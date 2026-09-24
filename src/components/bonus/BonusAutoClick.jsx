import { useEffect, useState } from "react";
import {
  FaRobot,
  FaBolt,
  FaCoins,
  FaLock,
  FaCheck,
  FaLightbulb,
  FaPowerOff,
  FaArrowUp,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import "./Bonus.css";
import {
  AUTO_CLICKER_SPEEDS as SPEEDS,
  AUTO_CLICKER_LEVELS,
  MAX_AUTO_CLICKER,
} from "../../game/constants.js";
import { formatMoney as fmt } from "../../utils/format.js";

export const BonusAutoClick = ({
  setAutoClickSpeed,
  money,
  setMoney,
  rebirlvl,
  autoClick,
  setAutoClick,
  level = 0,
  setLevel,
  hitGain = 0,
  intervalMs = 1000,
}) => {
  const maxLevels = MAX_AUTO_CLICKER;
  const upgraderClicker = AUTO_CLICKER_LEVELS;

  // Al cargar partida guardada, restaura la velocidad según el nivel.
  useEffect(() => {
    const current = upgraderClicker.find((u) => u.level === level);
    if (current) setAutoClickSpeed(current.speed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Colapsado por defecto: solo resumen visible, clic para expandir
  const [open, setOpen] = useState(false);

  const nextUpgrade = upgraderClicker.find((u) => u.level === level + 1) || null;
  const canUpgrade =
    nextUpgrade && money >= nextUpgrade.cost && rebirlvl >= nextUpgrade.reqRebirth;
  const lockedByRb = nextUpgrade && rebirlvl < nextUpgrade.reqRebirth;
  const stateLabel =
    level === 0 ? "Sin comprar" : autoClick ? "Encendido" : "Apagado";

  const handleUpgrade = () => {
    if (!canUpgrade) return;
    setMoney((prev) => prev - nextUpgrade.cost);
    setAutoClickSpeed(nextUpgrade.speed);
    setLevel((prev) => prev + 1);
  };

  return (
    <div className="ac-box">
      <button className="ac-collapse-head" onClick={() => setOpen((o) => !o)} title={open ? "Contraer" : "Expandir"} aria-expanded={open}>
        <span className="ac-icon">
          <FaRobot />
        </span>
        <div className="ac-head-text">
          <div className="ac-title">Auto-Clicker</div>
          <div className="ac-meta-row">
            <span className={`ac-sub ${autoClick && level > 0 ? "on" : ""}`}>{stateLabel}</span>
            <span className="ac-lvl">
              Nv {level}/{maxLevels}
            </span>
          </div>
        </div>
        <div className="ac-head-right">
          <span className="collapse-chevron">{open ? <FaChevronUp /> : <FaChevronDown />}</span>
        </div>
      </button>

      {/* Modo compacto: botón encender/apagar debajo, chico. Al expandir se oculta y vuelve a su lugar dentro de acciones. */}
      {!open && level > 0 && (
        <div className="ac-compact-action">
          <button
            className={`ac-toggle compact ${autoClick ? "on" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              setAutoClick(!autoClick);
            }}
            title={autoClick ? "Apagar auto-clicker (tu click manual sigue igual)" : "Encender auto-clicker (suma golpes sin pausar tu click manual)"}
          >
            <FaPowerOff /> {autoClick ? "APAGAR" : "ENCENDER"}
          </button>
        </div>
      )}

      <div className={`collapse-body ${open ? "open" : ""}`}>
      <div className="collapse-inner ac-detail p-0">
      {/* Estado + rendimiento */}
      <div className="ac-section ac-status-section">
        <div className="ac-status-row d-flex justify-content-center align-items-center">
          {level > 0 && (
            <span className="ac-perf" title="Ganancia de cada golpe automático">
              <FaBolt /> +${fmt(hitGain)} <em>cada {intervalMs}ms</em>
            </span>
          )}
        </div>
      </div>

      <div className="ac-section ac-progress-section">
        <div className="ac-dots">
          {[...Array(maxLevels)].map((_, i) => (
            <span key={i} className={`ac-dot ${i < level ? "on" : ""}`} />
          ))}
        </div>
      </div>

      {/* Próxima mejora: ÚNICO lugar con la info de requisito/costo */}
      <div className="ac-section ac-next-section">
        {nextUpgrade ? (
          <div className="ac-next">
            <div className="ac-next-top">
              <span>
                <FaArrowUp /> Nivel {nextUpgrade.level}
              </span>
              <span className={money >= nextUpgrade.cost ? "ok" : ""}>
                <FaCoins /> ${fmt(nextUpgrade.cost)}
              </span>
            </div>
            <p className="ac-next-sub text-capitalize">
              Vel: {SPEEDS[level]}ms → {nextUpgrade.speed}ms por golpe.
            </p>
            {lockedByRb && (
              <div className="ac-lock-note">
                <FaLock /> RB {nextUpgrade.reqRebirth}
              </div>
            )}
          </div>
        ) : (
          <div className="ac-max">
            <FaCheck /> Velocidad máxima alcanzada
          </div>
        )}
      </div>

      <div className="ac-section ac-actions-section">
        <div className="ac-actions">
          {nextUpgrade && (
            <button
              className={`ac-buy ${canUpgrade ? "ready" : ""}`}
              onClick={handleUpgrade}
              disabled={!canUpgrade}
              title={
                lockedByRb
                  ? `Se desbloquea en RB ${nextUpgrade.reqRebirth}`
                  : `Cuesta $${fmt(nextUpgrade.cost)}`
              }
            >
              MEJORAR · ${fmt(nextUpgrade.cost)}
            </button>
          )}

          {level > 0 && (
            <button
              className={`ac-toggle ${autoClick ? "on" : ""}`}
              onClick={() => setAutoClick(!autoClick)}
              title={autoClick ? "Apagar auto-clicker (tu click manual sigue igual)" : "Encender auto-clicker (suma golpes sin pausar tu click manual)"}
            >
              <FaPowerOff /> {autoClick ? "APAGAR" : "ENCENDER"}
            </button>
          )}
        </div>
      </div>

      {level === 0 && (
        <div className="ac-section ac-help-section">
          <p className="ac-tip">
            <FaLightbulb /> Se desbloquea en <b>RB 2</b>. Niveles en RB 2 / 4 / 6 / 8 / 10.
          </p>
        </div>
      )}
      </div>
      </div>
    </div>
  );
};
