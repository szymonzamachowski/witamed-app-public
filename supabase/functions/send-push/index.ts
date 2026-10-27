// Witamed — wysyłka powiadomień push (Supabase Edge Function)
//
// Tryby (body.mode):
//   reminders            — z crona: przypomnienia o meczach (tydzień przed) i treningach/sparingach
//                          (dzień przed o 18:00 czasu PL oraz 3h przed)       [nagłówek x-cron-secret]
//   video  {match_id}    — z triggera: nowe wideo meczu                       [x-cron-secret]
//   stats  {match_id}    — z triggera: statystyki meczu (raz na mecz)         [x-cron-secret]
//   subscribe {subscription, userAgent} — zapis urządzenia zalogowanego zawodnika [JWT]
//   unsubscribe {endpoint}              — usunięcie urządzenia                     [JWT]
//   test                                — powiadomienie testowe do siebie           [JWT]

import { createClient } from 'npm:@supabase/supabase-js@2.80.0'
import webpush from 'npm:web-push@3.6.7'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const CRON_SECRET = Deno.env.get('PUSH_CRON_SECRET')!
const APP_URL = 'https://your-app.vercel.app'

webpush.setVapidDetails(APP_URL, Deno.env.get('VAPID_PUBLIC_KEY')!, Deno.env.get('VAPID_PRIVATE_KEY')!)

const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

type Payload = { title: string; body: string; url: string; tag: string }
type Sub = { id: string; player_id: string; endpoint: string; p256dh: string; auth: string }
type Kind = 'match_week' | 'day_before' | 'three_hours' | 'video' | 'stats'

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })

// ---------- Czas polski ----------
const TZ = 'Europe/Warsaw'

/** Przesunięcie strefy Warszawy względem UTC (w minutach) w danym momencie. */
function warsawOffset(date: Date): number {
  const name = new Intl.DateTimeFormat('en-US', { timeZone: TZ, timeZoneName: 'shortOffset' })
    .formatToParts(date)
    .find(p => p.type === 'timeZoneName')?.value ?? 'GMT+1'
  const m = name.match(/GMT([+-]\d+)(?::(\d+))?/)
  return m ? Number(m[1]) * 60 + Math.sign(Number(m[1])) * Number(m[2] ?? 0) : 60
}

/** Dzień przed wydarzeniem, godz. 18:00 czasu polskiego. */
function dayBefore18(start: Date): Date {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' })
      .formatToParts(start)
      .map(p => [p.type, p.value])
  )
  const guess = new Date(Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day) - 1, 18, 0))
  return new Date(guess.getTime() - warsawOffset(guess) * 60_000)
}

const fmtTime = (d: Date) => d.toLocaleTimeString('pl-PL', { timeZone: TZ, hour: '2-digit', minute: '2-digit' })
const fmtDay = (d: Date) =>
  d.toLocaleDateString('pl-PL', { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long' })

// ---------- Wysyłka ----------
async function subscriptionsFor(playerIds?: string[]): Promise<Sub[]> {
  let query = db.from('push_subscriptions').select('id, player_id, endpoint, p256dh, auth')
  if (playerIds) query = query.in('player_id', playerIds.length ? playerIds : ['00000000-0000-0000-0000-000000000000'])
  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

async function sendTo(subs: Sub[], payload: Payload) {
  let sent = 0
  await Promise.all(
    subs.map(async sub => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify(payload),
          { TTL: 60 * 60 * 12 }
        )
        sent++
      } catch (e) {
        const status = (e as { statusCode?: number }).statusCode
        if (status === 404 || status === 410) {
          await db.from('push_subscriptions').delete().eq('id', sub.id) // urządzenie wyrejestrowane
        } else {
          console.error('Push error', status, (e as Error).message)
        }
      }
    })
  )
  return sent
}

/** Zapisuje w logu i zwraca tylko tych zawodników, którzy jeszcze tego nie dostali. */
async function claim(kind: Kind, refId: string, playerIds: string[]): Promise<string[]> {
  if (!playerIds.length) return []
  const { data, error } = await db
    .from('notification_log')
    .upsert(playerIds.map(player_id => ({ kind, ref_id: refId, player_id })), {
      onConflict: 'kind,ref_id,player_id',
      ignoreDuplicates: true,
    })
    .select('player_id')
  if (error) throw error
  return (data ?? []).map(r => r.player_id)
}

