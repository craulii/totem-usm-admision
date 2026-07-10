# Política de Seguridad — Tótem USM

## Versiones soportadas

| Versión | Soporte de seguridad |
|---------|---------------------|
| 0.1.x | ✅ Activa |
| < 0.1.0 | No soportada |

## Reportar una vulnerabilidad

Si encuentras una vulnerabilidad de seguridad en este proyecto:

1. **No abras un Issue público** — podría exponer la vulnerabilidad antes de ser corregida
2. Escribe directamente al responsable del proyecto por correo o mensaje privado en GitHub
3. Incluye: descripción del problema, pasos para reproducir, impacto potencial

Responderemos en un plazo máximo de 7 días hábiles.

## Consideraciones de seguridad del proyecto

Este proyecto es una **aplicación kiosk de uso público** en un stand universitario. Con la nueva
dirección (registro de datos + backend Supabase), las consideraciones son:

- **Datos personales (SÍ se capturan)**: nombre, RUT, correo, teléfono, comuna, colegio, curso.
  Aplica la **Ley 19.628** de protección de datos — ver sección de privacidad abajo.
- **Backend Supabase**: usar la **anon key** en el cliente (nunca la service key); proteger las
  tablas con **Row Level Security (RLS)**. Credenciales en variables de entorno, no en el repo.
- **Conexión a internet**: la app sincroniza con Supabase cuando hay red y cae a modo offline
  (cola local + Excel) cuando no. El export local con datos personales debe manejarse con cuidado.
- **Panel de administración**: accesible solo por **link privado** + autenticación; no exponer
  públicamente.
- **Kiosk**: la interacción del estudiante es pública/sin login; el admin sí requiere acceso.
- **Electron (dev)**: `nodeIntegration: false` y `contextIsolation: true`. En producción se usa
  Capacitor.

## Privacidad y datos personales (Ley 19.628)

Como se capturan datos personales, es obligatorio:
- **Aviso de privacidad visible** en el formulario de registro (qué se pide y para qué).
- Recolectar solo lo necesario; **dedup por RUT** para no duplicar alumnos.
- Documentar dónde se almacenan (Supabase / cola local / Excel) y cómo se eliminan.
- Restringir el acceso a los registros exportados y al panel admin.
