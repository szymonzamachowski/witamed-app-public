import type { Event, Match, NewsItem } from './types'

export const events: Event[] = [
  {
    id: 'e1',
    title: 'Trening - Sala Główna',
    type: 'training',
    date: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    location: 'Hala Sportowa',
    description: 'Skupienie na przyjęciu i bloku'
  },
  {
    id: 'e2',
    title: 'Mecz ligowy vs Orzeł',
    type: 'match',
    date: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
    location: 'Stadion Miejski',
    description: 'Mecz o punkty'
  }
]

export const matches: Match[] = [
  {
    id: 'm1',
    title: 'Mecz: Witamed vs Orzeł',
    type: 'match',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    location: 'Stadion Miejski',
    videoUrl: '',
    stats: { sets: '3:1', pointsFor: 75, pointsAgainst: 68 }
  },
]

export const news: NewsItem[] = [
  { id: 'n1', title: 'Nowy trener siatkówki!', date: new Date().toISOString(), content: 'Witamy trenera Marka.' },
  { id: 'n2', title: 'Trening przesunięty', date: new Date().toISOString(), content: 'Trening w środę przeniesiony na 19:00.' }
]

export function findNextEvent(): Event | null {
  const upcoming = events.concat(matches).filter(e => new Date(e.date) > new Date())
  upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  return upcoming[0] ?? null
}
