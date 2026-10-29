-- Música Retro · importación de la planilla exportada: año, fecha de carga y Spotify por ítem

-- p_items: [{banda, titulo, formato, copias, anio, fecha_carga, spotify_url}]; los últimos tres son opcionales.
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
      if nullif(v_item ->> 'fecha_carga', '') is not null or nullif(v_item ->> 'spotify_url', '') is not null then
        update public.discos
        set fecha_carga = coalesce(nullif(v_item ->> 'fecha_carga', '')::timestamptz, fecha_carga),
            spotify_url = coalesce(nullif(v_item ->> 'spotify_url', ''), spotify_url)
        where id = (v_res -> 'disco' ->> 'id')::uuid;
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
