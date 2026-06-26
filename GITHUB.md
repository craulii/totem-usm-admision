# Instrucciones GitHub — Tótem USM

## Repositorio sugerido

| Campo | Valor |
|-------|-------|
| **Nombre** | `totem-usm-admision` |
| **Descripción** | Kiosk interactivo para el stand de Admisión USM — Santiago. Electron + React + Vite. |
| **Visibilidad** | Público (o Privado si el equipo lo prefiere) |
| **Topics** | `electron`, `react`, `vite`, `kiosk`, `totem`, `usm`, `admision`, `touchscreen`, `game` |

---

## Crear el repositorio con GitHub CLI

```bash
# Asegurarse de estar en la carpeta del proyecto
cd /home/crauli/admision/totem-app

# Crear el repo y subir
gh repo create totem-usm-admision \
  --description "Kiosk interactivo para el stand de Admisión USM — Santiago. Electron + React + Vite." \
  --public \
  --source=. \
  --remote=origin \
  --push
```

Si no se tiene GitHub CLI instalado:
```bash
# Con npm
npm install -g @github/gh

# O seguir instrucciones en https://cli.github.com/
```

---

## Configuración manual (sin CLI)

```bash
# 1. Crear repo en github.com manualmente

# 2. Conectar el remote
git remote add origin https://github.com/TU_USUARIO/totem-usm-admision.git

# 3. Primer push
git push -u origin main
```

---

## Badges para el README

Agregar después de crear el repo:

```markdown
![Version](https://img.shields.io/badge/version-0.1.1-blue)
![Electron](https://img.shields.io/badge/Electron-33-47848F?logo=electron)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)
![License](https://img.shields.io/badge/license-MIT-green)
```

---

## Labels sugeridos para Issues

| Label | Color | Descripción |
|-------|-------|-------------|
| `bug` | `#d73a4a` | Algo no funciona |
| `feature` | `#a2eeef` | Nueva funcionalidad |
| `fase-2` | `#0075ca` | Parte de la Fase 2 |
| `fase-3` | `#7057ff` | Parte de la Fase 3 |
| `blocked` | `#e4e669` | Bloqueado por decisión externa |
| `android` | `#3ddc84` | Relacionado con hardware Android |
| `assets` | `#f9d0c4` | Pendiente de assets USM |
| `good first issue` | `#7057ff` | Para nuevos contribuidores |

---

## Milestones sugeridos

| Milestone | Descripción | Fecha tentativa |
|-----------|-------------|----------------|
| `MVP v0.1.x` | 2048 funcional con bugfixes | Completado Jun 2026 |
| `Flujo Completo v0.2.0` | Attract, instrucciones, resultado | TBD |
| `Dos Juegos v0.3.0` | 2048 + Wally | TBD |
| `Producción v1.0.0` | Deploy en tótem físico USM | TBD |

---

## Secrets necesarios (si se agrega CI/CD)

No se necesitan secrets por ahora. Si se agrega CI en el futuro:

| Secret | Para qué |
|--------|---------|
| `GH_TOKEN` | Publicar releases automáticos con electron-builder |
| `APPLE_ID` | Firma de código macOS (si aplica) |

---

## CI/CD futura (GitHub Actions)

Cuando se quiera automatizar builds:

```yaml
# .github/workflows/build.yml
name: Build

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
```

Para builds de Electron multiplataforma, se necesitaría una matriz con `ubuntu-latest`, `windows-latest`, `macos-latest`.
