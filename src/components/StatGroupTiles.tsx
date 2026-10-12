import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/20/solid'
import { STAT_COLUMNS, STAT_GROUPS, formatStat, type RawStats } from '../stats/statConfig'
import FormChart from './FormChart'

export type MatchSeriesItem = { matchId: string; date: string; opponent: string; stats: RawStats }

/**
 * Statystyki zawodnika pogrupowane: wyśrodkowany tytuł z kluczowym procentem
 * („PRZYJĘCIE — 47%”), kafelki z liczbami (kolor wg `tone` w statConfig),
 * strzałka trendu po ostatnim meczu (`previous`) i wykres formy mecz po meczu (`series`).
 */
export default function StatGroupTiles({
  stats,
  previous,
  series,
}: {
  stats: RawStats
  previous?: RawStats | null
  series?: MatchSeriesItem[]
}) {
  return (
    <div className="stat-groups">
      {STAT_GROUPS.filter(g => g.id !== 'overview').map(group => {
        const columns = STAT_COLUMNS.filter(c => c.group === group.id)
        const keyStat = columns.find(c => c.format === 'pct')
        const tiles = columns.filter(c => c !== keyStat)
        const keyValue = keyStat ? keyStat.value(stats) : null

        // Trend: procent sezonu po ostatnim meczu vs bez niego
        let trend: { dir: 'up' | 'down'; before: number; now: number } | null = null
        if (keyStat && previous) {
          const before = keyStat.value(previous)
          if (keyValue !== null && before !== null && keyValue !== before) {
            trend = { dir: keyValue > before ? 'up' : 'down', before, now: keyValue }
          }
        }

        const formPoints =
          keyStat && series && series.length > 1
            ? series.map(m => {
                const d = new Date(m.date)
                return {
                  label: `${d.getDate()}.${d.getMonth() + 1}`,
                  title: `vs ${m.opponent} (${d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })})`,
                  value: keyStat.value(m.stats),
                }
              })
            : null

        return (
          <section key={group.id} className="stat-group">
            <h3 className="stat-group-title display">
              {group.label}
              {keyStat && (
                <>
                  <span className="stat-group-dash"> — </span>
                  <span className="stat-group-key">{formatStat(keyValue, keyStat.format)}</span>
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
            {keyStat && keyStat.label !== '%' && <p className="stat-group-sub muted">{keyStat.label}</p>}
            <div className="stat-tiles">
              {tiles.map(c => (
                <div key={c.key} className={`stat-tile tone-${c.tone}`}>
                  <span className="stat-tile-label">{c.label}</span>
                  <span className="stat-tile-value display">{formatStat(c.value(stats), c.format)}</span>
                </div>
              ))}
            </div>
            {formPoints && keyStat && <FormChart points={formPoints} name={`${group.label} ${keyStat.label}`} />}
          </section>
        )
      })}
    </div>
  )
}
