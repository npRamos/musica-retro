-- Música Retro · máximo de géneros por banda configurable (1 a 5, 3 por defecto), igual para todo el catálogo

-- ─── Ajustes del catálogo: una sola fila ────────────────────────────────
create table public.ajustes_catalogo (
  id             boolean primary key default true check (id),
  maximo_generos integer not null default 3 check (maximo_generos between 1 and 5)
);

insert into public.ajustes_catalogo default values;

alter table public.ajustes_catalogo enable row level security;
revoke all on public.ajustes_catalogo from anon, authenticated;
-- Sin insert ni delete desde la app: la fila es esta.
grant select, update on public.ajustes_catalogo to authenticated;

create policy ajustes_leer on public.ajustes_catalogo
  for select to authenticated
  using ((select public.es_miembro()));

create policy ajustes_cambiar on public.ajustes_catalogo
  for update to authenticated
  using ((select public.es_miembro()))
  with check ((select public.es_miembro()));

-- ─── Géneros: la base solo garantiza el tope del rango ──────────────────
-- El máximo elegido lo controla la app: bajarlo no obliga a quitar géneros a las bandas que ya tienen más.
alter table public.bandas drop constraint bandas_generos_maximo;
alter table public.bandas add constraint bandas_generos_maximo check (cardinality(generos) <= 5);
