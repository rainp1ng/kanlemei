import BaseCrawler from './base.js'
import { config } from '../config/index.js'

/**
 * MoreTickets 爬虫
 * https://www.moretickets.com
 * 国际票务平台，主要港澳演出
 */
export class MoreticketsCrawler extends BaseCrawler {
  get platform() {
    return 'moretickets'
  }
  
  get baseUrl() {
    return 'https://www.moretickets.com'
  }
  
  /**
   * 爬取演出列表
   */
  async crawlList(params = {}) {
    const results = []
    
    try {
      if (!this.page) await this.launchBrowser()
      
      // 访问首页
      const url = `${this.baseUrl}/`
      console.log(`[MoreTickets] Crawling: ${url}`)
      
      await this.goto(url)
      await this.delay(3000)
      
      // 提取演出信息（首页直接显示演出列表）
      const events = await this.page.evaluate(() => {
        const results = []
        const seen = new Set()
        
        // 查找所有演出卡片
        const cards = document.querySelectorAll('[class*="event"], [class*="card"], [class*="item"]')
        
        // 尝试从页面提取演出信息
        // 页面结构：每个演出有名称、日期、地点、价格
        document.querySelectorAll('a').forEach(a => {
          const text = a.textContent || ''
          const href = a.href
          
          // 跳过导航链接
          if (!href || href.includes('about') || href.includes('faq') || href.includes('careers')) return
          
          // 尝试提取演出信息
          const parentEl = a.closest('[class*="event"]') || a.closest('[class*="card"]') || a.parentElement?.parentElement
          if (!parentEl) return
          
          const fullText = parentEl.textContent || ''
          
          // 检查是否包含演出信息
          if (fullText.includes('演唱會') || fullText.includes('活動') || fullText.includes('HK$') || fullText.includes('澳門') || fullText.includes('香港')) {
            // 提取标题
            const titleMatch = fullText.match(/([^\n]+?(演唱會|巡演|見面會|音樂會)[^\n]*)/)
            const title = titleMatch ? titleMatch[1].trim() : ''
            
            if (title && !seen.has(title)) {
              seen.add(title)
              
              // 提取日期
              const dateMatch = fullText.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/)
              const date = dateMatch ? `${dateMatch[1]}/${dateMatch[2]}/${dateMatch[3]}` : ''
              
              // 提取地点
              let location = ''
              if (fullText.includes('中國香港') || fullText.includes('香港')) location = '香港'
              else if (fullText.includes('中國澳門') || fullText.includes('澳門')) location = '澳门'
              else if (fullText.includes('中國台灣') || fullText.includes('台灣')) location = '台湾'
              else if (fullText.includes('新加坡')) location = '新加坡'
              else if (fullText.includes('馬來西亞')) location = '马来西亚'
              else if (fullText.includes('韓國')) location = '韩国'
              
              // 提取价格
              const priceMatch = fullText.match(/HK\$\s*[\d,]+/)
              const price = priceMatch ? priceMatch[0] : ''
              
              // 尝试获取图片
              const img = parentEl.querySelector('img')
              const poster = img ? img.src : ''
              
              results.push({
                title,
                date,
                location,
                price,
                poster,
                sourceUrl: href.includes('show-list') ? '' : href,
                sourceId: href.split('/').pop() || ''
              })
            }
          }
        })
        
        return results.slice(0, 30)
      })
      
      console.log(`[MoreTickets] Found ${events.length} events`)
      
      // 处理每个演出
      for (const event of events) {
        if (!event.title || !event.sourceUrl) continue
        
        try {
          await this.delay(500)
          
          // 如果有详情页，访问获取更多信息
          if (event.sourceUrl && event.sourceUrl.startsWith('http')) {
            const detail = await this.crawlDetail(event.sourceUrl)
            if (detail) {
              results.push(detail)
              console.log(`[MoreTickets] ✅ Crawled: ${detail.title}`)
            }
          } else {
            // 直接使用列表信息
            const normalized = this.normalize({
              title: event.title,
              venueName: event.location,
              city: event.location,
              eventDate: this.parseDate(event.date),
              posterUrl: event.poster,
              priceRange: event.price,
              sourceUrl: event.sourceUrl || `${this.baseUrl}/`,
              sourceId: event.sourceId || `mt_${Date.now()}`
            })
            results.push(normalized)
            console.log(`[MoreTickets] ✅ Added: ${event.title}`)
          }
        } catch (error) {
          console.error(`[MoreTickets] Error processing event:`, error.message)
        }
      }
      
    } catch (error) {
      console.error('[MoreTickets] Error crawling list:', error.message)
      throw error
    }
    
