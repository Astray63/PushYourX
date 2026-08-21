-- L'aperçu est résolu à la création de la session, pas dans le webhook :
-- Stripe abandonne un webhook trop lent, et un oEmbed lent le ferait retenter.
alter table public.pending add column if not exists post_text   text not null default '';
alter table public.pending add column if not exists post_author text not null default '';
