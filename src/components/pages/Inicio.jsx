import { Container, Row, Col } from "react-bootstrap";
import { ClikerGamer } from "../ClikerGamer";
import { BonusBienvenida } from "../bonus/BonusBienvenida";
import { MejorasProges } from "../upgrader/MejorasProges";
import { ReiniciosLvl } from "../rebirs/ReiniciosLvl";

export const Inicio = ({
  money,
  setMoney,
  multiplier,
  setMultiplier,
  buyUpgrade,
  handleClick,
  addMoneyDev,
  setRebirLvl,
  rebirlvl
}) => {
  return (
    <Container fluid className="py-5">
      <Row className="g-4">
        {/* Columna Izquierda - Bonus y Upgrader */}
        <Col lg={3} md={12} className="d-flex flex-column gap-4">
          <div className="bonus-section">
            <BonusBienvenida
              multiplier={multiplier}
              setMultiplier={setMultiplier}
            />
          </div>
          <div className="upgrader-section">
            <MejorasProges
              money={money}
              multiplier={multiplier}
              buyUpgrade={buyUpgrade}
              rebirlvl={rebirlvl}
            />
          </div>
        </Col>

        {/* Columna Central - Clicker */}
        <Col
          lg={6}
          md={12}
          className="d-flex justify-content-center align-items-center"
        >
          <div className="clicker-section">
            <ClikerGamer
              money={money}
              multiplier={multiplier}
              handleClick={handleClick}
              addMoneyDev={addMoneyDev}
            />
          </div>
        </Col>

        {/* Columna Derecha - Vacía */}
        <Col lg={3} md={12}>
        <div className="reinicio-bottom-section">
            <ReiniciosLvl
              money={money}
              setMoney={setMoney}
              multiplier={multiplier}
              setRebirLvl={setRebirLvl}
              rebirlvl={rebirlvl}
            />
          </div></Col>
      </Row>

      {/* Sección inferior centrada - Reinicio */}
      <Row className="g-4 mt-5">
        <Col xs={12} className="d-flex justify-content-center">
          
        </Col>
      </Row>
    </Container>
  );
};
