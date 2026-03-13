import { createClient } from '@supabase/supabase-js'
import type { Database } from '~/types/database'

type Event = Database['public']['Tables']['events']['Row']

export const useSearch = () => {
  const config = useRuntimeConfig()
  
  const supabase = createClient<Database>(
    config.public.supabaseUrl,
    config.public.supabaseKey
  )
  
  // 全文搜索
  const search = async (query: string, options?: {
    type?: 'events' | 'artists' | 'venues' | 'all'
    limit?: number
  }) => {
    const { type = 'all', limit = 20 } = options || {}
    
    const results: {
      events: Event[]
    } = {
      events: []
    }
    
    // 搜索演出
    if (type === 'all' || type === 'events') {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .or(`title.ilike.%${query}%,artist_names.cs.{${query}},venue_name.ilike.%${query}%`)
        .eq('status', 'active')
        .limit(limit)
      
      if (!error && data) {
        results.events = data as Event[]
      }
    }
    
    return results
  }
  
  // 高亮搜索结果
  const highlight = (text: string, query: string) => {
    if (!query) return text
    const regex = new RegExp(`(${query})`, 'gi')
    return text.replace(regex, '<mark class="bg-primary-500/30 text-white px-0.5 rounded">$1</mark>')
  }
  
  return {
    search,
    highlight
  }
}
