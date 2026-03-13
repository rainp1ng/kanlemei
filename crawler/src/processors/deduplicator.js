import { supabase } from '../config/index.js'

/**
 * 去重工具
 */

/**
 * 检查演出是否已存在
 */
export async function checkExists(sourcePlatform, sourceId) {
  if (!sourcePlatform || !sourceId) return null
  
  const { data, error } = await supabase
    .from('events')
    .select('id, updated_at')
    .eq('source_platform', sourcePlatform)
    .eq('source_id', sourceId)
    .single()
  
  if (error && error.code !== 'PGRST116') {  // PGRST116 = not found
    console.error('Error checking exists:', error.message)
  }
  
  return data
}

/**
 * 批量检查重复
 */
export async function batchCheckExists(events) {
  const results = new Map()
  
  // 构建查询条件
  const conditions = events
    .filter(e => e.source_platform && e.source_id)
    .map(e => `and(source_platform.eq.${e.source_platform},source_id.eq.${e.source_id})`)
  
  if (conditions.length === 0) return results
  
  // 分批查询（避免 URL 过长）
  const batchSize = 50
  for (let i = 0; i < conditions.length; i += batchSize) {
    const batch = conditions.slice(i, i + batchSize)
    const { data, error } = await supabase
      .from('events')
      .select('id, source_platform, source_id')
      .or(batch.join(','))
    
    if (data) {
      data.forEach(event => {
        results.set(`${event.source_platform}:${event.source_id}`, event.id)
      })
    }
  }
  
  return results
}

/**
 * 根据标题和日期去重（备用方案）
 */
export async function checkByTitleAndDate(title, eventDate, city) {
  if (!title || !eventDate) return null
  
  const { data, error } = await supabase
    .from('events')
    .select('id, source_platform, source_id')
    .ilike('title', title)
    .gte('event_date', new Date(eventDate).toISOString())
    .lte('event_date', new Date(new Date(eventDate).getTime() + 86400000).toISOString())
    .eq('city', city)
    .limit(1)
    .single()
  
  if (error && error.code !== 'PGRST116') {
    console.error('Error checking by title:', error.message)
  }
  
  return data
}

export default {
  checkExists,
  batchCheckExists,
  checkByTitleAndDate
}
