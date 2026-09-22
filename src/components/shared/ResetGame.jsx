import { useEffect, useRef, useState } from "react";
import { FaTrashAlt, FaExclamationTriangle, FaTimes } from "react-icons/fa";
import "./ResetGame.css";

// Botón con DOBLE confirmación: 1° clic arma el borrado,
// 2° clic en "SÍ, BORRAR" lo ejecuta. Se desarma solo a los 8s.
export const ResetGame = ({ onReset }) => {
  const [armed, setArmed] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const arm = () => {
    setArmed(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setArmed(false), 8000);
  };

  const cancel = () => {
    clearTimeout(timer.current);
    setArmed(false);
  };

  const confirm = () => {
    clearTimeout(timer.current);
    if (onReset) onReset();
  };

  if (!armed) {
    return (
      <button
        className="btn-dev text-danger"
        onClick={arm}
        title="Borra la partida guardada y empieza de cero"
      >
        <FaTrashAlt /> RESET
      </button>
    );
  }

  return (
    <div className="reset-confirm">
      <p className="reset-warn">
        <FaExclamationTriangle /> Borra TODO y empiezas de 0. Sin vuelta atrás.
      </p>
      <div className="reset-row">
        <button className="reset-yes" onClick={confirm}>
          SÍ, BORRAR TODO
        </button>
        <button className="reset-no" onClick={cancel} title="Cancelar (se desarma solo en 8s)">
          <FaTimes /> Cancelar
        </button>
      </div>
    </div>
  );
};
