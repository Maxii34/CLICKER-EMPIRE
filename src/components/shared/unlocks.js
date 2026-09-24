// Mapa único de desbloqueos por nivel de Renacimiento.
// side: dónde vive el componente (izq / centro / der).
export const UNLOCKS = [
  { rb: 0, icon: "👆", title: "Click + Tienda x$", side: "centro/der", desc: "Click manual y tienda de multiplicador lvl 0." },
  { rb: 0, icon: "💪", title: "Imperio: Exoesqueleto", side: "izq", desc: "+$2 por click, sin requisito." },
  { rb: 0, icon: "⛏️", title: "Minería tier 0", side: "der", desc: "6 rigs de $/seg desde el inicio." },
  { rb: 0, icon: "🎁", title: "Bonus bienvenida x2", side: "centro", desc: "Duplica tu multiplicador base (x2 permanente, respeta el tope)." },
  { rb: 0, icon: "✨", title: "Evento dorado", side: "centro", desc: "Botón dorado cada 1-3 min: fortuna (usa tu click actual, mayor en frenesí) o frenesí x3." },
  { rb: 0, icon: "🏠", title: "Ciudad: Casa", side: "izq", desc: "+$2/seg de renta por nivel, sin requisito." },
  { rb: 1, icon: "🏦", title: "Imperio: Fondo", side: "izq", desc: "+$5/seg pasivo por nivel." },
  { rb: 1, icon: "🏬", title: "Ciudad: Mercado", side: "izq", desc: "+$7/seg de renta por nivel." },
  { rb: 1, icon: "🎯", title: "Imperio: Golpe Crítico", side: "izq", desc: "+3% chance de golpe x5 por nivel (MAX 10)." },
  { rb: 1, icon: "🏪", title: "Tienda lvl 1", side: "der", desc: "Nuevos aumentos hasta x100." },
  { rb: 2, icon: "🧱", title: "Ciudad: Muralla", side: "izq", desc: "+$2 por click por nivel (MAX 15)." },
  { rb: 2, icon: "💪", title: "Entrenamiento: Fuerza y Disciplina", side: "izq", desc: "+$3/click y +$4/seg por nivel (MAX 30)." },
  { rb: 2, icon: "⚙️", title: "Imperio: Overclock", side: "izq", desc: "+x1 potencia del Auto-Clicker." },
  { rb: 2, icon: "🤖", title: "Auto-Clicker lvl 1", side: "der", desc: "Golpes automáticos cada 900ms que suman a tu click." },
  { rb: 2, icon: "⛏️", title: "Minería tier 1", side: "der", desc: "6 rigs nuevos de $/seg." },
  { rb: 2, icon: "🚚", title: "Imperio: Recolector", side: "izq", desc: "+10% a lo minado por nivel y vacía la bóveda solo cada N seg (MAX 5)." },
  { rb: 3, icon: "🏛️", title: "Ciudad: Ayuntamiento", side: "izq", desc: "+$25/seg de renta por nivel (MAX 10)." },
  { rb: 3, icon: "⚔️", title: "Ejército: Soldado", side: "izq", desc: "Saqueos de botín cada 45s. +12 poder/nivel." },
  { rb: 3, icon: "⚡", title: "Entrenamiento: Reflejos", side: "izq", desc: "+$12 por golpe auto por nivel (MAX 20)." },
  { rb: 4, icon: "🤖", title: "Auto-Clicker lvl 2", side: "der", desc: "Velocidad 800ms." },
  { rb: 4, icon: "🏹", title: "Ejército: Arquero", side: "izq", desc: "+35 poder de saqueo por nivel." },
  { rb: 4, icon: "⛏️", title: "Minería tier 2", side: "der", desc: "Perforadoras de alto rendimiento." },
  { rb: 5, icon: "🐎", title: "Ejército: Caballero", side: "izq", desc: "+100 poder de saqueo por nivel." },
  { rb: 6, icon: "🤖", title: "Auto-Clicker lvl 3", side: "der", desc: "Velocidad 700ms." },
  { rb: 6, icon: "👑", title: "Ejército: General", side: "izq", desc: "+300 poder de saqueo por nivel (MAX 5)." },
  { rb: 6, icon: "⛏️", title: "Minería tier 3", side: "der", desc: "Taladros láser y drones." },
  { rb: 8, icon: "🤖", title: "Auto-Clicker lvl 4", side: "der", desc: "Velocidad 600ms." },
  { rb: 8, icon: "⛏️", title: "Minería tier 4", side: "der", desc: "Extractores cuánticos." },
  { rb: 10, icon: "🤖", title: "Auto-Clicker lvl 5 MAX", side: "der", desc: "Velocidad máxima 500ms." },
  { rb: 10, icon: "⛏️", title: "Minería tier 5", side: "der", desc: "Singularidades y refinería final." },
];

// Fuente única de recompensas extra por renacimiento (FASE 1).
// La usa ReiniciosLvl.jsx para "Al renacer obtienes". icon = clave que el
// componente mapea a react-icons (los datos no traen componentes).
export const REBIRTH_EXTRA = {
  2: [
    { icon: "robot", label: "Auto-Clicker lvl 1" },
    { icon: "hardhat", label: "Minería tier 1" },
    { icon: "cogs", label: "Overclock del Imperio" },
    { icon: "dumbbell", label: "Entrenamiento: Fuerza y Disciplina" },
  ],
  3: [
    { icon: "shield", label: "Ejército: Soldado + saqueos" },
    { icon: "bolt", label: "Entrenamiento: Reflejos" },
  ],
  4: [
    { icon: "robot", label: "Auto-Clicker lvl 2" },
    { icon: "hardhat", label: "Minería tier 2" },
    { icon: "shield", label: "Ejército: Arquero" },
  ],
  5: [{ icon: "shield", label: "Ejército: Caballero" }],
  6: [
    { icon: "robot", label: "Auto-Clicker lvl 3" },
    { icon: "hardhat", label: "Minería tier 3" },
    { icon: "shield", label: "Ejército: General" },
  ],
  8: [
    { icon: "robot", label: "Auto-Clicker lvl 4" },
    { icon: "hardhat", label: "Minería tier 4" },
  ],
  10: [
    { icon: "robot", label: "Auto-Clicker lvl 5 MAX" },
    { icon: "hardhat", label: "Minería tier 5" },
  ],
};
