import {
  FaDumbbell,
  FaPiggyBank,
  FaCogs,
  FaCrosshairs,
  FaTruck,
} from "react-icons/fa";

const costExo = (lvl) => Math.floor(500 * Math.pow(2.2, lvl));
const costFondo = (lvl) => Math.floor(1500 * Math.pow(2.5, lvl));
const costOverclock = (lvl) => Math.floor(5000 * Math.pow(3, lvl));
const costCrit = (lvl) => Math.floor(3000 * Math.pow(3, lvl));
const costCollector = (lvl) => Math.floor(8000 * Math.pow(2.8, lvl));

const MAX_CRIT = 10; // 10 x 3% = 30% chance
const MAX_COLLECTOR = 5; // cada 10s al máximo

const formatNumber = (num) => {
  if (num < 10000) return num.toLocaleString("es-AR");
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + "B";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(0) + "K";
  return `${num}`;
};

export const ImperioMejoras = ({
  money,
  rebirlvl,
  clickBonus,
  passiveRate,
  autoPower,
  imperioLvl,
  totalClicks,
  moneyPerClick,
  moneyPerAuto,
  buyExo,
  buyFondo,
  buyOverclock,
  critChance = 0,
  critMult = 5,
  collectEverySec = 0,
  buyCrit,
  buyCollector,
}) => {
  const lvl = (k) => imperioLvl[k] || 0;

  const items = [
    {
      key: "exo",
      icon: FaDumbbell,
      name: "Exoesqueleto",
      desc: "+$2 por click. Siempre disponible.",
      lvl: lvl("exo"),
      max: Infinity,
      cost: costExo(lvl("exo")),
      effect: `+$${clickBonus} /click`,
      req: 0,
      buy: () => buyExo(costExo(lvl("exo"))),
      accent: "exo",
    },
    {
      key: "fondo",
      icon: FaPiggyBank,
      name: "Fondo Inversión",
      desc: "+$5 /seg pasivo, incluso sin clickear.",
      lvl: lvl("fondo"),
      max: Infinity,
      cost: costFondo(lvl("fondo")),
      effect: `+$${passiveRate} /seg`,
      req: 1,
      buy: () => buyFondo(costFondo(lvl("fondo"))),
      accent: "fondo",
    },
    {
      key: "overclock",
      icon: FaCogs,
      name: "Overclock",
      desc: "+x1 potencia del Auto-Clicker.",
      lvl: lvl("overclock"),
      max: Infinity,
      cost: costOverclock(lvl("overclock")),
      effect: `Auto x${autoPower}`,
      req: 2,
      buy: () => buyOverclock(costOverclock(lvl("overclock"))),
      accent: "over",
    },
    {
      key: "crit",
      icon: FaCrosshairs,
      name: "Golpe Crítico",
      desc: `+3% chance de golpe x${critMult} por click.`,
      lvl: lvl("crit"),
      max: MAX_CRIT,
      cost: costCrit(lvl("crit")),
      effect: `${critChance}% x${critMult}`,
      req: 1,
      buy: () => buyCrit(costCrit(lvl("crit"))),
      accent: "crit",
    },
    {
      key: "collector",
      icon: FaTruck,
      name: "Recolector",
      desc: "Vacía la bóveda minera solo, cada N seg.",
      lvl: lvl("collector"),
      max: MAX_COLLECTOR,
      cost: costCollector(lvl("collector")),
      effect: collectEverySec > 0 ? `Auto c/${collectEverySec}s` : "Apagado",
      req: 2,
      buy: () => buyCollector(costCollector(lvl("collector"))),
      accent: "coll",
    },
  ];

  return (
    <div className="imperio-box">
      <div className="imperio-header">
        <div>
          <h2 className="imperio-title">Imperio</h2>
          <p className="imperio-sub">Mejoras permanentes del imperio</p>
        </div>
        <span className="imperio-badge"> x{rebirlvl} RB</span>
      </div>

      {/* Dashboard de stats */}
      <div className="imperio-stats">
        <div className="istat">
          <span className="istat-label">Por click</span>
          <span className="istat-value gold">+${formatNumber(moneyPerClick)}</span>
        </div>
        <div className="istat">
          <span className="istat-label">Pasivo</span>
          <span className="istat-value green">+${formatNumber(passiveRate)}/s</span>
        </div>
        <div className="istat">
          <span className="istat-label">Auto hit</span>
          <span className="istat-value blue">+${formatNumber(moneyPerAuto)}</span>
        </div>
        <div className="istat">
          <span className="istat-label">Clicks</span>
          <span className="istat-value muted">{totalClicks.toLocaleString("es-AR")}</span>
        </div>
      </div>

      {/* Lista scrolleable: el panel no crece aunque agregues opciones */}
      <div className="imperio-list">
        {items.map((it) => {
          const lockedByRb = rebirlvl < it.req;
          const maxed = it.lvl >= it.max;
          const can = !maxed && !lockedByRb && money >= it.cost;
          const Icon = it.icon;
          return (
            <div key={it.key} className={`imperio-card ${it.accent} ${!can ? "is-disabled" : ""}`}>
              <div className="icard-top">
                <span className="icard-icon">
                  <Icon />
                </span>
                <div className="icard-head">
                  <h3 className="icard-name">
                    {it.name} <span className="ilvl">Nv.{it.lvl}</span>
                  </h3>
                  <p className="icard-desc">{it.desc}</p>
                </div>
                <span className="ieffect">{it.effect}</span>
              </div>

              <div className="icard-foot">
                <span className={`ireq ${lockedByRb ? "locked" : "ok"}`}>
                  {it.req === 0 ? "Sin requisito" : `RB ${it.req}+`}
                </span>
                <button
                  className={`ibuy ${can ? "ready" : ""}`}
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

              {/* mini progreso visual: próximos 8 niveles */}
              <div className="ipips">
                {[...Array(8)].map((_, i) => (
                  <span key={i} className={`ipip ${i < Math.min(it.lvl, 8) ? "on" : ""}`} />
                ))}
                {it.lvl >= 8 && <span className="imore">+{it.lvl - 8}</span>}
              </div>
            </div>
          );
        })}
      </div>

      <p className="imperio-tip">
        Sobreviven al renacimiento. <b>Crítico</b> y <b>Recolector</b> tienen nivel máximo.
      </p>
    </div>
  );
};
