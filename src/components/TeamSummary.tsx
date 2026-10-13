import { sumRaw, type RawStats } from '../stats/statConfig'
import './team-summary.css'

export type OwnErrorsByCategory = { own_serve: number; own_reception: number; own_attack: number; own_blocked: number }

type Part = { label: string; value: number }

function Breakdown({ title, total, parts, tone }: { title: string; total: number; parts: Part[]; tone: 'good' | 'bad' }) {
  return (
    <div className={`card team-block tone-${tone}`}>
      <div className="team-block-head">
        <h3 className="label">{title}</h3>
        <span className="display team-block-total">{total}</span>
      </div>
      <ul className="team-parts">
        {parts.map(p => {
          const share = total > 0 ? Math.round((p.value / total) * 100) : 0
          return (
            <li key={p.label}>
              <span className="team-part-label">{p.label}</span>
              <span className="team-part-meter">
                <small className="team-part-share">{total > 0 ? `${share}%` : '–'}</small>
                <span className="team-part-bar" aria-hidden="true">
                  <span style={{ width: `${share}%` }} />
                </span>
              </span>
              <span className="team-part-value">{p.value}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/**
 * Statystyki drużynowe: skąd mamy punkty (atak, asy, blok, błędy rywala),
 * skąd tracimy (błędy własne wg kategorii + inne) i bilans błędów.
 * Kategorie błędów własnych wpisują statystycy per set; gdy ich brak (stare mecze),
 * bierzemy je z sumy błędów zawodników.
 */
export default function TeamSummary({
  players,
  opponentErrors,
  ownByCategory,
  ownOther,
}: {
  players: RawStats[]
  opponentErrors: number
  ownByCategory?: OwnErrorsByCategory | null
  ownOther: number
}) {
  const t = sumRaw(players)
  const n = (v: number | null | undefined) => v ?? 0
  const categoriesEntered = ownByCategory && Object.values(ownByCategory).some(v => v > 0)

  const won: Part[] = [
    { label: 'Atak', value: n(t.attack_points) },
    { label: 'Asy', value: n(t.serve_aces) },
    { label: 'Blok', value: n(t.block_total) },
    { label: 'Błędy rywala', value: opponentErrors },
  ]
  const lost: Part[] = [
    { label: 'Serwis', value: categoriesEntered ? ownByCategory!.own_serve : n(t.serve_errors) },
    { label: 'Przyjęcie', value: categoriesEntered ? ownByCategory!.own_reception : n(t.reception_errors) },
    { label: 'Atak', value: categoriesEntered ? ownByCategory!.own_attack : n(t.attack_errors) },
    { label: 'Zablokowane', value: categoriesEntered ? ownByCategory!.own_blocked : n(t.attack_blocked) },
    { label: 'Inne', value: ownOther },
  ]
  const wonTotal = won.reduce((s, p) => s + p.value, 0)
  const lostTotal = lost.reduce((s, p) => s + p.value, 0)
  const balance = opponentErrors - (lostTotal)

  return (
    <div className="team-summary">
      <Breakdown title="Skąd mamy punkty" total={wonTotal} parts={won} tone="good" />
      <Breakdown title="Skąd tracimy (błędy własne)" total={lostTotal} parts={lost} tone="bad" />
      <div className="card team-balance">
        <span className="label">Bilans błędów</span>
        <span className={`display ${balance >= 0 ? 'is-good' : 'is-bad'}`}>{balance > 0 ? `+${balance}` : balance}</span>
        <span className="muted">błędy rywala {opponentErrors} − nasze {lostTotal}</span>
      </div>
    </div>
  )
}
