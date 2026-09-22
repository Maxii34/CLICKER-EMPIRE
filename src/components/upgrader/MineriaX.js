// Tienda de Minería: rigs de ingreso PASIVO ($/seg).
// value = $/seg que suma al comprar. Compra única (id), permanente (sobrevive al rebirth).
// reqRebirth = RB mínimo para desbloquear el rig.
const MineriaX = [
  // TIER 0 — Disponible desde el inicio (RB 0). Para que la tienda nunca esté vacía.
  { id: "m0_1", level: 0, name: "Pico de Cobre", cost: 800, value: 1, reqRebirth: 0 },
  { id: "m0_2", level: 0, name: "Pico de Hierro", cost: 1500, value: 2, reqRebirth: 0 },
  { id: "m0_3", level: 0, name: "Taladro Manual", cost: 2600, value: 3, reqRebirth: 0 },
  { id: "m0_4", level: 0, name: "Carreta Minera", cost: 4200, value: 4, reqRebirth: 0 },
  { id: "m0_5", level: 0, name: "Forja Pequeña", cost: 6500, value: 6, reqRebirth: 0 },
  { id: "m0_6", level: 0, name: "Mina a Cielo", cost: 9500, value: 8, reqRebirth: 0 },

  // TIER 1 — RB 2 (junto al Auto-Clicker lvl 1 y Overclock)
  { id: "m1_1", level: 1, name: "Excavadora I", cost: 20000, value: 10, reqRebirth: 2 },
  { id: "m1_2", level: 1, name: "Excavadora II", cost: 28000, value: 13, reqRebirth: 2 },
  { id: "m1_3", level: 1, name: "Túnel Profundo", cost: 38000, value: 16, reqRebirth: 2 },
  { id: "m1_4", level: 1, name: "Dinamita", cost: 52000, value: 20, reqRebirth: 2 },
  { id: "m1_5", level: 1, name: "Refinería I", cost: 70000, value: 25, reqRebirth: 2 },
  { id: "m1_6", level: 1, name: "Veta de Oro", cost: 95000, value: 32, reqRebirth: 2 },

  // TIER 2 — RB 4
  { id: "m2_1", level: 2, name: "Perforadora", cost: 130000, value: 38, reqRebirth: 4 },
  { id: "m2_2", level: 2, name: "Galería II", cost: 170000, value: 45, reqRebirth: 4 },
  { id: "m2_3", level: 2, name: "Cinta Minera", cost: 220000, value: 53, reqRebirth: 4 },
  { id: "m2_4", level: 2, name: "Refinería II", cost: 280000, value: 62, reqRebirth: 4 },
  { id: "m2_5", level: 2, name: "Veta Platino", cost: 360000, value: 73, reqRebirth: 4 },
  { id: "m2_6", level: 2, name: "Pozo Diamante", cost: 460000, value: 86, reqRebirth: 4 },

  // TIER 3 — RB 6
  { id: "m3_1", level: 3, name: "Taladro Láser", cost: 600000, value: 100, reqRebirth: 6 },
  { id: "m3_2", level: 3, name: "Dron Minero", cost: 780000, value: 118, reqRebirth: 6 },
  { id: "m3_3", level: 3, name: "Núcleo Térmico", cost: 1000000, value: 138, reqRebirth: 6 },
  { id: "m3_4", level: 3, name: "Refinería III", cost: 1300000, value: 162, reqRebirth: 6 },
  { id: "m3_5", level: 3, name: "Veta Titanio", cost: 1700000, value: 190, reqRebirth: 6 },
  { id: "m3_6", level: 3, name: "Mina Orbital", cost: 2200000, value: 225, reqRebirth: 6 },

  // TIER 4 — RB 8
  { id: "m4_1", level: 4, name: "Extractor Cuántico", cost: 3000000, value: 260, reqRebirth: 8 },
  { id: "m4_2", level: 4, name: "Enjambre Drones", cost: 4000000, value: 305, reqRebirth: 8 },
  { id: "m4_3", level: 4, name: "Reactor Minero", cost: 5300000, value: 360, reqRebirth: 8 },
  { id: "m4_4", level: 4, name: "Forja Estelar", cost: 7000000, value: 425, reqRebirth: 8 },
  { id: "m4_5", level: 4, name: "Veta Neutrón", cost: 9200000, value: 500, reqRebirth: 8 },
  { id: "m4_6", level: 4, name: "Planeta Mina", cost: 12000000, value: 590, reqRebirth: 8 },

  // TIER 5 — RB 10 (endgame temprano)
  { id: "m5_1", level: 5, name: "Singularidad I", cost: 16000000, value: 700, reqRebirth: 10 },
  { id: "m5_2", level: 5, name: "Singularidad II", cost: 21000000, value: 830, reqRebirth: 10 },
  { id: "m5_3", level: 5, name: "Cosechadora Solar", cost: 28000000, value: 980, reqRebirth: 10 },
  { id: "m5_4", level: 5, name: "Refinería Final", cost: 37000000, value: 1160, reqRebirth: 10 },
  { id: "m5_5", level: 5, name: "Veta Antimateria", cost: 48000000, value: 1370, reqRebirth: 10 },
  { id: "m5_6", level: 5, name: "Imperio Galáctico", cost: 62000000, value: 1620, reqRebirth: 10 },
];

export default MineriaX;
