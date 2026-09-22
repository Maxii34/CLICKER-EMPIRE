import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import rebirthReq from "../rebirs/rebirthReq.js";
import "./Menu.css";

const formatMoney = (num) => {
  if (num < 10000) return num.toLocaleString("es-AR");
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + "B";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return `${Math.floor(num)}`;
};

export const MenuNav = ({
  money,
  multiplier,
  bonusActivo,
  rebirlvl = 0,
  moneyPerClick = 0,
  passiveTotal = 0,
  autoClick = false,
}) => {
  const req = rebirthReq.find((r) => r.level === rebirlvl) || rebirthReq[rebirthReq.length - 1];
  const isMax = rebirlvl >= rebirthReq.length;
  const pMoney = req ? Math.min(1, money / req.money) : 1;
  const pMult = req ? Math.min(1, multiplier / req.multiplier) : 1;
  const progress = Math.round(((pMoney + pMult) / 2) * 100);
  const ready = req && money >= req.money && multiplier >= req.multiplier;

  return (
    <header className="topbar-wrap">
      <Navbar expand="lg" className="custom-navbar shadow-lg">
        <Container fluid className="navbar-container">
          {/* LOGO + RB */}
          <div className="brand-group">
            <Navbar.Brand className="brand-logo">
              <span className="brand-icon">🏛️</span>
              <span className="brand-text">
                CLICKER <em>EMPIRE</em>
              </span>
            </Navbar.Brand>
            <span className={`rb-chip ${ready ? "ready" : ""}`}>
              {isMax ? "🏆 MAX" : `🔄 RB ${rebirlvl}`}
            </span>
          </div>

          <Navbar.Toggle aria-controls="navbar-content" />

          {/* STATS */}
          <Navbar.Collapse id="navbar-content" className="justify-content-end">
            <div className="stats-wrapper">
              <div className="status-card money-card" title="Dinero actual">
                <small className="status-label text-success">💰 Dinero</small>
                <span className="status-value text-success">
                  ${formatMoney(money)}
                </span>
              </div>

              <div className="status-card multiplier-card" title="Multiplicador base (tienda x$)">
                <small className="status-label text-info">⚡ Multiplicador</small>
                <span className="status-value text-info">x{multiplier}</span>
              </div>

              <div className="status-card click-card" title="Ganancia real por click (multiplicador + Imperio)">
                <small className="status-label text-warning">👆 Por click</small>
                <span className="status-value text-warning">
                  +${formatMoney(moneyPerClick)}
                </span>
              </div>

              <div className="status-card passive-card" title="Ingreso pasivo por segundo (Fondo + Minería)">
                <small className="status-label text-passive">🌱 Pasivo</small>
                <span className="status-value text-passive">
                  +${formatMoney(passiveTotal)}/s
                </span>
              </div>

              {autoClick && (
                <div className="auto-pill" title="Auto-clicker encendido">
                  <span className="pulsing-dot"></span> AUTO ON
                </div>
              )}

              {bonusActivo && (
                <div className="bonus-status-pill" title="Bonus de bienvenida permanente">
                  <span className="pulsing-dot"></span>
                  🎁 x2 Activo
                </div>
              )}
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Barra de progreso al próximo renacimiento */}
      {!isMax && req && (
        <div className="rb-progress" title={`Rebirth ${req.level}: $${req.money.toLocaleString()} + x${req.multiplier}`}>
          <div className="rb-progress-track">
            <div className={`rb-progress-fill ${ready ? "ready" : ""}`} style={{ width: `${progress}%` }} />
          </div>
          <span className="rb-progress-label">
            {ready
              ? `✅ ¡Renacimiento RB ${req.level} listo!`
              : `Próx. RB ${req.level}: $${formatMoney(req.money)} + x${req.multiplier} — ${progress}%`}
          </span>
        </div>
      )}
    </header>
  );
};
