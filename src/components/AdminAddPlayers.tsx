import { useState, FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import './admin-add-players.css'

const DEFAULT_PLAYERS = [
  { username: 'kamil', fullName: 'Kamil' },
  { username: 'nowak', fullName: 'Nowak' },
  { username: 'marcin', fullName: 'Marcin' },
  { username: 'lis', fullName: 'Lis' },
  { username: 'lewandowska', fullName: 'Lewandowski' },
  { username: 'kozlowski', fullName: 'Kozłowski' },
  { username: 'zamach', fullName: 'Zamach' },
]

export default function AdminAddPlayers() {
  const queryClient = useQueryClient()
  const [password, setPassword] = useState('HASLO_STARTOWE')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [creating, setCreating] = useState<string[]>([])

  const createPlayerMutation = useMutation({
    mutationFn: async ({ username, fullName, password }: { username: string; fullName: string; password: string }) => {
      // Utwórz użytkownika w auth
      const email = `${username}@witamed.local`
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            full_name: fullName,
            role: 'player'
          },
          emailRedirectTo: undefined
        }
      })

      if (authError) throw authError

      // Utwórz profil
      if (authData?.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            username,
            full_name: fullName,
            role: 'player'
          })

        if (profileError) {
          console.error('Błąd przy tworzeniu profilu:', profileError)
          // Nie rzucamy błędu - użytkownik może już istnieć
        }
      }

      return authData
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] })
    }
  })

  const handleCreateAll = async () => {
    setError(null)
    setSuccess(null)
    setCreating([])

    if (!password || password.length < 6) {
      setError('Hasło musi mieć co najmniej 6 znaków')
      return
    }

    const results: string[] = []
    const errors: string[] = []

    for (const player of DEFAULT_PLAYERS) {
      setCreating(prev => [...prev, player.username])
      
      try {
        await createPlayerMutation.mutateAsync({
          username: player.username,
          fullName: player.fullName,
          password
        })
        results.push(player.username)
      } catch (err: any) {
        // Sprawdź czy użytkownik już istnieje
        if (err.message?.includes('already registered') || err.message?.includes('already exists')) {
          results.push(`${player.username} (już istnieje)`)
        } else {
          errors.push(`${player.username}: ${err.message || 'Błąd'}`)
        }
      } finally {
        setCreating(prev => prev.filter(u => u !== player.username))
      }
    }

    if (results.length > 0) {
      setSuccess(`Utworzono/zaktualizowano: ${results.join(', ')}`)
    }
    if (errors.length > 0) {
      setError(`Błędy: ${errors.join('; ')}`)
    }
  }

  return (
    <div className="admin-add-players">
      <h3>Dodaj zawodników z przykładowych statystyk</h3>
      
      <p className="info-text">
        Ten formularz utworzy 7 zawodników widocznych na przykładowych statystykach:
      </p>

      <ul className="players-list">
        {DEFAULT_PLAYERS.map(player => (
          <li key={player.username}>
            <strong>{player.fullName}</strong> (username: <code>{player.username}</code>)
            {creating.includes(player.username) && <span className="creating"> ⏳ Tworzenie...</span>}
          </li>
        ))}
      </ul>

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

      <form onSubmit={(e) => { e.preventDefault(); handleCreateAll(); }} className="admin-form">
        <div className="form-group">
          <label htmlFor="password">Hasło dla wszystkich zawodników *</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 6 znaków"
            minLength={6}
            required
            disabled={creating.length > 0}
          />
          <small className="form-hint">
            To samo hasło zostanie użyte dla wszystkich zawodników. Możesz je później zmienić.
          </small>
        </div>

        <button 
          type="submit" 
          className="admin-button"
          disabled={creating.length > 0}
        >
          {creating.length > 0 
            ? `Tworzenie... (${creating.length}/${DEFAULT_PLAYERS.length})` 
            : 'Utwórz wszystkich zawodników'}
        </button>
      </form>

      <div className="info-box">
        <p><strong>Uwaga:</strong></p>
        <ul>
          <li>Każdy zawodnik otrzyma email: <code>username@witamed.local</code></li>
          <li>Jeśli zawodnik już istnieje, zostanie pominięty</li>
          <li>Po utworzeniu możesz dodać statystyki dla meczu w sekcji "Zarządzanie statystykami"</li>
        </ul>
      </div>
    </div>
  )
}

