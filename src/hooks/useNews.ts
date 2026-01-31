import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { News } from '../types/database'

export function useNews() {
  return useQuery({
    queryKey: ['news'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news')
        .select('*, profiles(full_name, username)')
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      return data as (News & { profiles: { full_name: string; username: string } | null })[]
    },
    staleTime: 1000 * 60 * 5, // 5 minut
  })
}

