-- Schema inicial Supabase — Tótem USM (ver DATABASE.md)
-- Pegar completo en el SQL Editor de Supabase (Project → SQL Editor → New query → Run).
-- No hay CLI ni migraciones automatizadas: el schema cambia poco, se aplica a mano.

create table if not exists comunas (
  id     bigint generated always as identity primary key,
  nombre text not null unique
);

create table if not exists colegios (
  id        bigint generated always as identity primary key,
  comuna_id bigint not null references comunas(id),
  nombre    text not null
);

create table if not exists alumnos (
  id         bigint generated always as identity primary key,
  rut        text not null unique,
  nombre     text not null,
  correo     text,
  telefono   text,
  colegio_id bigint references colegios(id),
  curso      text,
  code       text, -- código corto del ticket (revisión manual en el tótem)
  creado_en  timestamptz not null default now()
);

create table if not exists partidas (
  id         bigint generated always as identity primary key,
  alumno_id  bigint not null references alumnos(id),
  juego      text not null,
  score      integer not null,
  jugado_en  timestamptz not null default now()
);

create table if not exists config (
  key   text primary key,
  value text
);

-- RLS ------------------------------------------------------------------
-- comunas/colegios/config: no son datos personales, lectura pública abierta.
-- alumnos/partidas: datos personales (Ley 19.628) — sin policies para anon,
-- solo se tocan vía las funciones RPC de abajo (security definer).

alter table comunas  enable row level security;
alter table colegios enable row level security;
alter table config   enable row level security;
alter table alumnos  enable row level security;
alter table partidas enable row level security;

create policy comunas_select_anon  on comunas  for select to anon using (true);
create policy colegios_select_anon on colegios for select to anon using (true);
create policy colegios_insert_anon on colegios for insert to anon with check (true);
create policy config_select_anon  on config   for select to anon using (true);
create policy config_upsert_anon  on config   for insert to anon with check (true);
create policy config_update_anon  on config   for update to anon using (true);

-- RPC: registrar/actualizar alumno (dedup por RUT) ----------------------
-- El cliente (anon key) nunca hace INSERT/UPDATE directo sobre `alumnos`;
-- solo puede llamar esta función, que corre con permisos del dueño (definer).
-- Recibe comuna_id + nombre de colegio (texto libre, como hoy en Register.jsx)
-- y resuelve/crea el colegio, en vez de exigir un colegio_id ya existente.
create or replace function registrar_alumno(
  p_rut text,
  p_nombre text,
  p_correo text,
  p_telefono text,
  p_comuna_id bigint,
  p_colegio_nombre text,
  p_curso text,
  p_code text
) returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_colegio_id bigint;
  v_id bigint;
begin
  select id into v_colegio_id from colegios where comuna_id = p_comuna_id and nombre = p_colegio_nombre;
  if v_colegio_id is null then
    insert into colegios (comuna_id, nombre) values (p_comuna_id, p_colegio_nombre)
    returning id into v_colegio_id;
  end if;

  insert into alumnos (rut, nombre, correo, telefono, colegio_id, curso, code)
  values (p_rut, p_nombre, p_correo, p_telefono, v_colegio_id, p_curso, p_code)
  on conflict (rut) do update set
    nombre     = excluded.nombre,
    correo     = excluded.correo,
    telefono   = excluded.telefono,
    colegio_id = excluded.colegio_id,
    curso      = excluded.curso,
    code       = excluded.code
  returning id into v_id;
  return v_id;
end;
$$;

grant execute on function registrar_alumno(text, text, text, text, bigint, text, text, text) to anon;

-- RPC: registrar partida a partir del RUT (sin exponer alumnos.id) ------
create or replace function registrar_partida(
  p_rut text,
  p_juego text,
  p_score integer
) returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_alumno_id bigint;
  v_id bigint;
begin
  select id into v_alumno_id from alumnos where rut = p_rut;
  if v_alumno_id is null then
    raise exception 'alumno no encontrado para rut %', p_rut;
  end if;

  insert into partidas (alumno_id, juego, score)
  values (v_alumno_id, p_juego, p_score)
  returning id into v_id;
  return v_id;
end;
$$;

grant execute on function registrar_partida(text, text, integer) to anon;

-- Seed inicial de comunas/colegios (desde src/data/comunas.mjs) ---------
insert into comunas (nombre) values
  ('Santiago'), ('Maipú'), ('Puente Alto'), ('La Florida'), ('Ñuñoa')
on conflict (nombre) do nothing;

insert into colegios (comuna_id, nombre)
select c.id, x.nombre from (values
  ('Santiago', 'Instituto Nacional'),
  ('Santiago', 'Liceo 1 Javiera Carrera'),
  ('Santiago', 'Internado Nacional Barros Arana'),
  ('Santiago', 'Liceo de Aplicación'),
  ('Santiago', 'Colegio San Ignacio'),
  ('Maipú', 'Liceo Municipal de Maipú'),
  ('Maipú', 'Colegio Santiago de Maipú'),
  ('Maipú', 'Complejo Educacional Maipú'),
  ('Maipú', 'Colegio Coya'),
  ('Puente Alto', 'Liceo Volcán San José'),
  ('Puente Alto', 'Colegio Compañía de María'),
  ('Puente Alto', 'Liceo Chiloé'),
  ('La Florida', 'Liceo Benjamín Vicuña Mackenna'),
  ('La Florida', 'Colegio Nuestra Señora de las Nieves'),
  ('Ñuñoa', 'Liceo José Victorino Lastarria'),
  ('Ñuñoa', 'Colegio Salesiano Oratorio'),
  ('Ñuñoa', 'Colegio Providencia')
) as x(comuna_nombre, nombre)
join comunas c on c.nombre = x.comuna_nombre
where not exists (
  select 1 from colegios where comuna_id = c.id and nombre = x.nombre
);
