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

Este proyecto es una **aplicación kiosk de uso público** en un stand universitario. Las consideraciones de seguridad relevantes son:

- **Sin datos personales**: La app no captura ni almacena información de los estudiantes (en la versión actual)
- **Electron seguro**: `nodeIntegration: false` y `contextIsolation: true` están activados
- **Sin conexión a internet**: La app está diseñada para operar offline
- **Sin autenticación**: Es una experiencia pública, no requiere login

## Si se agrega captura de datos en el futuro

Si en una fase futura se implementa captura de datos de estudiantes, se debe:
- Agregar aviso de privacidad visible en la app
- Cumplir con la normativa chilena de protección de datos (Ley 19.628 y sus actualizaciones)
- Documentar qué datos se capturan y cómo se almacenan/eliminan
