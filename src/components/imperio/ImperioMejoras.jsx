const costExo = (lvl) => Math.floor(500 * Math.pow(2.2, lvl));
const costFondo = (lvl) => Math.floor(1500 * Math.pow(2.5, lvl));
const costOverclock = (lvl) => Math.floor(5000 * Math.pow(3, lvl));

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
}) => {
  const items = [
    {
      key: "exo",
      icon: "💪",
      name: "Exoesqueleto",
      desc: "+$2 por click. Siempre disponible.",
      lvl: imperioLvl.exo,
      cost: costExo(imperioLvl.exo),
      effect: `+$${clickBonus} /click`,
      req: 0,
      can: money >= costExo(imperioLvl.exo),
      buy: () => buyExo(costExo(imperioLvl.exo)),
      accent: "exo",
    },
    {
      key: "fondo",
      icon: "🏦",
      name: "Fondo Inversión",
      desc: "+$5 /seg pasivo, incluso sin clickear.",
      lvl: imperioLvl.fondo,
      cost: costFondo(imperioLvl.fondo),
      effect: `+$${passiveRate} /seg`,
      req: 1,
      can: money >= costFondo(imperioLvl.fondo) && rebirlvl >= 1,
      buy: () => buyFondo(costFondo(imperioLvl.fondo)),
      accent: "fondo",
    },
    {
      key: "overclock",
      icon: "⚙️",
      name: "Overclock",
      desc: "+x1 potencia del Auto-Clicker.",
      lvl: imperioLvl.overclock,
      cost: costOverclock(imperioLvl.overclock),
      effect: `Auto x${autoPower}`,
      req: 2,
      can: money >= costOverclock(imperioLvl.overclock) && rebirlvl >= 2,
      buy: () => buyOverclock(costOverclock(imperioLvl.overclock)),
      accent: "over",
    },
  ];

  return (
    <div className="imperio-box">
      <div className="imperio-header">
        <div>
          <h2 className="imperio-title">🏛️ Imperio</h2>
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

      <div className="imperio-list">
        {items.map((it) => {
          const lockedByRb = rebirlvl < it.req;
          return (
            <div key={it.key} className={`imperio-card ${it.accent} ${!it.can ? "is-disabled" : ""}`}>
              <div className="icard-top">
                <span className="icard-icon">{it.icon}</span>
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
                  className={`ibuy ${it.can && !lockedByRb ? "ready" : ""}`}
                  disabled={!it.can || lockedByRb}
                  onClick={it.buy}
                >
                  {lockedByRb ? "🔒 BLOQUEADO" : it.can ? `COMPRAR $${formatNumber(it.cost)}` : `$${formatNumber(it.cost)}`}
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
        💡 Sobreviven al renacimiento. Prioriza <b>Exoesqueleto</b> al inicio y <b>Fondo</b> desde RB1.
      </p>
    </div>
  );
};
