import { useEffect, useMemo, useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import {
  STAT_COLUMNS,
  STAT_GROUPS,
  POINTS_COLUMN,
  formatStat,
  sumRaw,
  type RawStats,
  type StatGroupId,
} from '../stats/statConfig'
import StatGroupTiles, { type MatchSeriesItem } from './StatGroupTiles'
import '../styles/data-table.css'
import './stats-board.css'

export type StatsRow = {
  id: string
  name: string
  /** Liczba meczów (tylko statystyki sezonu) */
  matches?: number
  stats: RawStats
  /** Sezon bez ostatniego meczu (strzałki trendu w panelu zawodnika) */
  previous?: RawStats | null
  /** Statystyki mecz po meczu (wykres formy w panelu zawodnika) */
  series?: MatchSeriesItem[]
}

type Column = {
  key: string
  label: string
  short: string
  format: 'int' | 'pct'
  value: (row: StatsRow) => number | null
}

type Sort = { key: string; dir: 'asc' | 'desc' }

const MATCHES_COLUMN: Column = { key: 'matches', label: 'Mecze', short: 'M', format: 'int', value: r => r.matches ?? 0 }
const POINTS: Column = { ...POINTS_COLUMN, value: r => POINTS_COLUMN.value(r.stats) }
const toColumn = (c: (typeof STAT_COLUMNS)[number]): Column => ({ ...c, value: r => c.value(r.stats) })

/** „1 mecz”, „3 mecze”, „5 meczów” */
function matchesLabel(count: number) {
  const lastTwo = count % 100
  const last = count % 10
  if (count === 1) return '1 mecz'
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) return `${count} mecze`
  return `${count} meczów`
}

/** Skrót nazwiska na telefon: „Lewandowski Mateusz” → „Lewandowski M.” */
function shortName(name: string) {
  const [last, first] = name.split(' ')
  return first ? `${last} ${first[0]}.` : name
}

