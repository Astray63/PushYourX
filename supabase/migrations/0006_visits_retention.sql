-- Rétention des visiteurs.
--
-- `visits` stocke un identifiant dérivé de l'IP : c'est de la donnée
-- personnelle, elle ne doit pas être conservée indéfiniment. Mais purger
-- la table ferait chuter le compteur public "visitors", qui la comptait
-- directement. On sépare donc les deux : l'agrégat vit à part et survit,
-- la donnée par visiteur ne reste que 30 jours.

create table if not exists public.counters (
  key   text   primary key,
  value bigint not null default 0
);

alter table public.counters enable row level security;

-- Amorçage : le total actuel devient la valeur de départ, rien n'est perdu.
insert into public.counters (key, value)
values ('visitors_total', (select count(*) from public.visits))
on conflict (key) do nothing;

-- Le total n'avance que pour un visiteur jamais vu.
create or replace function public.track_visit(p_visitor text)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  insert into public.visits (visitor, seen_at)
  values (p_visitor, now())
  on conflict (visitor) do nothing;

  if found then
    update public.counters set value = value + 1 where key = 'visitors_total';
  else
    update public.visits set seen_at = now() where visitor = p_visitor;
  end if;
end;
$$;

-- "visitors" se lit désormais dans le compteur, plus dans la table.
create or replace function public.board_stats()
returns json
language sql
stable
security invoker
set search_path = ''
as $$
  select json_build_object(
    'online',   (select count(*) from public.visits where seen_at > now() - interval '5 minutes'),
    'visitors', (select coalesce(max(value), 0) from public.counters where key = 'visitors_total'),
    'listed',   (select count(*) from public.bids where paid),
    'volume',   (select coalesce(sum(amount), 0) from public.bids where paid),
    'top',      (select coalesce(max(amount), 0) from public.bids where paid)
  );
$$;

create or replace function public.purge_visits()
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  removed integer;
begin
  delete from public.visits where seen_at < now() - interval '30 days';
  get diagnostics removed = row_count;
  return removed;
end;
$$;
