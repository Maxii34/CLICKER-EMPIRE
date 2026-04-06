import { bonuInicio } from "../bonus/bonuInicio";
import { ClikerGamer } from "../ClikerGamer";
import { reinicio } from "../rebirs/reinicio";
import { upProgresivo } from "../upgrader/upProgresivo";


export const Inicio = () => {
    return (
        <>
            <ClikerGamer />
            <bonuInicio />
            <upProgresivo />
            <reinicio />
        </>
    );
};