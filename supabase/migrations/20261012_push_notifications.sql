-- Powiadomienia push (PWA)
-- Wysyłką zajmuje się funkcja Edge `send-push`. Baza: subskrypcje, log wysłanych,
-- triggery (nowe wideo / pierwsze statystyki meczu) i cron z przypomnieniami.
--
-- Wymagane sekrety w Vault (tworzone osobno, NIE w tym pliku):
--   push_function_url  = https://<ref>.supabase.co/functions/v1/send-push
--   push_cron_secret   = ten sam sekret co PUSH_CRON_SECRET w funkcji

create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron;

-- Subskrypcje urządzeń. Zapis/usuwanie tylko przez funkcję (service role),
-- zawodnik może jedynie odczytać swoje.
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.profiles(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now()
);

alter table public.push_subscriptions enable row level security;

drop policy if exists "Players read own push subscriptions" on public.push_subscriptions;
create policy "Players read own push subscriptions" on public.push_subscriptions
  for select using (auth.uid() = player_id);

-- Log wysłanych powiadomień: chroni przed podwójną wysyłką (np. dwa uruchomienia crona)
create table if not exists public.notification_log (
  id uuid primary key default gen_random_uuid(),
  kind text not null,          -- match_week | day_before | three_hours | video | stats
  ref_id uuid not null,        -- id meczu lub wydarzenia
  player_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (kind, ref_id, player_id)
);

alter table public.notification_log enable row level security;
-- brak polityk = dostęp tylko dla service role

-- Wywołanie funkcji Edge z bazy (asynchronicznie przez pg_net)
create or replace function public.notify_push(payload jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  fn_url text;
  fn_secret text;
begin
  select decrypted_secret into fn_url from vault.decrypted_secrets where name = 'push_function_url';
  select decrypted_secret into fn_secret from vault.decrypted_secrets where name = 'push_cron_secret';
  if fn_url is null or fn_secret is null then
    return;
  end if;

  perform net.http_post(
    url := fn_url,
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron-secret', fn_secret),
    body := payload
  );
end;
$$;

revoke all on function public.notify_push(jsonb) from public, anon, authenticated;

-- Nowe wideo meczu (puste -> link)
create or replace function public.trg_match_video_push()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(new.video_url, '') <> ''
     and (tg_op = 'INSERT' or coalesce(old.video_url, '') = '') then
    perform public.notify_push(jsonb_build_object('mode', 'video', 'match_id', new.id));
  end if;
  return new;
end;
$$;

drop trigger if exists match_video_push on public.matches;
create trigger match_video_push
  after insert or update of video_url on public.matches
  for each row execute function public.trg_match_video_push();

-- Statystyki meczu (funkcja wysyła tylko raz na mecz dzięki notification_log)
create or replace function public.trg_match_stats_push()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  m uuid;
begin
  for m in select distinct match_id from new_rows loop
    perform public.notify_push(jsonb_build_object('mode', 'stats', 'match_id', m));
  end loop;
  return null;
end;
$$;

drop trigger if exists match_stats_push on public.match_statistics;
create trigger match_stats_push
  after insert on public.match_statistics
  referencing new table as new_rows
  for each statement execute function public.trg_match_stats_push();

-- Przypomnienia co 15 minut
select cron.unschedule('witamed-push-reminders')
where exists (select 1 from cron.job where jobname = 'witamed-push-reminders');

select cron.schedule(
  'witamed-push-reminders',
  '*/15 * * * *',
  $$select public.notify_push('{"mode":"reminders"}'::jsonb)$$
);
