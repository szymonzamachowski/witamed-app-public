import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Attendance } from '../types/database'

export type AttendanceWithPlayer = Attendance & {
  profiles: {
    id: string
    username: string | null
    full_name: string | null
  } | null
}

export function useAttendance(eventId: string) {
  return useQuery({
    queryKey: ['attendance', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attendance')
        .select('*, profiles(id, username, full_name)')
        .eq('event_id', eventId)

      if (error) {
        console.error('Błąd przy pobieraniu obecności:', error)
        throw error
      }

      return (data || []) as AttendanceWithPlayer[]
    },
    enabled: !!eventId,
  })
}

export function useAttendanceCount(eventId: string) {
  return useQuery({
    queryKey: ['attendance-count', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attendance')
        .select('id')
        .eq('event_id', eventId)
        .eq('status', 'present')

      if (error) {
        console.error('Błąd przy liczeniu obecności:', error)
        throw error
      }

      return data?.length || 0
    },
    enabled: !!eventId,
  })
}

export function useUserAttendance(eventId: string, userId: string | undefined) {
  return useQuery({
    queryKey: ['user-attendance', eventId, userId],
    queryFn: async () => {
      if (!userId) return null

      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('event_id', eventId)
        .eq('player_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned
        console.error('Błąd przy pobieraniu obecności użytkownika:', error)
        throw error
      }

      return data as Attendance | null
    },
    enabled: !!eventId && !!userId,
  })
}

export function useToggleAttendance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ eventId, playerId }: { eventId: string; playerId: string }) => {
      // Sprawdź czy już istnieje i jaki ma status
      const { data: existing } = await supabase
        .from('attendance')
        .select('id, status')
        .eq('event_id', eventId)
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
            event_id: eventId,
            player_id: playerId,
            status: newStatus,
            match_id: null // Musi być null, bo używamy event_id
          }])
          .select()
          .single()

        if (error) throw error
        return data
      }
    },
    onSuccess: (_, variables) => {
      // Odśwież cache
      queryClient.invalidateQueries({ queryKey: ['attendance', variables.eventId] })
      queryClient.invalidateQueries({ queryKey: ['attendance-count', variables.eventId] })
      queryClient.invalidateQueries({ queryKey: ['user-attendance', variables.eventId] })
    },
  })
}

export function useSetAttendanceStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      eventId,
      playerId,
      status
    }: {
      eventId: string
      playerId: string
      status: 'present' | 'absent'
    }) => {
      // Sprawdź czy już istnieje
      const { data: existing } = await supabase
        .from('attendance')
        .select('id')
        .eq('event_id', eventId)
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
            event_id: eventId,
            player_id: playerId,
            status,
            match_id: null
          }])
          .select()
          .single()

        if (error) throw error
        return data
      }
    },
    onSuccess: (_, variables) => {
      // Odśwież cache
      queryClient.invalidateQueries({ queryKey: ['attendance', variables.eventId] })
      queryClient.invalidateQueries({ queryKey: ['attendance-count', variables.eventId] })
      queryClient.invalidateQueries({ queryKey: ['attendance-absent-count', variables.eventId] })
      queryClient.invalidateQueries({ queryKey: ['user-attendance', variables.eventId] })
    },
  })
}

export function useAbsentCount(eventId: string) {
  return useQuery({
    queryKey: ['attendance-absent-count', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attendance')
        .select('id')
        .eq('event_id', eventId)
        .eq('status', 'absent')

      if (error) {
        console.error('Błąd przy liczeniu nieobecnych:', error)
        throw error
      }

      return data?.length || 0
    },
    enabled: !!eventId,
  })
}

export function useDeleteEventAttendance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ attendanceId, eventId: _eventId }: { attendanceId: string; eventId: string }) => {
      const { error } = await supabase
        .from('attendance')
        .delete()
        .eq('id', attendanceId)

      if (error) {
        console.error('Błąd przy usuwaniu obecności (event):', error)
        throw error
      }
    },
    onSuccess: (_data, variables) => {
      // Odśwież powiązane zapytania dla wydarzenia
      const { eventId } = variables
      queryClient.invalidateQueries({ queryKey: ['attendance', eventId] })
      queryClient.invalidateQueries({ queryKey: ['attendance-count', eventId] })
      queryClient.invalidateQueries({ queryKey: ['attendance-absent-count', eventId] })
    },
  })
}