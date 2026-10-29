-- Música Retro · datos de MusicBrainz: año, lista de temas y enlaces a artista, disco y edición

-- ─── Columnas ───────────────────────────────────────────────────────────
alter table public.bandas add column mbid uuid;

alter table public.discos
  add column anio smallint check (anio between 1900 and 2100),
  add column temas jsonb,
  add column mb_release_group uuid,
  add column mb_release uuid,
  add column mb_estado text not null default 'pendiente'
    check (mb_estado in ('pendiente', 'enlazado', 'sin_coincidencia'));

-- ─── Normalización: comillas tipográficas de MusicBrainz = comillas rectas ─
-- Espejo de normalizar() en src/lib/texto.js
create or replace function public.normalizar(t text)
returns text
language sql
stable
set search_path = ''
as $$
  select btrim(regexp_replace(lower(extensions.unaccent(translate(coalesce(t, ''), '’‘“”', '''''""'))), '\s+', ' ', 'g'))
$$;

-- Recalcula las columnas *_norm existentes (los triggers se disparan con update of nombre/titulo).
update public.bandas set nombre = nombre;
update public.discos set titulo = titulo;

-- ─── Alta con datos opcionales ──────────────────────────────────────────
-- p_datos: {banda_mbid, anio, temas, mb_release_group, mb_release}. Todos opcionales.
drop function public.agregar_disco(text, text, public.formato_disco, integer);

create function public.agregar_disco(
  p_banda text,
  p_titulo text,
  p_formato public.formato_disco,
  p_copias integer default 1,
  p_datos jsonb default null
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
  v_banda_mbid uuid := (p_datos ->> 'banda_mbid')::uuid;
  v_release uuid := (p_datos ->> 'mb_release')::uuid;
begin
  if not public.es_miembro() then
    raise exception 'Sin acceso al catálogo';
  end if;

  select * into v_banda from public.bandas where nombre_norm = public.normalizar(p_banda);

  if not found then
    insert into public.bandas (nombre, mbid) values (p_banda, v_banda_mbid) returning * into v_banda;
    v_banda_nueva := true;
  elsif v_banda.mbid is null and v_banda_mbid is not null then
    update public.bandas set mbid = v_banda_mbid where id = v_banda.id returning * into v_banda;
  end if;

  select * into v_disco
  from public.discos
  where banda_id = v_banda.id and titulo_norm = public.normalizar(p_titulo) and formato = p_formato;

  if found then
    return jsonb_build_object('estado', 'duplicado', 'disco', to_jsonb(v_disco), 'banda', to_jsonb(v_banda));
  end if;

  insert into public.discos (banda_id, titulo, formato, copias, anio, temas, mb_release_group, mb_release, mb_estado)
  values (
    v_banda.id,
    p_titulo,
    p_formato,
    greatest(coalesce(p_copias, 1), 1),
    (p_datos ->> 'anio')::smallint,
    nullif(p_datos -> 'temas', 'null'::jsonb),
    (p_datos ->> 'mb_release_group')::uuid,
    v_release,
    case when v_release is null then 'pendiente' else 'enlazado' end
  )
  returning * into v_disco;

  return jsonb_build_object(
    'estado', 'creado',
    'disco', to_jsonb(v_disco),
    'banda', to_jsonb(v_banda),
    'banda_nueva', v_banda_nueva
  );
end
$$;

-- ─── Completar un disco existente ───────────────────────────────────────
-- No toca banda ni título. El año solo se reemplaza si viene uno.
create or replace function public.completar_disco(p_disco uuid, p_datos jsonb)
returns public.discos
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_disco public.discos;
  v_banda_mbid uuid := (p_datos ->> 'banda_mbid')::uuid;
begin
  update public.discos
  set anio = coalesce((p_datos ->> 'anio')::smallint, anio),
      temas = coalesce(nullif(p_datos -> 'temas', 'null'::jsonb), temas),
      mb_release_group = (p_datos ->> 'mb_release_group')::uuid,
      mb_release = (p_datos ->> 'mb_release')::uuid,
      mb_estado = 'enlazado'
  where id = p_disco
  returning * into v_disco;

  if not found then
    raise exception 'El disco no existe';
  end if;

  if v_banda_mbid is not null then
    update public.bandas set mbid = v_banda_mbid where id = v_disco.banda_id and mbid is null;
  end if;

  return v_disco;
end
$$;

-- ─── Unir bandas: conservar también los datos de MusicBrainz ────────────
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
          contratapa_path = coalesce(contratapa_path, v_disco.contratapa_path),
          spotify_url = coalesce(spotify_url, v_disco.spotify_url),
          anio = coalesce(anio, v_disco.anio),
          temas = coalesce(temas, v_disco.temas),
          mb_release_group = coalesce(mb_release_group, v_disco.mb_release_group),
          mb_release = coalesce(mb_release, v_disco.mb_release),
          mb_estado = case when mb_release is null and v_disco.mb_release is not null then v_disco.mb_estado else mb_estado end
      where id = v_choque.id;

      if v_choque.tapa_path is not null and v_disco.tapa_path is not null then
        v_huerfanas := v_huerfanas || v_disco.tapa_path;
      end if;
      if v_choque.contratapa_path is not null and v_disco.contratapa_path is not null then
        v_huerfanas := v_huerfanas || v_disco.contratapa_path;
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

  update public.bandas set mbid = coalesce(mbid, v_origen.mbid) where id = p_destino;

  delete from public.bandas where id = p_origen;

  return jsonb_build_object('estado', 'ok', 'banda_id', p_destino, 'huerfanas', to_jsonb(v_huerfanas));
end
$$;

-- ─── Permisos ───────────────────────────────────────────────────────────
revoke execute on function
  public.agregar_disco(text, text, public.formato_disco, integer, jsonb),
  public.completar_disco(uuid, jsonb)
from public, anon;

grant execute on function
  public.agregar_disco(text, text, public.formato_disco, integer, jsonb),
  public.completar_disco(uuid, jsonb)
to authenticated;
