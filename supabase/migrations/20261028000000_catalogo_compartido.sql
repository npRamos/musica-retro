-- Música Retro · catálogo compartido entre miembros
-- Pasa de "cada cuenta ve lo suyo" a un único catálogo para las cuentas listadas en public.miembros.

-- ─── Miembros ───────────────────────────────────────────────────────────
create table public.miembros (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  agregado_en timestamptz not null default now()
);

alter table public.miembros enable row level security;
revoke all on public.miembros from anon, authenticated;

-- security definer: consulta miembros sin exponer la tabla ni recursión de RLS.
create or replace function public.es_miembro()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.miembros where user_id = auth.uid())
$$;

revoke execute on function public.es_miembro() from public, anon;
grant execute on function public.es_miembro() to authenticated;

-- ─── owner_id pasa a ser "quién lo cargó" ───────────────────────────────
drop policy if exists bandas_de_la_duena on public.bandas;
drop policy if exists discos_de_la_duena on public.discos;

alter table public.bandas rename column owner_id to cargado_por;
alter table public.discos rename column owner_id to cargado_por;

-- La unicidad ahora es del catálogo entero, no por cuenta.
alter table public.bandas drop constraint if exists bandas_owner_id_nombre_norm_key;
alter table public.bandas add constraint bandas_nombre_norm_key unique (nombre_norm);
alter table public.discos drop constraint if exists discos_owner_id_banda_id_titulo_norm_formato_key;
alter table public.discos add constraint discos_banda_titulo_formato_key unique (banda_id, titulo_norm, formato);

create policy bandas_de_miembros on public.bandas
  for all to authenticated
  using ((select public.es_miembro()))
  with check ((select public.es_miembro()));

create policy discos_de_miembros on public.discos
  for all to authenticated
  using ((select public.es_miembro()))
  with check ((select public.es_miembro()));

-- ─── RPC sin filtro por cuenta ──────────────────────────────────────────
create or replace function public.agregar_disco(
  p_banda text,
  p_titulo text,
  p_formato public.formato_disco,
  p_copias integer default 1
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_banda public.bandas;
  v_disco public.discos;
  v_banda_nueva boolean := false;
begin
  if not public.es_miembro() then
    raise exception 'Sin acceso al catálogo';
  end if;

  select * into v_banda from public.bandas where nombre_norm = public.normalizar(p_banda);

  if not found then
    insert into public.bandas (nombre) values (p_banda) returning * into v_banda;
    v_banda_nueva := true;
  end if;

  select * into v_disco
  from public.discos
  where banda_id = v_banda.id and titulo_norm = public.normalizar(p_titulo) and formato = p_formato;

  if found then
    return jsonb_build_object('estado', 'duplicado', 'disco', to_jsonb(v_disco), 'banda', to_jsonb(v_banda));
  end if;

  insert into public.discos (banda_id, titulo, formato, copias)
  values (v_banda.id, p_titulo, p_formato, greatest(coalesce(p_copias, 1), 1))
  returning * into v_disco;

  return jsonb_build_object(
    'estado', 'creado',
    'disco', to_jsonb(v_disco),
    'banda', to_jsonb(v_banda),
    'banda_nueva', v_banda_nueva
  );
end
$$;

create or replace function public.renombrar_banda(p_banda uuid, p_nombre text)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_otra public.bandas;
  v_banda public.bandas;
begin
  select * into v_otra from public.bandas where nombre_norm = public.normalizar(p_nombre) and id <> p_banda;

  if found then
    return jsonb_build_object('estado', 'conflicto', 'banda', to_jsonb(v_otra));
  end if;

  update public.bandas set nombre = p_nombre where id = p_banda returning * into v_banda;
  if not found then
    raise exception 'La banda no existe';
  end if;

  return jsonb_build_object('estado', 'ok', 'banda', to_jsonb(v_banda));
end
$$;

-- ─── Storage: las imágenes son de todo el catálogo ──────────────────────
drop policy if exists imagenes_leer on storage.objects;
drop policy if exists imagenes_subir on storage.objects;
drop policy if exists imagenes_actualizar on storage.objects;
drop policy if exists imagenes_borrar on storage.objects;

create policy imagenes_leer on storage.objects
  for select to authenticated
  using (bucket_id = 'imagenes' and (select public.es_miembro()));

create policy imagenes_subir on storage.objects
  for insert to authenticated
  with check (bucket_id = 'imagenes' and (select public.es_miembro()));

create policy imagenes_actualizar on storage.objects
  for update to authenticated
  using (bucket_id = 'imagenes' and (select public.es_miembro()))
  with check (bucket_id = 'imagenes' and (select public.es_miembro()));

create policy imagenes_borrar on storage.objects
  for delete to authenticated
  using (bucket_id = 'imagenes' and (select public.es_miembro()));

-- Para sumar miembros (después de invitarlos en Authentication → Users):
--   insert into public.miembros (user_id)
--   select id from auth.users where email in ('uno@ejemplo.com', 'otra@ejemplo.com');
