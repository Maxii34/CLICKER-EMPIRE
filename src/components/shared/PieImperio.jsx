import { FaLandmark, FaSave, FaMousePointer, FaRedo } from "react-icons/fa";
import { GAME_VERSION } from "../../game/constants.js";
import "./PieImperio.css";

export const PieImperio = ({ rebirlvl = 0, totalClicks = 0 }) => {
  return (
    <footer className="pie-suelo">
      <div className="pie-contenido">
        <span className="pie-marca" title="Clicker Empire">
          <FaLandmark /> Clicker Empire <em>v{GAME_VERSION}</em>
        </span>
        <span className="pie-dato" title="Nivel de renacimiento actual">
          <FaRedo /> RB {rebirlvl}
        </span>
        <span className="pie-dato" title="Clics totales de la partida">
          <FaMousePointer /> {Number(totalClicks || 0).toLocaleString("es")} clics
        </span>
        <span className="pie-dato pie-guardado" title="La partida se guarda sola">
          <FaSave /> Autoguardado activo
        </span>
      </div>
    </footer>
  );
};
