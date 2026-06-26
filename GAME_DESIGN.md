# Diseño de Juegos — Tótem Interactivo USM

## Filosofía de diseño

Los juegos del tótem deben ser:
- **Inmediatos**: sin tutoriales largos, se entiende en 5 segundos
- **Cortos**: máximo 2-3 minutos por partida
- **Táctiles**: optimizados para dedos en pantalla grande
- **Branded**: colores y elementos visuales de USM
- **Inclusivos**: sin requerir habilidades específicas previas

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

## Juego 2: Buscar a Wally ⏳ Pendiente (Fase 3)

### Concepto
Variante del clásico "¿Dónde está Wally?". El estudiante debe encontrar un personaje (Wally o mascota USM) escondido en una imagen llena de elementos visuales.

### Mecánicas propuestas (TBD con equipo USM)

| Aspecto | Propuesta |
|---------|-----------|
| Formato | Imagen de alta resolución con personaje escondido |
| Interacción | Tocar en la pantalla donde creen que está el personaje |
| Feedback | Zoom a la zona tocada + indicador sí/no |
| Tiempo | 60-90 segundos por ronda |
| Dificultad | 1-3 niveles (fácil → difícil) |
| Puntaje | Tiempo restante cuando encuentra al personaje |

### Pendiente confirmar
- [ ] ¿Usar Wally real (licencia) o personaje propio USM?
- [ ] ¿Cuántas imágenes diferentes?
- [ ] ¿Assets de imágenes a cargo de quién?

---

## Juego 3: TBD ⏳ Pendiente (Fase 4)

### Opciones propuestas (del proyecto ANTIGUO)

| Opción | Descripción | Dificultad de impl. |
|--------|-------------|-------------------|
| Primos | Clasificar números como primos o compuestos en 60s | Baja |
| Flappy USM | Flappy Bird con mascota USM, obstáculos con logos | Media |
| Trivia USM | Preguntas sobre la universidad | Baja |
| Photo Booth | Selfie con filtros/stickers USM (requiere cámara) | Alta |

### Decisión pendiente
El nombre y mecánica del tercer juego debe ser decidido con el equipo USM antes de implementar.

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

function MiJuego({ onBack }) {
  // ... lógica del juego

  return (
    <div style={{ width: '100%', height: '100vh', background: '#0a0f1e' }}>
      {/* UI del juego */}
      {/* Siempre incluir botón o forma de volver: onBack() */}
    </div>
  );
}

export default MiJuego;
```

Y en `App.jsx`:
```jsx
{screen === 'miJuego' && <MiJuego onBack={handleBack} />}
```
