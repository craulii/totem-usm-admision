-- Schema inicial Supabase — Tótem USM (ver DATABASE.md)
-- Pegar completo en el SQL Editor de Supabase (Project → SQL Editor → New query → Run).
-- No hay CLI ni migraciones automatizadas: el schema cambia poco, se aplica a mano.

create table if not exists comunas (
  id     bigint generated always as identity primary key,
  nombre text not null unique
);

-- nombre siempre en minúscula (normalizado en registrar_alumno/addColegio) —
-- el unique evita colegios duplicados por may/min o espacios distintos.
create table if not exists colegios (
  id        bigint generated always as identity primary key,
  comuna_id bigint not null references comunas(id),
  nombre    text not null,
  unique (comuna_id, nombre)
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

-- Sin link a alumnos: el tótem nunca sabe qué RUT está jugando (el registro
-- es externo y el ticket se revisa a ojo). Se identifica por las 3 iniciales
-- que ya pide Leaderboard.jsx (estilo arcade) + jugado_en, que alcanza para
-- diferenciar nombres repetidos porque los juegos son de a uno a la vez.
create table if not exists partidas (
  id         bigint generated always as identity primary key,
  iniciales  text not null,
  juego      text not null,
  score      integer not null,
  jugado_en  timestamptz not null default now()
);

create table if not exists config (
  key   text primary key,
  value text
);

-- Secreto del panel admin (ver admin_listar_alumnos más abajo). Sin policies:
-- ni siquiera anon puede leer esta tabla directamente, solo la función RPC.
create table if not exists admin_secrets (
  key   text primary key,
  value text
);

-- Bitácora de acciones del panel admin (config, altas de colegio, exportar
-- Excel). Insert abierto (para que el panel pueda escribir), sin policy de
-- select: nadie con el link ?admin=… puede leerla, solo tú desde el Table
-- Editor de Supabase (entra como dueño del proyecto, se salta RLS). No hay
-- "quién" porque el token admin es compartido, sin login por persona.
create table if not exists admin_log (
  id        bigint generated always as identity primary key,
  accion    text not null,
  detalle   text,
  creado_en timestamptz not null default now()
);

-- RLS ------------------------------------------------------------------
-- comunas/colegios/config: no son datos personales, lectura pública abierta.
-- alumnos/partidas: datos personales (Ley 19.628) — sin policies para anon,
-- solo se tocan vía las funciones RPC de abajo (security definer).

alter table comunas       enable row level security;
alter table colegios      enable row level security;
alter table config        enable row level security;
alter table alumnos       enable row level security;
alter table partidas      enable row level security;
alter table admin_secrets enable row level security;
alter table admin_log     enable row level security;

create policy comunas_select_anon  on comunas  for select to anon using (true);
create policy colegios_select_anon on colegios for select to anon using (true);
create policy colegios_insert_anon on colegios for insert to anon with check (true);
create policy config_select_anon  on config   for select to anon using (true);
create policy config_upsert_anon  on config   for insert to anon with check (true);
create policy config_update_anon  on config   for update to anon using (true);
-- admin_log: mismo patrón que partidas — insert sin select (sin .select() al
-- insertar desde db.js, mismo motivo que partidas).
create policy admin_log_insert_anon on admin_log for insert to anon with check (true);
-- partidas: sin PII (solo iniciales arcade + score), insert abierto, sin select
-- (el ranking en pantalla vive en localStorage, esto es solo el respaldo).
-- Ojo: sin policy de select, un INSERT ... RETURNING falla por RLS (Postgres
-- exige poder "leer" la fila insertada). db.js debe insertar SIN encadenar
-- .select() (el default de supabase-js ya es return=minimal, no pidas más).
create policy partidas_insert_anon on partidas for insert to anon with check (true);

-- RPC: registrar/actualizar alumno (dedup por RUT) ----------------------
-- El cliente (anon key) nunca hace INSERT/UPDATE directo sobre `alumnos`;
-- solo puede llamar esta función, que corre con permisos del dueño (definer).
-- Recibe comuna_id + nombre de colegio (texto libre, como hoy en Register.jsx)
-- y resuelve/crea el colegio (normalizado a minúscula) en vez de exigir un
-- colegio_id ya existente. El upsert (on conflict) es atómico: evita la
-- carrera de dos registros creando el mismo colegio nuevo a la vez.
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
  insert into colegios (comuna_id, nombre)
  values (p_comuna_id, lower(trim(p_colegio_nombre)))
  on conflict (comuna_id, nombre) do update set nombre = excluded.nombre
  returning id into v_colegio_id;

  insert into alumnos (rut, nombre, correo, telefono, colegio_id, curso, code)
  values (p_rut, p_nombre, lower(trim(p_correo)), p_telefono, v_colegio_id, p_curso, p_code)
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

-- RPC: lista de alumnos para el panel admin, protegida por token --------
-- Nota de seguridad: ADMIN_TOKEN hoy vive en src/config.js y se empaqueta
-- en el bundle público (cualquiera puede extraerlo con las devtools). Esta
-- función sí es mejor que nada (hoy: cero verificación, cualquiera con la
-- anon key lee `alumnos` directo), pero NO es autenticación real — eso es
-- Fase 4 (Supabase Auth). Cambiar el valor de abajo por uno propio y
-- considerar rotarlo si se filtra.
create or replace function admin_listar_alumnos(p_token text)
returns table (
  id bigint, rut text, nombre text, correo text, telefono text,
  curso text, code text, creado_en timestamptz, colegio text, comuna text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_token is null or p_token <> (select value from admin_secrets where key = 'admin_token') then
    raise exception 'token inválido';
  end if;
  return query
    select a.id, a.rut, a.nombre, a.correo, a.telefono, a.curso, a.code, a.creado_en,
           c.nombre as colegio, co.nombre as comuna
    from alumnos a
    left join colegios c on c.id = a.colegio_id
    left join comunas co on co.id = c.comuna_id
    order by a.creado_en desc;
end;
$$;

grant execute on function admin_listar_alumnos(text) to anon;

insert into admin_secrets (key, value) values ('admin_token', 'usm-admin-2026')
on conflict (key) do nothing;

-- RPC: bitácora admin, protegida por un segundo secreto (owner_token) -----
-- Distinto de admin_token a propósito: admin_token vive en src/config.js y
-- se empaqueta en el bundle público (cualquiera con el link ?admin=... lo
-- puede extraer). owner_token NUNCA debe vivir en el código — solo en esta
-- tabla y en la URL que tú guardes. Sembrarlo a mano:
--   insert into admin_secrets (key, value) values ('owner_token', '<TU-TOKEN-LARGO-Y-ALEATORIO>');
-- y usar https://tu-dominio/?secreto=<ese-token>
create or replace function admin_listar_log(p_token text)
returns table (id bigint, accion text, detalle text, creado_en timestamptz)
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_token is null or p_token <> (select value from admin_secrets where key = 'owner_token') then
    raise exception 'token inválido';
  end if;
  return query select l.id, l.accion, l.detalle, l.creado_en from admin_log l order by l.creado_en desc;
end;
$$;

grant execute on function admin_listar_log(text) to anon;

-- Seed inicial de comunas/colegios (desde src/data/comunas.mjs) ---------
insert into comunas (nombre) values
  ('Santiago'), ('Maipú'), ('Puente Alto'), ('La Florida'), ('Ñuñoa')
on conflict (nombre) do nothing;

-- nombre en minúscula (ver comentario en `create table colegios`).
insert into colegios (comuna_id, nombre)
select c.id, lower(x.nombre) from (values
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
on conflict (comuna_id, nombre) do nothing;

-- Ampliación: todas las comunas de la Región Metropolitana + colegios activos
-- (fuente: listado "Colegios activos" de MINEDUC, filtrado a la Región
-- Metropolitana de Santiago; regenerar filtrando ese export si se necesita
-- una versión más reciente)
-- comunas nuevas de la Región Metropolitana
insert into comunas (nombre) values
  ('Buin'),
  ('Calera de Tango'),
  ('Cerrillos'),
  ('Cerro Navia'),
  ('Colina'),
  ('Conchalí'),
  ('Curacaví'),
  ('El Bosque'),
  ('El Monte'),
  ('Estación Central'),
  ('Huechuraba'),
  ('Independencia'),
  ('Isla de Maipo'),
  ('La Cisterna'),
  ('La Florida'),
  ('La Granja'),
  ('La Pintana'),
  ('La Reina'),
  ('Lampa'),
  ('Las Condes'),
  ('Lo Barnechea'),
  ('Lo Espejo'),
  ('Lo Prado'),
  ('Macul'),
  ('Maipú'),
  ('Melipilla'),
  ('Padre Hurtado'),
  ('Paine'),
  ('Pedro Aguirre Cerda'),
  ('Peñaflor'),
  ('Peñalolén'),
  ('Pirque'),
  ('Providencia'),
  ('Pudahuel'),
  ('Puente Alto'),
  ('Quilicura'),
  ('Quinta Normal'),
  ('Recoleta'),
  ('Renca'),
  ('San Bernardo'),
  ('San Joaquín'),
  ('San Miguel'),
  ('San Ramón'),
  ('Santiago'),
  ('Talagante'),
  ('Til Til'),
  ('Vitacura'),
  ('Ñuñoa')
on conflict (nombre) do nothing;

-- colegios activos RM (fuente: xlsx "Colegios activos", MINEDUC)
insert into colegios (comuna_id, nombre)
select c.id, x.nombre from (values
  ('Til Til', 'altos del huerto'),
  ('La Reina', 'andree english school'),
  ('Independencia', 'anexo liceo mun paula jaraquemada'),
  ('La Florida', 'bernadette college'),
  ('La Florida', 'bicentenario college'),
  ('Puente Alto', 'c. integral de ad. profesora teresa moya reye'),
  ('El Monte', 'c.e.i.a. profesor hector duarte'),
  ('Pedro Aguirre Cerda', 'c.e.i.a.pedro aguirre cerda'),
  ('Puente Alto', 'cardenal juan francisco fresno larrain'),
  ('Lo Espejo', 'ceia aprender'),
  ('Cerro Navia', 'ceia georgina salas dinamarca'),
  ('La Cisterna', 'centro de educ. integ. de ad. forjando futuro'),
  ('Talagante', 'centro de educ. integrada de adultos talagant'),
  ('Maipú', 'centro de educ. tecn.profesional codeduc'),
  ('Maipú', 'centro de educación de adultos bernardo o´higgins de maipú'),
  ('Santiago', 'centro de educacion integrada de ad. creando'),
  ('San Bernardo', 'centro de educacion integrado de  adultos gladys lazo nº 2'),
  ('Isla de Maipo', 'centro de educacion mario bertero cevasco'),
  ('San Ramón', 'centro de educacion paula jaraquemada'),
  ('Curacaví', 'centro de estudios francisco bilbao de curaca'),
  ('Providencia', 'centro de form tecn inst fco  bilbao'),
  ('Lo Espejo', 'centro duc.cardenal jose maria caro'),
  ('Ñuñoa', 'centro educ profes gmo gonzalez heinrich'),
  ('Santiago', 'centro educ. casa talleres san vicente de pau'),
  ('La Florida', 'centro educ. de adultos cardenal raul silva h'),
  ('Puente Alto', 'centro educ. de adultos isabel la catolica'),
  ('El Bosque', 'centro educ. denver colorado school'),
  ('Peñalolén', 'centro educ. diego de almagro'),
  ('Paine', 'centro educ. enrique bernstein carabante'),
  ('Renca', 'centro educ. goyenechea'),
  ('Peñaflor', 'centro educ. nino dios de malloco'),
  ('San Bernardo', 'centro educ. padre alberto hurtado de san ber'),
  ('Isla de Maipo', 'centro educ. part. maria reina inmaculada'),
  ('San Miguel', 'centro educ. particular san luis'),
  ('Puente Alto', 'centro educ. principado de asturia adulto'),
  ('Puente Alto', 'centro educ. principado de asturias'),
  ('San Joaquín', 'centro educ. provincia de ñuble'),
  ('Peñalolén', 'centro educ. valle hermoso'),
  ('Peñalolén', 'centro educ.adultos americo vespucio'),
  ('Estación Central', 'centro educ.munic. dr. amador nechme r.'),
  ('San Bernardo', 'centro educ.part.orden de san jorge'),
  ('Peñalolén', 'centro educacion mariano egana'),
  ('Peñaflor', 'centro educacional adultos kairos'),
  ('Quinta Normal', 'centro educacional alberto hurtado'),
  ('San Bernardo', 'centro educacional baldomero lillo'),
  ('Cerro Navia', 'centro educacional de adultos'),
  ('Quilicura', 'centro educacional de adultos ceduca'),
  ('Peñaflor', 'centro educacional de adultos dreyse'),
  ('El Monte', 'centro educacional de adultos el monte'),
  ('Santiago', 'centro educacional de adultos el prado'),
  ('Melipilla', 'centro educacional de adultos lope de vega'),
  ('Padre Hurtado', 'centro educacional de adultos padre alberto hurtado'),
  ('La Florida', 'centro educacional de adultos rafael sotomayo'),
  ('Puente Alto', 'centro educacional de adultos san alfonso'),
  ('Huechuraba', 'centro educacional de huechuraba'),
  ('Peñalolén', 'centro educacional eduardo de la barra'),
  ('Renca', 'centro educacional federico garcia lorca'),
  ('Puente Alto', 'centro educacional fernando de aragon'),
  ('Peñalolén', 'centro educacional fundacion paula jaraquemad'),
  ('San Joaquín', 'centro educacional horacio aravena a.'),
  ('Las Condes', 'centro educacional innovativo'),
  ('Santiago', 'centro educacional integral de adult acuario'),
  ('Isla de Maipo', 'centro educacional isla de maipo'),
  ('Recoleta', 'centro educacional jose miguel carrera'),
  ('Macul', 'centro educacional julio verne'),
  ('La Florida', 'centro educacional la florida'),
  ('Puente Alto', 'centro educacional larun rayun'),
  ('Renca', 'centro educacional laura vicuña'),
  ('La Florida', 'centro educacional liahona la florida'),
  ('Las Condes', 'centro educacional life support'),
  ('La Cisterna', 'centro educacional lincoln college'),
  ('La Florida', 'centro educacional london'),
  ('El Bosque', 'centro educacional matias cousino'),
  ('Melipilla', 'centro educacional menesiano'),
  ('San Ramón', 'centro educacional mirador'),
  ('La Pintana', 'centro educacional mun.mariano latorre'),
  ('San Ramón', 'centro educacional municipal san ramon'),
  ('Puente Alto', 'centro educacional nueva creacion'),
  ('Maipú', 'centro educacional piamartino carolina llona de cuevas'),
  ('Renca', 'centro educacional renca'),
  ('Puente Alto', 'centro educacional san carlos de aragon'),
  ('Lo Barnechea', 'centro educacional san esteban martir'),
  ('Recoleta', 'centro educacional san lorenzo'),
  ('La Cisterna', 'centro educacional santa clara'),
  ('La Pintana', 'centro educacional santa rosa del sur'),
  ('Santiago', 'centro educativo salesianos alameda'),
  ('La Cisterna', 'centro politec. carlos condell de la cisterna'),
  ('Conchalí', 'centro politecnico particular conchali'),
  ('Ñuñoa', 'centro politecnico particular de nunoa'),
  ('La Cisterna', 'centro politecnico particular san ramon'),
  ('Puente Alto', 'centro tecnico educacional san cayetano'),
  ('Cerrillos', 'chilean eagles college'),
  ('La Cisterna', 'chilean eagles college - la cisterna'),
  ('Puente Alto', 'chilean eagles college - las  vizcachas'),
  ('Ñuñoa', 'col tec profesional republica argentina'),
  ('La Reina', 'col. part. sagrado corazon de jesus de la re'),
  ('Providencia', 'col. part. sales. el patrocinio de san jose'),
  ('Peñaflor', 'col.part.inmac.conc. de ntra.sra. de lourdes'),
  ('Maipú', 'col.particular san valentin de maipu'),
  ('Renca', 'coleg. poliv. santa maria de la providencia'),
  ('Renca', 'colegio  alonso  de  cordova'),
  ('La Florida', 'colegio  andares'),
  ('La Florida', 'colegio  artistico sol del  illimani'),
  ('Recoleta', 'colegio  educar adultos  recoleta'),
  ('Peñalolén', 'colegio  epullay'),
  ('San Bernardo', 'colegio  fitzroy college'),
  ('San Bernardo', 'colegio  ingles isaac newton'),
  ('Melipilla', 'colegio  instituto manquehue'),
  ('La Florida', 'colegio  latinoamericano'),
  ('Quilicura', 'colegio  manquecura valle lo campino'),
  ('La Florida', 'colegio  pablo apostol'),
  ('San Miguel', 'colegio  paulo  freire  de  san  miguel'),
  ('La Florida', 'colegio  playground'),
  ('Quilicura', 'colegio  san carlos de quilicura'),
  ('Colina', 'colegio  san jose de chicureo'),
  ('Providencia', 'colegio  united college'),
  ('Puente Alto', 'colegio `emprender obispo alvear`'),
  ('Recoleta', 'colegio academia de humanidades'),
  ('Vitacura', 'colegio adul. instituto tabancura de vitacura'),
  ('Maipú', 'colegio adultos  alfred nobel'),
  ('Lampa', 'colegio adultos manquehue'),
  ('La Florida', 'colegio adventista de florida'),
  ('La Cisterna', 'colegio adventista la cisterna'),
  ('Las Condes', 'colegio adventista las condes'),
  ('Las Condes', 'colegio adventista las condes'),
  ('Santiago', 'colegio adventista porvenir'),
  ('Lo Prado', 'colegio adventista santiago poniente'),
  ('Ñuñoa', 'colegio akros'),
  ('La Florida', 'colegio alain de la florida'),
  ('Recoleta', 'colegio albert einstein'),
  ('Padre Hurtado', 'colegio alberto hurtado cruchaga'),
  ('Maipú', 'colegio alberto perez'),
  ('Lampa', 'colegio alborada de lampa'),
  ('La Florida', 'colegio alcantara cordillera'),
  ('Peñalolén', 'colegio alcántara de los altos de peñalolen'),
  ('Talagante', 'colegio alcantara de talagante'),
  ('Las Condes', 'colegio alcazar de las condes'),
  ('Colina', 'colegio alemán de chicureo'),
  ('Las Condes', 'colegio aleman de santiago'),
  ('Providencia', 'colegio aleman sankt thomas morus'),
  ('La Florida', 'colegio alicante de la florida'),
  ('Puente Alto', 'colegio alicante del sol'),
  ('Puente Alto', 'colegio alicante del valle'),
  ('Peñalolén', 'colegio alicura'),
  ('La Granja', 'colegio alma mater'),
  ('Pirque', 'colegio almenar de pirque'),
  ('Puente Alto', 'colegio almenar del maipo'),
  ('La Florida', 'colegio almendral'),
  ('Peñalolén', 'colegio altamira'),
  ('Paine', 'colegio altazol del maipo'),
  ('San Bernardo', 'colegio alterra'),
  ('Isla de Maipo', 'colegio alto del maipo'),
  ('Buin', 'colegio alto del valle'),
  ('La Pintana', 'colegio alto gabriela'),
  ('Santiago', 'colegio alto palena'),
  ('Independencia', 'colegio alvaro covarrubias arlegui'),
  ('Maipú', 'colegio alvaro lavín'),
  ('San Bernardo', 'colegio american academy'),
  ('La Florida', 'colegio american british college'),
  ('La Florida', 'colegio american british school'),
  ('Peñaflor', 'colegio american school'),
  ('Las Condes', 'colegio andino antillanca'),
  ('Lo Barnechea', 'colegio anglo american international school'),
  ('Maipú', 'colegio anglo maipu'),
  ('Vitacura', 'colegio antartica chilena'),
  ('La Cisterna', 'colegio antil mawida'),
  ('Peñaflor', 'colegio antimanque'),
  ('La Florida', 'colegio antuquenu andino'),
  ('Lo Barnechea', 'colegio apoquindo femenino'),
  ('Lo Barnechea', 'colegio apoquindo hombres'),
  ('Ñuñoa', 'colegio apostol san pedro'),
  ('Las Condes', 'colegio arabe'),
  ('San Bernardo', 'colegio aragon'),
  ('Puente Alto', 'colegio araucaria cordillera'),
  ('Providencia', 'colegio argentino del sagrado corazon'),
  ('La Florida', 'colegio artistico el salvador anexo'),
  ('Maipú', 'colegio artistico el trigal'),
  ('San Ramón', 'colegio arturo matte larraín'),
  ('Puente Alto', 'colegio arturo prat'),
  ('Independencia', 'colegio arturo toro amor'),
  ('La Florida', 'colegio atenas'),
  ('Providencia', 'colegio aula clinica santa maria'),
  ('La Pintana', 'colegio australia'),
  ('Lo Barnechea', 'colegio bertait college'),
  ('La Florida', 'colegio bertrand russel'),
  ('La Granja', 'colegio betania'),
  ('Lo Barnechea', 'colegio betterland school'),
  ('Quinta Normal', 'colegio bicentenario elvira hurtado de matte de santiago'),
  ('La Florida', 'colegio boston college alto macul'),
  ('Vitacura', 'colegio bradford school'),
  ('Las Condes', 'colegio british high school'),
  ('La Reina', 'colegio british royal school'),
  ('Buin', 'colegio buin'),
  ('Peñaflor', 'colegio c.i.e.a. garcia hurtado de mendoza'),
  ('Ñuñoa', 'colegio calasanz'),
  ('Santiago', 'colegio cambridge'),
  ('Providencia', 'colegio cambridge college'),
  ('Buin', 'colegio campanario'),
  ('Providencia', 'colegio campvs college'),
  ('Talagante', 'colegio carampangue'),
  ('Curacaví', 'colegio carpe diem de curacavi'),
  ('Padre Hurtado', 'colegio castelgandolfo'),
  ('Maipú', 'colegio centenario'),
  ('Puente Alto', 'colegio centro educ. y familiar pte alto'),
  ('Padre Hurtado', 'colegio centro educacional altair'),
  ('Maipú', 'colegio centro educacional rousseau'),
  ('La Granja', 'colegio christian garden school'),
  ('Independencia', 'colegio cientifico humanista alvaro covarrubias'),
  ('Las Condes', 'colegio ciudadela montessori de las condes'),
  ('San Miguel', 'colegio claretiano'),
  ('Peñaflor', 'colegio comercial de penaflor'),
  ('Las Condes', 'colegio compañia de maria apoquindo'),
  ('Providencia', 'colegio compañia de maria-seminario'),
  ('Las Condes', 'colegio concordia'),
  ('Quinta Normal', 'colegio corazon de jesus'),
  ('San Miguel', 'colegio corazon de maria'),
  ('Puente Alto', 'colegio cordillera'),
  ('Las Condes', 'colegio cordillera de las condes'),
  ('La Reina', 'colegio coronel eleuterio ramirez molina'),
  ('Las Condes', 'colegio coyancura'),
  ('Lo Barnechea', 'colegio craighouse'),
  ('Las Condes', 'colegio creces'),
  ('Cerro Navia', 'colegio cree'),
  ('Puente Alto', 'colegio cristiano belen'),
  ('La Florida', 'colegio cristiano bethel  n 3'),
  ('La Florida', 'colegio cristiano emmanuel'),
  ('Conchalí', 'colegio cristobal colon'),
  ('Melipilla', 'colegio cristobal colon de melipilla'),
  ('Santiago', 'colegio ctro. integ  adultos altazol'),
  ('Las Condes', 'colegio cumbres'),
  ('Las Condes', 'colegio dalcahue'),
  ('Pedro Aguirre Cerda', 'colegio de ad. antonio acevedo'),
  ('Maipú', 'colegio de ad. educap'),
  ('La Pintana', 'colegio de ad. instituto humboldt'),
  ('Peñaflor', 'colegio de ad. instituto nueva imagen'),
  ('Providencia', 'colegio de ad. instituto san sebastian de bel'),
  ('San Miguel', 'colegio de ad. san javier de san miguel'),
  ('Estación Central', 'colegio de ad. santa maria del trabajo de est'),
  ('Santiago', 'colegio de adult.academia estudios miraflores'),
  ('Providencia', 'colegio de adulto clotario blest riffo'),
  ('Renca', 'colegio de adulto laura vicuna de renca'),
  ('Melipilla', 'colegio de adultos  alba de oro'),
  ('El Bosque', 'colegio de adultos alfred nobel el bosque'),
  ('Santiago', 'colegio de adultos altazol de santiago'),
  ('Til Til', 'colegio de adultos altos del huerto'),
  ('San Bernardo', 'colegio de adultos anselmo urbano cadiz'),
  ('Peñalolén', 'colegio de adultos antu-anay'),
  ('Conchalí', 'colegio de adultos carelmapu de conchali'),
  ('Providencia', 'colegio de adultos casa de estudios futuro'),
  ('Santiago', 'colegio de adultos centro de estudios la araucana'),
  ('Pudahuel', 'colegio de adultos educap'),
  ('Quinta Normal', 'colegio de adultos escuela del cariño'),
  ('Santiago', 'colegio de adultos gladys lazo'),
  ('La Florida', 'colegio de adultos hernando de magallanes'),
  ('Santiago', 'colegio de adultos instituto andes'),
  ('Santiago', 'colegio de adultos instituto norel gavac'),
  ('Providencia', 'colegio de adultos instituto nuevo bilbao'),
  ('Puente Alto', 'colegio de adultos instituto rogeriano'),
  ('Santiago', 'colegio de adultos instituto tabancura sede londres'),
  ('Huechuraba', 'colegio de adultos jose abelardo nunez'),
  ('El Bosque', 'colegio de adultos jose abelardo nunez el bos'),
  ('San Bernardo', 'colegio de adultos jose abelardo nunez-san be'),
  ('Maipú', 'colegio de adultos juan ramon jimenez'),
  ('La Florida', 'colegio de adultos london de la florida'),
  ('Maipú', 'colegio de adultos los libertadores de maipu'),
  ('Til Til', 'colegio de adultos manquehue de til til'),
  ('San Miguel', 'colegio de adultos part. vasco de gama'),
  ('Maipú', 'colegio de adultos presbiteriano de maipu'),
  ('Santiago', 'colegio de adultos pulmahue'),
  ('Macul', 'colegio de adultos rocket'),
  ('Colina', 'colegio de adultos san andres de colina'),
  ('Colina', 'colegio de adultos sembrador san benito'),
  ('Melipilla', 'colegio de adultos tirso de molina'),
  ('Renca', 'colegio de adultos valle de azapa'),
  ('San Bernardo', 'colegio de la inmaculada concepción'),
  ('Maipú', 'colegio de la providencia c.larrain de i'),
  ('La Reina', 'colegio de la salle - la reina'),
  ('Santiago', 'colegio de los sagrados corazones alameda'),
  ('Vitacura', 'colegio de los sagrados corazones de manquehue'),
  ('Providencia', 'colegio de los sagrados corazones providencia'),
  ('Buin', 'colegio de maipo'),
  ('Maipú', 'colegio del real'),
  ('Las Condes', 'colegio del sagrado corazon de apoquindo'),
  ('Maipú', 'colegio del valle'),
  ('Las Condes', 'colegio del verbo divino'),
  ('Colina', 'colegio del verbo divino de chicureo'),
  ('San Bernardo', 'colegio denham school'),
  ('Colina', 'colegio desiree'),
  ('La Florida', 'colegio divina pastora'),
  ('La Florida', 'colegio divina pastora la florida'),
  ('Ñuñoa', 'colegio divina pastora ñuñoa'),
  ('San Bernardo', 'colegio domingo eyzaguirre'),
  ('Peñaflor', 'colegio dreyse belser'),
  ('Las Condes', 'colegio dunalastair'),
  ('Peñalolén', 'colegio dunalastair peñalolén'),
  ('Colina', 'colegio dunalastair valle norte'),
  ('Estación Central', 'colegio echaurren'),
  ('Paine', 'colegio ecologico paine'),
  ('Puente Alto', 'colegio educ.part. compañia de maria puente alto'),
  ('Conchalí', 'colegio educaadultos conchali'),
  ('Lo Espejo', 'colegio educad lo espejo'),
  ('El Bosque', 'colegio el almendro'),
  ('Renca', 'colegio el bosque de renca'),
  ('Puente Alto', 'colegio el bosque provincia cordillera'),
  ('La Reina', 'colegio el carmen teresiano'),
  ('Vitacura', 'colegio el carmen teresiano i'),
  ('Peñalolén', 'colegio el encuentro'),
  ('Providencia', 'colegio el patrocinio de san jose'),
  ('Pudahuel', 'colegio el prado'),
  ('Maipú', 'colegio el redentor'),
  ('Ñuñoa', 'colegio el roble'),
  ('Puente Alto', 'colegio el sembrador'),
  ('Puente Alto', 'colegio el sembrador anexo 2'),
  ('Independencia', 'colegio elena bettini'),
  ('Maipú', 'colegio ellen college'),
  ('Las Condes', 'colegio emaus'),
  ('La Florida', 'colegio emmanuel high school'),
  ('Peñaflor', 'colegio emmanuel mounier'),
  ('Cerro Navia', 'colegio enrique alvear de cerro navia'),
  ('Puente Alto', 'colegio ensenada'),
  ('Maipú', 'colegio esc.  jose manso de velasco'),
  ('Providencia', 'colegio especial hospitalario con todo el cor'),
  ('San Joaquín', 'colegio espiritu santo del verbo divino'),
  ('Puente Alto', 'colegio estela segura'),
  ('La Reina', 'colegio etievan'),
  ('Lo Barnechea', 'colegio everest'),
  ('Santiago', 'colegio excelsior'),
  ('Curacaví', 'colegio farmland school'),
  ('Santiago', 'colegio filipense'),
  ('La Florida', 'colegio florida high school'),
  ('Estación Central', 'colegio franciscano maria reina'),
  ('Santiago', 'colegio francisco arriaran'),
  ('Peñalolén', 'colegio francisco de miranda'),
  ('Ñuñoa', 'colegio francisco encina'),
  ('San Bernardo', 'colegio getsemani'),
  ('Huechuraba', 'colegio grace college'),
  ('Pedro Aguirre Cerda', 'colegio grace school'),
  ('Estación Central', 'colegio greenland school'),
  ('Conchalí', 'colegio hellen´s college'),
  ('Ñuñoa', 'colegio henry fayol'),
  ('Maipú', 'colegio hermanos carrera de chile'),
  ('Colina', 'colegio highlands'),
  ('Peñalolén', 'colegio highlands montessori school of santiago'),
  ('Santiago', 'colegio hispano americano'),
  ('La Reina', 'colegio hospitalario hospital militar'),
  ('Vitacura', 'colegio huelen'),
  ('Lo Barnechea', 'colegio huelquen montessori'),
  ('La Florida', 'colegio hugo landauro henriquez'),
  ('La Cisterna', 'colegio idop limitada'),
  ('Cerrillos', 'colegio industrial part. don orione'),
  ('Independencia', 'colegio industrial vasco nunez de balboa'),
  ('San Joaquín', 'colegio infocap'),
  ('Buin', 'colegio ingles san jose de linderos'),
  ('Vitacura', 'colegio inmaculada concepcion'),
  ('Las Condes', 'colegio institucion teresiana'),
  ('Santiago', 'colegio instituto alonso de ercilla'),
  ('Santiago', 'colegio instituto artístico de estudios secundarios de la universidad de chile'),
  ('Calera de Tango', 'colegio instituto calera de tango')
) as x(comuna_nombre, nombre)
join comunas c on c.nombre = x.comuna_nombre
on conflict (comuna_id, nombre) do nothing;
