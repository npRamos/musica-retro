-- Música Retro · estado de los discos y lista de deseados

-- ─── Estado del disco ───────────────────────────────────────────────────
-- Qué etiqueta corresponde a cada formato lo controla la app (src/lib/estado.js).
alter table public.discos
  add column estado text[] not null default '{}'
    constraint discos_estado_valores check (estado <@ array['rayado', 'muy_rayado', 'caja_rota', 'sin_caja', 'tapa_rota', 'necesita_funda']::text[])
    constraint discos_estado_rayado check (not (estado @> array['rayado', 'muy_rayado']::text[])),
  add column observacion text;

-- ─── Lista de deseados ──────────────────────────────────────────────────
-- formato null: cualquiera. Compartida entre los miembros, como el catálogo.
create table public.deseados (
  id               uuid primary key default gen_random_uuid(),
  banda_id         uuid not null references public.bandas (id) on delete restrict,
  titulo           text not null check (btrim(titulo) <> ''),
  titulo_norm      text not null,
  formato          public.formato_disco,
  anio             integer check (anio between 1900 and 2100),
  mb_release_group uuid,
  creado_en       timestamptz not null default now(),
  constraint deseados_banda_titulo_formato_key unique (banda_id, titulo_norm, formato)
);

-- Una unique común trata cada null como distinto: los que no tienen formato necesitan la suya.
create unique index deseados_sin_formato_key on public.deseados (banda_id, titulo_norm) where formato is null;

create trigger deseados_normalizar
  before insert or update of titulo on public.deseados
  for each row execute function public.tg_discos_normalizar();

alter table public.deseados enable row level security;
revoke all on public.deseados from anon, authenticated;
grant select, insert, update, delete on public.deseados to authenticated;

create policy deseados_de_miembros on public.deseados
  for all to authenticated
  using ((select public.es_miembro()))
  with check ((select public.es_miembro()));

-- Al tener el disco (alta, importación o edición), el deseado que coincide se resuelve solo.
create or replace function public.tg_discos_resolver_deseados()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  delete from public.deseados
  where banda_id = new.banda_id
    and titulo_norm = new.titulo_norm
    and (formato is null or formato = new.formato);
  return null;
end
$$;

create trigger discos_resolver_deseados
  after insert or update of banda_id, titulo, formato on public.discos
  for each row execute function public.tg_discos_resolver_deseados();

-- ─── Unir bandas: también el estado y los deseados ──────────────────────
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
  v_etiquetas text[];
  v_huerfanas text[] := '{}';
begin
  if p_origen = p_destino then
    raise exception 'No se puede unir una banda consigo misma';
  end if;

  select * into v_origen from public.bandas where id = p_origen;
  if not found then raise exception 'La banda de origen no existe'; end if;
  select * into v_destino from public.bandas where id = p_destino;
  if not found then raise exception 'La banda de destino no existe'; end if;

  -- Deseados: los que ya están en el destino no se repiten; el resto pasa al destino.
  delete from public.deseados o
  using public.deseados d
  where o.banda_id = p_origen
    and d.banda_id = p_destino
    and d.titulo_norm = o.titulo_norm
    and d.formato is not distinct from o.formato;
  update public.deseados set banda_id = p_destino where banda_id = p_origen;

  for v_disco in select * from public.discos where banda_id = p_origen loop
    select * into v_choque
    from public.discos
    where banda_id = p_destino and titulo_norm = v_disco.titulo_norm and formato = v_disco.formato;

    if found then
      -- Estado: las etiquetas de los dos, con "muy rayado" en lugar de "rayado".
      v_etiquetas := v_choque.estado || v_disco.estado;
      if 'muy_rayado' = any(v_etiquetas) then
        v_etiquetas := array_remove(v_etiquetas, 'rayado');
      end if;

      update public.discos
      set copias = copias + v_disco.copias,
          tapa_path = coalesce(tapa_path, v_disco.tapa_path),
          contratapa_path = coalesce(contratapa_path, v_disco.contratapa_path),
          spotify_url = coalesce(spotify_url, v_disco.spotify_url),
          anio = coalesce(anio, v_disco.anio),
          temas = coalesce(temas, v_disco.temas),
          mb_release_group = coalesce(mb_release_group, v_disco.mb_release_group),
          mb_release = coalesce(mb_release, v_disco.mb_release),
          mb_estado = case when mb_release is null and v_disco.mb_release is not null then v_disco.mb_estado else mb_estado end,
          estado = (select coalesce(array_agg(distinct e), '{}') from unnest(v_etiquetas) as e),
          observacion = case
            when observacion is not null and v_disco.observacion is not null and observacion <> v_disco.observacion
              then observacion || ' · ' || v_disco.observacion
            else coalesce(observacion, v_disco.observacion)
          end
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

  -- Si el disco ya estaba en el destino, nadie lo tocó y el trigger no se disparó: se resuelve acá.
  delete from public.deseados d
  using public.discos x
  where d.banda_id = p_destino
    and x.banda_id = p_destino
    and x.titulo_norm = d.titulo_norm
    and (d.formato is null or d.formato = x.formato);

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

-- ─── Importar: también el estado y la observación ───────────────────────
-- p_items: [{banda, titulo, formato, copias, anio, fecha_carga, spotify_url, estado, observacion}]; los últimos cinco son opcionales.
-- Solo se escriben en los discos creados: "sumar como copias" no toca los datos del disco existente.
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
      v_copias,
      jsonb_build_object('anio', v_item -> 'anio')
    );

    if v_res ->> 'estado' = 'creado' then
      v_discos := v_discos + 1;
      if (v_res ->> 'banda_nueva')::boolean then
        v_bandas := v_bandas + 1;
      end if;
      update public.discos
      set fecha_carga = coalesce(nullif(v_item ->> 'fecha_carga', '')::timestamptz, fecha_carga),
          spotify_url = coalesce(nullif(v_item ->> 'spotify_url', ''), spotify_url),
          estado = case
            when jsonb_typeof(v_item -> 'estado') = 'array'
              then array(select jsonb_array_elements_text(v_item -> 'estado'))
            else estado
          end,
          observacion = coalesce(nullif(v_item ->> 'observacion', ''), observacion)
      where id = (v_res -> 'disco' ->> 'id')::uuid;
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
