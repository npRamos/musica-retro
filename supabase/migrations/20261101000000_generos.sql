-- Música Retro · géneros de las bandas (hasta 3, de MusicBrainz o escritos a mano)

-- generos_estado: 'pendiente' = nadie los revisó (aparece en "Completar géneros");
-- 'listo' = vinieron de MusicBrainz, se confirmaron o se editaron (puede quedar sin géneros).
-- La búsqueda automática solo actúa sobre bandas pendientes: nunca pisa una edición.
alter table public.bandas
  add column generos text[] not null default '{}'
    constraint bandas_generos_maximo check (cardinality(generos) <= 3),
  add column generos_estado text not null default 'pendiente'
    constraint bandas_generos_estado check (generos_estado in ('pendiente', 'listo'));

-- ─── Unir bandas: también los géneros ───────────────────────────────────
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

  -- Logo: el destino conserva el suyo o hereda el del origen; el que sobra queda huérfano.
  if v_destino.logo_path is null then
    update public.bandas
    set logo_path = v_origen.logo_path,
        logo_invertir = v_origen.logo_invertir,
        logo_buscado_en = coalesce(logo_buscado_en, v_origen.logo_buscado_en)
    where id = p_destino;
  elsif v_origen.logo_path is not null then
    v_huerfanas := v_huerfanas || v_origen.logo_path;
  end if;

  -- Géneros: el destino conserva los suyos si ya están revisados; si no, toma los revisados del origen.
  if v_destino.generos_estado = 'pendiente' and v_origen.generos_estado = 'listo' then
    update public.bandas
    set generos = v_origen.generos,
        generos_estado = v_origen.generos_estado
    where id = p_destino;
  end if;

  delete from public.bandas where id = p_origen;

  return jsonb_build_object('estado', 'ok', 'banda_id', p_destino, 'huerfanas', to_jsonb(v_huerfanas));
end
$$;
