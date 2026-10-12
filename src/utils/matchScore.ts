/**
 * Wynik meczu w formacie "3:1 (25:17, 20:25, ...)": pierwsza liczba to nasze sety.
 * `sets` to wyniki setów bez nawiasów (jeśli są).
 */
export function parseMatchScore(score: string | undefined | null) {
  if (!score) return null
  const main = score.match(/(\d+)\s*:\s*(\d+)/)
  if (!main) return null
  const sets = score.match(/\(([^)]*)\)/)?.[1]?.trim() || null
  return { ours: Number(main[1]), theirs: Number(main[2]), sets }
}

export type MatchOutcome = 'win' | 'loss' | 'draw'

/** Wygrana / porażka / remis (np. 2:2); null gdy wyniku nie da się odczytać. */
export function matchOutcome(result: ReturnType<typeof parseMatchScore>): MatchOutcome | null {
  if (!result) return null
  if (result.ours === result.theirs) return 'draw'
  return result.ours > result.theirs ? 'win' : 'loss'
}

export const OUTCOME_LABEL: Record<MatchOutcome, string> = {
  win: 'Wygrana',
  loss: 'Porażka',
  draw: 'Remis',
}
