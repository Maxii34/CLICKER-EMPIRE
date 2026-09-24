import { useState } from "react";
import { FaExclamationTriangle, FaUpload, FaTrashAlt, FaRedo } from "react-icons/fa";
import { deserialize, persistSave, clearSave, readBackup } from "../../game/save.js";
import "./ResetGame.css";

const REASONS = {
  "json-invalido": "El guardado está corrupto (no es JSON válido).",
  "version-futura": "El guardado es de una versión más nueva del juego.",
  "version-invalida": "El guardado tiene una versión inválida.",
  "sin-migracion": "El guardado no se puede migrar a la versión actual.",
  formato: "El guardado no tiene el formato esperado.",
};

// Pantalla bloqueante: no se borra nada sin avisar.
// El texto original ya quedó respaldado en otra clave (backupKey).
export const SaveRecovery = ({ reason, found, backupKey }) => {
  const [error, setError] = useState("");
  const [restored, setRestored] = useState(false);

  const handleRestore = () => {
    setError("");
    const text = readBackup(backupKey);
    if (!text) {
      setError("No se pudo leer el respaldo.");
      return;
    }
    const res = deserialize(text);
    if (!res.ok) {
      setError(`El respaldo tampoco carga (${REASONS[res.reason] || res.reason}).`);
      return;
    }
    setRestored(true);
    persistSave(res.state);
    window.location.reload();
  };

  const handleFresh = () => {
    clearSave();
    window.location.reload();
  };

  const handleRetry = () => window.location.reload();

  return (
    <div className="reset-confirm" style={{ maxWidth: 520, margin: "8vh auto", padding: 24 }}>
      <p className="reset-warn">
        <FaExclamationTriangle /> No se pudo cargar tu partida y no se borró nada.
      </p>
      <p>{REASONS[reason] || reason}{found ? ` (versión ${found}).` : ""}</p>
      <p className="dev-menu-note">
        Respaldo guardado en: <code>{backupKey || "…"}</code>
      </p>
      {error && <p className="text-danger">{error}</p>}
      {restored && <p>Cargando respaldo…</p>}
      <div className="reset-row" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button className="reset-yes" onClick={handleRestore} title="Valida el respaldo y lo carga si está sano">
          <FaUpload /> Importar respaldo
        </button>
        <button className="btn-dev" onClick={handleRetry} title="Vuelve a intentar cargar">
          <FaRedo /> Reintentar
        </button>
        <button className="btn-dev text-danger" onClick={handleFresh} title="Borra todo y empieza de cero">
          <FaTrashAlt /> Empezar de nuevo
        </button>
      </div>
    </div>
  );
};
