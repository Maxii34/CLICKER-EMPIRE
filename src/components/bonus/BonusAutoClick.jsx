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

const SPEEDS = [1000, 900, 800, 700, 600, 500];

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
  const maxLevels = 5;
  const upgraderClicker = [
    { level: 1, cost: 10000, speed: 900, reqRebirth: 2 },
    { level: 2, cost: 50000, speed: 800, reqRebirth: 4 },
    { level: 3, cost: 100000, speed: 700, reqRebirth: 6 },
    { level: 4, cost: 250000, speed: 600, reqRebirth: 8 },
    { level: 5, cost: 500000, speed: 500, reqRebirth: 10 },
  ];

  // Al cargar partida guardada, restaura la velocidad según el nivel.
  useEffect(() => {
    const current = upgraderClicker.find((u) => u.level === level);
    if (current) setAutoClickSpeed(current.speed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fmt = (n) => {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
    if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
    return `${Math.floor(n)}`;
  };

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
        <span className="ac-head-text">
          <span className="ac-title">Auto-Clicker</span>
          <span className={`ac-sub ${autoClick && level > 0 ? "on" : ""}`}>{stateLabel}</span>
        </span>
        <span className="ac-head-right">
          <span className="ac-lvl">
            Nv {level}/{maxLevels}
          </span>
          <span className="collapse-chevron">{open ? <FaChevronUp /> : <FaChevronDown />}</span>
        </span>
      </button>

      <div className={`collapse-body ${open ? "open" : ""}`}>
      <div className="collapse-inner ac-detail p-0">
      {/* Estado + rendimiento */}
      <div className="ac-status-row">
        <span className={`ac-state ${autoClick && level > 0 ? "on" : "off"}`}>
          <span className={`status-led ${autoClick && level > 0 ? "led-green" : ""}`} />
          {level === 0 ? "SIN COMPRAR" : autoClick ? "ENCENDIDO" : "APAGADO"}
        </span>
        {level > 0 && (
          <span className="ac-perf" title="Ganancia de cada golpe automático">
            <FaBolt /> +${fmt(hitGain)} <em>cada {intervalMs}ms</em>
          </span>
        )}
      </div>

      <div className="ac-dots">
        {[...Array(maxLevels)].map((_, i) => (
          <span key={i} className={`ac-dot ${i < level ? "on" : ""}`} />
        ))}
      </div>

      {/* Próxima mejora */}
      {nextUpgrade ? (
        <div className="ac-next">
          <div className="ac-next-top">
            <span>
              <FaArrowUp /> Nivel {nextUpgrade.level}
            </span>
            <span className={lockedByRb ? "locked" : money >= nextUpgrade.cost ? "ok" : ""}>
              {lockedByRb ? (
                <>
                  <FaLock /> RB {nextUpgrade.reqRebirth}
                </>
              ) : (
                <>
                  <FaCoins /> ${fmt(nextUpgrade.cost)}
                </>
              )}
            </span>
          </div>
          <p className="ac-next-sub">
            Velocidad: {SPEEDS[level]}ms → {nextUpgrade.speed}ms por golpe
          </p>
        </div>
      ) : (
        <div className="ac-max">
          <FaCheck /> Velocidad máxima alcanzada
        </div>
      )}

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
            {lockedByRb ? (
            <>
              <FaLock /> RB {nextUpgrade.reqRebirth}
            </>
          ) : (
            <>MEJORAR ${fmt(nextUpgrade.cost)}</>
          )}
          </button>
        )}

        {level > 0 && (
          <button
            className={`ac-toggle ${autoClick ? "on" : ""}`}
            onClick={() => setAutoClick(!autoClick)}
            title={autoClick ? "Apagar auto-clicker (vuelves a clickear manual)" : "Encender auto-clicker (pausa tu click manual)"}
          >
            <FaPowerOff /> {autoClick ? "APAGAR" : "ENCENDER"}
          </button>
        )}
      </div>

      {level === 0 && (
        <p className="ac-tip">
          <FaLightbulb /> Se desbloquea en <b>RB 2</b>. Niveles en RB 2 / 4 / 6 / 8 / 10.
        </p>
      )}
      </div>
      </div>
    </div>
  );
};
