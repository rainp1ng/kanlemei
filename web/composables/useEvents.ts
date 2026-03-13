import { createClient } from '@supabase/supabase-js'
import type { Database } from '~/types/database'

type Event = Database['public']['Tables']['events']['Row']

export const useEvents = () => {
  const config = useRuntimeConfig()
  
  // 创建 Supabase 客户端
  const supabase = createClient<Database>(
    config.public.supabaseUrl,
    config.public.supabaseKey
  )
  
  // 获取热门演出
  const getHotEvents = async (limit = 8) => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'active')
      .gte('event_date', new Date().toISOString())
      .order('view_count', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data as Event[]
  }
  
  // 获取演出列表
  const getEvents = async (params: {
    city?: string
    eventType?: string
    startDate?: string
    endDate?: string
    page?: number
    pageSize?: number
  }) => {
    const { city, eventType, startDate, endDate, page = 1, pageSize = 20 } = params
    
    let query = supabase
      .from('events')
      .select('*', { count: 'exact' })
      .eq('status', 'active')
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true })
    
    if (city) {
      query = query.eq('city', city)
    }
    
    if (eventType) {
      query = query.eq('event_type', eventType)
    }
    
    if (startDate) {
      query = query.gte('event_date', startDate)
    }
    
    if (endDate) {
      query = query.lte('event_date', endDate)
    }
    
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    
    const { data, error, count } = await query.range(from, to)
    
    if (error) throw error
    return { data: data as Event[], total: count || 0 }
  }
  
  // 获取演出详情
  const getEventById = async (id: string) => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data as Event
  }
  
  // 获取城市列表
  const getCities = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('city')
      .eq('status', 'active')
      .gte('event_date', new Date().toISOString())
    
    if (error) throw error
    
    // 统计每个城市的演出数量
    const cityCount = data.reduce((acc, item) => {
      acc[item.city] = (acc[item.city] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return Object.entries(cityCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  }
  
  return {
    getHotEvents,
    getEvents,
    getEventById,
    getCities
  }
}
