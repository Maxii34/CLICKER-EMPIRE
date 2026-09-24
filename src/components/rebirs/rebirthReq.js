// multiplier = debe coincidir siempre con el "max" del ultimo upgrade de ese nivel en upgrades.js
// P1a (FASE 2-bis): dinero RB12-13 con x1.8, RB14-19 con x1.6 por RB
// (antes x2.6). RB0 a RB11 intactos.
const rebirthReq = [
  { level: 0, money: 590, multiplier: 50, bonus: 5 },
  { level: 1, money: 1490, multiplier: 100, bonus: 7 },
  { level: 2, money: 3930, multiplier: 105, bonus: 10 },
  { level: 3, money: 10220, multiplier: 115, bonus: 14 },
  { level: 4, money: 52810, multiplier: 120, bonus: 20 },
  { level: 5, money: 137310, multiplier: 150, bonus: 28 },
  { level: 6, money: 356940, multiplier: 170, bonus: 39 },
  { level: 7, money: 928030, multiplier: 200, bonus: 55 },
  { level: 8, money: 2412800, multiplier: 230, bonus: 77 },
  { level: 9, money: 9395110, multiplier: 250, bonus: 108 },
  { level: 10, money: 24427300, multiplier: 270, bonus: 151 },
  { level: 11, money: 63510950, multiplier: 305, bonus: 211 },
  { level: 12, money: 114319710, multiplier: 340, bonus: 295 },
  { level: 13, money: 205775478, multiplier: 375, bonus: 413 },
  { level: 14, money: 329240765, multiplier: 410, bonus: 578 },
  { level: 15, money: 526785224, multiplier: 445, bonus: 809 },
  { level: 16, money: 842856358, multiplier: 480, bonus: 1133 },
  { level: 17, money: 1348570173, multiplier: 515, bonus: 1586 },
  { level: 18, money: 2157712277, multiplier: 550, bonus: 2220 },
  { level: 19, money: 3452339643, multiplier: 585, bonus: 3108 },
];

export default rebirthReq;