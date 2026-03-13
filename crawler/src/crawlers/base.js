/**
 * 爬虫基类
 * 所有平台爬虫继承此类
 */
export class BaseCrawler {
  constructor(options = {}) {
    this.options = {
      concurrency: 3,
      delay: 1000,
      timeout: 30000,
      retries: 3,
      ...options
    }
  }
  
  /**
   * 平台名称
   */
  get platform() {
    throw new Error('platform must be implemented')
  }
  
  /**
   * 平台基础 URL
   */
  get baseUrl() {
    throw new Error('baseUrl must be implemented')
  }
  
  /**
   * 启动浏览器
   */
  async launchBrowser() {
    const puppeteer = await import('puppeteer')
    
    this.browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    })
    
    this.page = await this.browser.newPage()
    
    // 设置视口
    await this.page.setViewport({ width: 1280, height: 800 })
    
    // 设置 User-Agent
    await this.page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    )
    
    return this.page
  }
  
  /**
   * 关闭浏览器
   */
  async closeBrowser() {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
      this.page = null
    }
  }
  
  /**
   * 延迟
   */
  async delay(ms = this.options.delay) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
  
  /**
   * 访问页面（带重试）
   */
  async goto(url, options = {}) {
    const { retries = this.options.retries, timeout = this.options.timeout } = options
    
    for (let i = 0; i < retries; i++) {
      try {
        await this.page.goto(url, {
          waitUntil: 'networkidle2',
          timeout
        })
        return true
      } catch (error) {
        console.log(`[Retry ${i + 1}/${retries}] Failed to load: ${url}`)
        if (i === retries - 1) throw error
        await this.delay(2000)
      }
    }
  }
  
  /**
   * 爬取演出列表
   * @param {object} params - 爬取参数
   * @param {string} params.city - 城市
   * @param {string} params.type - 演出类型
   * @returns {Promise<Array>} 演出列表
   */
  async crawlList(params) {
    throw new Error('crawlList must be implemented')
  }
  
  /**
   * 爬取演出详情
   * @param {string} url - 演出详情页 URL
   * @returns {Promise<object>} 演出详情
   */
  async crawlDetail(url) {
    throw new Error('crawlDetail must be implemented')
  }
  
  /**
   * 解析演出数据
   * @param {object} rawData - 原始数据
   * @returns {object} 标准化的演出数据
   */
  normalize(rawData) {
    return {
      title: rawData.title || '',
      description: rawData.description || null,
      artist_names: rawData.artistNames || [],
      venue_name: rawData.venueName || '',
      city: rawData.city || '',
      event_date: rawData.eventDate || '',
      event_end_date: rawData.eventEndDate || null,
      event_type: rawData.eventType || 'concert',
      poster_url: rawData.posterUrl || null,
      ticket_platforms: rawData.ticketPlatforms || [],
      price_range: rawData.priceRange || null,
      source_platform: this.platform,
      source_url: rawData.sourceUrl || '',
      source_id: rawData.sourceId || ''
    }
  }
}

export default BaseCrawler