/** Wysyła różne treści zależnie od zawodnika; log zapisuje przed wysyłką. */
async function notifyPlayers(kind: Kind, refId: string, playerIds: string[], payloadFor: (playerId: string) => Payload) {
  const subs = await subscriptionsFor(playerIds)
  const withDevice = [...new Set(subs.map(s => s.player_id))]
  const claimed = await claim(kind, refId, withDevice)
  let sent = 0
  for (const playerId of claimed) {
    sent += await sendTo(subs.filter(s => s.player_id === playerId), payloadFor(playerId))
  }
  return sent
}

// ---------- Przypomnienia ----------
type Item = {
  id: string
  isMatch: boolean
  label: string
  title: string
  start: Date
  location: string
  tab: 'training' | 'sparing' | 'match'
}

async function statusesFor(item: Item): Promise<Map<string, string>> {
  const { data } = await db
    .from('attendance')
    .select('player_id, status')
    .eq(item.isMatch ? 'match_id' : 'event_id', item.id)
  return new Map((data ?? []).map(a => [a.player_id, a.status]))
}

async function runReminders() {
  const now = new Date()
  const horizon = new Date(now.getTime() + 8 * 24 * 3600_000).toISOString()
  const [{ data: matches }, { data: events }, { data: players }] = await Promise.all([
    db.from('matches').select('id, opponent, date, location, score').gt('date', now.toISOString()).lte('date', horizon),
    db.from('events').select('id, title, date, location, type').gt('date', now.toISOString()).lte('date', horizon),
    // Kontuzjowani nie dostają przypomnień; sztab dostaje, choć się nie zaznacza
    db.from('profiles').select('id, training_only, player_status').neq('player_status', 'injured'),
  ])
  const allPlayers = (players ?? []).map(p => p.id)
  const staff = new Set((players ?? []).filter(p => p.player_status === 'staff').map(p => p.id))
  // Zawodnicy „tylko treningi” nie dostają nic o meczach ligowych
  const matchPlayers = (players ?? []).filter(p => !p.training_only).map(p => p.id)

  const items: Item[] = [
    ...(matches ?? [])
      .filter(m => !m.score)
      .map(m => ({ id: m.id, isMatch: true, label: 'Mecz', title: `vs ${m.opponent}`, start: new Date(m.date), location: m.location ?? '', tab: 'match' as const })),
    ...(events ?? [])
      .filter(e => e.type !== 'match')
      .map(e => ({
        id: e.id,
        isMatch: false,
        label: e.type === 'training' ? 'Trening' : 'Sparing',
        title: e.title,
        start: new Date(e.date),
        location: e.location ?? '',
        tab: e.type === 'training' ? ('training' as const) : ('sparing' as const),
      })),
  ]

  let sent = 0
  for (const item of items) {
    // Sztab traktujemy jak zapisanych na „Będę” (bez próśb o zaznaczenie obecności)
    const statusesWithStaff = async () => {
      const statuses = await statusesFor(item)
      staff.forEach(id => statuses.set(id, 'present'))
      return statuses
    }
    const url = `/attendance?tab=${item.tab}&focus=${item.id}`
    const when = `${fmtDay(item.start)}, ${fmtTime(item.start)}`
    const place = item.location ? ` · ${item.location}` : ''
    const threeHours = new Date(item.start.getTime() - 3 * 3600_000)
    const audience = item.isMatch ? matchPlayers : allPlayers

    if (item.isMatch) {
      // Mecz: tydzień przed
      const weekBefore = new Date(item.start.getTime() - 7 * 24 * 3600_000)
      if (now >= weekBefore) {
        const statuses = await statusesWithStaff()
        const recipients = audience.filter(id => statuses.get(id) !== 'absent')
        sent += await notifyPlayers('match_week', item.id, recipients, id => ({
          title: `Mecz ${item.title} — ${fmtDay(item.start)}`,
          body:
            statuses.get(id) === 'present'
              ? `${fmtTime(item.start)}${place}. Widzimy się!`
              : `${fmtTime(item.start)}${place}. Będziesz? Zaznacz obecność.`,
          url,
          tag: `match-${item.id}`,
        }))
      }
      continue
    }

    // Trening / sparing: dzień przed o 18:00 (jeśli to jeszcze przed oknem „3h przed”)
    if (now >= dayBefore18(item.start) && now < threeHours) {
      const statuses = await statusesWithStaff()
      const recipients = audience.filter(id => statuses.get(id) !== 'absent')
      sent += await notifyPlayers('day_before', item.id, recipients, id => ({
        title: `Jutro ${item.label.toLowerCase()} o ${fmtTime(item.start)}`,
        body:
          statuses.get(id) === 'present'
            ? `${item.title}${place}. Do zobaczenia!`
            : `${item.title}${place}. Będziesz? Zaznacz obecność.`,
        url,
        tag: `event-${item.id}`,
      }))
    }

    // 3h przed: tylko zapisani na „Będę”
    if (now >= threeHours) {
      const statuses = await statusesWithStaff()
      const recipients = audience.filter(id => statuses.get(id) === 'present')
      sent += await notifyPlayers('three_hours', item.id, recipients, () => ({
        title: `Dziś ${item.label.toLowerCase()} o ${fmtTime(item.start)}`,
        body: `${item.title}${place}`,
        url,
        tag: `event-${item.id}`,
      }))
    }
  }
  return sent
}

