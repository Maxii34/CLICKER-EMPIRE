import { ClikerGamer } from "../ClikerGamer";
import { bonuInicio as BonuInicio } from "../bonus/bonuInicio";
import { upProgresivo as UpProgresivo } from "../upgrader/upProgresivo";
import { reinicio as Reinicio } from "../rebirs/reinicio";

export const Inicio = ({ money, setMoney, multiplier, setMultiplier, buyUpgrade, handleClick }) => {
    return (
        <>
            <ClikerGamer money={money} multiplier={multiplier} handleClick={handleClick} />
            <BonuInicio multiplier={multiplier} setMultiplier={setMultiplier} />
            <UpProgresivo money={money} multiplier={multiplier} />
            <Reinicio money={money} setMoney={setMoney} multiplier={multiplier} />
        </>
    );
};