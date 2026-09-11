-- =====================================================================
-- Fix: aislar el modulo esmeralda_* del modulo MUN/staff_roles ajeno,
-- alinear el modelo de roles con el especificado por el cliente,
-- y cerrar varios huecos de autorizacion encontrados en la auditoria.
--
-- NOTA: esta migracion ya fue aplicada directamente en produccion
-- (proyecto Supabase "Perrito-IA") el 2026-09-11 durante la auditoria
-- de seguridad. Este archivo la deja versionada en el repositorio para
-- que el esquema deje de vivir solo en el dashboard de Supabase.
-- Es idempotente: puede volver a ejecutarse sin romper nada.
-- No borra datos existentes.
-- =====================================================================

-- 1) Modelo de roles canonico (español, el que usa todo el frontend)
alter table public.esmeralda_staff_roles drop constraint if exists esmeralda_staff_roles_role_check;
alter table public.esmeralda_staff_roles add constraint esmeralda_staff_roles_role_check
  check (role = any (array['admin_maestro','admin','coordinador','acreditacion','logistica','evaluador']));

-- 2) BUG CRITICO: is_staff()/is_master_admin() consultaban la tabla
--    "staff_roles" de OTRO sistema (MUN/comisiones), no "esmeralda_staff_roles".
--    Esto permitia que cuentas de un modulo totalmente ajeno leyeran datos
--    privados de debatientes (email, telefono, alergias, medicamentos, cedula)
--    y cambiaran el estado de acreditacion de cualquier participante del TRD.
create or replace function public.is_staff(required_role text default null)
returns boolean
language sql
stable security definer
set search_path to ''
as $$
  select exists (
    select 1 from public.esmeralda_staff_roles sr
    where sr.user_id = auth.uid()
      and (
        required_role is null
        or sr.role = required_role
        or sr.role in ('admin','admin_maestro')
      )
  );
$$;

create or replace function public.is_master_admin()
returns boolean
language sql
stable security definer
set search_path to ''
as $$
  select exists (
    select 1 from public.esmeralda_staff_roles sr
    where sr.user_id = auth.uid() and sr.role = 'admin_maestro'
  );
$$;

-- 3) RPCs de acreditacion/PII: antes dependian del is_staff() generico
--    (cualquier rol, de cualquier tabla). Ahora exigen explicitamente
--    un rol con permiso de acreditacion, igual que verify_esmeralda_debater.
create or replace function public.get_esmeralda_debater_private(p_id uuid)
returns table(id uuid, first_name text, last_name text, full_name text, email text, phone text, grade text, role text, consent boolean, school_name text, district text, allergies text, medications text, id_number text, accreditation_status text, team_id uuid)
language sql
security definer
set search_path to ''
as $$
  select d.id,d.first_name,d.last_name,d.full_name,d.email,d.phone,d.grade,d.role,d.consent,d.school_name,d.district,d.allergies,d.medications,d.id_number,d.accreditation_status,d.team_id
  from public.esmeralda_debaters d
  where d.id=p_id
    and exists (select 1 from public.esmeralda_staff_roles r where r.user_id=auth.uid() and r.role in ('acreditacion','admin','admin_maestro','coordinador'))
  limit 1;
$$;

create or replace function public.get_esmeralda_accreditation_private(p_id uuid)
returns table(id uuid, first_name text, last_name text, phone text, school_name text, district text, allergies text, medications text, id_number text, role text, status text, event_id uuid)
language sql
security definer
set search_path to ''
as $$
  select a.id,a.first_name,a.last_name,a.phone,a.school_name,a.district,a.allergies,a.medications,a.id_number,a.role,a.status,a.event_id
  from public.esmeralda_accreditations a
  where a.id=p_id
    and exists (select 1 from public.esmeralda_staff_roles r where r.user_id=auth.uid() and r.role in ('acreditacion','admin','admin_maestro','coordinador'))
  limit 1;
$$;

create or replace function public.set_esmeralda_debater_accreditation(p_id uuid, p_status text)
returns boolean
language plpgsql
security definer
set search_path to ''
as $$
begin
  if p_status not in ('pending','accredited','rejected') then
    raise exception 'Estado de acreditación inválido';
  end if;
  if not exists (
    select 1 from public.esmeralda_staff_roles r
    where r.user_id = auth.uid() and r.role in ('acreditacion','admin','admin_maestro','coordinador')
  ) then
    raise exception 'No tienes permisos de acreditación';
  end if;
  update public.esmeralda_debaters
  set accreditation_status = p_status,
      accreditation_verified_at = case when p_status='accredited' then now() else accreditation_verified_at end,
      accreditation_verified_by = case when p_status='accredited' then auth.uid() else accreditation_verified_by end
  where id = p_id;
  if not found then return false; end if;
  insert into public.esmeralda_accreditation_log(debater_id,action,verified_by) values(p_id,p_status,auth.uid());
  return true;
