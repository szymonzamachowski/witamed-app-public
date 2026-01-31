import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types/database'

export function usePlayers() {
  return useQuery({
    queryKey: ['players'],
    queryFn: async () => {
      // Pobierz wszystkich zawodników: role='player' LUB (role='admin' AND league_license_number IS NOT NULL)
      // To oznacza, że zawodnicy z rolą admin (którzy grają) są również uwzględnieni
      // ale czyste konta adminów (bez league_license_number) nie są
      
      // Najpierw pobierz zawodników z role='player'
      const { data: players, error: playersError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'player')
        .order('full_name', { ascending: true })

      if (playersError) {
        throw playersError
      }

      // Następnie pobierz adminów z league_license_number (zawodnicy-admini)
      const { data: adminPlayers, error: adminPlayersError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'admin')
        .not('league_license_number', 'is', null)
        .order('full_name', { ascending: true })

      if (adminPlayersError) {
        throw adminPlayersError
      }

      // Połącz i posortuj wyniki
      const allPlayers = [...(players || []), ...(adminPlayers || [])]
      allPlayers.sort((a, b) => {
        const nameA = a.full_name || a.username || ''
        const nameB = b.full_name || b.username || ''
        return nameA.localeCompare(nameB)
      })

      return allPlayers as Profile[]
    },
  })
}

