import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Event } from '../types/database'

export function useEvents() {
  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true })

      if (error) {
        console.error('Błąd przy pobieraniu wydarzeń:', error)
        throw error
      }

      return (data || []) as Event[]
    },
    staleTime: 1000 * 60 * 5, // 5 minut
  })
}

export function useEventsByType(type: 'training' | 'match' | 'friendly' | 'other' | 'sparing') {
  return useQuery({
    queryKey: ['events', type],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('type', type)
        .order('date', { ascending: true })

      if (error) {
        console.error('Błąd przy pobieraniu wydarzeń:', error)
        throw error
      }

      return (data || []) as Event[]
    },
    staleTime: 1000 * 60 * 5, // 5 minut
  })
}

