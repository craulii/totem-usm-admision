// MOCK data hasta que el cliente entregue su BDD y se conecte Supabase (Fase 2).
// El panel admin (Fase 4) permitirá filtrar por comuna y dar de alta colegios.
// Estructura pensada para migrar 1:1 a las tablas `comunas` / `colegios`.
// .mjs para que el test de Node lo importe como ESM.

export const COMUNAS = [
  { id: 1, nombre: 'Santiago', colegios: [
    'Instituto Nacional', 'Liceo 1 Javiera Carrera', 'Internado Nacional Barros Arana',
    'Liceo de Aplicación', 'Colegio San Ignacio',
  ] },
  { id: 2, nombre: 'Maipú', colegios: [
    'Liceo Municipal de Maipú', 'Colegio Santiago de Maipú', 'Complejo Educacional Maipú',
    'Colegio Coya',
  ] },
  { id: 3, nombre: 'Puente Alto', colegios: [
    'Liceo Volcán San José', 'Colegio Compañía de María', 'Liceo Chiloé',
  ] },
  { id: 4, nombre: 'La Florida', colegios: [
    'Liceo Benjamín Vicuña Mackenna', 'Colegio Nuestra Señora de las Nieves',
  ] },
  { id: 5, nombre: 'Ñuñoa', colegios: [
    'Liceo José Victorino Lastarria', 'Colegio Salesiano Oratorio', 'Colegio Providencia',
  ] },
];

// Cursos fijos pedidos por el cliente.
export const CURSOS = [
  '7° básico', '8° básico', 'I medio', 'II medio', 'III medio', 'IV medio', 'Egresado', 'Profesor',
];
