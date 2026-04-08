import { Container, Row, Col } from "react-bootstrap";
import { ClikerGamer } from "../ClikerGamer";
import { BonusBienvenida } from "../bonus/BonusBienvenida";
import { MejorasProges } from "../upgrader/MejorasProges";
import { ReiniciosLvl } from "../rebirs/ReiniciosLvl";
import { BonusAutoClick } from "../bonus/BonusAutoClick";
import "./Pages.css";

export const Inicio = ({
  money,
  setMoney,
  multiplier,
  setMultiplier,
  buyUpgrade,
  handleClick,
  addMoneyDev,
  setRebirLvl,
  rebirlvl,
  setUnlockedLvl,
  unlockedLvl,
  bonusActivo,
  setBonusActivo,
}) => {
  return (
    <Container fluid className="inicio-container">
      <main className="inicio-main">
        <Row className="h-100 g-0">
          {/* SECCIÓN IZQUIERDA (JUEGO) */}
          <Col lg={8} md={7} className="inicio-left">
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

          {/* SECCIÓN DERECHA (TIENDA Y MEJORAS) */}
          <Col lg={4} md={5} className="inicio-right scroll-fix">
            <div className="inicio-panel">
              
              {/* MEJORAS PROGRESIVAS (ARRIBA) */}
              <div className="shop-section mb-3">
                <MejorasProges
                  money={money}
                  multiplier={multiplier}
                  buyUpgrade={buyUpgrade}
                  rebirlvl={rebirlvl}
                  unlockedLvl={unlockedLvl}
                />
              </div>

              {/* CONTENEDOR COMPARTIDO: REINICIOS Y AUTOCLICK */}
              <Row className="g-2"> {/* g-2 añade una separación pequeña entre columnas */}
                <Col xs={12} xl={6}>
                  <div className="rebirth-section h-100">
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
                </Col>
                
                <Col xs={12} xl={6}>
                  <div className="autoclick-section h-100">
                    {/* Aquí puedes pasarle las props de nivel y costo cuando las tengas */}
                    <BonusAutoClick level={0} cost={5000} />
                  </div>
                </Col>
              </Row>

            </div>
          </Col>
        </Row>
      </main>
    </Container>
  );
};