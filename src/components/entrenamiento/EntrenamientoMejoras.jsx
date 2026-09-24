import { FaDumbbell, FaHeart, FaBolt } from "react-icons/fa";
import "./Entrenamiento.css";
import {
  costFuerza,
  costDisciplina,
  costReflejos,
} from "../../game/economy.js";
import {
  MAX_FUERZA,
  MAX_DISCIPLINA,
  MAX_REFLEJOS,
} from "../../game/constants.js";
import { formatMoney as formatNumber } from "../../utils/format.js";

export const EntrenamientoMejoras = ({
  money,
  rebirlvl,
  trainLvl = {},
  trainClickBonus = 0,
  trainRate = 0,
  trainAutoBonus = 0,
  buyFuerza,
  buyDisciplina,
  buyReflejos,
}) => {
  const lvl = (k) => trainLvl[k] || 0;

  const items = [
    {
      key: "fuerza",
      icon: FaDumbbell,
      name: "Fuerza",
      desc: "+$3 por click por nivel. Puños de acero.",
      lvl: lvl("fuerza"),
      max: MAX_FUERZA,
      cost: costFuerza(lvl("fuerza")),
      effect: `+$${formatNumber(trainClickBonus)} /click`,
      req: 2,
      buy: () => buyFuerza(costFuerza(lvl("fuerza"))),
      accent: "fuerza",
    },
    {
      key: "disciplina",
      icon: FaHeart,
      name: "Disciplina",
      desc: "+$4 /seg pasivo por nivel. Constancia total.",
      lvl: lvl("disciplina"),
      max: MAX_DISCIPLINA,
      cost: costDisciplina(lvl("disciplina")),
      effect: `+$${formatNumber(trainRate)} /seg`,
      req: 2,
      buy: () => buyDisciplina(costDisciplina(lvl("disciplina"))),
      accent: "disciplina",
    },
    {
      key: "reflejos",
      icon: FaBolt,
      name: "Reflejos",
      desc: "+$12 por golpe auto por nivel. Manos relámpago.",
      lvl: lvl("reflejos"),
      max: MAX_REFLEJOS,
      cost: costReflejos(lvl("reflejos")),
      effect: `+$${formatNumber(trainAutoBonus)} /auto`,
      req: 3,
      buy: () => buyReflejos(costReflejos(lvl("reflejos"))),
      accent: "reflejos",
    },
  ];

  const total = lvl("fuerza") + lvl("disciplina") + lvl("reflejos");

  return (
    <div className="entreno-box">
      <div className="entreno-header">
        <div>
          <h2 className="entreno-title">Entrenamiento</h2>
          <p className="entreno-sub">Sube tus stats base permanentes</p>
        </div>
        <span className="entreno-badge">{total} stats</span>
      </div>

      <div className="entreno-stats">
        <div className="tstat">
          <span className="tstat-label">Fuerza</span>
          <span className="tstat-value gold">+${formatNumber(trainClickBonus)}</span>
        </div>
        <div className="tstat">
          <span className="tstat-label">Disciplina</span>
          <span className="tstat-value green">+${formatNumber(trainRate)}/s</span>
        </div>
        <div className="tstat">
          <span className="tstat-label">Reflejos</span>
          <span className="tstat-value blue">+${formatNumber(trainAutoBonus)}</span>
        </div>
      </div>

      <div className="entreno-list">
        {items.map((it) => {
          const lockedByRb = rebirlvl < it.req;
          const maxed = it.lvl >= it.max;
          const can = !maxed && !lockedByRb && money >= it.cost;
          const Icon = it.icon;
          return (
            <div
              key={it.key}
              className={`entreno-card ${it.accent} ${!can ? "is-disabled" : ""}`}
            >
              <div className="tcard-top">
                <span className="tcard-icon">
                  <Icon />
                </span>
                <div className="tcard-head">
                  <h3 className="tcard-name">
                    {it.name} <span className="tlvl">Nv.{it.lvl}</span>
                  </h3>
                  <p className="tcard-desc">{it.desc}</p>
                </div>
                <span className="teffect">{it.effect}</span>
              </div>

              <div className="tcard-foot">
                <span className={`treq ${lockedByRb ? "locked" : "ok"}`}>
                  RB {it.req}+
                </span>
                <button
                  className={`tbuy ${can ? "ready" : ""}`}
                  disabled={!can}
                  onClick={it.buy}
                  title={maxed ? "Nivel máximo" : `Cuesta $${formatNumber(it.cost)}`}
                >
                  {maxed
                    ? "MÁXIMO"
                    : lockedByRb
                      ? "BLOQUEADO"
                      : can
                        ? `COMPRAR $${formatNumber(it.cost)}`
                        : `$${formatNumber(it.cost)}`}
                </button>
              </div>

              <div className="tpips">
                {[...Array(8)].map((_, i) => (
                  <span
                    key={i}
                    className={`tpip ${i < Math.min(it.lvl, 8) ? "on" : ""}`}
                  />
                ))}
                {it.lvl >= 8 && <span className="tmore">+{it.lvl - 8}</span>}
              </div>
            </div>
          );
        })}
      </div>

      <p className="entreno-tip">
        Los stats <b>sobreviven al renacimiento</b> y se suman a todo:
        click, pasivo y auto.
      </p>
    </div>
  );
};
