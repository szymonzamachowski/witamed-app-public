import { useState, FormEvent } from 'react'
import { useMatches } from '../hooks/useMatches'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Match } from '../types/database'
import './admin-match-manager.css'

export default function AdminMatchManager() {
  const { data: matches, isLoading } = useMatches()
  const queryClient = useQueryClient()
  const [mode, setMode] = useState<'add' | 'edit'>('add')
  const [selectedMatchId, setSelectedMatchId] = useState<string>('')
  
  // Pola dla dodawania/edycji meczu
  const [opponent, setOpponent] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [location, setLocation] = useState('')
  const [score, setScore] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const selectedMatch = matches?.find(m => m.id === selectedMatchId)

  const addMatchMutation = useMutation({
    mutationFn: async (matchData: {
      opponent: string
      date: string
      location: string
      score?: string
      video_url?: string
    }) => {
      const { data, error } = await supabase
        .from('matches')
        .insert([matchData])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] })
      setSuccess('Mecz został dodany!')
      setOpponent('')
      setDate('')
      setTime('')
      setLocation('')
      setScore('')
      setVideoUrl('')
      setTimeout(() => setSuccess(null), 3000)
    },
    onError: (err: any) => {
      setError(err.message || 'Błąd przy dodawaniu meczu')
      setTimeout(() => setError(null), 5000)
    },
  })


  const updateFullMatchMutation = useMutation({
    mutationFn: async (matchData: {
      matchId: string
      opponent: string
      date: string
      location: string
      score?: string
      video_url?: string
    }) => {
      const { data, error } = await supabase
        .from('matches')
        .update({
          opponent: matchData.opponent,
          date: matchData.date,
          location: matchData.location,
          score: matchData.score || null,
          video_url: matchData.video_url || null
        })
        .eq('id', matchData.matchId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] })
      queryClient.invalidateQueries({ queryKey: ['match', selectedMatchId] })
      setSuccess('Mecz został zaktualizowany!')
      setTimeout(() => setSuccess(null), 3000)
    },
    onError: (err: any) => {
      setError(err.message || 'Błąd przy aktualizacji meczu')
      setTimeout(() => setError(null), 5000)
    },
  })

  const deleteMatchMutation = useMutation({
    mutationFn: async (matchId: string) => {
      // Najpierw usuń powiązane rekordy z attendance
      const { error: attendanceError } = await supabase
        .from('attendance')
        .delete()
        .eq('match_id', matchId)

      if (attendanceError) {
        console.error('Błąd przy usuwaniu attendance:', attendanceError)
        throw attendanceError
      }

      // Następnie usuń powiązane rekordy z match_statistics
      const { error: statsError } = await supabase
        .from('match_statistics')
        .delete()
        .eq('match_id', matchId)

      if (statsError) {
        console.error('Błąd przy usuwaniu match_statistics:', statsError)
        throw statsError
      }

      // Na końcu usuń mecz
      const { error: matchError } = await supabase
        .from('matches')
        .delete()
        .eq('id', matchId)

      if (matchError) {
        console.error('Błąd przy usuwaniu meczu:', matchError)
        throw matchError
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] })
      queryClient.invalidateQueries({ queryKey: ['attendance'] })
      queryClient.invalidateQueries({ queryKey: ['match-statistics'] })
      setSuccess('Mecz został usunięty wraz z powiązanymi danymi!')
      setSelectedMatchId('')
      setShowDeleteConfirm(false)
      // Wyczyść formularz
      setOpponent('')
      setDate('')
      setTime('')
      setLocation('')
      setScore('')
      setVideoUrl('')
      setTimeout(() => setSuccess(null), 3000)
    },
    onError: (err: any) => {
      setError(err.message || 'Błąd przy usuwaniu meczu')
      setTimeout(() => setError(null), 5000)
    },
  })

  const handleMatchSelect = (matchId: string) => {
    setSelectedMatchId(matchId)
    const match = matches?.find(m => m.id === matchId)
    if (match && mode === 'edit') {
      // Wypełnij formularz danymi meczu
      setOpponent(match.opponent || '')
      const matchDate = new Date(match.date)
      setDate(matchDate.toISOString().split('T')[0])
      setTime(matchDate.toTimeString().slice(0, 5))
      setLocation(match.location || '')
      setScore(match.score || '')
      setVideoUrl(match.video_url || '')
    }
    setError(null)
    setSuccess(null)
    setShowDeleteConfirm(false)
  }

  const handleAddMatch = (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!opponent.trim() || !date || !location.trim()) {
      setError('Wypełnij wszystkie wymagane pola')
      return
    }

    // Połącz datę i czas
    const dateTime = time ? `${date}T${time}:00` : `${date}T18:00:00`

    addMatchMutation.mutate({
      opponent: opponent.trim(),
      date: dateTime,
      location: location.trim(),
      score: score.trim() || undefined,
      video_url: videoUrl.trim() || undefined
    })
  }


  const handleUpdateFullMatch = (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!selectedMatchId) {
      setError('Wybierz mecz')
      return
    }

    if (!opponent.trim() || !date || !location.trim()) {
      setError('Wypełnij wszystkie wymagane pola')
      return
    }

    // Połącz datę i czas
    const dateTime = time ? `${date}T${time}:00` : `${date}T18:00:00`

    updateFullMatchMutation.mutate({
      matchId: selectedMatchId,
      opponent: opponent.trim(),
      date: dateTime,
      location: location.trim(),
      score: score.trim() || undefined,
      video_url: videoUrl.trim() || undefined
    })
  }

  const handleDeleteMatch = () => {
    if (!selectedMatchId) return
    
    deleteMatchMutation.mutate(selectedMatchId)
  }

  if (isLoading) {
    return <div className="loading">Ładowanie meczów...</div>
  }

  return (
    <div className="admin-match-manager">
      <h3>Zarządzanie meczami ligowymi</h3>

      <div className="match-manager-tabs">
        <button
          className={`manager-tab ${mode === 'add' ? 'active' : ''}`}
          onClick={() => {
            setMode('add')
            setSelectedMatchId('')
            setError(null)
            setSuccess(null)
            setShowDeleteConfirm(false)
            // Wyczyść formularz
            setOpponent('')
            setDate('')
            setTime('')
            setLocation('')
            setScore('')
            setVideoUrl('')
          }}
        >
          Dodaj mecz
        </button>
        <button
          className={`manager-tab ${mode === 'edit' ? 'active' : ''}`}
          onClick={() => {
            setMode('edit')
            setError(null)
            setSuccess(null)
            setShowDeleteConfirm(false)
            if (selectedMatchId) {
              handleMatchSelect(selectedMatchId)
            }
          }}
        >
          Edytuj
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

      {mode === 'add' ? (
        <form onSubmit={handleAddMatch} className="admin-form">
          <div className="form-group">
            <label htmlFor="opponent">Przeciwnik *</label>
            <input
              id="opponent"
              type="text"
              value={opponent}
              onChange={(e) => setOpponent(e.target.value)}
              placeholder="np. KS AZS Politechnika Warszawska"
              required
              disabled={addMatchMutation.isPending}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="match-date">Data *</label>
              <input
                id="match-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                disabled={addMatchMutation.isPending}
              />
            </div>

            <div className="form-group">
              <label htmlFor="match-time">Godzina</label>
              <input
                id="match-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                disabled={addMatchMutation.isPending}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="match-location">Lokalizacja *</label>
            <input
              id="match-location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="np. Hala sportowa, ul. Sportowa 1"
              required
              disabled={addMatchMutation.isPending}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="match-score">Wynik (opcjonalne)</label>
              <input
                id="match-score"
                type="text"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="np. 3:1"
                disabled={addMatchMutation.isPending}
              />
            </div>

            <div className="form-group">
              <label htmlFor="match-video-url">Link do YouTube (opcjonalne)</label>
              <input
                id="match-video-url"
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                disabled={addMatchMutation.isPending}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="admin-button"
            disabled={addMatchMutation.isPending}
          >
            {addMatchMutation.isPending ? 'Dodawanie...' : 'Dodaj mecz'}
          </button>
        </form>
      ) : (
        <>
          <div className="match-selector">
            <label htmlFor="match-select-edit">Wybierz mecz do edycji:</label>
            <select
              id="match-select-edit"
              value={selectedMatchId}
              onChange={(e) => handleMatchSelect(e.target.value)}
              className="match-select"
            >
              <option value="">-- Wybierz mecz --</option>
              {matches?.map(match => (
                <option key={match.id} value={match.id}>
                  vs {match.opponent} - {new Date(match.date).toLocaleDateString('pl-PL')}
                </option>
              ))}
            </select>
          </div>

          {selectedMatch && (
            <>
              <form onSubmit={handleUpdateFullMatch} className="admin-form">
                <div className="form-group">
                  <label htmlFor="edit-opponent">Przeciwnik *</label>
                  <input
                    id="edit-opponent"
                    type="text"
                    value={opponent}
                    onChange={(e) => setOpponent(e.target.value)}
                    placeholder="np. KS AZS Politechnika Warszawska"
                    required
                    disabled={updateFullMatchMutation.isPending || deleteMatchMutation.isPending}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit-match-date">Data *</label>
                    <input
                      id="edit-match-date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                      disabled={updateFullMatchMutation.isPending || deleteMatchMutation.isPending}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit-match-time">Godzina</label>
                    <input
                      id="edit-match-time"
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      disabled={updateFullMatchMutation.isPending || deleteMatchMutation.isPending}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="edit-match-location">Lokalizacja *</label>
                  <input
                    id="edit-match-location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="np. Hala sportowa, ul. Sportowa 1"
                    required
                    disabled={updateFullMatchMutation.isPending || deleteMatchMutation.isPending}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit-match-score">Wynik (opcjonalne)</label>
                    <input
                      id="edit-match-score"
                      type="text"
                      value={score}
                      onChange={(e) => setScore(e.target.value)}
                      placeholder="np. 3:1"
                      disabled={updateFullMatchMutation.isPending || deleteMatchMutation.isPending}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit-match-video-url">Link do YouTube (opcjonalne)</label>
                    <input
                      id="edit-match-video-url"
                      type="url"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      disabled={updateFullMatchMutation.isPending || deleteMatchMutation.isPending}
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="admin-button"
                    disabled={updateFullMatchMutation.isPending || deleteMatchMutation.isPending}
                  >
                    {updateFullMatchMutation.isPending ? 'Zapisywanie...' : 'Zapisz zmiany'}
                  </button>
                  
                  <button
                    type="button"
                    className="admin-button admin-button-danger"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={updateFullMatchMutation.isPending || deleteMatchMutation.isPending}
                  >
                    Usuń mecz
                  </button>
                </div>
              </form>

              {showDeleteConfirm && (
                <div className="delete-confirm">
                  <div className="delete-confirm-content">
                    <h4>Potwierdź usunięcie</h4>
                    <p>Czy na pewno chcesz usunąć mecz vs {selectedMatch.opponent}?</p>
                    <p className="delete-warning">Ta operacja jest nieodwracalna!</p>
                    <div className="delete-confirm-actions">
                      <button
                        type="button"
                        className="admin-button admin-button-danger"
                        onClick={handleDeleteMatch}
                        disabled={deleteMatchMutation.isPending}
                      >
                        {deleteMatchMutation.isPending ? 'Usuwanie...' : 'Tak, usuń'}
                      </button>
                      <button
                        type="button"
                        className="admin-button admin-button-secondary"
                        onClick={() => setShowDeleteConfirm(false)}
                        disabled={deleteMatchMutation.isPending}
                      >
                        Anuluj
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}