    return results
  }
  
  /**
   * 爬取演出详情
   */
  async crawlDetail(url) {
    try {
      if (!this.page) await this.launchBrowser()
      
      console.log(`[MoreTickets] Crawling detail: ${url}`)
      await this.goto(url)
      await this.delay(1500)
      
      // 提取详情数据
      const data = await this.page.evaluate(() => {
        // 标题
        const titleEl = document.querySelector('h1, .event-title, [class*="title"]')
        const title = titleEl?.textContent?.trim() || ''
        
        // 时间
        const timeEl = document.querySelector('[class*="time"], .event-time, .date')
        const timeText = timeEl?.textContent?.trim() || ''
        
        // 地点/场馆
        const venueEl = document.querySelector('[class*="venue"], [class*="address"], .location, [class*="place"]')
        const venueText = venueEl?.textContent?.trim() || ''
        
        // 艺人
        const artistEls = document.querySelectorAll('[class*="artist"], .performer, [class*="singer"]')
        const artists = Array.from(artistEls).map(el => el.textContent?.trim()).filter(Boolean)
        
        // 海报 - 尝试多种选择器
        let posterUrl = ''
        const posterSelectors = [
          'img[class*="poster"]',
          'img[class*="cover"]',
          '.event-img img',
          '.banner img',
          'img[class*="event"]'
        ]
        for (const selector of posterSelectors) {
          const img = document.querySelector(selector)
          if (img?.src && !img.src.includes('avatar')) {
            posterUrl = img.src
            break
          }
        }
        
        // 票价
        const priceEl = document.querySelector('[class*="price"], .ticket-price')
        const priceText = priceEl?.textContent?.trim() || ''
        
        // 描述
        const descEl = document.querySelector('[class*="desc"], .event-intro, .content, [class*="intro"]')
        const description = descEl?.textContent?.trim() || ''
        
        // 从 URL 提取 ID
        const pathParts = window.location.pathname.split('/')
        const sourceId = pathParts[pathParts.length - 1] || pathParts[pathParts.length - 2] || ''
        
        return {
          title,
          timeText,
          venueText,
          artists,
          posterUrl,
          priceText,
          description,
          sourceUrl: window.location.href,
          sourceId
        }
      })
      
      if (!data.title) return null
      
      // 解析时间
      const eventDate = this.parseDate(data.timeText)
      
      // 解析城市和场馆
      const { city, venueName } = this.parseVenue(data.venueText)
      
      // 解析票价
      const priceRange = this.parsePrice(data.priceText)
      
      return this.normalize({
        title: data.title,
        description: data.description,
        artistNames: data.artists.length > 0 ? data.artists : undefined,
        venueName,
        city,
        eventDate,
        posterUrl: data.posterUrl,
        priceRange,
        sourceUrl: data.sourceUrl,
        sourceId: data.sourceId
      })
      
    } catch (error) {
      console.error('[MoreTickets] Error crawling detail:', error.message)
      return null
    }
  }
  
  /**
   * 解析日期
   */
  parseDate(text) {
    if (!text) return ''
    
    // 尝试多种格式
    const patterns = [
      /(\d{4})[年\-\/](\d{1,2})[月\-\/](\d{1,2})[日]?\s*(\d{1,2}):(\d{2})/,
      /(\d{1,2})[月\-\/](\d{1,2})[日]?\s*(\d{1,2}):(\d{2})/,
      /(\d{4})-(\d{2})-(\d{2})/,
      /(\d{4})\/(\d{1,2})\/(\d{1,2})/
    ]
    
    for (const pattern of patterns) {
      const match = text.match(pattern)
      if (match) {
        let year, month, day, hour = 0, minute = 0
        
        if (match.length === 6) {
          year = match[1]
          month = match[2]
          day = match[3]
          hour = match[4]
          minute = match[5]
        } else if (match.length === 5) {
          year = new Date().getFullYear()
          month = match[1]
          day = match[2]
          hour = match[3]
          minute = match[4]
        } else if (match.length === 4) {
          year = match[1]
          month = match[2]
          day = match[3]
        }
        
        return new Date(year, month - 1, day, hour, minute).toISOString()
      }
    }
    
    return ''
  }
  
  /**
   * 解析场馆信息
   */
  parseVenue(text) {
    if (!text) return { city: '', venueName: '' }
    
    // 尝试提取城市
    const cityMatch = text.match(/(北京|上海|广州|深圳|成都|杭州|重庆|武汉|西安|苏州|天津|南京|长沙|郑州|东莞|青岛|沈阳|宁波|昆明|香港|澳门|台湾|新加坡|马来西亚|韩国)/)
    const city = cityMatch ? cityMatch[1] : ''
    
    // 场馆名称
    let venueName = text.replace(city, '').trim()
    
    return { city, venueName }
  }
  
  /**
   * 解析票价
   */
  parsePrice(text) {
    if (!text) return null
    
    const prices = text.match(/\d+/g)
    if (prices && prices.length > 0) {
      const nums = prices.map(Number).filter(n => n > 10 && n < 100000)
      if (nums.length > 0) {
        const min = Math.min(...nums)
        const max = Math.max(...nums)
        return min === max ? `HK$${min}` : `HK$${min}-${max}`
      }
    }
    
    return text.trim()
  }
}

export default MoreticketsCrawler
