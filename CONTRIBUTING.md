# Guía de Contribución — Tótem USM

Gracias por querer contribuir al proyecto. Esta guía explica el flujo de trabajo para agregar cambios correctamente.

---

## Prerrequisitos

- Node.js >= 18
- npm >= 9
- Git configurado
- Leer `ROADMAP.md` para entender las fases actuales (Fase 0–8)
- Leer `CLAUDE.md` para las reglas del proyecto

---

## Flujo de trabajo

### 1. Crear una rama

```bash
git checkout -b tipo/descripcion-corta
```

Tipos de rama:
- `feat/` — nueva funcionalidad
- `fix/` — corrección de bug
- `docs/` — solo documentación
- `refactor/` — refactorización sin cambios funcionales
- `chore/` — tareas de mantenimiento

Ejemplos:
```bash
git checkout -b feat/attract-screen
git checkout -b fix/timer-display
git checkout -b docs/game-design
```

### 2. Desarrollar el cambio

- Probar con `npm start` antes de hacer commit
- Verificar que el juego 2048 sigue funcionando
- Mantener el patrón de inline styles existente
- No eliminar stubs vacíos, **salvo** `WallyGame.jsx` y `Game3.jsx` (ya autorizados — ver `CLAUDE.md`)

### 3. Commit con Conventional Commits

```bash
git commit -m "tipo(scope): descripción en minúsculas"
```

| Tipo | Cuándo usar |
|------|------------|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `docs` | Solo documentación |
| `refactor` | Refactor sin cambios funcionales |
| `chore` | Dependencias, .gitignore, configs |
| `style` | Cambios de formato, sin lógica |

Ejemplos:
```
feat(game2048): add keyboard arrow key support
fix(menu): correct subtitle text for 2048 card
docs(readme): update installation steps
refactor(clock): extract Clock to standalone component
chore: update electron to v34
```

### 4. Push y Pull Request

```bash
git push origin feat/mi-cambio
```

Luego abrir un Pull Request en GitHub usando la plantilla provista.

---

## Reglas de código

- **Idioma UI**: Español para textos visibles al estudiante
- **Idioma código**: Inglés para variables, funciones, comentarios
- **Estilos**: inline styles (patrón del proyecto — no introducir CSS framework sin discutir)
- **Estado**: useState local por componente — no agregar Redux/Zustand sin necesidad
- **No agregar dependencias** sin discutirlo primero (el bundle debe mantenerse liviano)

---

## Agregar un nuevo juego

Ver la sección "Estructura de código para nuevos juegos" en `GAME_DESIGN.md`.

Resumen:
1. Crear carpeta `src/games/nombreJuego/`
2. Crear `NombreJuego.jsx` con props `onGameEnd(score)` y `onMenu`, incluir `<EndGameButton>` y timer desde `src/config.js`
3. Agregar ruta en `App.jsx`
4. Agregar card en `Menu.jsx`

---

## Reportar bugs

Usar la plantilla de issue en GitHub (`.github/ISSUE_TEMPLATE/bug_report.md`).

Incluir siempre:
- Sistema operativo
- Pasos para reproducir
- Comportamiento esperado vs. actual
- Capturas de pantalla si aplica
