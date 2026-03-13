import BaseCrawler from './base.js'
import { config } from '../config/index.js'

/**
 * MoreTickets 爬虫
 * https://www.moretickets.com
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
    const { city, type = 'all', page = 1 } = params
    const results = []
    
    try {
      if (!this.page) await this.launchBrowser()
      
      // MoreTickets 演出列表
      const typePath = {
        concert: 'concert',
        livehouse: 'live',
        festival: 'festival',
        all: ''
      }
      
      const url = `${this.baseUrl}/events/${typePath[type] || ''}?page=${page}`
      console.log(`[MoreTickets] Crawling: ${url}`)
      
      await this.goto(url)
      await this.delay(2000)
      
      // 等待列表加载
      await this.page.waitForSelector('.event-card, .event-item, [class*="event"]', { timeout: 10000 }).catch(() => {})
      
      // 提取演出链接
      const eventLinks = await this.page.evaluate(() => {
        const links = []
        const selectors = [
          'a[href*="/event/"]',
          'a[href*="/events/"]',
          '.event-card a',
          '.event-item a',
          '[class*="event"] a'
        ]
        
        for (const selector of selectors) {
          const elements = document.querySelectorAll(selector)
          elements.forEach(el => {
            const href = el.href
            if (href && !links.includes(href) && (href.includes('/event/') || href.includes('/events/'))) {
              links.push(href)
            }
          })
        }
        
        return links
      })
      
      console.log(`[MoreTickets] Found ${eventLinks.length} events`)
      
      // 爬取每个演出的详情
      for (const link of eventLinks.slice(0, 20)) {
        try {
          await this.delay(800)
          const detail = await this.crawlDetail(link)
          if (detail) {
            results.push(detail)
          }
        } catch (error) {
          console.error(`[MoreTickets] Error crawling ${link}:`, error.message)
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
      await this.delay(1000)
      
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
      /(\d{4})-(\d{2})-(\d{2})/
    ]
    
    for (const pattern of patterns) {
      const match = text.match(pattern)
      if (match) {
        let year, month, day, hour = 0, minute = 0
        
        if (match.length === 6) {
          [, year, month, day, hour, minute] = match
        } else if (match.length === 5) {
          year = new Date().getFullYear()
          [, month, day, hour, minute] = match
        } else if (match.length === 4) {
          [, year, month, day] = match
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
    const cityMatch = text.match(/(北京|上海|广州|深圳|成都|杭州|重庆|武汉|西安|苏州|天津|南京|长沙|郑州|东莞|青岛|沈阳|宁波|昆明|香港|澳门)/)
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
      const nums = prices.map(Number).filter(n => n > 10 && n < 10000)
      if (nums.length > 0) {
        const min = Math.min(...nums)
        const max = Math.max(...nums)
        return min === max ? `¥${min}` : `¥${min}-${max}`
      }
    }
    
    return text.trim()
  }
}

export default MoreticketsCrawler
