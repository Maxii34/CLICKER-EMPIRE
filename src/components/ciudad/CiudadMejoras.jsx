import { FaHome, FaStore, FaChessRook, FaLandmark } from "react-icons/fa";
import "./Ciudad.css";
import {
  costCasa,
  costMercado,
  costMuralla,
  costAyunta,
} from "../../game/economy.js";
import { MAX_AYUNTA, MAX_MURALLA } from "../../game/constants.js";
import { formatMoney as formatNumber } from "../../utils/format.js";

export const CiudadMejoras = ({
  money,
  rebirlvl,
  cityLvl = {},
  cityRate = 0,
  cityClickBonus = 0,
  buyCasa,
  buyMercado,
  buyMuralla,
  buyAyunta,
}) => {
  const lvl = (k) => cityLvl[k] || 0;

  const items = [
    {
      key: "casa",
      icon: FaHome,
      name: "Casa",
      desc: "+$2 /seg de renta por nivel. Tu primer territorio.",
      lvl: lvl("casa"),
      max: Infinity,
      cost: costCasa(lvl("casa")),
      effect: `+$${formatNumber(lvl("casa") * 2)} /seg`,
      req: 0,
      buy: () => buyCasa(costCasa(lvl("casa"))),
      accent: "casa",
    },
    {
      key: "mercado",
      icon: FaStore,
      name: "Mercado",
      desc: "+$7 /seg de renta por nivel. Comercio activo.",
      lvl: lvl("mercado"),
      max: Infinity,
      cost: costMercado(lvl("mercado")),
      effect: `+$${formatNumber(lvl("mercado") * 7)} /seg`,
      req: 1,
      buy: () => buyMercado(costMercado(lvl("mercado"))),
      accent: "mercado",
    },
    {
      key: "muralla",
      icon: FaChessRook,
      name: "Muralla",
      desc: "+$2 por click por nivel. Defiende y potencia tus golpes.",
      lvl: lvl("muralla"),
      max: MAX_MURALLA,
      cost: costMuralla(lvl("muralla")),
      effect: `+$${formatNumber(cityClickBonus)} /click`,
      req: 2,
      buy: () => buyMuralla(costMuralla(lvl("muralla"))),
      accent: "muralla",
    },
    {
      key: "ayunta",
      icon: FaLandmark,
      name: "Ayuntamiento",
      desc: "+$25 /seg de renta por nivel. El corazón de la ciudad.",
      lvl: lvl("ayunta"),
      max: MAX_AYUNTA,
      cost: costAyunta(lvl("ayunta")),
      effect: `+$${formatNumber(lvl("ayunta") * 25)} /seg`,
      req: 3,
      buy: () => buyAyunta(costAyunta(lvl("ayunta"))),
      accent: "ayunta",
    },
  ];

  const totalEdificios =
    lvl("casa") + lvl("mercado") + lvl("muralla") + lvl("ayunta");

  return (
    <div className="ciudad-box">
      <div className="ciudad-header">
        <div>
          <h2 className="ciudad-title">Ciudad</h2>
          <p className="ciudad-sub">Edificios y territorio con renta pasiva</p>
        </div>
        <span className="ciudad-badge">{totalEdificios} edif.</span>
      </div>

      <div className="ciudad-stats">
        <div className="cstat">
          <span className="cstat-label">Renta ciudad</span>
          <span className="cstat-value green">+${formatNumber(cityRate)}/s</span>
        </div>
        <div className="cstat">
          <span className="cstat-label">Bonus click</span>
          <span className="cstat-value gold">+${formatNumber(cityClickBonus)}</span>
        </div>
      </div>

      <div className="ciudad-list">
        {items.map((it) => {
          const lockedByRb = rebirlvl < it.req;
          const maxed = it.lvl >= it.max;
          const can = !maxed && !lockedByRb && money >= it.cost;
          const Icon = it.icon;
          return (
            <div
              key={it.key}
              className={`ciudad-card ${it.accent} ${!can ? "is-disabled" : ""}`}
            >
              <div className="ccard-top">
                <span className="ccard-icon">
                  <Icon />
                </span>
                <div className="ccard-head">
                  <h3 className="ccard-name">
                    {it.name} <span className="clvl">Nv.{it.lvl}</span>
                  </h3>
                  <p className="ccard-desc">{it.desc}</p>
                </div>
                <span className="ceffect">{it.effect}</span>
              </div>

              <div className="ccard-foot">
                <span className={`creq ${lockedByRb ? "locked" : "ok"}`}>
                  {it.req === 0 ? "Sin requisito" : `RB ${it.req}+`}
                </span>
                <button
                  className={`cbuy ${can ? "ready" : ""}`}
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

              <div className="cpips">
                {[...Array(8)].map((_, i) => (
                  <span
                    key={i}
                    className={`cpip ${i < Math.min(it.lvl, 8) ? "on" : ""}`}
                  />
                ))}
                {it.lvl >= 8 && <span className="cmore">+{it.lvl - 8}</span>}
              </div>
            </div>
          );
        })}
      </div>

      <p className="ciudad-tip">
        La renta va <b>directo a tu dinero</b> cada segundo. La <b>Muralla</b> suma
        a cada click y sobrevive al renacimiento.
      </p>
    </div>
  );
};
