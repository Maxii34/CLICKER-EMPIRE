# Análisis de balance — Clicker Empire (FASE 2)

_Derivado del simulador greedy. Ningún valor del juego fue modificado._

## 1. Ejército: desbloqueo vs primera compra real

| Tropa | Desbloqueo | 1ª compra (cps3) | RB compra | Costo 1ª compra | Req dinero de ese RB |
|---|---|---|---|---|---|
| Soldado | RB3 | 7m 1s | RB4 | $15.000 | $52.810 (RB4) |
| Arquero | RB4 | 9m 33s | RB4 | $42.000 | $52.810 (RB4) |
| Caballero | RB5 | 15m 29s | RB5 | $120.000 | $137.310 (RB5) |
| General | RB6 | 30m 50s | RB7 | $360.000 | $928.030 (RB7) |

## 2. Minería T0: amortización (costo / $/s) y compra real

| Rig | Costo | $/s | Amortización | 1ª compra (cps3) |
|---|---|---|---|---|
| Pico de Cobre | $800 | 1 | 800s (~13 min) | 2m 29s (RB1) |
| Pico de Hierro | $1.500 | 2 | 750s (~13 min) | 3m 6s (RB2) |
| Taladro Manual | $2.600 | 3 | 867s (~14 min) | 3m 13s (RB2) |
| Carreta Minera | $4.200 | 4 | 1050s (~18 min) | 4m 17s (RB3) |
| Forja Pequeña | $6.500 | 6 | 1083s (~18 min) | 4m 45s (RB3) |
| Mina a Cielo | $9.500 | 8 | 1188s (~20 min) | 5m 24s (RB3) |

## 3. Fracción del ingreso por sistema al llegar a cada RB (cps3, 200h)

| RB | Click% | Auto% | Pasivo% | Minería% | Saqueo% | Click: mult vs planos | Pasivo: fondo/ciudad/disc |
|---|---|---|---|---|---|---|---|
| 0 | 100.0 | 0.0 | 0.0 | 0.0 | 0.0 | x100 vs +0 planos | 0/0/0 (de 1/s) |
| 1 | 99.2 | 0.0 | 0.6 | 0.2 | 0.0 | x200 vs +4 planos | 0/4/0 (de 4/s) |
| 2 | 96.8 | 0.0 | 2.4 | 0.8 | 0.0 | x210 vs +6 planos | 5/13/0 (de 18/s) |
| 3 | 38.9 | 58.2 | 1.8 | 1.1 | 0.0 | x230 vs +13 planos | 15/22/4 (de 41/s) |
| 4 | 29.8 | 64.8 | 3.0 | 2.1 | 0.3 | x240 vs +27 planos | 20/83/8 (de 111/s) |
| 5 | 30.4 | 60.9 | 3.2 | 4.7 | 0.7 | x300 vs +36 planos | 25/119/12 (de 156/s) |
| 6 | 26.3 | 63.6 | 2.8 | 6.8 | 0.5 | x340 vs +43 planos | 30/153/16 (de 199/s) |
| 7 | 24.2 | 61.1 | 2.3 | 11.2 | 1.2 | x400 vs +50 planos | 40/162/20 (de 222/s) |
| 8 | 20.1 | 61.5 | 1.9 | 15.1 | 1.4 | x460 vs +57 planos | 45/198/24 (de 267/s) |
| 9 | 17.2 | 54.2 | 1.8 | 25.4 | 1.4 | x500 vs +66 planos | 50/266/32 (de 348/s) |
| 10 | 13.9 | 54.1 | 1.3 | 29.4 | 1.3 | x540 vs +73 planos | 55/275/36 (de 366/s) |
| 11 | 11.6 | 46.1 | 1.0 | 40.1 | 1.1 | x610 vs +80 planos | 60/309/40 (de 409/s) |
| 12 | 11.6 | 49.9 | 1.0 | 36.4 | 1.1 | x680 vs +85 planos | 65/343/40 (de 448/s) |
| 13 | 12.0 | 51.6 | 1.0 | 34.4 | 1.0 | x750 vs +89 planos | 65/345/44 (de 454/s) |
| 14 | 12.0 | 55.0 | 1.0 | 31.1 | 1.0 | x826 vs +96 planos | 70/377/48 (de 495/s) |
| 15 | 13.2 | 60.2 | 0.8 | 25.1 | 0.8 | x1156 vs +99 planos | 75/379/48 (de 502/s) |
| 16 | 13.6 | 66.3 | 0.6 | 18.9 | 0.6 | x1618 vs +103 planos | 75/388/52 (de 515/s) |
| 17 | 14.4 | 70.1 | 0.5 | 14.5 | 0.5 | x2266 vs +108 planos | 80/397/52 (de 529/s) |
| 18 | 14.4 | 74.4 | 0.4 | 10.5 | 0.4 | x3172 vs +115 planos | 85/399/56 (de 540/s) |

