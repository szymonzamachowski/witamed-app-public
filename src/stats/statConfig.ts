/**
 * Konfiguracja statystyk — JEDNO miejsce do zmian po konsultacji z trenerem.
 *
 * Z tego pliku korzystają: strona Statystyki, statystyki meczu i (docelowo) Moje konto.
 * - zmiana nazwy / skrótu kolumny        → `label` / `short`
 * - inny wzór (np. skuteczność ataku)    → `value`
 * - kolumna widoczna / ukryta na telefonie → `mobile`
 * - nowa kolumna z istniejących liczb     → dopisz obiekt do STAT_COLUMNS
 * - zupełnie nowa liczba zbierana w meczu → najpierw kolumna w bazie (match_statistics)
 *   + pole w formularzu admina, potem dopisz ją do RAW_FIELDS i tutaj.
 */

/** Surowe liczby zapisywane dla zawodnika w meczu (kolumny match_statistics). */
export const RAW_FIELDS = [
  'serve_total',
  'serve_errors',
  'serve_aces',
  'reception_total',
  'reception_positive',
  'reception_other',
  'reception_errors',
  'attack_total',
  'attack_points',
  'attack_unfinished',
  'attack_errors',
  'attack_blocked',
  'block_total',
] as const

export type RawField = (typeof RAW_FIELDS)[number]
export type RawStats = Partial<Record<RawField, number | null>>

export type StatGroupId = 'overview' | 'serve' | 'reception' | 'attack' | 'block'

export const STAT_GROUPS: { id: StatGroupId; label: string; short: string }[] = [
  { id: 'overview', label: 'Ogólne', short: 'Ogólne' },
  { id: 'serve', label: 'Zagrywka', short: 'Zagr.' },
  { id: 'reception', label: 'Przyjęcie', short: 'Przyj.' },
  { id: 'attack', label: 'Atak', short: 'Atak' },
  { id: 'block', label: 'Blok', short: 'Blok' },
]

export type StatColumn = {
  key: string
  /** Grupa w pełnej tabeli (komputer) i w panelu zawodnika */
  group: Exclude<StatGroupId, 'overview'>
  /** Pełna nazwa (nagłówek na komputerze, panel zawodnika) */
  label: string
  /** Krótka nazwa (nagłówek na telefonie) */
  short: string
  format: 'int' | 'pct'
  /** null = brak akcji (pokazujemy „–”) */
  value: (s: RawStats) => number | null
  /** Znaczenie liczby (kolor kafelka): suma akcji, dobra, zła albo neutralna */
  tone: 'total' | 'positive' | 'negative' | 'neutral'
  /** Pokaż w zakładce grupy na telefonie (max ~4 kolumny na zakładkę) */
  mobile: boolean
  /** Także w zakładce „Ogólne” */
  overview?: boolean
  /** Krótka nazwa w zakładce „Ogólne” (gdy `short` byłby tam niejednoznaczny) */
  overviewShort?: string
}

const n = (v: number | null | undefined) => v ?? 0
/** Procent; null gdy nie było żadnej akcji (wtedy „–”, nie 0%). */
const pct = (part: number, total: number) => (total > 0 ? Math.round((part / total) * 100) : null)

export const STAT_COLUMNS: StatColumn[] = [
  // Zagrywka
  { key: 'serve_total', group: 'serve', tone: 'total', label: 'Total', short: 'Total', format: 'int', value: s => n(s.serve_total), mobile: true },
  { key: 'serve_errors', group: 'serve', tone: 'negative', label: 'Błąd', short: 'Bł.', format: 'int', value: s => n(s.serve_errors), mobile: true },
  { key: 'serve_aces', group: 'serve', tone: 'positive', label: 'As', short: 'Asy', format: 'int', value: s => n(s.serve_aces), mobile: true },
  // Zagrywki w boisku (bez błędu) — kluczowa liczba zagrywki; asy i błędy pokazujemy obok jako bilans
  { key: 'serve_pct', group: 'serve', tone: 'positive', label: '% w boisku', short: '% boisko', format: 'pct', value: s => pct(n(s.serve_total) - n(s.serve_errors), n(s.serve_total)), mobile: true },

  // Przyjęcie — Poz% = pozytywne / wszystkie (jak w TAURON Lidze)
  { key: 'reception_total', group: 'reception', tone: 'total', label: 'Total', short: 'Total', format: 'int', value: s => n(s.reception_total), mobile: true },
  { key: 'reception_positive', group: 'reception', tone: 'positive', label: 'Pozytywne', short: 'Poz.', format: 'int', value: s => n(s.reception_positive), mobile: true },
  { key: 'reception_other', group: 'reception', tone: 'neutral', label: 'Pozostałe', short: 'Pozost.', format: 'int', value: s => n(s.reception_other), mobile: false },
  { key: 'reception_errors', group: 'reception', tone: 'negative', label: 'Błąd', short: 'Bł.', format: 'int', value: s => n(s.reception_errors), mobile: true },
  {
    key: 'reception_pct', group: 'reception', tone: 'positive', label: '%', short: '%', format: 'pct',
    value: s => pct(n(s.reception_positive), n(s.reception_total)), mobile: true, overview: true, overviewShort: 'Przyj%',
  },

  // Atak
  { key: 'attack_total', group: 'attack', tone: 'total', label: 'Total', short: 'Akcje', format: 'int', value: s => n(s.attack_total), mobile: true },
  { key: 'attack_points', group: 'attack', tone: 'positive', label: 'Punktowy', short: 'Pkt', format: 'int', value: s => n(s.attack_points), mobile: true },
  { key: 'attack_unfinished', group: 'attack', tone: 'neutral', label: 'Nieskończony', short: 'Niesk.', format: 'int', value: s => n(s.attack_unfinished), mobile: false },
  { key: 'attack_errors', group: 'attack', tone: 'negative', label: 'Błąd', short: 'Bł.', format: 'int', value: s => n(s.attack_errors), mobile: true },
  { key: 'attack_blocked', group: 'attack', tone: 'negative', label: 'Zablokowany', short: 'Zabl.', format: 'int', value: s => n(s.attack_blocked), mobile: false },
  {
    key: 'attack_pct', group: 'attack', tone: 'positive', label: '%', short: 'Skut.', format: 'pct',
    value: s => pct(n(s.attack_points), n(s.attack_total)), mobile: true, overview: true, overviewShort: 'Atak%',
  },

  // Blok
  { key: 'block_total', group: 'block', tone: 'positive', label: 'Bloki', short: 'Bloki', format: 'int', value: s => n(s.block_total), mobile: true },
]

/** Punkty zdobyte = punktowe ataki + asy + bloki (pierwsza kolumna „Ogólne”). */
export const POINTS_COLUMN = {
  key: 'points',
  label: 'Punkty',
  short: 'Pkt',
  format: 'int' as const,
  value: (s: RawStats) => n(s.attack_points) + n(s.serve_aces) + n(s.block_total),
}

export function formatStat(value: number | null, format: 'int' | 'pct') {
  if (value === null) return '–'
  return format === 'pct' ? `${value}%` : String(value)
}

/** Suma surowych liczb (do wiersza RAZEM; procenty liczone z sum, nie średnia procentów). */
export function sumRaw(rows: RawStats[]): RawStats {
  const total: RawStats = {}
  for (const field of RAW_FIELDS) {
    total[field] = rows.reduce((acc, row) => acc + n(row[field]), 0)
  }
  return total
}
