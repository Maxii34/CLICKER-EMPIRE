import { Container, Row, Col } from "react-bootstrap";
import { ClikerGamer } from "../ClikerGamer";
import { BonusBienvenida } from "../bonus/BonusBienvenida";
import { MejorasProges } from "../upgrader/MejorasProges";
import { ReiniciosLvl } from "../rebirs/ReiniciosLvl";
import { BonusAutoClick } from "../bonus/BonusAutoClick";
import { MinerProges } from "../upgrader/MinerProgres";
import "./Pages.css";


export const Inicio = ({
  money,
  setMoney,
  multiplier,
  setMultiplier,
  buyUpgrade,
  handleClick,
  addMoneyDev,
  removeMoney,
  setRebirLvl,
  rebirlvl,
  setUnlockedLvl,
  unlockedLvl,
  bonusActivo,
  setBonusActivo,
  setAutoClickSpeed,
  autoClick,
  setAutoClick,
}) => {
  return (
    <Container fluid className="inicio-container">
      <main className="inicio-main">
        <Row className="h-100 g-0">
          {/* 1. NUEVA SECCIÓN IZQUIERDA (Panel Lateral / Stats Extras) */}
          <Col lg={2} md={3} className="inicio-sidebar scroll-fix">
            <div className="sidebar-content p-3">
              {/* Aquí puedes poner inventario, logros o stats secundarios */}
              <h6 className="text-muted text-center">PANEL LATERAL</h6>
            </div>
          </Col>

          {/* 2. SECCIÓN CENTRAL (JUEGO) */}
          <Col lg={6} md={5} className="inicio-left">
            <div className="mb-4 mt-4">
              <BonusBienvenida
                setMultiplier={setMultiplier}
                bonusActivo={bonusActivo}
                setBonusActivo={setBonusActivo}
              />
            </div>

            <ClikerGamer
              money={money}
              setMoney={setMoney}
              multiplier={multiplier}
              handleClick={handleClick}
              addMoneyDev={addMoneyDev}
              removeMoney={removeMoney}
              unlockedLvl={unlockedLvl}
              autoClick={autoClick}
            />
          </Col>

          {/* 3. SECCIÓN DERECHA (TIENDA Y MEJORAS) */}
          <Col lg={4} md={4} className="inicio-right scroll-fix">
            <div className="inicio-panel">
              <div className="shop-section mb-3">
                <MejorasProges
                  money={money}
                  multiplier={multiplier}
                  buyUpgrade={buyUpgrade}
                  rebirlvl={rebirlvl}
                  unlockedLvl={unlockedLvl}
                />
              </div>

              <Row className="g-2">
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
                    <BonusAutoClick
                      setAutoClickSpeed={setAutoClickSpeed}
                      money={money}
                      setMoney={setMoney}
                      rebirlvl={rebirlvl}
                      autoClick={autoClick}
                      setAutoClick={setAutoClick}
                    />
                  </div>
                </Col>
              </Row>
              <div>
                <MinerProges
                  money={money}
                  multiplier={multiplier}
                  buyUpgrade={buyUpgrade}
                  rebirlvl={rebirlvl}
                  unlockedLvl={unlockedLvl}
                />
              </div>
            </div>
          </Col>
        </Row>
      </main>
    </Container>
  );
};
