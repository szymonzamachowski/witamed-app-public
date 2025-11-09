import { useState, type FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useEvents } from '../hooks/useEvents'
import './admin-events-manager.css'

type EventType = 'training' | 'friendly' | 'other'

export default function AdminEventsManager() {
  const queryClient = useQueryClient()
  const [eventType, setEventType] = useState<EventType>('training')
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const { data: events } = useEvents()

  const addEventMutation = useMutation({
    mutationFn: async (eventData: {
      title: string
      date: string
      location: string
      type: EventType
      description?: string
    }) => {
      const { data, error } = await supabase
        .from('events')
        .insert([eventData])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      setSuccess('Wydarzenie zostało dodane!')
      setTitle('')
      setDate('')
      setTime('')
      setLocation('')
      setDescription('')
      setTimeout(() => setSuccess(null), 3000)
    },
    onError: (err: any) => {
      setError(err.message || 'Błąd przy dodawaniu wydarzenia')
      setTimeout(() => setError(null), 5000)
    },
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!title.trim() || !date || !location.trim()) {
      setError('Wypełnij wszystkie wymagane pola')
      return
    }

    // Połącz datę i czas
    const dateTime = time ? `${date}T${time}:00` : `${date}T12:00:00`

    addEventMutation.mutate({
      title: title.trim(),
      date: dateTime,
      location: location.trim(),
      type: eventType,
      description: description.trim() || undefined
    })
  }

  const filteredEvents = events?.filter(e => {
    if (eventType === 'training') return e.type === 'training'
    if (eventType === 'friendly') return e.type === 'friendly' || e.type === 'other'
    return false
  }) || []

  return (
    <div className="admin-events-manager">
      <h3>Zarządzanie wydarzeniami</h3>

      <div className="events-tabs">
        <button
          className={`event-tab ${eventType === 'training' ? 'active' : ''}`}
          onClick={() => setEventType('training')}
        >
          Treningi
        </button>
        <button
          className={`event-tab ${eventType === 'friendly' ? 'active' : ''}`}
          onClick={() => setEventType('friendly')}
        >
          Sparingi
        </button>
      </div>

      <form onSubmit={handleSubmit} className="admin-form">
        {error && (
          <div className="admin-error">
            {error}
          </div>
        )}

        {success && (
          <div className="admin-success">
            {success}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="eventTitle">Tytuł *</label>
          <input
            id="eventTitle"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={eventType === 'training' ? 'np. Trening techniczny' : 'np. Sparing z drużyną X'}
            required
            disabled={addEventMutation.isPending}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="eventDate">Data *</label>
            <input
              id="eventDate"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              disabled={addEventMutation.isPending}
            />
          </div>

          <div className="form-group">
            <label htmlFor="eventTime">Godzina</label>
            <input
              id="eventTime"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              disabled={addEventMutation.isPending}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="eventLocation">Lokalizacja *</label>
          <input
            id="eventLocation"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="np. Hala sportowa, ul. Sportowa 1"
            required
            disabled={addEventMutation.isPending}
          />
        </div>

        <div className="form-group">
          <label htmlFor="eventDescription">Opis (opcjonalne)</label>
          <textarea
            id="eventDescription"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Dodatkowe informacje o wydarzeniu"
            rows={4}
            disabled={addEventMutation.isPending}
          />
        </div>

        <button 
          type="submit" 
          className="admin-button"
          disabled={addEventMutation.isPending}
        >
          {addEventMutation.isPending ? 'Dodawanie...' : `Dodaj ${eventType === 'training' ? 'trening' : 'sparing'}`}
        </button>
      </form>

      {filteredEvents.length > 0 && (
        <div className="events-list-section">
          <h4>Ostatnio dodane {eventType === 'training' ? 'treningi' : 'sparingi'}</h4>
          <ul className="events-list">
            {filteredEvents.slice(0, 5).map(event => (
              <li key={event.id}>
                <div className="event-item">
                  <strong>{event.title}</strong>
                  <span className="event-date">
                    {new Date(event.date).toLocaleDateString('pl-PL', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  <span className="event-location">{event.location}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

