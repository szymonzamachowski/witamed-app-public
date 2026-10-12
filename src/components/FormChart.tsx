import { useState } from 'react'

export type FormPoint = { label: string; title: string; value: number | null }

const W = 320
const H = 96
const PAD = { top: 16, right: 16, bottom: 18, left: 34 }

/**
 * Wykres formy: procent z każdego meczu jako kropka, kolejne mecze połączone linią.
 * Mecz bez akcji w danej kategorii (null) przerywa linię.
 */
export default function FormChart({ points, name }: { points: FormPoint[]; name: string }) {
  const [active, setActive] = useState<number | null>(null)
  if (points.filter(p => p.value !== null).length === 0) return null

  const innerW = W - PAD.left - PAD.right
  const innerH = H - PAD.top - PAD.bottom
  const x = (i: number) => PAD.left + (points.length === 1 ? innerW / 2 : (i / (points.length - 1)) * innerW)
  const y = (v: number) => PAD.top + innerH - (v / 100) * innerH

  // Odcinki linii tylko między sąsiednimi meczami z wartością
  const segments: string[] = []
  points.forEach((p, i) => {
    const prev = points[i - 1]
    if (i > 0 && p.value !== null && prev?.value !== null && prev !== undefined) {
      segments.push(`M${x(i - 1)},${y(prev.value!)}L${x(i)},${y(p.value)}`)
    }
  })

  const lastIndex = points.map(p => p.value !== null).lastIndexOf(true)
  const shown = active ?? lastIndex
  const showEveryLabel = points.length <= 8

  return (
    <figure className="form-chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Forma: ${name} w kolejnych meczach`}>
        {[0, 50, 100].map(v => (
          <g key={v}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(v)} y2={y(v)} className="fc-grid" />
            <text x={PAD.left - 6} y={y(v) + 3} className="fc-axis" textAnchor="end">{v}%</text>
          </g>
        ))}
        <path d={segments.join('')} className="fc-line" />
        {points.map((p, i) =>
          p.value === null ? null : (
            <g
              key={i}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              onClick={() => setActive(active === i ? null : i)}
            >
              <circle cx={x(i)} cy={y(p.value)} r={12} className="fc-hit" />
              <circle cx={x(i)} cy={y(p.value)} r={i === shown ? 5 : 4} className={`fc-dot ${i === shown ? 'is-active' : ''}`} />
              <title>{`${p.title}: ${p.value}%`}</title>
            </g>
          )
        )}
        {shown >= 0 && points[shown]?.value !== null && (
          <text x={x(shown)} y={y(points[shown].value!) - 9} className="fc-value" textAnchor="middle">
            {points[shown].value}%
          </text>
        )}
        {points.map((p, i) =>
          showEveryLabel || i === 0 || i === points.length - 1 ? (
            <text key={i} x={x(i)} y={H - 4} className="fc-axis" textAnchor="middle">{p.label}</text>
          ) : null
        )}
      </svg>
      {active !== null && <figcaption className="fc-caption">{points[active].title}</figcaption>}
    </figure>
  )
}
