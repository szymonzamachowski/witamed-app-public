export type Profile = {
  id: string
  username: string
  full_name: string
  phone_number: string
  league_license_number: string
  role: 'player' | 'admin' | 'coach'
  created_at: string
}

export type Match = {
  id: string
  date: string
  opponent: string
  location: string
  score?: string
  video_url?: string
  created_at: string
  match_errors?: MatchErrors // JSONB field dla błędów meczu
}

export type MatchStatistics = {
  id: string
  match_id: string
  player_id: string
  points: number
  aces: number
  blocks: number
  spikes: number
  digs: number
  created_at: string
  // Rozszerzone statystyki (można przechowywać w JSONB lub osobnych kolumnach)
  serve_total?: number
  serve_errors?: number
  serve_aces?: number
  reception_total?: number
  reception_positive?: number
  reception_other?: number
  reception_errors?: number
  reception_percentage?: number
  attack_total?: number
  attack_points?: number
  attack_unfinished?: number
  attack_errors?: number
  attack_blocked?: number
  attack_percentage?: number
  block_total?: number
}

export type MatchErrors = {
  opponent_errors_total?: number
  opponent_errors_set1?: number
  opponent_errors_set2?: number
  opponent_errors_set3?: number
  opponent_errors_set4?: number
  opponent_errors_set5?: number
  blocks_against_total?: number
  blocks_against_set1?: number
  blocks_against_set2?: number
  blocks_against_set3?: number
  blocks_against_set4?: number
  blocks_against_set5?: number
  own_errors_total?: number
  own_errors_set1?: number
  own_errors_set2?: number
  own_errors_set3?: number
  own_errors_set4?: number
  own_errors_set5?: number
  own_errors_other_set1?: number
  own_errors_other_set2?: number
  own_errors_other_set3?: number
  own_errors_other_set4?: number
  own_errors_other_set5?: number
  // Błędy własne per set w podziale na kategorie
  own_serve_set1?: number
  own_serve_set2?: number
  own_serve_set3?: number
  own_serve_set4?: number
  own_serve_set5?: number
  own_reception_set1?: number
  own_reception_set2?: number
  own_reception_set3?: number
  own_reception_set4?: number
  own_reception_set5?: number
  own_attack_set1?: number
  own_attack_set2?: number
  own_attack_set3?: number
  own_attack_set4?: number
  own_attack_set5?: number
  own_blocked_set1?: number
  own_blocked_set2?: number
  own_blocked_set3?: number
  own_blocked_set4?: number
  own_blocked_set5?: number
}

export type Event = {
  id: string
  title: string
  date: string
  location: string
  type: 'match' | 'training' | 'friendly' | 'other'
  description?: string
  created_at: string
}

export type Attendance = {
  id: string
  event_id: string | null
  match_id: string | null
  player_id: string
  status: 'present' | 'absent' | 'unknown'
  created_at: string
}

export type News = {
  id: string
  title: string
  content: string
  author_id: string
  created_at: string
}