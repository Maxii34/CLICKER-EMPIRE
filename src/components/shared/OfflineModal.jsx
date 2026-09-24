import { Modal, Button, ListGroup, Badge } from "react-bootstrap";
import { FaMoon } from "react-icons/fa";

// Modal "Mientras no estabas...": solo informa, las ganancias ya están
// aplicadas y persistidas de forma atómica (recargar no duplica ni pierde).
// "Recoger" simplemente cierra el modal.
const fmtInt = (v) =>
  (Number.isFinite(v) ? Math.floor(v) : 0).toLocaleString("es-AR");

export const fmtOfflineTime = (sec) => {
  if (!Number.isFinite(sec) || sec <= 0) return "0s";
  const s = Math.floor(sec);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const rest = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${rest}s`;
  return `${rest}s`;
};

export const OfflineModal = ({ report, onCollect }) => {
  if (!report) return null;
  const r = report;
  return (
    <Modal show onHide={onCollect} centered backdrop="static" keyboard={false}>
      <Modal.Header>
        <Modal.Title>
          <FaMoon style={{ marginRight: 8 }} />
          Mientras no estabas…
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Ausente <strong>{fmtOfflineTime(r.elapsedSec)}</strong>
          {r.capped && (
            <>
              {" "}
              <Badge bg="warning" text="dark">
                tope de 8h aplicado
              </Badge>
            </>
          )}{" "}
          (cuenta al 50% del ritmo).
        </p>
        <ListGroup variant="flush">
          <ListGroup.Item className="d-flex justify-content-between">
            <span>Pasivo (Fondo + Ciudad + Disciplina)</span>
            <strong>+${fmtInt(r.passive)}</strong>
          </ListGroup.Item>
          <ListGroup.Item className="d-flex justify-content-between">
            <span>
              Minería
              {r.collectorEverySec > 0
                ? ` (Recolector: ${r.collections} recolección${r.collections === 1 ? "" : "es"} → al dinero)`
                : " (a la bóveda)"}
            </span>
            <strong>+${fmtInt(r.mining)}</strong>
          </ListGroup.Item>
          <ListGroup.Item className="d-flex justify-content-between">
            <span>
              Saqueos
              {r.raids > 0 ? ` (${r.raids} × $${fmtInt(r.raidEach)})` : " (sin tropas o sin tiempo)"}
            </span>
            <strong>+${fmtInt(r.raidTotal)}</strong>
          </ListGroup.Item>
          <ListGroup.Item className="d-flex justify-content-between">
            <span>Total al dinero</span>
            <strong>+${fmtInt(r.totalToMoney)}</strong>
          </ListGroup.Item>
          {r.totalToVault > 0 && (
            <ListGroup.Item className="d-flex justify-content-between">
              <span>A la bóveda (recaudala cuando quieras)</span>
              <strong>+${fmtInt(r.totalToVault)}</strong>
            </ListGroup.Item>
          )}
        </ListGroup>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="success" onClick={onCollect}>
          Recoger
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
