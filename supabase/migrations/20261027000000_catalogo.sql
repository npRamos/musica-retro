-- Música Retro · estructura inicial del catálogo
-- Aplicar sobre un proyecto Supabase vacío (supabase db push o SQL Editor).

-- ─── Extensiones y tipos ────────────────────────────────────────────────
create extension if not exists unaccent with schema extensions;

create type public.formato_disco as enum ('vinilo', 'cd');

-- Minúsculas, sin tildes, espacios colapsados. Espejo de normalizar() en src/lib/texto.js
create or replace function public.normalizar(t text)
returns text
language sql
stable
set search_path = ''
as $$
  select btrim(regexp_replace(lower(extensions.unaccent(coalesce(t, ''))), '\s+', ' ', 'g'))
$$;

-- ─── Tablas ─────────────────────────────────────────────────────────────
create table public.bandas (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nombre      text not null check (btrim(nombre) <> ''),
  nombre_norm text not null,
  imagen_path text,
  creado_en   timestamptz not null default now(),
  unique (owner_id, nombre_norm)
);

create table public.discos (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  banda_id    uuid not null references public.bandas (id) on delete restrict,
  titulo      text not null check (btrim(titulo) <> ''),
  titulo_norm text not null,
  formato     public.formato_disco not null,
  copias      integer not null default 1 check (copias >= 1),
  fecha_carga timestamptz not null default now(),
  spotify_url text check (spotify_url is null or spotify_url ~ '^https://open\.spotify\.com/'),
  tapa_path   text,
  unique (owner_id, banda_id, titulo_norm, formato)
);

create index discos_banda_id_idx on public.discos (banda_id);

-- ─── Normalización automática ───────────────────────────────────────────
create or replace function public.tg_bandas_normalizar()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.nombre := btrim(regexp_replace(new.nombre, '\s+', ' ', 'g'));
  new.nombre_norm := public.normalizar(new.nombre);
  return new;
end
$$;

create or replace function public.tg_discos_normalizar()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.titulo := btrim(regexp_replace(new.titulo, '\s+', ' ', 'g'));
  new.titulo_norm := public.normalizar(new.titulo);
  return new;
end
$$;

create trigger bandas_normalizar
  before insert or update of nombre on public.bandas
  for each row execute function public.tg_bandas_normalizar();

create trigger discos_normalizar
  before insert or update of titulo on public.discos
  for each row execute function public.tg_discos_normalizar();

-- ─── RLS: cada fila es solo de su dueña ─────────────────────────────────
alter table public.bandas enable row level security;
alter table public.discos enable row level security;

create policy bandas_de_la_duena on public.bandas
  for all to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy discos_de_la_duena on public.discos
  for all to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

revoke all on public.bandas, public.discos from anon;

-- ─── RPC ────────────────────────────────────────────────────────────────
-- Busca o crea la banda y agrega el disco. Si ya existe, no inserta y lo devuelve.
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
  if auth.uid() is null then
    raise exception 'Sesión requerida';
  end if;

  select * into v_banda
  from public.bandas
  where owner_id = auth.uid() and nombre_norm = public.normalizar(p_banda);

  if not found then
    insert into public.bandas (nombre) values (p_banda) returning * into v_banda;
    v_banda_nueva := true;
  end if;

  select * into v_disco
  from public.discos
  where owner_id = auth.uid()
    and banda_id = v_banda.id
    and titulo_norm = public.normalizar(p_titulo)
    and formato = p_formato;

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

create or replace function public.sumar_copia(p_disco uuid, p_cantidad integer default 1)
returns public.discos
language sql
security invoker
set search_path = ''
as $$
  update public.discos
  set copias = copias + greatest(coalesce(p_cantidad, 1), 1)
  where id = p_disco
  returning *;
$$;

-- Importación en una sola transacción. p_items: [{banda, titulo, formato, copias}]
create or replace function public.importar_discos(p_items jsonb, p_duplicados text default 'omitir')
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_item jsonb;
  v_res jsonb;
  v_copias integer;
  v_discos integer := 0;
  v_bandas integer := 0;
  v_sumadas integer := 0;
  v_omitidos integer := 0;
