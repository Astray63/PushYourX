-- Opérations qui doivent être atomiques ou agrégées côté base.
-- search_path figé : sans ça l'advisor sécurité de Supabase remonte un warning.

-- Encaisse une mise. Une remise ne peut jamais faire baisser un montant déjà payé.
create or replace function public.settle_bid(
  p_handle  text,
  p_display text,
  p_tagline text,
  p_amount  integer
)
returns public.bids
language plpgsql
security invoker
set search_path = ''
as $$
declare
  result public.bids;
begin
  insert into public.bids (handle, display_handle, tagline, amount, paid, created_at, updated_at)
  values (p_handle, p_display, p_tagline, p_amount, true, now(), now())
  on conflict (handle) do update
    set amount         = greatest(public.bids.amount, excluded.amount),
        display_handle = excluded.display_handle,
        tagline        = excluded.tagline,
        paid           = true,
        updated_at     = now()
  returning * into result;

  return result;
end;
$$;

-- Achète la bannière pour p_hours heures.
create or replace function public.settle_takeover(
  p_handle  text,
  p_tagline text,
  p_amount  integer,
  p_hours   integer
)
returns public.takeover
language plpgsql
security invoker
set search_path = ''
as $$
declare
  result public.takeover;
begin
  insert into public.takeover (handle, tagline, amount, expires_at)
  values (p_handle, p_tagline, p_amount, now() + make_interval(hours => p_hours))
  returning * into result;

  return result;
end;
$$;

-- Un clic : compteur dénormalisé + ligne horodatée pour le trending.
create or replace function public.track_click(p_id bigint)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  update public.bids set clicks = clicks + 1 where id = p_id and paid;
  if found then
    insert into public.clicks (bid_id) values (p_id);
  end if;
end;
$$;

create or replace function public.track_visit(p_visitor text)
returns void
language sql
security invoker
set search_path = ''
as $$
  insert into public.visits (visitor, seen_at)
  values (p_visitor, now())
  on conflict (visitor) do update set seen_at = now();
$$;

-- Tout ce que le header et les cartes de stats affichent, en un aller-retour.
create or replace function public.board_stats()
returns json
language sql
stable
security invoker
set search_path = ''
as $$
  select json_build_object(
    'online',   (select count(*) from public.visits where seen_at > now() - interval '5 minutes'),
    'visitors', (select count(*) from public.visits),
    'listed',   (select count(*) from public.bids where paid),
    'volume',   (select coalesce(sum(amount), 0) from public.bids where paid),
    'top',      (select coalesce(max(amount), 0) from public.bids where paid)
  );
$$;

-- Les handles les plus cliqués sur la dernière heure.
create or replace function public.board_trending(p_limit integer default 5)
returns table (
  id             bigint,
  display_handle text,
  amount         integer,
  hits           bigint
)
language sql
stable
security invoker
set search_path = ''
as $$
  select b.id, b.display_handle, b.amount, count(c.id) as hits
    from public.clicks c
    join public.bids b on b.id = c.bid_id and b.paid
   where c.at > now() - interval '1 hour'
   group by b.id, b.display_handle, b.amount
   order by hits desc, b.amount desc
   limit p_limit;
$$;

-- Combien de handles payés sont au-dessus de ce montant (rang qu'il achèterait).
create or replace function public.rank_for_amount(
  p_amount integer,
  p_ignore text default ''
)
returns integer
language sql
stable
security invoker
set search_path = ''
as $$
  select (count(*) + 1)::integer
    from public.bids
   where paid and amount >= p_amount and handle <> p_ignore;
$$;
