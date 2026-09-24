import {
  FaUserShield,
  FaCrosshairs,
  FaChessKnight,
  FaCrown,
  FaBolt,
} from "react-icons/fa";
import "./Ejercito.css";
import {
  costSoldado,
  costArquero,
  costCaballero,
  costGeneral,
} from "../../game/economy.js";
import { MAX_GENERAL } from "../../game/constants.js";
import { formatMoney as formatNumber } from "../../utils/format.js";

export const EjercitoMejoras = ({
  money,
  rebirlvl,
  armyLvl = {},
  armyPower = 0,
  raidLoot = 0,
  raidCooldown = 0,
  raidEvery = 45,
  totalRaids = 0,
  buySoldado,
  buyArquero,
  buyCaballero,
  buyGeneral,
  doRaid,
}) => {
  const lvl = (k) => armyLvl[k] || 0;

  const items = [
    {
      key: "soldado",
      icon: FaUserShield,
      name: "Soldado",
      desc: "+12 poder de saqueo por nivel. Infantería fiel.",
      lvl: lvl("soldado"),
      max: Infinity,
      cost: costSoldado(lvl("soldado")),
      effect: `+${formatNumber(lvl("soldado") * 12)} poder`,
      req: 3,
      buy: () => buySoldado(costSoldado(lvl("soldado"))),
      accent: "soldado",
    },
    {
      key: "arquero",
      icon: FaCrosshairs,
      name: "Arquero",
      desc: "+35 poder de saqueo por nivel. Lluvia certera.",
      lvl: lvl("arquero"),
      max: Infinity,
      cost: costArquero(lvl("arquero")),
      effect: `+${formatNumber(lvl("arquero") * 35)} poder`,
      req: 4,
      buy: () => buyArquero(costArquero(lvl("arquero"))),
      accent: "arquero",
    },
    {
      key: "caballero",
      icon: FaChessKnight,
      name: "Caballero",
      desc: "+100 poder de saqueo por nivel. Carga pesada.",
      lvl: lvl("caballero"),
      max: Infinity,
      cost: costCaballero(lvl("caballero")),
      effect: `+${formatNumber(lvl("caballero") * 100)} poder`,
      req: 5,
      buy: () => buyCaballero(costCaballero(lvl("caballero"))),
      accent: "caballero",
    },
    {
      key: "general",
      icon: FaCrown,
      name: "General",
      desc: "+300 poder de saqueo por nivel. Mente maestra.",
      lvl: lvl("general"),
      max: MAX_GENERAL,
      cost: costGeneral(lvl("general")),
      effect: `+${formatNumber(lvl("general") * 300)} poder`,
      req: 6,
      buy: () => buyGeneral(costGeneral(lvl("general"))),
      accent: "general",
    },
  ];

  const totalTropas =
    lvl("soldado") + lvl("arquero") + lvl("caballero") + lvl("general");
  const canRaid = armyPower > 0 && raidCooldown <= 0;
  const pct =
    raidEvery > 0 ? Math.min(100, ((raidEvery - raidCooldown) / raidEvery) * 100) : 0;

  return (
    <div className="ejercito-box">
      <div className="ejercito-header">
        <div>
          <h2 className="ejercito-title">Ejército</h2>
          <p className="ejercito-sub">Tropas y saqueos periódicos</p>
        </div>
        <span className="ejercito-badge">{totalTropas} tropas</span>
      </div>

      <div className="ejercito-stats">
        <div className="estat">
          <span className="estat-label">Poder</span>
          <span className="estat-value red">⚔️ {formatNumber(armyPower)}</span>
        </div>
        <div className="estat">
          <span className="estat-label">Botín / saqueo</span>
          <span className="estat-value gold">+${formatNumber(raidLoot)}</span>
        </div>
      </div>

      {/* Saqueo: manual o automático cada N seg */}
      <div className={`raid-box ${canRaid ? "ready" : ""}`}>
        <div className="raid-info">
          <span className="raid-label">
            <FaBolt /> Saqueo {totalRaids > 0 ? `• ${totalRaids} hechos` : ""}
          </span>
          <span className="raid-timer">
            {armyPower <= 0
              ? "Recluta tropas"
              : raidCooldown > 0
                ? `Próximo en ${raidCooldown}s`
                : "¡Botín listo!"}
          </span>
        </div>
        <div className="raid-track">
          <div className="raid-fill" style={{ width: `${pct}%` }} />
        </div>
        <button
          className={`raid-btn ${canRaid ? "ready" : ""}`}
          disabled={!canRaid}
          onClick={() => doRaid && doRaid()}
          title={
            armyPower <= 0
              ? "Recluta al menos 1 tropa"
              : canRaid
                ? `Saquear +$${formatNumber(raidLoot)} ahora`
                : `Espera ${raidCooldown}s`
          }
        >
          {armyPower <= 0 ? "SIN TROPAS" : canRaid ? "⚔️ SAQUEAR" : `EN ${raidCooldown}s`}
        </button>
      </div>

      <div className="ejercito-list">
        {items.map((it) => {
          const lockedByRb = rebirlvl < it.req;
          const maxed = it.lvl >= it.max;
          const can = !maxed && !lockedByRb && money >= it.cost;
          const Icon = it.icon;
          return (
            <div
              key={it.key}
              className={`ejercito-card ${it.accent} ${!can ? "is-disabled" : ""}`}
            >
              <div className="ecard-top">
                <span className="ecard-icon">
                  <Icon />
                </span>
                <div className="ecard-head">
                  <h3 className="ecard-name">
                    {it.name} <span className="elvl">Nv.{it.lvl}</span>
                  </h3>
                  <p className="ecard-desc">{it.desc}</p>
                </div>
                <span className="eeffect">{it.effect}</span>
              </div>

              <div className="ecard-foot">
                <span className={`ereq ${lockedByRb ? "locked" : "ok"}`}>
                  RB {it.req}+
                </span>
                <button
                  className={`ebuy ${can ? "ready" : ""}`}
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

              <div className="epips">
                {[...Array(8)].map((_, i) => (
                  <span
                    key={i}
                    className={`epip ${i < Math.min(it.lvl, 8) ? "on" : ""}`}
                  />
                ))}
                {it.lvl >= 8 && <span className="emore">+{it.lvl - 8}</span>}
              </div>
            </div>
          );
        })}
      </div>

      <p className="ejercito-tip">
        El saqueo cae <b>solo cada {raidEvery}s</b> o al pulsar el botón.
        Sobrevive al renacimiento.
      </p>
    </div>
  );
};
