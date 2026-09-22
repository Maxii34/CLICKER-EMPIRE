import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import Dropdown from "react-bootstrap/Dropdown";
import { FaCog } from "react-icons/fa";
import rebirthReq from "../rebirs/rebirthReq.js";
import { ResetGame } from "./ResetGame";
import "./ResetGame.css";
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
  addMoneyDev,
  removeMoney,
  resetSave,
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

          {/* STATS: pills minimalistas */}
          <Navbar.Collapse id="navbar-content" className="justify-content-end">
            <div className="hud-pills">
              <span className="hud-pill hud-money" title="Dinero actual">
                💰 ${formatMoney(money)}
              </span>
              <span className="hud-pill" title="Multiplicador base (tienda x$)">
                ⚡ x{multiplier}
              </span>
              <span className="hud-pill" title="Ganancia real por click (multiplicador + Imperio)">
                👆 +${formatMoney(moneyPerClick)}
              </span>
              <span className="hud-pill" title="Ingreso pasivo directo por segundo (Fondo de Inversión)">
                🌱 +${formatMoney(passiveTotal)}/s
              </span>

              {autoClick && (
                <span className="auto-pill" title="Auto-clicker encendido">
                  <span className="pulsing-dot"></span> AUTO ON
                </span>
              )}

              {bonusActivo && (
                <span className="bonus-status-pill" title="Bonus de bienvenida permanente">
                  <span className="pulsing-dot"></span>
                  🎁 x2
                </span>
              )}
            </div>
          </Navbar.Collapse>

          {/* Menú desplegable: herramientas DEV + borrado total */}
          <div className="nav-actions">
            <Dropdown autoClose="outside" align="end">
              <Dropdown.Toggle className="gear-btn" title="Ajustes y herramientas DEV">
                <FaCog />
              </Dropdown.Toggle>
              <Dropdown.Menu className="dev-dropdown-menu">
                <div className="dev-menu-title">Herramientas DEV</div>
                <div className="dev-menu-row">
                  <button className="btn-dev text-success" onClick={addMoneyDev} title="Sumar $50M (testing)">
                    +$ DEV
                  </button>
                  <button className="btn-dev text-danger" onClick={removeMoney} title="Poner dinero en 0">
                    -$ DEV
                  </button>
                </div>
                {resetSave && <ResetGame onReset={resetSave} />}
                <div className="dev-menu-note">Autoguardado activo</div>
              </Dropdown.Menu>
            </Dropdown>
            <Navbar.Toggle aria-controls="navbar-content" />
          </div>
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
