import BaseCrawler from './base.js'
import { config } from '../config/index.js'

/**
 * 秀动爬虫
 * https://www.showstart.com
 */
export class XiudongCrawler extends BaseCrawler {
  get platform() {
    return 'xiudong'
  }
  
  get baseUrl() {
    return 'https://www.showstart.com'
  }
  
  // 城市代码映射
  get cityCodes() {
    return {
      '北京': '10',
      '上海': '20',
      '广州': '30',
      '深圳': '31',
      '成都': '40',
      '杭州': '50',
      '重庆': '60',
      '武汉': '70',
      '西安': '80',
      '苏州': '90',
      '天津': '100',
      '南京': '110',
      '长沙': '120',
      '郑州': '130',
      '东莞': '140',
      '青岛': '150',
      '沈阳': '160',
      '宁波': '170',
      '昆明': '180',
      '香港': '190',
      '澳门': '200'
    }
  }
  
  /**
   * 爬取演出列表
   */
  async crawlList(params = {}) {
    const results = []
    
    try {
      if (!this.page) await this.launchBrowser()
      
      // 遍历主要城市
      const cities = ['北京', '上海', '广州', '深圳', '成都', '杭州', '武汉', '西安', '南京', '长沙']
      
      for (const city of cities) {
        const cityCode = this.cityCodes[city]
        if (!cityCode) continue
        
        const url = `${this.baseUrl}/event/list?cityCode=${cityCode}`
        console.log(`[Xiudong] Crawling: ${city} - ${url}`)
        
        await this.goto(url)
        await this.delay(3000)
        
        // 提取演出链接
        const eventLinks = await this.page.evaluate(() => {
          const links = []
          const seen = new Set()
          
          // 演出列表中的卡片链接
          document.querySelectorAll('a[href*="/event/"]').forEach(a => {
            const href = a.href
            if (href.includes('/event/list') || seen.has(href)) return
            seen.add(href)
            links.push(href)
          })
          
          return links.slice(0, 15)
        })
        
        console.log(`[Xiudong] ${city}: Found ${eventLinks.length} events`)
        
        // 爬取详情
        for (const link of eventLinks) {
          try {
            await this.delay(800)
            const detail = await this.crawlDetail(link)
            if (detail && detail.title) {
              results.push(detail)
              console.log(`[Xiudong] ✅ Crawled: ${detail.title}`)
            }
          } catch (error) {
            console.error(`[Xiudong] Error: ${error.message}`)
          }
        }
        
        await this.delay(500)
      }
      
    } catch (error) {
      console.error('[Xiudong] Error:', error.message)
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
      
      await this.goto(url)
      await this.delay(2000)
      
      const data = await this.page.evaluate(() => {
        // 标题 - 在主要信息区域
        const titleEl = document.querySelector('[class*="title"], h1, .event-title')
        const title = titleEl?.textContent?.trim() || ''
        
        if (!title) return null
        
        // 时间
        let timeText = ''
        document.querySelectorAll('p').forEach(p => {
          if (p.textContent.includes('演出时间')) {
            timeText = p.textContent
          }
        })
        
        // 场地和地址
        let venueText = ''
        let addressText = ''
        document.querySelectorAll('p').forEach(p => {
          const text = p.textContent
          if (text.includes('场地：')) {
            venueText = text
          }
          if (text.includes('地址：')) {
            addressText = text.replace('地址：', '').replace('查看地图', '').trim()
          }
        })
        
        // 海报 - 第一个大图
        let posterUrl = ''
        const mainImg = document.querySelector('main img, [class*="poster"] img, [class*="cover"] img')
        if (mainImg?.src && !mainImg.src.includes('avatar')) {
          posterUrl = mainImg.src
        }
        
        // 票价
        const prices = []
        document.querySelectorAll('button').forEach(btn => {
          const text = btn.textContent
          if (text.includes('￥')) {
            const match = text.match(/￥(\d+)/)
            if (match) prices.push(parseInt(match[1]))
          }
        })
        
        // 艺人
        const artists = []
        document.querySelectorAll('a[href*="/artist/"]').forEach(a => {
          const name = a.textContent?.trim()
          if (name && name.length > 0 && name.length < 20) {
            artists.push(name.replace(/\/$/, ''))
          }
        })
        
        // ID
        const pathParts = window.location.pathname.split('/')
        const sourceId = pathParts.filter(p => p).pop() || ''
        
        return {
          title,
          timeText,
          venueText,
          addressText,
          posterUrl,
          prices,
          artists: [...new Set(artists)],
          sourceUrl: window.location.href,
          sourceId
        }
      })
      
      if (!data || !data.title) return null
      
      // 解析
      const eventDate = this.parseDate(data.timeText)
      const { city, venueName } = this.parseVenue(data.venueText, data.addressText)
      const priceRange = data.prices.length > 0 
        ? (Math.min(...data.prices) === Math.max(...data.prices) 
          ? `¥${Math.min(...data.prices)}` 
          : `¥${Math.min(...data.prices)}-${Math.max(...data.prices)}`)
        : null
      
      return this.normalize({
        title: data.title,
        venueName: venueName || data.addressText,
        city,
        eventDate,
        posterUrl: data.posterUrl,
        priceRange,
        artistNames: data.artists.length > 0 ? data.artists : undefined,
        sourceUrl: data.sourceUrl,
        sourceId: data.sourceId
      })
      
    } catch (error) {
      console.error('[Xiudong] Detail error:', error.message)
      return null
    }
  }
  
  parseDate(text) {
    if (!text) return ''
    
    // 03月14日 20:00
    const match = text.match(/(\d{1,2})月(\d{1,2})日\s*(\d{1,2}):(\d{2})/)
    if (match) {
      const year = new Date().getFullYear()
      return new Date(year, parseInt(match[1]) - 1, parseInt(match[2]), parseInt(match[3]), parseInt(match[4])).toISOString()
    }
    
    return ''
  }
  
  parseVenue(venueText, addressText) {
    // 从地址或场地提取城市
    const fullText = `${venueText} ${addressText}`
    const cityMatch = fullText.match(/(北京|上海|广州|深圳|成都|杭州|重庆|武汉|西安|苏州|天津|南京|长沙|郑州|东莞|青岛|沈阳|宁波|昆明|香港|澳门)/)
    const city = cityMatch ? cityMatch[1] : ''
    
    // 场馆名称
    let venueName = venueText.replace('场地：', '').replace(city, '').trim() || addressText
    
    return { city, venueName }
  }
}

export default XiudongCrawler
