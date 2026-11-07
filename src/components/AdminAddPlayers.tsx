import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { PlayerStatus, Profile } from '../types/database'
import './admin-add-players.css'

const STATUS_OPTIONS: { value: PlayerStatus; label: string }[] = [
  { value: 'active', label: 'Zawodnik' },
  { value: 'injured', label: 'Kontuzjowany' },
  { value: 'staff', label: 'Sztab' },
]

export default function AdminAddPlayers() {
  const queryClient = useQueryClient()

  const { data: profiles, isLoading, error } = useQuery({
    queryKey: ['all-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*').order('full_name')
      if (error) throw error
      return data as Profile[]
    },
  })

  // Panel zmienia tylko status w kadrze; roli admina stąd nie da się nadać ani odebrać
  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: PlayerStatus }) => {
      const { error } = await supabase.from('profiles').update({ player_status: status }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-profiles'] })
      queryClient.invalidateQueries({ queryKey: ['players'] })
    },
  })

  return (
    <div className="admin-add-players">
      <h3>Użytkownicy aplikacji</h3>

      <p className="info-text">
        Kontuzjowani i sztab mają dostęp do aplikacji, ale nie zaznaczają obecności i nie ma ich w statystykach meczu.
        Sztab dostaje przypomnienia, kontuzjowani nie.
      </p>

      {isLoading && <p className="muted">Ładowanie…</p>}
      {error && <p className="admin-error">Nie udało się pobrać listy: {(error as Error).message}</p>}
      {setStatus.error && <p className="admin-error">Nie udało się zmienić statusu: {(setStatus.error as Error).message}</p>}

      {profiles && (
        <div className="players-table-container">
          <table className="players-table">
            <thead>
              <tr>
                <th>Lp.</th>
                <th>Imię i nazwisko</th>
                <th>Login</th>
                <th>Numer legitymacji</th>
                <th>Rola</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((player, index) => (
                <tr key={player.id}>
                  <td>{index + 1}</td>
                  <td>
                    <strong>{player.full_name}</strong>
                    {player.training_only && <span className="muted"> · tylko treningi</span>}
                  </td>
                  <td>
                    <code>{player.username}</code>
                  </td>
                  <td>{player.league_license_number ? <code>{player.league_license_number}</code> : '—'}</td>
                  <td>
                    {player.role === 'admin' ? (
                      <span className="admin-badge">ADMIN</span>
                    ) : (
                      <span className="player-badge">Użytkownik</span>
                    )}
                  </td>
                  <td>
                    <select
                      className="match-select player-status-select"
                      aria-label={`Status: ${player.full_name}`}
                      value={player.player_status ?? 'active'}
                      disabled={setStatus.isPending}
                      onChange={e => setStatus.mutate({ id: player.id, status: e.target.value as PlayerStatus })}
                    >
                      {STATUS_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="info-box">
        <p><strong>Informacje:</strong></p>
        <ul>
          <li>Hasło startowe przekazuje admin (poza aplikacją)</li>
          <li>Logowanie odbywa się tylko loginem (nazwiskiem)</li>
          <li>Rolę admina zmienia się poza panelem</li>
        </ul>
      </div>
    </div>
  )
}
