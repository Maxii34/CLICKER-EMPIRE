import { Container, Row, Col } from "react-bootstrap";
import { ClikerGamer } from "../ClikerGamer";
import { BonusBienvenida } from "../bonus/BonusBienvenida";
import { MejorasProges } from "../upgrader/MejorasProges";
import { ReiniciosLvl } from "../rebirs/ReiniciosLvl";
import { BonusAutoClick } from "../bonus/BonusAutoClick";
import { MinerProges } from "../upgrader/MinerProgres";
import { ImperioMejoras } from "../imperio/ImperioMejoras";
import { GuiaDesbloqueos } from "../shared/GuiaDesbloqueos";
import { LogrosPanel } from "../logros/LogrosPanel";
import "../imperio/Imperio.css";
import "../shared/Guia.css";
import "../logros/Logros.css";
import "./Pages.css";


export const Inicio = ({
  money,
  setMoney,
  multiplier,
  setMultiplier,
  buyUpgrade,
  handleClick,
  setRebirLvl,
  rebirlvl,
  setUnlockedLvl,
  unlockedLvl,
  bonusActivo,
  setBonusActivo,
  setAutoClickSpeed,
  autoClickSpeed,
  autoClick,
  setAutoClick,
  autoClickLevel,
  setAutoClickLevel,
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
  critChance,
  critMult,
  collectEverySec,
  buyCrit,
  buyCollector,
  miningRate,
  purchasedMinerIds,
  buyMiner,
  vault,
  collectVault,
  golden,
  frenzyLeft,
  goldenMsg,
  collectGolden,
  unlockedIds,
}) => {
  return (
    <Container fluid className="inicio-container">
      <main className="inicio-main">
        <Row className="h-100 g-0">
          {/* 1. PANEL IZQUIERDO: IMPERIO (mejoras comprables) */}
          <Col lg={3} md={4} className="inicio-sidebar scroll-fix">
            <div className="sidebar-content">
              <ImperioMejoras
                money={money}
                rebirlvl={rebirlvl}
                clickBonus={clickBonus}
                passiveRate={passiveRate}
                autoPower={autoPower}
                imperioLvl={imperioLvl}
                totalClicks={totalClicks}
                moneyPerClick={moneyPerClick}
                moneyPerAuto={moneyPerAuto}
                buyExo={buyExo}
                buyFondo={buyFondo}
                buyOverclock={buyOverclock}
                critChance={critChance}
                critMult={critMult}
                collectEverySec={collectEverySec}
                buyCrit={buyCrit}
                buyCollector={buyCollector}
              />
              <LogrosPanel unlockedIds={unlockedIds} />
            </div>
          </Col>

          {/* 2. SECCIÓN CENTRAL (JUEGO) */}
          <Col lg={5} md={8} className="inicio-center">
            <div className="center-bonus">
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
              autoClick={autoClick}
              moneyPerClick={moneyPerClick}
              moneyPerAuto={moneyPerAuto}
              passiveRate={passiveRate}
              autoPower={autoPower}
              golden={golden}
              frenzyLeft={frenzyLeft}
              goldenMsg={goldenMsg}
              collectGolden={collectGolden}
            />
            <GuiaDesbloqueos rebirlvl={rebirlvl} />
          </Col>

          {/* 3. SECCIÓN DERECHA (TIENDA Y MEJORAS) */}
          <Col lg={4} md={12} className="inicio-right scroll-fix">
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

              {/* align-items-start: al expandir una tarjeta, la otra no se estira */}
              <Row className="g-2 align-items-start">
                <Col xs={12} xl={6}>
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
                </Col>
                <Col xs={12} xl={6}>
                  <div className="autoclick-section">
                    <BonusAutoClick
                      setAutoClickSpeed={setAutoClickSpeed}
                      money={money}
                      setMoney={setMoney}
                      rebirlvl={rebirlvl}
                      autoClick={autoClick}
                      setAutoClick={setAutoClick}
                      level={autoClickLevel}
                      setLevel={setAutoClickLevel}
                      hitGain={moneyPerAuto}
                      intervalMs={autoClickSpeed}
                    />
                  </div>
                </Col>
              </Row>
              <div>
                <MinerProges
                  money={money}
                  rebirlvl={rebirlvl}
                  miningRate={miningRate}
                  purchasedMinerIds={purchasedMinerIds}
                  buyMiner={buyMiner}
                  vault={vault}
                  collectVault={collectVault}
                />
              </div>
            </div>
          </Col>
        </Row>
      </main>
    </Container>
  );
};