async function runMatchNews(kind: 'video' | 'stats', matchId: string) {
  const { data: match } = await db.from('matches').select('id, opponent').eq('id', matchId).single()
  if (!match) return 0
  const { data: players } = await db.from('profiles').select('id').eq('training_only', false)
  const payload: Payload =
    kind === 'video'
      ? { title: `📹 Wideo z meczu vs ${match.opponent}`, body: 'Nagranie jest już dostępne.', url: `/matches/${match.id}`, tag: `video-${match.id}` }
      : { title: `📊 Statystyki z meczu vs ${match.opponent}`, body: 'Sprawdź swoje liczby.', url: `/matches/${match.id}`, tag: `stats-${match.id}` }
  return notifyPlayers(kind, match.id, (players ?? []).map(p => p.id), () => payload)
}

// ---------- Obsługa żądań ----------
Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid JSON' }, 400)
  }
  const mode = String(body.mode ?? '')

  try {
    // Tryby systemowe (cron / triggery)
    if (mode === 'reminders' || mode === 'video' || mode === 'stats') {
      if (!CRON_SECRET || req.headers.get('x-cron-secret') !== CRON_SECRET) return json({ error: 'Unauthorized' }, 401)
      if (mode === 'reminders') return json({ sent: await runReminders() })
      if (typeof body.match_id !== 'string') return json({ error: 'match_id required' }, 400)
      return json({ sent: await runMatchNews(mode, body.match_id) })
    }

    // Tryby zawodnika (zalogowany użytkownik)
    const token = req.headers.get('Authorization')?.replace('Bearer ', '')
    const { data: auth } = token ? await db.auth.getUser(token) : { data: { user: null } }
    const user = auth?.user
    if (!user) return json({ error: 'Unauthorized' }, 401)

    if (mode === 'subscribe') {
      const sub = body.subscription as { endpoint?: string; keys?: { p256dh?: string; auth?: string } } | undefined
      if (!sub?.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) return json({ error: 'Invalid subscription' }, 400)
      const { error } = await db.from('push_subscriptions').upsert(
        {
          player_id: user.id,
          endpoint: sub.endpoint,
          p256dh: sub.keys.p256dh,
          auth: sub.keys.auth,
          user_agent: typeof body.userAgent === 'string' ? body.userAgent.slice(0, 300) : null,
        },
        { onConflict: 'endpoint' }
      )
      if (error) throw error
      return json({ ok: true })
    }

    if (mode === 'unsubscribe') {
      if (typeof body.endpoint !== 'string') return json({ error: 'endpoint required' }, 400)
      await db.from('push_subscriptions').delete().eq('endpoint', body.endpoint).eq('player_id', user.id)
      return json({ ok: true })
    }

    if (mode === 'test') {
      const sent = await sendTo(await subscriptionsFor([user.id]), {
        title: 'Witamed 🏐',
        body: 'Powiadomienia działają!',
        url: '/account',
        tag: 'test',
      })
      return json({ sent })
    }

    return json({ error: 'Unknown mode' }, 400)
  } catch (e) {
    console.error(e)
    return json({ error: (e as Error).message }, 500)
  }
})