export default function StatsBoard({
  rows,
  showMatches = false,
  searchable = false,
}: {
  rows: StatsRow[]
  showMatches?: boolean
  searchable?: boolean
}) {
  const [tab, setTab] = useState<StatGroupId>('overview')
  const [sort, setSort] = useState<Sort>({ key: 'points', dir: 'desc' })
  const [filter, setFilter] = useState('')
  const [selected, setSelected] = useState<StatsRow | null>(null)

  const allColumns = useMemo(() => STAT_COLUMNS.map(toColumn), [])
  const columnByKey = useMemo(() => {
    const map = new Map<string, Column>([[POINTS.key, POINTS], [MATCHES_COLUMN.key, MATCHES_COLUMN]])
    allColumns.forEach(c => map.set(c.key, c))
    return map
  }, [allColumns])

  // Kolumny zakładki na telefonie
  const tabColumns = useMemo<Column[]>(() => {
    if (tab === 'overview') {
      return [
        ...(showMatches ? [MATCHES_COLUMN] : []),
        POINTS,
        ...STAT_COLUMNS.filter(c => c.overview).map(c => ({ ...toColumn(c), short: c.overviewShort ?? c.short })),
      ]
    }
    return STAT_COLUMNS.filter(c => c.group === tab && c.mobile).map(toColumn)
  }, [tab, showMatches])

  const visibleRows = useMemo(() => {
    const q = filter.trim().toLowerCase()
    const filtered = q ? rows.filter(r => r.name.toLowerCase().includes(q)) : rows
    const column = columnByKey.get(sort.key)
    const sign = sort.dir === 'asc' ? 1 : -1
    return [...filtered].sort((a, b) => {
      if (sort.key === 'name' || !column) return sign * a.name.localeCompare(b.name, 'pl')
      const va = column.value(a)
      const vb = column.value(b)
      // Brak akcji („–”) zawsze na końcu, niezależnie od kierunku
      if (va === null || vb === null) return va === vb ? a.name.localeCompare(b.name, 'pl') : va === null ? 1 : -1
      return sign * (va - vb) || a.name.localeCompare(b.name, 'pl')
    })
  }, [rows, filter, sort, columnByKey])

  // Wiersz RAZEM liczony ze wszystkich zawodników (nie tylko wyszukanych)
  const totalsRow = useMemo<StatsRow>(() => ({ id: 'total', name: 'Razem', stats: sumRaw(rows.map(r => r.stats)) }), [rows])

  const handleSort = (key: string) => {
    setSort(prev =>
      prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: key === 'name' ? 'asc' : 'desc' }
    )
  }

  const sortMark = (key: string) => (sort.key === key ? (sort.dir === 'desc' ? ' ↓' : ' ↑') : '')

  const desktopGroups = STAT_GROUPS.filter(g => g.id !== 'overview').map(g => ({
    ...g,
    columns: allColumns.filter(c => STAT_COLUMNS.find(s => s.key === c.key)?.group === g.id),
  }))
  const overviewColumns = [...(showMatches ? [MATCHES_COLUMN] : []), POINTS]

  return (
    <div className="stats-board">
      {searchable && (
        <input
          type="search"
          className="stats-search"
          placeholder="Szukaj zawodnika…"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          aria-label="Szukaj zawodnika"
        />
      )}

      {/* ---------- Telefon: zakładki kategorii ---------- */}
      <div className="stats-mobile">
        <div className="segmented stats-tabs" role="tablist" aria-label="Kategoria statystyk">
          {STAT_GROUPS.map(g => (
            <button
              key={g.id}
              type="button"
              role="tab"
              aria-selected={tab === g.id}
              className={tab === g.id ? 'active' : ''}
              onClick={() => setTab(g.id)}
            >
              {g.short}
            </button>
          ))}
        </div>

        <div className="card stats-compact-card">
          <table className="stats-compact">
            <thead>
              <tr>
                <th className="sc-name" onClick={() => handleSort('name')} aria-sort={sort.key === 'name' ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}>
                  Zawodnik{sortMark('name')}
                </th>
                {tabColumns.map(c => (
                  <th
                    key={c.key}
                    className={sort.key === c.key ? 'is-sorted' : ''}
                    onClick={() => handleSort(c.key)}
                    aria-sort={sort.key === c.key ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}
                  >
                    {c.short}{sortMark(c.key)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row, i) => (
                <tr key={row.id} onClick={() => setSelected(row)} tabIndex={0} onKeyDown={e => e.key === 'Enter' && setSelected(row)}>
                  <td className="sc-name">
                    <span className="sc-rank">{i + 1}</span>
                    {shortName(row.name)}
                  </td>
                  {tabColumns.map(c => (
                    <td key={c.key} className={sort.key === c.key ? 'is-sorted' : ''}>{formatStat(c.value(row), c.format)}</td>
                  ))}
                </tr>
              ))}
              <tr className="sc-total">
                <td className="sc-name">Razem</td>
                {tabColumns.map(c => (
                  <td key={c.key}>{c.key === 'matches' ? '–' : formatStat(c.value(totalsRow), c.format)}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <p className="stats-hint muted">Kliknij zawodnika, żeby zobaczyć wszystkie jego statystyki.</p>
      </div>

      {/* ---------- Komputer: pełna tabela ---------- */}
      <div className="stats-desktop data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th rowSpan={2} className="dt-player-col sortable" onClick={() => handleSort('name')}>
                Zawodnik{sortMark('name')}
              </th>
              <th colSpan={overviewColumns.length} className="dt-group">Ogólne</th>
              {desktopGroups.map(g => (
                <th key={g.id} colSpan={g.columns.length} className="dt-group">{g.label}</th>
              ))}
            </tr>
            <tr>
              {[...overviewColumns, ...desktopGroups.flatMap(g => g.columns)].map(c => (
                <th key={c.key} className={`sortable ${sort.key === c.key ? 'is-sorted' : ''}`} onClick={() => handleSort(c.key)}>
                  {c.label}{sortMark(c.key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map(row => (
              <tr key={row.id} className="dt-clickable" onClick={() => setSelected(row)}>
                <td className="dt-player">{row.name}</td>
                {[...overviewColumns, ...desktopGroups.flatMap(g => g.columns)].map(c => (
                  <td key={c.key} className={sort.key === c.key ? 'is-sorted' : ''}>{formatStat(c.value(row), c.format)}</td>
                ))}
              </tr>
            ))}
            <tr className="dt-totals">
              <td className="dt-player">Razem</td>
              {[...overviewColumns, ...desktopGroups.flatMap(g => g.columns)].map(c => (
                <td key={c.key}>{c.key === 'matches' ? '–' : formatStat(c.value(totalsRow), c.format)}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {visibleRows.length === 0 && <p className="muted stats-none">Brak zawodników pasujących do wyszukiwania.</p>}

      {selected && (
        <PlayerSheet row={selected} showMatches={showMatches} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}

function PlayerSheet({
  row,
  showMatches,
  onClose,
}: {
  row: StatsRow
  showMatches: boolean
  onClose: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" role="dialog" aria-modal="true" aria-labelledby="player-sheet-title" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 id="player-sheet-title" className="display">{row.name}</h2>
            {showMatches && <p className="muted">{matchesLabel(row.matches ?? 0)}</p>}
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Zamknij">
            <XMarkIcon aria-hidden="true" />
          </button>
        </div>
        <div className="modal-body">
          <div className="player-sheet-points">
            <span className="display">{POINTS.value(row)}</span>
            <span className="label">Punkty</span>
          </div>
          <StatGroupTiles stats={row.stats} previous={row.previous} series={row.series} />
        </div>
      </div>
    </div>
  )
}