## 4. Mejoras nunca compradas por el greedy (candidatas a 'muertas')

- Exoesqueleto: cps1/cps3/cps6/larga = sí/sí/sí/sí
- Fondo: cps1/cps3/cps6/larga = sí/sí/sí/sí
- Overclock: cps1/cps3/cps6/larga = sí/sí/sí/sí
- Crítico: cps1/cps3/cps6/larga = sí/sí/sí/sí
- Recolector: cps1/cps3/cps6/larga = sí/sí/sí/sí
- Casa: cps1/cps3/cps6/larga = sí/sí/sí/sí
- Mercado: cps1/cps3/cps6/larga = sí/sí/sí/sí
- Muralla: cps1/cps3/cps6/larga = sí/sí/sí/sí
- Ayuntamiento: cps1/cps3/cps6/larga = sí/sí/sí/sí
- Soldado: cps1/cps3/cps6/larga = sí/sí/sí/sí
- Arquero: cps1/cps3/cps6/larga = sí/sí/sí/sí
- Caballero: cps1/cps3/cps6/larga = sí/sí/sí/sí
- General: cps1/cps3/cps6/larga = sí/sí/sí/sí
- Fuerza: cps1/cps3/cps6/larga = sí/sí/sí/sí
- Disciplina: cps1/cps3/cps6/larga = sí/sí/sí/sí
- Reflejos: cps1/cps3/cps6/larga = sí/sí/sí/sí
- Auto-Clicker nv 1: cps1/cps3/cps6/larga = sí/sí/sí/sí
- Auto-Clicker nv 2: cps1/cps3/cps6/larga = sí/sí/sí/sí
- Auto-Clicker nv 3: cps1/cps3/cps6/larga = sí/sí/sí/sí
- Auto-Clicker nv 4: cps1/cps3/cps6/larga = sí/sí/sí/sí
- Auto-Clicker nv 5: cps1/cps3/cps6/larga = sí/sí/sí/sí
- Rigs mineros comprados (alguna corrida): 36/36

## 5. Primeras 15 compras (cps3, tienda A)

1. t=0m 12s RB0 — Tienda +0.2 ($70) ($70)
2. t=0m 22s RB0 — Tienda +0.2 ($70) ($70)
3. t=0m 30s RB0 — Tienda +0.2 ($70) ($70)
4. t=0m 38s RB0 — Tienda +0.2 ($70) ($70)
5. t=0m 44s RB0 — Tienda +0.2 ($70) ($70)
6. t=0m 50s RB0 — Tienda +0.2 ($70) ($70)
7. t=0m 55s RB0 — Tienda +0.2 ($70) ($70)
8. t=1m 0s RB0 — Tienda +0.2 ($70) ($70)
9. t=1m 5s RB0 — Tienda +0.5 ($80) ($80)
10. t=1m 9s RB0 — Tienda +0.2 ($70) ($70)
11. t=1m 13s RB0 — Tienda +0.5 ($80) ($80)
12. t=1m 16s RB0 — Tienda +0.2 ($70) ($70)
13. t=1m 19s RB0 — Tienda +0.2 ($70) ($70)
14. t=1m 22s RB0 — Tienda +0.5 ($80) ($80)
15. t=1m 25s RB0 — Tienda +0.5 ($80) ($80)