end;
$$;

-- 4) verify_esmeralda_debater: bloquea la fila (FOR UPDATE) y evita
--    doble-acreditacion si dos personas escanean el mismo QR casi a la vez.
--    Coincide con la firma real ya desplegada (returns jsonb, columna
--    "action" en esmeralda_accreditation_log).
create or replace function public.verify_esmeralda_debater(p_debater_id uuid)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_status text;
  v_now timestamptz := now();
begin
  if auth.uid() is null then raise exception 'No autenticado'; end if;
  if not exists (
    select 1 from public.esmeralda_staff_roles r
    where r.user_id = auth.uid() and r.role in ('admin','admin_maestro','acreditacion','coordinador')
  ) then raise exception 'Sin permisos de acreditacion'; end if;

  select accreditation_status into v_status
  from public.esmeralda_debaters where id = p_debater_id for update;

  if v_status is null then raise exception 'Participante no encontrado'; end if;
  if v_status = 'accredited' then
    raise exception 'Este participante ya fue acreditado previamente.';
  end if;

  update public.esmeralda_debaters
  set accreditation_status='accredited',
      accreditation_verified_at=v_now,
      accreditation_verified_by=auth.uid()
  where id=p_debater_id
  returning accreditation_status into v_status;

  insert into public.esmeralda_accreditation_log(debater_id,action,verified_by,verified_at)
  values(p_debater_id,'accredited',auth.uid(),v_now);

  return jsonb_build_object('success',true,'status',v_status,'verified_at',v_now,'verified_by',auth.uid());
end;
$function$;

-- 5) get_esmeralda_public_debaters: antes mostraba tambien equipos "pending"
--    (aun no aprobados) en la vista publica de Participantes. Ahora exige
--    'approved', igual que get_esmeralda_public_debater (ficha individual).
create or replace function public.get_esmeralda_public_debaters(p_event_id uuid)
returns table(id uuid, full_name text, team_id uuid, team_name text)
language sql
stable security definer
set search_path to ''
as $$
  select
    d.id,
    coalesce(nullif(trim(concat_ws(' ', d.first_name, d.last_name)), ''), d.full_name) as full_name,
    d.team_id,
    t.team_name
  from public.esmeralda_debaters d
  join public.esmeralda_teams t on t.id = d.team_id
  where t.event_id = p_event_id
    and t.status = 'approved'
  order by t.team_name, coalesce(nullif(trim(concat_ws(' ', d.first_name, d.last_name)), ''), d.full_name);
$$;

-- 6) esmeralda_coaches: la politica anterior daba ALL a "cualquier fila
--    en esmeralda_staff_roles", sin filtrar por rol. Se restringe a
--    los roles que realmente gestionan equipos/coaches.
drop policy if exists esmeralda_coaches_staff_manage on public.esmeralda_coaches;
create policy esmeralda_coaches_staff_manage on public.esmeralda_coaches for all to authenticated
using (exists(select 1 from public.esmeralda_staff_roles r where r.user_id=auth.uid() and r.role in ('admin','admin_maestro','coordinador')))
with check (exists(select 1 from public.esmeralda_staff_roles r where r.user_id=auth.uid() and r.role in ('admin','admin_maestro','coordinador')));

-- 7) esmeralda_debaters: el INSERT publico (formulario de inscripcion)
--    no restringia el valor de accreditation_status. Un envio manipulado
--    por API podia autoasignarse "accredited" desde el registro.
drop policy if exists esmeralda_debaters_public_insert on public.esmeralda_debaters;
create policy esmeralda_debaters_public_insert on public.esmeralda_debaters for insert to anon, authenticated
with check (coalesce(accreditation_status,'pending') = 'pending' and accreditation_verified_by is null);

-- 8) Alinear el resto de politicas de esmeralda_* al modelo de roles en
--    español, y aplicar minimo privilegio (los jueces/evaluadores no
--    necesitan gestionar equipos, PII de debatientes ni registros).
drop policy if exists esmeralda_announcements_staff_manage on public.esmeralda_announcements;
create policy esmeralda_announcements_staff_manage on public.esmeralda_announcements for all to authenticated
using (exists(select 1 from public.esmeralda_staff_roles r where r.user_id=auth.uid() and r.role in ('admin','admin_maestro','coordinador')))
with check (exists(select 1 from public.esmeralda_staff_roles r where r.user_id=auth.uid() and r.role in ('admin','admin_maestro','coordinador')));

drop policy if exists esmeralda_staff_events_all on public.esmeralda_events;
create policy esmeralda_staff_events_all on public.esmeralda_events for all to authenticated
using (exists(select 1 from public.esmeralda_staff_roles r where r.user_id=auth.uid() and r.role in ('admin','admin_maestro','coordinador')))
with check (exists(select 1 from public.esmeralda_staff_roles r where r.user_id=auth.uid() and r.role in ('admin','admin_maestro','coordinador')));

