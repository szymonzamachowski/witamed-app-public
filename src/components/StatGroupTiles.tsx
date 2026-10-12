import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/20/solid'
import { STAT_COLUMNS, STAT_GROUPS, formatStat, type RawStats } from '../stats/statConfig'

/**
 * Statystyki zawodnika pogrupowane: wyśrodkowany tytuł z kluczową skutecznością
 * („PRZYJĘCIE — 47%”), pod spodem kafelki z pozostałymi liczbami.
 * Kolumna „%” grupy (format pct) trafia do nagłówka zamiast do kafelka.
 * Kafelek ma kolor wg znaczenia liczby (`tone` w statConfig).
 * Strzałka przy skuteczności: czy po ostatnim meczu skuteczność sezonu wzrosła (↑) czy spadła (↓)
 * względem sezonu bez tego meczu (`previous`).
 */
export default function StatGroupTiles({ stats, previous }: { stats: RawStats; previous?: RawStats | null }) {
  return (
    <div className="stat-groups">
      {STAT_GROUPS.filter(g => g.id !== 'overview').map(group => {
        const columns = STAT_COLUMNS.filter(c => c.group === group.id)
        const keyStat = columns.find(c => c.format === 'pct')
        const tiles = columns.filter(c => c !== keyStat)
        const totalStat = columns.find(c => c.tone === 'total')

        // Trend tylko gdy przed ostatnim meczem były już akcje w tej kategorii
        let trend: { dir: 'up' | 'down'; before: number; now: number } | null = null
        if (keyStat && previous && totalStat && totalStat.value(previous) > 0) {
          const now = keyStat.value(stats)
          const before = keyStat.value(previous)
          if (now !== before) trend = { dir: now > before ? 'up' : 'down', before, now }
        }

        return (
          <section key={group.id} className="stat-group">
            <h3 className="stat-group-title display">
              {group.label}
              {keyStat && (
                <>
                  <span className="stat-group-dash"> — </span>
                  <span className="stat-group-key">{formatStat(keyStat.value(stats), keyStat.format)}</span>
                  {trend && (
                    <span
                      className={`stat-trend is-${trend.dir}`}
                      title={`Po ostatnim meczu: ${trend.before}% → ${trend.now}%`}
                      aria-label={`Po ostatnim meczu ${trend.dir === 'up' ? 'wzrost' : 'spadek'} z ${trend.before}% do ${trend.now}%`}
                    >
                      {trend.dir === 'up' ? <ArrowUpIcon aria-hidden="true" /> : <ArrowDownIcon aria-hidden="true" />}
                    </span>
                  )}
                </>
              )}
            </h3>
            <div className="stat-tiles">
              {tiles.map(c => {
                const value = c.value(stats)
                return (
                  <div key={c.key} className={`stat-tile tone-${c.tone}`}>
                    <span className="stat-tile-label">{c.label}</span>
                    <span className="stat-tile-value display">{formatStat(value, c.format)}</span>
                  </div>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
