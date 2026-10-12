export type AttendanceTab = 'training' | 'sparing' | 'match'

/** Zakładka strony Obecność, na której jest dane wydarzenie lub mecz. */
export function attendanceTabFor(event: { type: string }): AttendanceTab {
  if (event.type === 'match') return 'match'
  if (event.type === 'training') return 'training'
  return 'sparing' // friendly, other
}
