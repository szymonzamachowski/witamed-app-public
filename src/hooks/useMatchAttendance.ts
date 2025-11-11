import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Attendance } from '../types/database'

export type MatchAttendanceWithPlayer = Attendance & {
  profiles: {
    id: string
    username: string | null
    full_name: string | null
  } | null
}

export function useMatchAttendance(matchId: string) {
  return useQuery({
    queryKey: ['match-attendance', matchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attendance')
        .select('*, profiles(id, username, full_name)')
        .eq('match_id', matchId)

      if (error) {
        console.error('Błąd przy pobieraniu obecności na mecz:', error)
        throw error
      }

      return (data || []) as MatchAttendanceWithPlayer[]
    },
    enabled: !!matchId,
  })
}

export function useMatchAttendanceCount(matchId: string) {
  return useQuery({
    queryKey: ['match-attendance-count', matchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attendance')
        .select('id')
        .eq('match_id', matchId)
        .eq('status', 'present')

      if (error) {
        console.error('Błąd przy liczeniu obecności na mecz:', error)
        throw error
      }

      return data?.length || 0
    },
    enabled: !!matchId,
  })
}

export function useUserMatchAttendance(matchId: string, userId: string | undefined) {
  return useQuery({
    queryKey: ['user-match-attendance', matchId, userId],
    queryFn: async () => {
      if (!userId) return null

      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('match_id', matchId)
        .eq('player_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned
        console.error('Błąd przy pobieraniu obecności użytkownika na mecz:', error)
        throw error
      }

      return data as Attendance | null
    },
    enabled: !!matchId && !!userId,
  })
}

export function useToggleMatchAttendance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ matchId, playerId }: { matchId: string; playerId: string }) => {
      // Sprawdź czy już istnieje i jaki ma status
      const { data: existing } = await supabase
        .from('attendance')
        .select('id, status')
        .eq('match_id', matchId)
        .eq('player_id', playerId)
        .maybeSingle()

      const newStatus = existing?.status === 'present' ? 'absent' : 'present'

      if (existing) {
        // Aktualizuj
        const { data, error } = await supabase
          .from('attendance')
          .update({ status: newStatus })
          .eq('id', existing.id)
          .select()
          .single()

        if (error) throw error
        return data
      } else {
        // Dodaj nowy
        const { data, error } = await supabase
          .from('attendance')
          .insert([{
            match_id: matchId,
            player_id: playerId,
            status: newStatus,
            event_id: null // Musi być null, bo używamy match_id
          }])
          .select()
          .single()

        if (error) throw error
        return data
      }
    },
    onSuccess: (_, variables) => {
      // Odśwież cache
      queryClient.invalidateQueries({ queryKey: ['match-attendance', variables.matchId] })
      queryClient.invalidateQueries({ queryKey: ['match-attendance-count', variables.matchId] })
      queryClient.invalidateQueries({ queryKey: ['match-attendance-absent-count', variables.matchId] })
      queryClient.invalidateQueries({ queryKey: ['user-match-attendance', variables.matchId] })
    },
  })
}

export function useSetMatchAttendanceStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      matchId, 
      playerId, 
      status 
    }: { 
      matchId: string
      playerId: string
      status: 'present' | 'absent'
    }) => {
      // Sprawdź czy już istnieje
      const { data: existing } = await supabase
        .from('attendance')
        .select('id')
        .eq('match_id', matchId)
        .eq('player_id', playerId)
        .maybeSingle()

      if (existing) {
        // Aktualizuj
        const { data, error } = await supabase
          .from('attendance')
          .update({ status })
          .eq('id', existing.id)
          .select()
          .single()

        if (error) throw error
        return data
      } else {
        // Dodaj nowy
        const { data, error } = await supabase
          .from('attendance')
          .insert([{
            match_id: matchId,
            player_id: playerId,
            status,
            event_id: null
          }])
          .select()
          .single()

        if (error) throw error
        return data
      }
    },
    onSuccess: (_, variables) => {
      // Odśwież cache
      queryClient.invalidateQueries({ queryKey: ['match-attendance', variables.matchId] })
      queryClient.invalidateQueries({ queryKey: ['match-attendance-count', variables.matchId] })
      queryClient.invalidateQueries({ queryKey: ['match-attendance-absent-count', variables.matchId] })
      queryClient.invalidateQueries({ queryKey: ['user-match-attendance', variables.matchId] })
    },
  })
}

export function useMatchAbsentCount(matchId: string) {
  return useQuery({
    queryKey: ['match-attendance-absent-count', matchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attendance')
        .select('id')
        .eq('match_id', matchId)
        .eq('status', 'absent')

      if (error) {
        console.error('Błąd przy liczeniu nieobecnych na mecz:', error)
        throw error
      }

      return data?.length || 0
    },
    enabled: !!matchId,
  })
}

