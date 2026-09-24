// Formato único de dinero (FASE 1).
// Elegido: variante del topbar (la más informativa):
//   - < 10.000: número con locale es-AR (sin decimales, con floor previo)
//   - >= 1B / 1M / 1K: 1 decimal + sufijo B/M/K
// Antes había 9 copias con diferencias (K con 0 o 1 decimal,
// con o sin floor, BonusAutoClick sin rango B). Ahora una sola.
export const formatMoney = (num) => {
  if (!Number.isFinite(num)) return "0";
  const n = Math.floor(num);
  if (n < 10000) return n.toLocaleString("es-AR");
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + "B";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return `${n}`;
};
