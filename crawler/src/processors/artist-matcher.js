import { supabase } from '../config/index.js'

/**
 * 艺人匹配工具
 */

// 常见艺人别名映射（可以扩展）
const artistAliases = {
  '周杰伦': ['Jay Chou', '周董'],
  '林俊杰': ['JJ Lin', 'JJ'],
  '五月天': ['Mayday'],
  '邓紫棋': ['G.E.M.', 'GEM'],
  '薛之谦': ['老薛'],
  '华晨宇': ['花花'],
  // 可以添加更多...
}

/**
 * 查找艺人
 */
export async function findArtist(name) {
  if (!name) return null
  
  // 直接匹配
  const { data } = await supabase
    .from('artists')
    .select('id, name, aliases')
    .eq('name', name)
    .single()
  
  if (data) return data
  
  // 别名匹配
  const { data: aliasData } = await supabase
    .from('artists')
    .select('id, name, aliases')
    .contains('aliases', [name])
    .single()
  
  return aliasData
}

/**
 * 创建或更新艺人
 */
export async function upsertArtist(name, options = {}) {
  if (!name) return null
  
  const existing = await findArtist(name)
  
  if (existing) {
    return existing.id
  }
  
  // 创建新艺人
  const { data, error } = await supabase
    .from('artists')
    .insert({
      name,
      aliases: artistAliases[name] || [],
      ...options
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error creating artist:', error.message)
    return null
  }
  
  return data.id
}

/**
 * 批量匹配艺人
 */
export async function matchArtists(artistNames) {
  if (!artistNames || artistNames.length === 0) return []
  
  const ids = []
  
  for (const name of artistNames) {
    const id = await findArtist(name)
    if (id) {
      ids.push(id.id)
    }
  }
  
  return ids
}

export default {
  findArtist,
  upsertArtist,
  matchArtists
}
