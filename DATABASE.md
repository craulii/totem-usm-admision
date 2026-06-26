# Base de Datos y Persistencia — Tótem USM

## Estado actual: Sin persistencia

En la versión actual (v0.1.x), **no existe ningún mecanismo de persistencia**. Todo el estado del juego vive en la memoria React y se pierde al navegar de vuelta al menú.

---

## Datos que actualmente se pierden

| Dato | Dónde vive | Se pierde cuando |
|------|-----------|-----------------|
| `score` actual | `useState` en Game2048 | Al navegar al menú |
| `best` (mejor puntaje) | `useState` en Game2048 | Al navegar al menú |
| Estado del tablero | `useState` en Game2048 | Al navegar al menú |

---

## Plan de persistencia (Fase 2)

### Opción elegida: `localStorage`

Para la Fase 2, se usará `localStorage` del navegador (accesible desde el renderer de Electron) para persistir el mejor puntaje de la sesión.

```javascript
// Guardar al terminar la partida
localStorage.setItem('totem_best_score', score);

// Leer al iniciar Game2048
const savedBest = parseInt(localStorage.getItem('totem_best_score') || '0');
```

**Por qué localStorage y no electron-store**:
- Suficiente para el caso de uso actual (un puntaje por sesión)
- Sin dependencias adicionales
- Si se migra a Opción C (web pura en Android), localStorage sigue funcionando

---

## Si se necesita leaderboard (futuro)

Si USM decide implementar un ranking de estudiantes, las opciones son:

### Para Electron (Opción A - mini-PC):
```bash
npm install electron-store
```

```javascript
const Store = require('electron-store');
const store = new Store();

// Guardar top 10 scores
store.set('leaderboard', [...existing, { nombre, score, fecha }]);
```

Los datos persisten entre sesiones (incluso si la app se reinicia).

### Para Web/Android (Opción C):
```javascript
// Usar IndexedDB para datos más complejos
// O simplemente localStorage si es solo el top 10
const leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');
```

---

## Captura de datos de estudiantes (pendiente decisión USM)

Si USM decide capturar datos (nombre, colegio, carrera de interés):

1. Agregar formulario de registro antes del juego (pantalla Instrucciones)
2. Almacenar localmente con `electron-store` o `localStorage`
3. Exportar a CSV o enviar a backend cuando haya conexión

**Ninguna captura de datos personales está implementada actualmente**, en línea con la política de privacidad.

---

## No se planea backend propio

La app es **offline-first** por diseño. El tótem puede correr sin internet. Si se necesita sincronizar datos con sistemas USM, se evaluará en una fase posterior.
