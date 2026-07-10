# Diseño de Juegos — Tótem Interactivo USM

## Filosofía de diseño

Los juegos del tótem deben ser:
- **Inmediatos**: sin tutoriales largos, se entiende en 5 segundos
- **Cortos**: **30–60 segundos** por partida (duración configurable desde el panel admin, default 60s)
- **Táctiles**: optimizados para dedos en pantalla grande
- **Branded**: colores y elementos visuales de USM
- **Inclusivos**: sin requerir habilidades específicas previas
- **Con salida clara**: botón **"Terminar juego"** siempre visible → vuelve al menú

---

## Juego 1: 2048 USM ✅ Implementado

### Concepto
Variante del clásico 2048, adaptada con la identidad USM. En vez de potencias de 2, usa **potencias de 3** (sistema propio que hace que el número objetivo "2048" pase a ser "2187").

### Mecánicas

| Aspecto | Valor |
|---------|-------|
| Grid | 4×4 |
| Valores de tiles | 3, 9, 27, 81, 243, 729, 2187, 6561... |
| Objetivo | Llegar a **2187** (3⁷) |
| Tiempo límite | **120 segundos** |
| Tile inicial | 2 tiles: 90% chance de 3, 10% de 9 |
| Tile nuevo por movimiento | Mismo 90%/10% |
| Puntaje por merge | Valor del tile resultante |

### Controles
- **Touch**: deslizar en 4 direcciones (threshold 25px)
- **Mouse**: compatible (onMouseDown/onMouseUp no aplican al tablero, solo al menú)
- **Teclado**: no implementado (kiosk no tiene teclado)

### Estados
| Estado | Trigger | UI |
|--------|---------|-----|
| `playing` | Inicio | Tablero activo, timer corriendo |
| `won` | tile.val >= 2187 | Overlay verde oscuro con 🏆 y "¡2187!" dorado |
| `lost` | canMove() = false | Overlay rojo oscuro con 😵 y "Game Over" |
| `timeup` | timeLeft = 0 | Overlay azul oscuro con ⏱️ y "¡Tiempo!" |

### Balanceo
- 120 segundos es suficiente para llegar a 2187 con buenas jugadas, pero desafiante
- El tema azul oscuro con gradientes es consistente con la identidad USM (azul marino)
- El tile 2187 brilla en dorado (#ffd700) — contraste máximo, momento de celebración

### Bugs conocidos (resueltos en v0.1.1)
- ~~Import case-sensitivity en Linux~~ ✅ Corregido
- ~~ScorePop con `transform` duplicado~~ ✅ Corregido
- ~~Subtitle del menú decía "2048" en vez de "2187"~~ ✅ Corregido
- ~~Sin `touchAction: none` en tablero~~ ✅ Corregido

---

## Juego 2: Memorice ⏳ Pendiente (Fase 5)

### Concepto
Juego de memoria clásico: encontrar las parejas iguales dando vuelta cartas. Se prioriza **diseño
y animaciones** (flip, match, mismatch). Primero un **mockup con texto**, luego con imágenes/assets USM.

### Mecánicas

| Aspecto | Valor |
|---------|-------|
| Formato | Grilla de cartas, encontrar pares |
| Interacción | Tocar dos cartas; si coinciden, quedan reveladas |
| Feedback | Animación de flip, match (quedan) / mismatch (se ocultan) |
| Tiempo | Duración de `config` (30–60s) |
| Puntaje | Pares encontrados / tiempo restante |

### ⚠️ Pendiente confirmar (decisión de diseño)
El cliente mencionó **10×10**, pero 100 celdas / 50 pares es inviable para 30–60s y en portrait las
celdas quedan diminutas. **Propuesta:** default **4×4 / 6×6**, con 10×10 como modo difícil opcional.
Confirmar con el cliente antes de implementar.

---

## Juego 3: Prime Ninja ⏳ Pendiente (Fase 6)

### Concepto
"Fruit Ninja" de números primos. Se lanzan números desde abajo hacia arriba con trayectorias
distintas; el estudiante corta (swipe) los que son primos.

### Mecánicas

| Aspecto | Valor |
|---------|-------|
| Formato | Números lanzados de abajo hacia arriba (proyectil) |
| Interacción | Swipe para cortar (`onTouchStart/Move`) |
| **Cortar primo** | **+ puntos** |
| **Cortar no-primo** | **penalización** |
| **Primo que cae sin cortarse** | **penalización** |
| Tiempo | Duración de `config` (30–60s) |

### Implementación
- Spawner de números con velocidad/ángulo variables; física de proyectil simple.
- `isPrime(n)` con self-check (`assert` en casos borde 0, 1, 2, primos y compuestos).

---

## Criterios para agregar un nuevo juego

Para que un juego sea apto para el tótem:

1. **Tiempo**: máximo 3 minutos por partida
2. **Instrucciones**: comprensibles en menos de 10 segundos
3. **Táctil**: funciona con dedos en pantalla de 42"
4. **Sin tutorial largo**: el juego se explica solo o con 1-2 líneas
5. **Fin claro**: siempre hay un estado de victoria, derrota o tiempo
6. **Volver al menú**: siempre hay una forma de salir
7. **Branding**: colores y elementos USM integrados

## Estructura de código para nuevos juegos

```jsx
// src/games/miJuego/MiJuego.jsx
import EndGameButton from '../../components/EndGameButton';
import { GAME_DURATION } from '../../config';

function MiJuego({ onGameEnd, onMenu }) {
  // ... lógica del juego; timer basado en GAME_DURATION

  return (
    <div style={{ width: '100%', height: '100vh', background: '#0a0f1e' }}>
      <EndGameButton onClick={onMenu} />   {/* "Terminar juego" → menú */}
      {/* UI del juego; al terminar: onGameEnd(score) → leaderboard */}
    </div>
  );
}

export default MiJuego;
```

Y en `App.jsx`:
```jsx
{screen === 'miJuego' && <MiJuego onGameEnd={(s) => handleGameEnd('miJuego', s)} onMenu={handleMenu} />}
```
