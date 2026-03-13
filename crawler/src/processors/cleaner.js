/**
 * 数据清洗工具
 */

/**
 * 清理文本
 */
export function cleanText(text) {
  if (!text) return ''
  
  return text
    .replace(/<[^>]*>/g, '')           // 移除 HTML 标签
    .replace(/&nbsp;/g, ' ')           // 替换 HTML 实体
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')              // 多个空格合并为一个
    .trim()
}

/**
 * 清理标题
 */
export function cleanTitle(title) {
  if (!title) return ''
  
  return cleanText(title)
    .replace(/【.*?】/g, '')            // 移除【】标签
    .replace(/\[.*?\]/g, '')           // 移除[]标签
    .replace(/\(.*?\)/g, '')           // 移除()内容
    .replace(/（.*?）/g, '')           // 移除中文括号内容
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * 提取艺人名称
 */
export function extractArtists(text) {
  if (!text) return []
  
  const cleaned = cleanText(text)
  
  // 尝试按常见分隔符拆分
  const artists = cleaned
    .split(/[、,，\/\\&]/)
    .map(a => a.trim())
    .filter(a => a.length > 0 && a.length < 50)  // 过滤异常值
  
  return [...new Set(artists)]  // 去重
}

/**
 * 清理 URL
 */
export function cleanUrl(url) {
  if (!url) return ''
  
  // 移除 URL 参数中的追踪标识
  try {
    const parsed = new URL(url)
    const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'spm', 'from']
    trackingParams.forEach(param => parsed.searchParams.delete(param))
    return parsed.toString()
  } catch {
    return url
  }
}

/**
 * 清理演出数据
 */
export function cleanEventData(data) {
  return {
    title: cleanTitle(data.title),
    description: cleanText(data.description),
    artist_names: extractArtists(data.artist_names?.join(' / ') || ''),
    venue_name: cleanText(data.venue_name),
    city: cleanText(data.city),
    poster_url: cleanUrl(data.poster_url),
    price_range: cleanText(data.price_range),
    ...data
  }
}

export default {
  cleanText,
  cleanTitle,
  extractArtists,
  cleanUrl,
  cleanEventData
}
