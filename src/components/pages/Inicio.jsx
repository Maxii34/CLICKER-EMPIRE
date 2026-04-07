import { Container, Row, Col } from "react-bootstrap";
import { ClikerGamer } from "../ClikerGamer";
import { BonusBienvenida } from "../bonus/BonusBienvenida";
import { MejorasProges } from "../upgrader/MejorasProges";
import { ReiniciosLvl } from "../rebirs/ReiniciosLvl";

export const Inicio = ({
  money, setMoney, multiplier, setMultiplier, buyUpgrade,
  handleClick, addMoneyDev, setRebirLvl, rebirlvl,
  setUnlockedLvl, unlockedLvl, bonusActivo, setBonusActivo,
}) => {
  return (
    <Container fluid className="vh-100 d-flex flex-column p-0" style={{
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
      color: "#fff",
      overflow: "hidden" 
    }}>
      
      {/* NAVBAR */}
      <nav className="py-2 px-4 shadow-lg" style={{
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        height: "70px",
        zIndex: 10
      }}>
        <Row className="h-100 align-items-center">
          <Col md={5}>
            <h3 className="m-0 fw-bold" style={{ color: "#f59e0b" }}>⚡ CLICKER PRO</h3>
          </Col>
          <Col md={7} className="d-flex justify-content-end gap-3">
            <div className="px-3 py-1 rounded-3 bg-dark border border-success text-center">
              <small className="text-success d-block fw-bold" style={{fontSize: '0.65rem'}}>Dinero</small>
              <span className="h5 m-0 fw-bold text-success">${money.toLocaleString()}</span>
            </div>
            <div className="px-3 py-1 rounded-3 bg-dark border border-info text-center">
              <small className="text-info d-block fw-bold" style={{fontSize: '0.65rem'}}>Multiplicador</small>
              <span className="h5 m-0 fw-bold text-info">x{multiplier}</span>
            </div>
          </Col>
        </Row>
      </nav>

      {/* CUERPO PRINCIPAL - Aquí forzamos el alto para que el scroll funcione */}
      <main style={{ height: "calc(100vh - 70px)", width: "100%" }}>
        <Row className="h-100 g-0">
          
          {/* COLUMNA IZQUIERDA: Juego */}
          <Col lg={8} md={7} className="d-flex flex-column align-items-center justify-content-center p-4 h-100">
            <div className="mb-4">
              <BonusBienvenida
                multiplier={multiplier}
                setMultiplier={setMultiplier}
                bonusActivo={bonusActivo}
                setBonusActivo={setBonusActivo}
              />
            </div>
            <ClikerGamer
              money={money}
              multiplier={multiplier}
              handleClick={handleClick}
              addMoneyDev={addMoneyDev}
              unlockedLvl={unlockedLvl}
            />
          </Col>

          {/* COLUMNA DERECHA: Con scroll forzado */}
          <Col lg={4} md={5} className="h-100 border-start scroll-fix">
            <div className="p-3 d-flex flex-column gap-4 pb-5">
              
              <div className="shop-section">
                <MejorasProges
                  money={money}
                  multiplier={multiplier}
                  buyUpgrade={buyUpgrade}
                  rebirlvl={rebirlvl}
                  unlockedLvl={unlockedLvl}
                />
              </div>

              <div className="rebirth-section">
                <ReiniciosLvl
                  money={money}
                  setMoney={setMoney}
                  multiplier={multiplier}
                  setRebirLvl={setRebirLvl}
                  rebirlvl={rebirlvl}
                  setUnlockedLvl={setUnlockedLvl}
                  setMultiplier={setMultiplier} 
                />
              </div>

            </div>
          </Col>
        </Row>
      </main>

      {/* ESTILOS CSS ADICIONALES */}
      <style>{`
        /* FORZAR SCROLL EN COLUMNA DERECHA */
        .scroll-fix {
          overflow-y: scroll !important; /* Siempre mostrar barra o permitir scroll */
          background: rgba(0, 0, 0, 0.15);
        }

        /* Estilo de la barra de scroll para que combine */
        .scroll-fix::-webkit-scrollbar {
          width: 8px;
        }
        .scroll-fix::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
        }
        .scroll-fix::-webkit-scrollbar-thumb {
          background: #f59e0b;
          border-radius: 10px;
          border: 2px solid #1e293b;
        }
      `}</style>

    </Container>
  );
};