drop policy if exists esmeralda_rounds_staff_manage on public.esmeralda_rounds;
create policy esmeralda_rounds_staff_manage on public.esmeralda_rounds for all to authenticated
using (exists(select 1 from public.esmeralda_staff_roles r where r.user_id=auth.uid() and r.role in ('admin','admin_maestro','coordinador')))
with check (exists(select 1 from public.esmeralda_staff_roles r where r.user_id=auth.uid() and r.role in ('admin','admin_maestro','coordinador')));

drop policy if exists esmeralda_matches_staff_manage on public.esmeralda_matches;
create policy esmeralda_matches_staff_manage on public.esmeralda_matches for all to authenticated
using (exists(select 1 from public.esmeralda_staff_roles r where r.user_id=auth.uid() and r.role in ('admin','admin_maestro','coordinador')))
with check (exists(select 1 from public.esmeralda_staff_roles r where r.user_id=auth.uid() and r.role in ('admin','admin_maestro','coordinador')));

drop policy if exists esmeralda_evaluators_staff_manage on public.esmeralda_evaluators;
create policy esmeralda_evaluators_staff_manage on public.esmeralda_evaluators for all to authenticated
using (exists(select 1 from public.esmeralda_staff_roles r where r.user_id=auth.uid() and r.role in ('admin','admin_maestro','coordinador')))
with check (exists(select 1 from public.esmeralda_staff_roles r where r.user_id=auth.uid() and r.role in ('admin','admin_maestro','coordinador')));

drop policy if exists esmeralda_staff_teams_all on public.esmeralda_teams;
create policy esmeralda_staff_teams_all on public.esmeralda_teams for all to authenticated
using (exists(select 1 from public.esmeralda_staff_roles r where r.user_id=auth.uid() and r.role in ('admin','admin_maestro','coordinador')))
with check (exists(select 1 from public.esmeralda_staff_roles r where r.user_id=auth.uid() and r.role in ('admin','admin_maestro','coordinador')));

drop policy if exists esmeralda_staff_debaters_all on public.esmeralda_debaters;
create policy esmeralda_staff_debaters_all on public.esmeralda_debaters for all to authenticated
using (exists(select 1 from public.esmeralda_staff_roles r where r.user_id=auth.uid() and r.role in ('admin','admin_maestro','coordinador')))
with check (exists(select 1 from public.esmeralda_staff_roles r where r.user_id=auth.uid() and r.role in ('admin','admin_maestro','coordinador')));

drop policy if exists esmeralda_staff_registrations_all on public.esmeralda_registrations;
create policy esmeralda_staff_registrations_all on public.esmeralda_registrations for all to authenticated
using (exists(select 1 from public.esmeralda_staff_roles r where r.user_id=auth.uid() and r.role in ('admin','admin_maestro','coordinador')))
with check (exists(select 1 from public.esmeralda_staff_roles r where r.user_id=auth.uid() and r.role in ('admin','admin_maestro','coordinador')));

-- Los jueces (evaluador) si necesitan gestionar las evaluaciones de rondas.
drop policy if exists esmeralda_match_evaluations_staff_manage on public.esmeralda_match_evaluations;
create policy esmeralda_match_evaluations_staff_manage on public.esmeralda_match_evaluations for all to authenticated
using (exists(select 1 from public.esmeralda_staff_roles r where r.user_id=auth.uid() and r.role in ('admin','admin_maestro','coordinador','evaluador')))
with check (exists(select 1 from public.esmeralda_staff_roles r where r.user_id=auth.uid() and r.role in ('admin','admin_maestro','coordinador','evaluador')));

drop policy if exists esmeralda_accreditation_log_staff_read on public.esmeralda_accreditation_log;
create policy esmeralda_accreditation_log_staff_read on public.esmeralda_accreditation_log for select to authenticated
using (verified_by = auth.uid() or exists(select 1 from public.esmeralda_staff_roles r where r.user_id=auth.uid() and r.role in ('admin','admin_maestro','acreditacion','coordinador')));

-- 9) Rol 'logistica': lectura operativa de equipos y participantes
--    (para el dia del evento), sin permisos de escritura ni de borrado.
drop policy if exists esmeralda_teams_logistica_read on public.esmeralda_teams;
create policy esmeralda_teams_logistica_read on public.esmeralda_teams for select to authenticated
using (exists(select 1 from public.esmeralda_staff_roles r where r.user_id=auth.uid() and r.role='logistica'));

drop policy if exists esmeralda_debaters_logistica_read on public.esmeralda_debaters;
create policy esmeralda_debaters_logistica_read on public.esmeralda_debaters for select to authenticated
using (exists(select 1 from public.esmeralda_staff_roles r where r.user_id=auth.uid() and r.role='logistica'));
