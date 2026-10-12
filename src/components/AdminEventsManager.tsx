import { useState, type FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useEvents } from '../hooks/useEvents'
import { localDateTimeToISO, isoToLocalDate, isoToLocalTime } from '../utils/dateTime'
import './admin-events-manager.css'

type EventType = 'training' | 'friendly' | 'other'

export default function AdminEventsManager() {
  const queryClient = useQueryClient()
  const [mode, setMode] = useState<'add' | 'edit'>('add')
  const [eventType, setEventType] = useState<EventType>('training')
  const [selectedEventId, setSelectedEventId] = useState<string>('')
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const { data: events, isLoading } = useEvents()
  
  const selectedEvent = events?.find(e => e.id === selectedEventId)

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

  const updateEventMutation = useMutation({
    mutationFn: async (eventData: {
      eventId: string
      title: string
      date: string
      location: string
      type: EventType
      description?: string
    }) => {
      const { data, error } = await supabase
        .from('events')
        .update({
          title: eventData.title,
          date: eventData.date,
          location: eventData.location,
          type: eventData.type,
          description: eventData.description || null
        })
        .eq('id', eventData.eventId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      setSuccess('Wydarzenie zostało zaktualizowane!')
      setTimeout(() => setSuccess(null), 3000)
    },
    onError: (err: any) => {
      setError(err.message || 'Błąd przy aktualizacji wydarzenia')
      setTimeout(() => setError(null), 5000)
    },
  })

  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      // Najpierw usuń powiązane rekordy z attendance
      const { error: attendanceError } = await supabase
        .from('attendance')
        .delete()
        .eq('event_id', eventId)

      if (attendanceError) {
        console.error('Błąd przy usuwaniu attendance:', attendanceError)
        throw attendanceError
      }

      // Następnie usuń wydarzenie
      const { error: eventError } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)

      if (eventError) {
        console.error('Błąd przy usuwaniu wydarzenia:', eventError)
        throw eventError
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['attendance'] })
      setSuccess('Wydarzenie zostało usunięte wraz z powiązanymi danymi!')
      setSelectedEventId('')
      setShowDeleteConfirm(false)
      // Wyczyść formularz
      setTitle('')
      setDate('')
      setTime('')
      setLocation('')
      setDescription('')
      setTimeout(() => setSuccess(null), 3000)
    },
    onError: (err: any) => {
      setError(err.message || 'Błąd przy usuwaniu wydarzenia')
      setTimeout(() => setError(null), 5000)
    },
  })

  const handleEventSelect = (eventId: string) => {
    setSelectedEventId(eventId)
    const event = events?.find(e => e.id === eventId)
    if (event && mode === 'edit') {
      // Wypełnij formularz danymi wydarzenia
      setTitle(event.title || '')
      // Użyj funkcji pomocniczych do konwersji z UTC na lokalny czas polski
      setDate(isoToLocalDate(event.date))
      setTime(isoToLocalTime(event.date))
      setLocation(event.location || '')
      setDescription(event.description || '')
      setEventType(event.type as EventType)
    }
    setError(null)
    setSuccess(null)
    setShowDeleteConfirm(false)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!title.trim() || !date || !location.trim()) {
      setError('Wypełnij wszystkie wymagane pola')
      return
    }

    // Konwertuj lokalną datę i czas na ISO string z uwzględnieniem polskiej strefy czasowej
    const dateTime = localDateTimeToISO(date, time || '12:00')

    if (mode === 'edit' && selectedEventId) {
      updateEventMutation.mutate({
        eventId: selectedEventId,
        title: title.trim(),
        date: dateTime,
        location: location.trim(),
        type: eventType,
        description: description.trim() || undefined
      })
    } else {
      addEventMutation.mutate({
        title: title.trim(),
        date: dateTime,
        location: location.trim(),
        type: eventType,
        description: description.trim() || undefined
      })
    }
  }

  const handleDeleteEvent = () => {
    if (!selectedEventId) return
    deleteEventMutation.mutate(selectedEventId)
  }

  const filteredEvents = events?.filter(e => {
    if (eventType === 'training') return e.type === 'training'
    if (eventType === 'friendly') return e.type === 'friendly' || e.type === 'other'
    return false
  }) || []

  if (isLoading) {
    return <div className="loading">Ładowanie wydarzeń...</div>
  }

  return (
    <div className="admin-events-manager">
      <h3>Zarządzanie wydarzeniami</h3>

      <div className="match-manager-tabs">
        <button
          className={`manager-tab ${mode === 'add' ? 'active' : ''}`}
          onClick={() => {
            setMode('add')
            setSelectedEventId('')
            setError(null)
            setSuccess(null)
            setShowDeleteConfirm(false)
            // Wyczyść formularz
            setTitle('')
            setDate('')
            setTime('')
            setLocation('')
            setDescription('')
          }}
        >
          Dodaj wydarzenie
        </button>
        <button
          className={`manager-tab ${mode === 'edit' ? 'active' : ''}`}
          onClick={() => {
            setMode('edit')
            setError(null)
            setSuccess(null)
            setShowDeleteConfirm(false)
            if (selectedEventId) {
              handleEventSelect(selectedEventId)
            }
          }}
        >
          Edytuj
        </button>
      </div>

      <div className="events-type-tabs">
        <button
          className={`event-tab ${eventType === 'training' ? 'active' : ''}`}
          onClick={() => {
            setEventType('training')
            if (mode === 'edit' && selectedEventId) {
              handleEventSelect(selectedEventId)
            }
          }}
        >
          Treningi
        </button>
        <button
          className={`event-tab ${eventType === 'friendly' ? 'active' : ''}`}
          onClick={() => {
            setEventType('friendly')
            if (mode === 'edit' && selectedEventId) {
              handleEventSelect(selectedEventId)
            }
          }}
        >
          Sparingi
        </button>
      </div>

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

      {mode === 'edit' && (
        <div className="match-selector">
          <label htmlFor="event-select">Wybierz wydarzenie do edycji:</label>
          <select
            id="event-select"
            value={selectedEventId}
            onChange={(e) => handleEventSelect(e.target.value)}
            className="match-select"
          >
            <option value="">-- Wybierz wydarzenie --</option>
            {filteredEvents.map(event => (
              <option key={event.id} value={event.id}>
                {event.title} - {new Date(event.date).toLocaleDateString('pl-PL', { timeZone: 'Europe/Warsaw' })}
              </option>
            ))}
          </select>
        </div>
      )}

      {mode === 'add' ? (
        <form onSubmit={handleSubmit} className="admin-form">

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
      ) : (
        <>
          {!selectedEventId ? (
            <div className="admin-empty">
              <p>Wybierz wydarzenie z listy powyżej, aby je edytować lub usunąć.</p>
            </div>
          ) : selectedEvent ? (
            <>
              <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-group">
                <label htmlFor="edit-eventTitle">Tytuł *</label>
                <input
                  id="edit-eventTitle"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={eventType === 'training' ? 'np. Trening techniczny' : 'np. Sparing z drużyną X'}
                  required
                  disabled={updateEventMutation.isPending || deleteEventMutation.isPending}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="edit-eventDate">Data *</label>
                  <input
                    id="edit-eventDate"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    disabled={updateEventMutation.isPending || deleteEventMutation.isPending}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-eventTime">Godzina</label>
                  <input
                    id="edit-eventTime"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    disabled={updateEventMutation.isPending || deleteEventMutation.isPending}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="edit-eventLocation">Lokalizacja *</label>
                <input
                  id="edit-eventLocation"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="np. Hala sportowa, ul. Sportowa 1"
                  required
                  disabled={updateEventMutation.isPending || deleteEventMutation.isPending}
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-eventDescription">Opis (opcjonalne)</label>
                <textarea
                  id="edit-eventDescription"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Dodatkowe informacje o wydarzeniu"
                  rows={4}
                  disabled={updateEventMutation.isPending || deleteEventMutation.isPending}
                />
              </div>

              <button 
                type="submit" 
                className="admin-button"
                disabled={updateEventMutation.isPending || deleteEventMutation.isPending}
              >
                {updateEventMutation.isPending ? 'Zapisywanie...' : 'Zapisz zmiany'}
              </button>
            </form>

            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="admin-button delete-button"
                disabled={updateEventMutation.isPending || deleteEventMutation.isPending}
              >
                Usuń wydarzenie
              </button>
            ) : (
              <div className="delete-confirm">
                <p className="delete-confirm-text">
                  Czy na pewno chcesz usunąć wydarzenie "{selectedEvent.title}"?
                </p>
                <div className="delete-confirm-actions">
                  <button
                    onClick={handleDeleteEvent}
                    disabled={deleteEventMutation.isPending}
                    className="admin-button admin-button-danger"
                  >
                    {deleteEventMutation.isPending ? 'Usuwanie...' : 'Tak, usuń'}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deleteEventMutation.isPending}
                    className="admin-button admin-button-secondary"
                  >
                    Anuluj
                  </button>
                </div>
              </div>
            )}
            </>
          ) : (
            <div className="admin-empty">
              <p>Wydarzenie nie zostało znalezione.</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

