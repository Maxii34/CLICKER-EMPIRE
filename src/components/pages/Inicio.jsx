import { Container, Row, Col } from "react-bootstrap";
import { ClikerGamer } from "../ClikerGamer";
import { BonusBienvenida } from "../bonus/BonusBienvenida";
import { MejorasProges } from "../upgrader/MejorasProges";
import { ReiniciosLvl } from "../rebirs/ReiniciosLvl";
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
          {/* IZQUIERDA */}
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

          {/* DERECHA */}
          <Col lg={4} md={5} className="inicio-right scroll-fix">
            <div className="inicio-panel">
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
    </Container>
  );
};
