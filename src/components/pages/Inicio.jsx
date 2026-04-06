import { bonuInicio } from "../bonus/bonuInicio";
import { ClikerGamer } from "../ClikerGamer";
import { reinicio } from "../rebirs/reinicio";
import { upProgresivo } from "../upgrader/upProgresivo";


export const Inicio = ({ money, setMoney, multiplier, setMultiplier, buyUpgrade, handleClick }) => {
    return (
        <>
            <ClikerGamer money={money} multiplier={multiplier} handleClick={handleClick} />
            <bonuInicio multiplier={multiplier} setMultiplier={setMultiplier} />
            <upProgresivo money={money} multiplier={multiplier} />
            <reinicio money={money} setMoney={setMoney} multiplier={multiplier} />
        </>
    );
};