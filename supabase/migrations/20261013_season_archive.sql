-- Archiwum zakończonych sezonów (tylko do odczytu w aplikacji).
-- Osobne tabele, żeby bieżący sezon (matches / match_statistics) nie mieszał się ze starymi danymi.
-- player_id bez FK i player_name zapisane na sztywno: część zawodników z archiwum nie ma już kont.

create table if not exists public.season_archive_matches (
  id uuid primary key,
  season text not null,
  date timestamptz not null,
  opponent text not null,
  location text,
  score text,
  video_url text,
  match_errors jsonb
);

create index if not exists season_archive_matches_season_idx on public.season_archive_matches (season, date);

create table if not exists public.season_archive_statistics (
  id uuid primary key,
  season text not null,
  match_id uuid not null references public.season_archive_matches (id) on delete cascade,
  player_id uuid,
  player_name text not null,
  serve_total integer,
  serve_errors integer,
  serve_aces integer,
  reception_total integer,
  reception_positive integer,
  reception_other integer,
  reception_errors integer,
  attack_total integer,
  attack_points integer,
  attack_unfinished integer,
  attack_errors integer,
  attack_blocked integer,
  block_total integer
);

create index if not exists season_archive_statistics_season_idx on public.season_archive_statistics (season);
create index if not exists season_archive_statistics_match_idx on public.season_archive_statistics (match_id);

alter table public.season_archive_matches enable row level security;
alter table public.season_archive_statistics enable row level security;

drop policy if exists "Anyone can read archived matches" on public.season_archive_matches;
create policy "Anyone can read archived matches" on public.season_archive_matches for select using (true);

drop policy if exists "Anyone can read archived statistics" on public.season_archive_statistics;
create policy "Anyone can read archived statistics" on public.season_archive_statistics for select using (true);
