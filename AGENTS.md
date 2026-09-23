# AGENTS.md — Clicker Empire

Juego incremental (clicker) hecho con React + Vite + react-bootstrap.
Toda la interfaz está en español y debe seguir así.

## Reglas para trabajar en este proyecto

1. Leé el código real antes de modificar algo. Si esta guía no coincide con el código, avisá y no asumas.
2. Cambios chicos y reversibles. Editá en vez de reescribir archivos enteros.
3. Después de cada cambio corré `npm run build` y confirmá que compila.
4. No rompas partidas guardadas. Si cambia la estructura del save, agregá migración.
5. Cualquier número de balance nuevo (costos, poder, tiempos) se propone con 2 o 3 opciones y se espera confirmación. No inventes números sin probarlos con el simulador.
6. No metas lógica de juego nueva en componentes de UI. Las fórmulas van en archivos puros.
7. Cada rebirth debería abrir algo nuevo. Si agregás contenido, actualizá `unlocks.js`, `GuiaDesbloqueos.jsx` y `achievements.js`.
8. Mantené el estilo y los nombres en español de la UI.

## Estructura

- Estado central: `src/App.jsx`
- Layout de 3 columnas: `src/components/pages/Inicio.jsx`
- Autoguardado: `localStorage`, clave `clicker-empire-save-v1`

| Zona | Componente | Archivo |
|---|---|---|
| Topbar | MenuNav (HUD + progreso de rebirth) | `shared/MenuNav.jsx` |
| Izquierda (lg=3) | PanelIzquierdo con 4 tabs + LogrosPanel | `panel/PanelIzquierdo.jsx` |
| Centro (lg=5) | BonusBienvenida + ClikerGamer + GuiaDesbloqueos | `bonus/`, `ClikerGamer.jsx`, `shared/GuiaDesbloqueos.jsx` |
| Derecha (lg=4) | MejorasProges + ReiniciosLvl + BonusAutoClick + MinerProges | `upgrader/`, `rebirs/`, `bonus/` |

Datos importantes: `upgrades.js` (tienda), `rebirthReq.js` (20 rebirths), `unlocks.js` (33 filas de desbloqueos), `MineriaX.js` (36 rigs), `achievements.js` (26 logros).

## Fórmulas madre (App.jsx, ~líneas 355-364)

```
moneyPerClick = (multiplier + clickBonus + cityClickBonus + trainClickBonus) * (frenzy ? 3 : 1)
moneyPerAuto  = moneyPerClick * autoPower + trainAutoBonus
pasivoDirecto = passiveRate + cityRate + trainRate      // +$/s directo al dinero
miningRate    -> vault                                  // +$/s a la bóveda, no directo
raidLoot      = armyPower * 8                           // cada 45s (RAID_EVERY)
crítico       : chance = critLvl * 3%, golpe = moneyPerClick * 5
```

Todo lo que se compra suma a una de esas variables. Por eso todo escala entre sí: cualquier cambio en una fórmula afecta a varios sistemas.

## Qué persiste y qué se pierde al renacer

- Persiste: `imperioLvl`, `cityLvl`, `armyLvl`, `trainLvl`, `miningRate` + ids de rigs + vault, `autoLevel`, `bonusActivo`.
- Se pierde: `money` y `multiplier`.
- Al renacer: `rebirlvl++`, `money = 0`, `multiplier = bonus de inicio`, `unlockedLvl = próximo tope (o Infinity)`.

## Sistemas

### Tienda de aumentos (derecha)
- Solo muestra el nivel actual (`upgrades.filter(level == rebirlvl)`). 20 niveles (0-19).
- `buyUpgrade(cost, increment, max)`: tope = `min(max, unlockedLvl)`. Redondea al tope para no trabarse.
- Es la única mejora que se resetea con el rebirth.

### Rebirth
- Requisito doble: dinero y multiplicador (ver `rebirthReq.js`).
- Bonus de inicio por RB: x5, x7, x10, x14, x20, x28, x39, x55, x77, x108, x151... hasta x3108 en RB19.
- Barra global en topbar: `(pMoney + pMult) / 2`.

### Panel izquierdo (persistente)
- **Imperio (5 mejoras)**: Exoesqueleto (+2 click), Fondo Inversión (+5/s), Overclock (autoPower +1, base 4), Golpe Crítico (3% por nivel, máx 10), Recolector (vacía la bóveda cada `max(10, 35 - lvl*5)` s, máx 5).
- **Ciudad (4 edificios)**: Casa (+2/s), Mercado (+7/s), Muralla (+2 click), Ayuntamiento (+25/s).
- **Ejército (4 tropas)**: Soldado +12, Arquero +35, Caballero +100, General +300 (máx 5). Sistema independiente: saqueo cada 45s, manual o automático.
- **Entrenamiento (3 stats)**: Fuerza (+3 click), Disciplina (+4/s), Reflejos (+12 por auto, se suma después de multiplicar por autoPower).
- **Logros**: 26, con toast de 4s al desbloquear.

### Centro
- **BonusBienvenida**: un solo uso, duplica `multiplier`, permanente.
- **Evento Dorado**: primero a los 25s, luego cada 60-150s, visible 12s. Al recogerlo: 50% Frenesí (x3 por 20s, también afecta al auto) o 50% Fortuna (`max(moneyPerClick*30, money*15%)`).
- **Combo**: crítico x5 bajo frenesí x3 = x15 por click.

### Derecha
- **BonusAutoClick (5 niveles)**: solo acelera la frecuencia (900ms a 500ms). El daño lo dan Imperio/Entrenamiento. Cuando está encendido pausa el click manual.
- **Minería (36 rigs, 6 tiers)**: compra única y permanente. El flujo es `miningRate -> vault (cada 1s) -> RECAUDAR -> money`. El Recolector del Imperio lo automatiza.

## Conexiones clave

1. `multiplier` es la raíz: entra en click, auto, Frenesí, Crítico y Fortuna.
2. Imperio + Ciudad + Entrenamiento aportan sumandos planos al click. Exoesqueleto, Muralla y Fuerza son intercambiables en la fórmula (difieren en costo, curva y máximo).
3. El auto depende del click, y Overclock lo multiplica.
4. El pasivo viene de tres fuentes directas (Fondo, Ciudad, Disciplina). La minería va aparte, a la bóveda.
5. El ejército no usa `multiplier`. Es la vía de bulto tardío desde RB3.
6. El rebirth es la compuerta: cada RB abre filas de `unlocks.js`. El salto RB1 a RB2 cambia mucho el ritmo (Overclock, Auto1, Minería T1, Fuerza, Recolector).

## Problemas conocidos (a mejorar)

- El rebirth resetea muy poco, así que se siente poco como prestigio. Falta una moneda de prestigio propia.
- RB7 y RB9 no desbloquean nada, y RB11 a RB19 son solo escalado numérico.
- Exoesqueleto, Muralla y Fuerza son casi idénticos en función.
- El ejército está aislado del resto de sistemas.
- Las fórmulas viven en `App.jsx` y no hay simulador para validar el balance.
- Faltan: progreso offline, exportar/importar partida, versión y migración del save.

## Checklist antes de dar una tarea por terminada

- [ ] `npm run build` pasa sin errores.
- [ ] Una partida vieja (save existente) sigue cargando.
- [ ] No aparecen `NaN`, `Infinity` ni negativos en el estado.
- [ ] La UI en español sigue consistente.
- [ ] Si tocaste desbloqueos o contenido, `unlocks.js`, la guía y los logros están actualizados.