begin
  if p_duplicados not in ('omitir', 'sumar') then
    raise exception 'Opción de duplicados inválida: %', p_duplicados;
  end if;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_copias := greatest(coalesce((v_item ->> 'copias')::integer, 1), 1);
    v_res := public.agregar_disco(
      v_item ->> 'banda',
      v_item ->> 'titulo',
      (v_item ->> 'formato')::public.formato_disco,
      v_copias
    );

    if v_res ->> 'estado' = 'creado' then
      v_discos := v_discos + 1;
      if (v_res ->> 'banda_nueva')::boolean then
        v_bandas := v_bandas + 1;
      end if;
    elsif p_duplicados = 'sumar' then
      perform public.sumar_copia((v_res -> 'disco' ->> 'id')::uuid, v_copias);
      v_sumadas := v_sumadas + v_copias;
    else
      v_omitidos := v_omitidos + 1;
    end if;
  end loop;

  return jsonb_build_object(
    'discos_creados', v_discos,
    'bandas_creadas', v_bandas,
    'copias_sumadas', v_sumadas,
    'omitidos', v_omitidos
  );
end
$$;

-- Renombra si el nombre nuevo no choca con otra banda; si choca, devuelve la otra.
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
  select * into v_otra
  from public.bandas
  where owner_id = auth.uid() and nombre_norm = public.normalizar(p_nombre) and id <> p_banda;

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

-- Une origen en destino. Los discos repetidos suman copias. Devuelve imágenes huérfanas.
create or replace function public.fusionar_bandas(p_origen uuid, p_destino uuid)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_origen public.bandas;
  v_destino public.bandas;
  v_disco public.discos;
  v_choque public.discos;
  v_huerfanas text[] := '{}';
begin
  if p_origen = p_destino then
    raise exception 'No se puede unir una banda consigo misma';
  end if;

  select * into v_origen from public.bandas where id = p_origen;
  if not found then raise exception 'La banda de origen no existe'; end if;
  select * into v_destino from public.bandas where id = p_destino;
  if not found then raise exception 'La banda de destino no existe'; end if;

  for v_disco in select * from public.discos where banda_id = p_origen loop
    select * into v_choque
    from public.discos
    where banda_id = p_destino and titulo_norm = v_disco.titulo_norm and formato = v_disco.formato;

    if found then
      update public.discos
      set copias = copias + v_disco.copias,
          tapa_path = coalesce(tapa_path, v_disco.tapa_path),
          spotify_url = coalesce(spotify_url, v_disco.spotify_url)
      where id = v_choque.id;

      if v_choque.tapa_path is not null and v_disco.tapa_path is not null then
        v_huerfanas := v_huerfanas || v_disco.tapa_path;
      end if;

      delete from public.discos where id = v_disco.id;
    else
      update public.discos set banda_id = p_destino where id = v_disco.id;
    end if;
  end loop;

  if v_destino.imagen_path is null then
    update public.bandas set imagen_path = v_origen.imagen_path where id = p_destino;
  elsif v_origen.imagen_path is not null then
    v_huerfanas := v_huerfanas || v_origen.imagen_path;
  end if;

  delete from public.bandas where id = p_origen;

  return jsonb_build_object('estado', 'ok', 'banda_id', p_destino, 'huerfanas', to_jsonb(v_huerfanas));
end
$$;

-- Keep-alive: ejecuta SQL sin tocar datos. Es lo único accesible para anon.
create or replace function public.ping()
returns integer
language sql
security invoker
set search_path = ''
as $$
  select 1
$$;

revoke execute on function
  public.agregar_disco(text, text, public.formato_disco, integer),
  public.sumar_copia(uuid, integer),
  public.importar_discos(jsonb, text),
  public.renombrar_banda(uuid, text),
  public.fusionar_bandas(uuid, uuid),
  public.normalizar(text)
from public, anon;

grant execute on function
  public.agregar_disco(text, text, public.formato_disco, integer),
  public.sumar_copia(uuid, integer),
  public.importar_discos(jsonb, text),
  public.renombrar_banda(uuid, text),
  public.fusionar_bandas(uuid, uuid),
  public.normalizar(text)
to authenticated;

grant execute on function public.ping() to anon, authenticated;

-- ─── Storage: bucket privado de imágenes ────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('imagenes', 'imagenes', false, 1048576, array['image/webp', 'image/jpeg'])
on conflict (id) do nothing;

create policy imagenes_leer on storage.objects
  for select to authenticated
  using (bucket_id = 'imagenes' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy imagenes_subir on storage.objects
  for insert to authenticated
  with check (bucket_id = 'imagenes' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy imagenes_actualizar on storage.objects
  for update to authenticated
  using (bucket_id = 'imagenes' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'imagenes' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy imagenes_borrar on storage.objects
  for delete to authenticated
  using (bucket_id = 'imagenes' and (storage.foldername(name))[1] = (select auth.uid())::text);
