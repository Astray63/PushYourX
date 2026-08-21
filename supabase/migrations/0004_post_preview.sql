-- Le post mis en avant s'affiche en aperçu plutôt qu'en simple lien.
-- Le texte est récupéré une seule fois via l'oEmbed public de X, au moment
-- où la mise est encaissée, donc jamais à l'affichage.

alter table public.bids add column if not exists post_text   text not null default '';
alter table public.bids add column if not exists post_author text not null default '';

create or replace function public.settle_bid(
  p_handle      text,
  p_display     text,
  p_tagline     text,
  p_amount      integer,
  p_post_url    text default '',
  p_post_text   text default '',
  p_post_author text default ''
)
returns public.bids
language plpgsql
security invoker
set search_path = ''
as $$
declare
  result public.bids;
begin
  insert into public.bids (handle, display_handle, tagline, amount,
                           post_url, post_text, post_author, paid, created_at, updated_at)
  values (p_handle, p_display, p_tagline, p_amount,
          p_post_url, p_post_text, p_post_author, true, now(), now())
  on conflict (handle) do update
    set amount         = greatest(public.bids.amount, excluded.amount),
        display_handle = excluded.display_handle,
        tagline        = excluded.tagline,
        -- Remiser sans redonner de lien conserve le post déjà attaché.
        post_url       = case when excluded.post_url <> '' then excluded.post_url
                              else public.bids.post_url end,
        post_text      = case when excluded.post_url <> '' then excluded.post_text
                              else public.bids.post_text end,
        post_author    = case when excluded.post_url <> '' then excluded.post_author
                              else public.bids.post_author end,
        paid           = true,
        updated_at     = now()
  returning * into result;

  return result;
end;
$$;
