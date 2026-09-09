-- TRD La Regional Esmeralda: acreditación por QR con login y rol
alter table public.esmeralda_debaters
  add column if not exists accreditation_status text not null default 'pending',
  add column if not exists accreditation_verified_at timestamptz,
  add column if not exists accreditation_verified_by uuid references auth.users(id);

create index if not exists idx_esmeralda_debaters_accreditation_status
  on public.esmeralda_debaters(accreditation_status);

create table if not exists public.esmeralda_accreditation_log (
  id uuid primary key default gen_random_uuid(),
  debater_id uuid not null references public.esmeralda_debaters(id) on delete cascade,
  status text not null,
  verified_by uuid not null references auth.users(id),
  verified_at timestamptz not null default now()
);

create index if not exists idx_esmeralda_accreditation_log_debater
  on public.esmeralda_accreditation_log(debater_id, verified_at desc);

create or replace function public.get_esmeralda_accreditation_staff(p_debater_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare result jsonb;
begin
  if not exists (select 1 from public.esmeralda_staff_roles r where r.user_id=(select auth.uid()) and r.role in ('acreditacion','admin','coordinador')) then
    raise exception 'No tienes permisos de acreditación';
  end if;
  select jsonb_build_object(
    'id',d.id,'full_name',d.full_name,'first_name',d.first_name,'last_name',d.last_name,
    'email',d.email,'phone',d.phone,'grade',d.grade,'role',d.role,
    'school_name',coalesce(d.school_name,t.school_name),'district',coalesce(d.district,t.district),
    'id_number',d.id_number,'allergies',d.allergies,'medications',d.medications,
    'team_id',d.team_id,'team_name',t.team_name,
    'accreditation_status',coalesce(d.accreditation_status,'pending'),
    'accreditation_verified_at',d.accreditation_verified_at,
    'accreditation_verified_by',d.accreditation_verified_by
  ) into result
  from public.esmeralda_debaters d left join public.esmeralda_teams t on t.id=d.team_id
  where d.id=p_debater_id;
  return result;
end;
$$;

create or replace function public.verify_esmeralda_debater(p_debater_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare actor uuid := (select auth.uid());
begin
  if actor is null then raise exception 'Debes iniciar sesión'; end if;
  if not exists (select 1 from public.esmeralda_staff_roles r where r.user_id=actor and r.role in ('acreditacion','admin','coordinador')) then
    raise exception 'No tienes permisos de acreditación';
  end if;
  update public.esmeralda_debaters
  set accreditation_status='accredited',accreditation_verified_at=now(),accreditation_verified_by=actor
  where id=p_debater_id;
  if not found then raise exception 'Participante no encontrado'; end if;
  insert into public.esmeralda_accreditation_log(debater_id,status,verified_by) values(p_debater_id,'accredited',actor);
  return true;
end;
$$;

revoke execute on function public.get_esmeralda_accreditation_staff(uuid) from public,anon;
revoke execute on function public.verify_esmeralda_debater(uuid) from public,anon;
grant execute on function public.get_esmeralda_accreditation_staff(uuid) to authenticated;
grant execute on function public.verify_esmeralda_debater(uuid) to authenticated;

alter table public.esmeralda_accreditation_log enable row level security;
create policy "accreditation staff can read verification log"
on public.esmeralda_accreditation_log for select to authenticated
using (verified_by=(select auth.uid()) or exists(select 1 from public.esmeralda_staff_roles r where r.user_id=(select auth.uid()) and r.role in ('admin','coordinador')));