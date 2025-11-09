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
}

export type Event = {
  id: string
  title: string
  date: string
  location: string
  type: 'match' | 'training' | 'other'
  description?: string
  created_at: string
}

export type Attendance = {
  id: string
  event_id: string
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