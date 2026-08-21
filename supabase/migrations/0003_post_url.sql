-- Une mise peut mettre en avant un post X : idéal pour pousser un produit,
-- un lancement ou un thread plutôt que le seul profil.

alter table public.bids    add column if not exists post_url text not null default '';
alter table public.pending add column if not exists post_url text not null default '';

-- settle_bid transporte désormais le post. Un handle qui remise sans post
-- garde celui qu'il avait déjà : on n'efface pas par omission.
create or replace function public.settle_bid(
  p_handle   text,
  p_display  text,
  p_tagline  text,
  p_amount   integer,
  p_post_url text default ''
)
returns public.bids
language plpgsql
security invoker
set search_path = ''
as $$
declare
  result public.bids;
begin
  insert into public.bids (handle, display_handle, tagline, amount, post_url, paid, created_at, updated_at)
  values (p_handle, p_display, p_tagline, p_amount, p_post_url, true, now(), now())
  on conflict (handle) do update
    set amount         = greatest(public.bids.amount, excluded.amount),
        display_handle = excluded.display_handle,
        tagline        = excluded.tagline,
        post_url       = case
                           when excluded.post_url <> '' then excluded.post_url
                           else public.bids.post_url
                         end,
        paid           = true,
        updated_at     = now()
  returning * into result;

  return result;
end;
$$;
