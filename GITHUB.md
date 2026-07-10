# Instrucciones GitHub — Tótem USM

## Repositorio sugerido

| Campo | Valor |
|-------|-------|
| **Nombre** | `totem-usm-admision` |
| **Descripción** | Kiosk interactivo para el stand de Admisión USM — Santiago. React + Vite + Capacitor + Supabase. |
| **Visibilidad** | Público (o Privado si el equipo lo prefiere) |
| **Topics** | `react`, `vite`, `capacitor`, `supabase`, `kiosk`, `totem`, `usm`, `admision`, `touchscreen`, `game` |

---

## Crear el repositorio con GitHub CLI

```bash
# Asegurarse de estar en la carpeta del proyecto
cd /home/crauli/admision/totem-app

# Crear el repo y subir
gh repo create totem-usm-admision \
  --description "Kiosk interactivo para el stand de Admisión USM — Santiago. React + Vite + Capacitor + Supabase." \
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
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)
![Capacitor](https://img.shields.io/badge/Capacitor-Android-119EFF?logo=capacitor)
![Supabase](https://img.shields.io/badge/Supabase-backend-3FCF8E?logo=supabase)
![License](https://img.shields.io/badge/license-MIT-green)
```

---

## Labels

| Label | Color | Descripción |
|-------|-------|-------------|
| `roadmap` | `#5319e7` | Issue épico de una fase del roadmap v2 |
| `bug` | `#d73a4a` | Algo no funciona |
| `feature` | `#a2eeef` | Nueva funcionalidad |
| `blocked` | `#e4e669` | Bloqueado por decisión/entrega externa |
| `assets` | `#f9d0c4` | Pendiente de assets USM |
| `good first issue` | `#7057ff` | Para nuevos contribuidores |

---

## Milestones (creados) — uno por fase

Cada fase del roadmap v2 es un **milestone** + un **issue épico** (label `roadmap`):

| Milestone | Fase |
|-----------|------|
| `Fase 0 — Limpieza y botones base` | 0 |
| `Fase 1 — Registro en el tótem` | 1 |
| `Fase 2 — Supabase + pipeline` | 2 |
| `Fase 3 — QR + ficha de juego` | 3 |
| `Fase 4 — Panel de administración` | 4 |
| `Fase 5 — Memorice` | 5 |
| `Fase 6 — Prime Ninja` | 6 |
| `Fase 7 — Capacitor` | 7 |
| `Fase 8 — Producción` | 8 |

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

Para el APK de producción se agregaría un job con Android SDK + Capacitor (`npx cap sync && ./gradlew assembleRelease`). Las webs de registro/admin se despliegan aparte (Vercel/Netlify).
