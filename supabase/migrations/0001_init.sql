-- Push Your X — schéma initial.
-- Tout l'accès passe par les routes serveur Next.js avec la service_role key,
-- donc RLS est activé partout SANS policy : rien n'est joignable depuis le client.

create table if not exists public.bids (
  id             bigint generated always as identity primary key,
  handle         text        not null unique,
  display_handle text        not null,
  tagline        text        not null default '',
  amount         integer     not null check (amount >= 0),
  clicks         integer     not null default 0,
  paid           boolean     not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- L'ordre du leaderboard : montant décroissant, puis la mise la plus ancienne devant.
create index if not exists bids_rank_idx
  on public.bids (amount desc, updated_at asc, id asc)
  where paid;

create table if not exists public.pending (
  id         uuid        primary key default gen_random_uuid(),
  handle     text        not null,
  display    text        not null default '',
  tagline    text        not null default '',
  amount     integer     not null check (amount >= 0),
  kind       text        not null default 'bid' check (kind in ('bid', 'takeover')),
  settled    boolean     not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.takeover (
  id         bigint      generated always as identity primary key,
  handle     text        not null,
  tagline    text        not null default '',
  amount     integer     not null check (amount >= 0),
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists takeover_expires_idx on public.takeover (expires_at desc);

create table if not exists public.clicks (
  id     bigint      generated always as identity primary key,
  bid_id bigint      not null references public.bids (id) on delete cascade,
  at     timestamptz not null default now()
);

create index if not exists clicks_at_idx on public.clicks (at desc);

create table if not exists public.visits (
  visitor text        primary key,
  seen_at timestamptz not null default now()
);

create index if not exists visits_seen_idx on public.visits (seen_at desc);

alter table public.bids     enable row level security;
alter table public.pending  enable row level security;
alter table public.takeover enable row level security;
alter table public.clicks   enable row level security;
alter table public.visits   enable row level security;
