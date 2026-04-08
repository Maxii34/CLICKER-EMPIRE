import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import "./Menu.css";

export const MenuNav = ({ money, multiplier }) => {
  return (
    <Navbar expand="lg" className="custom-navbar shadow-lg">
      <Container fluid className="navbar-container">
        {/* LOGO */}
        <Navbar.Brand className="brand-logo">
          ⚡ CLICKER PRO
        </Navbar.Brand>

        {/* TOGGLE para móviles */}
        <Navbar.Toggle aria-controls="navbar-content" />

        {/* CONTENIDO DERECHA */}
        <Navbar.Collapse id="navbar-content" className="justify-content-end">
          <div className="stats-wrapper">
            {/* DINERO */}
            <div className="status-card money-card">
              <small className="status-label text-success">Dinero</small>
              <span className="status-value text-success">
                ${money.toLocaleString()}
              </span>
            </div>

            {/* MULTIPLICADOR */}
            <div className="status-card multiplier-card">
              <small className="status-label text-info">Multiplicador</small>
              <span className="status-value text-info">x{multiplier}</span>
            </div>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};