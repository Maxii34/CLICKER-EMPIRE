import { useState } from "react";
import {
  FaDownload, FaUpload, FaCopy, FaFileDownload, FaCheck, FaExclamationTriangle,
} from "react-icons/fa";
import { exportGame, importGame, persistSave } from "../../game/save.js";
import { formatMoney } from "../../utils/format.js";
import { ResetGame } from "./ResetGame";

// Panel de Ajustes de partida: exportar / importar / reiniciar.
// Importar nunca reemplaza la partida actual sin confirmación previa.
export const AjustesPartida = ({ snapshot, saveWarnings = [], resetSave }) => {
  const [exportText, setExportText] = useState("");
  const [exportMsg, setExportMsg] = useState("");
  const [importText, setImportText] = useState("");
  const [preview, setPreview] = useState(null);
  const [importError, setImportError] = useState("");

  const handleExport = () => {
    try {
      const { text } = exportGame(snapshot);
      setExportText(text);
      setExportMsg("");
    } catch {
      setExportMsg("No se pudo generar la exportación.");
    }
  };

  const handleCopy = async () => {
    if (!exportText) return;
    try {
      await navigator.clipboard.writeText(exportText);
      setExportMsg("Copiado al portapapeles.");
    } catch {
      setExportMsg("No se pudo copiar: seleccioná el texto a mano.");
    }
  };

  const handleDownload = () => {
    if (!exportText) return;
    const blob = new Blob([exportText], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `clicker-empire-rb${snapshot?.rebirlvl ?? 0}.txt`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  };

  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImportText(String(reader.result || ""));
    reader.readAsText(file);
  };

  const handlePreview = () => {
    setImportError("");
    setPreview(null);
    if (!importText.trim()) {
      setImportError("Pegá el texto exportado o subí un archivo.");
      return;
    }
    const res = importGame(importText);
    if (!res.ok) {
      setImportError(res.error);
      return;
    }
    setPreview(res);
  };

  const handleConfirm = () => {
    if (!preview?.ok) return;
    persistSave(preview.state);
    window.location.reload();
  };

  const lastSeen = snapshot?.lastSeenAt
    ? new Date(snapshot.lastSeenAt).toLocaleString("es-AR")
    : "—";

  return (
    <div className="ajustes-box">
      <div className="dev-menu-title">Ajustes de partida</div>
      <div className="dev-menu-note">
        Guardado v{snapshot?.version ?? "?"} • RB {snapshot?.rebirlvl ?? 0} • Último guardado: {lastSeen}
      </div>
      {saveWarnings.length > 0 && (
        <div className="dev-menu-note" title={saveWarnings.join("\n")}>
          <FaExclamationTriangle /> Última carga: {saveWarnings.length} advertencia(s) (ver consola).
        </div>
      )}

      <details className="ajustes-section">
        <summary><FaDownload /> Exportar partida</summary>
        <div className="ajustes-inner">
          <button className="btn-dev" onClick={handleExport}>Generar texto</button>
          {exportText && (
            <>
              <textarea readOnly rows={4} value={exportText} style={{ width: "100%" }} />
              <div className="dev-menu-row">
                <button className="btn-dev" onClick={handleCopy}><FaCopy /> Copiar</button>
                <button className="btn-dev" onClick={handleDownload}><FaFileDownload /> Descargar</button>
              </div>
            </>
          )}
          {exportMsg && <div className="dev-menu-note"><FaCheck /> {exportMsg}</div>}
        </div>
      </details>

      <details className="ajustes-section">
        <summary><FaUpload /> Importar partida</summary>
        <div className="ajustes-inner">
          <textarea
            rows={4}
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder="Pegá aquí el texto exportado…"
            style={{ width: "100%" }}
          />
          <div className="dev-menu-row">
            <label className="btn-dev" style={{ cursor: "pointer" }}>
              Subir archivo
              <input
                type="file"
                accept=".txt,.json,text/plain"
                hidden
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </label>
            <button className="btn-dev" onClick={handlePreview}>Validar</button>
          </div>
          {importError && <p className="text-danger">{importError}</p>}
          {preview?.ok && (
            <div>
              <p className="dev-menu-note">
                RB {preview.summary.rebirlvl} • ${formatMoney(preview.summary.money)} • x{preview.summary.multiplier} •
                {" "}{preview.summary.rigs} rigs • exportado: {preview.summary.exportedAt ? new Date(preview.summary.exportedAt).toLocaleString("es-AR") : "—"}
              </p>
              {preview.warnings.length > 0 && (
                <p className="dev-menu-note">
                  <FaExclamationTriangle /> {preview.warnings.length} advertencia(s) de migración.
                </p>
              )}
              <button className="reset-yes" onClick={handleConfirm}>
                <FaCheck /> Reemplazar mi partida actual
              </button>
            </div>
          )}
        </div>
      </details>

      <details className="ajustes-section">
        <summary><FaExclamationTriangle /> Zona de peligro</summary>
        <div className="ajustes-inner">
          {resetSave && <ResetGame onReset={resetSave} />}
        </div>
      </details>
    </div>
  );
};
