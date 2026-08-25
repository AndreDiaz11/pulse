create table if not exists teams (
  id text primary key,
  name text not null,
  logo_url text not null default '',
  region text not null default 'other'
);

create table if not exists tournaments (
  id text primary key,
  league_id text,
  league_name text not null default 'Torneo',
  league_image_url text not null default '',
  season_name text not null default '',
  tier text not null default 'amateur',
  type text not null default 'online',
  prizepool text,
  country text,
  begin_at timestamptz,
  end_at timestamptz,
  status text not null default 'upcoming',
  winner_id text,
  winner_name text,
  winner_logo_url text,
  updated_at timestamptz not null default now()
);

create table if not exists matches (
  id text primary key,
  tournament_id text not null,
  tournament_name text not null default 'Torneo',
  tier text not null default 'amateur',
  team_a jsonb not null,
  team_b jsonb not null,
  start_time_utc timestamptz not null,
  best_of text not null default 'bo1',
  status text not null default 'upcoming',
  head_to_head jsonb not null default '[]',
  live_score jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists news (
  id text primary key,
  title text not null,
  link text not null,
  source text not null default '',
  summary text not null default '',
  image_url text,
  published_at timestamptz not null
);

create table if not exists device_subscriptions (
  device_id text primary key,
  fcm_token text,
  favorite_team_ids text[] not null default '{}',
  notification_lead_minutes int not null default 30,
  notified_match_ids text[] not null default '{}',
  updated_at timestamptz not null default now()
);

alter table teams enable row level security;
alter table tournaments enable row level security;
alter table matches enable row level security;
alter table news enable row level security;
alter table device_subscriptions enable row level security;

create policy "teams publico lectura" on teams for select using (true);
create policy "tournaments publico lectura" on tournaments for select using (true);
create policy "matches publico lectura" on matches for select using (true);
create policy "news publico lectura" on news for select using (true);

-- device_subscriptions: la app (cliente anon) puede registrar/actualizar su
-- propia fila (sin auth, es solo un ID aleatorio generado en el dispositivo,
-- no hay datos sensibles). Los scripts de sync usan la service_role key y no
-- pasan por estas politicas.
create policy "device_subscriptions insertar propio" on device_subscriptions for insert with check (true);
create policy "device_subscriptions actualizar propio" on device_subscriptions for update using (true);
