export type EventType = 'training' | 'match' | 'friendly'

export interface Event {
  id: string
  title: string
  type: EventType
  date: string // ISO
  location?: string
  description?: string
}

export interface NewsItem {
  id: string
  title: string
  date: string
  content?: string
}

export interface Match extends Event {
  videoUrl?: string
  stats?: Record<string, any>
}

export interface AttendanceRecord {
  eventId: string
  userId: string
  status: 'yes' | 'no' | 'maybe'
}
