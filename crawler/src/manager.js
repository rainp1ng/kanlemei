import { supabase, config } from './config/index.js'
import XiudongCrawler from './crawlers/xiudong.js'

/**
 * 爬虫管理器
 */
export class CrawlerManager {
  constructor() {
    this.crawlers = {
      xiudong: new XiudongCrawler()
    }
    
    this.stats = {
      found: 0,
      added: 0,
      updated: 0,
      errors: 0
    }
  }
  
  /**
   * 运行爬虫
   */
  async run(platform = 'all', options = {}) {
    console.log(`\n🚀 Starting crawler: ${platform}`)
    console.log(`   Time: ${new Date().toLocaleString()}`)
    
    const startTime = Date.now()
    let taskId = null
    
    try {
      // 创建任务记录
      const { data: task } = await supabase
        .from('crawler_tasks')
        .insert({
          platform,
          task_type: options.type || 'incremental',
          status: 'running',
          started_at: new Date().toISOString()
        })
        .select()
        .single()
      
      taskId = task?.id
      
      const allEvents = []
      
      // 运行爬虫
      if (platform === 'all') {
        for (const [name, crawler] of Object.entries(this.crawlers)) {
          if (config.platforms[name]?.enabled) {
            try {
              const events = await crawler.crawlList(options)
              allEvents.push(...events)
            } catch (error) {
              console.error(`Error running ${name} crawler:`, error.message)
              this.stats.errors++
            }
          }
        }
      } else if (this.crawlers[platform]) {
        const events = await this.crawlers[platform].crawlList(options)
        allEvents.push(...events)
      }
      
      this.stats.found = allEvents.length
      console.log(`\n📊 Found ${allEvents.length} events`)
      
      // 保存到数据库
      for (const event of allEvents) {
        try {
          await this.saveEvent(event)
        } catch (error) {
          console.error(`Error saving event:`, error.message)
          this.stats.errors++
        }
      }
      
      // 更新任务状态
      if (taskId) {
        await supabase
          .from('crawler_tasks')
          .update({
            status: 'completed',
            finished_at: new Date().toISOString(),
            events_found: this.stats.found,
            events_added: this.stats.added,
            events_updated: this.stats.updated
          })
          .eq('id', taskId)
      }
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(1)
      
      console.log(`\n✅ Crawler finished`)
      console.log(`   Duration: ${duration}s`)
      console.log(`   Found: ${this.stats.found}`)
      console.log(`   Added: ${this.stats.added}`)
      console.log(`   Updated: ${this.stats.updated}`)
      console.log(`   Errors: ${this.stats.errors}`)
      
      return this.stats
      
    } catch (error) {
      console.error('\n❌ Crawler failed:', error.message)
      
      // 更新任务状态
      if (taskId) {
        await supabase
          .from('crawler_tasks')
          .update({
            status: 'failed',
            finished_at: new Date().toISOString(),
            error_message: error.message
          })
          .eq('id', taskId)
      }
      
      throw error
    }
  }
  
  /**
   * 保存演出数据
   */
  async saveEvent(event) {
    if (!event.source_id || !event.source_platform) {
      console.log('Skipping event without source info:', event.title)
      return
    }
    
    // 检查是否已存在
    const { data: existing } = await supabase
      .from('events')
      .select('id')
      .eq('source_platform', event.source_platform)
      .eq('source_id', event.source_id)
      .single()
    
    if (existing) {
      // 更新
      const { error } = await supabase
        .from('events')
        .update({
          ...event,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
      
      if (!error) {
        this.stats.updated++
        console.log(`  📝 Updated: ${event.title}`)
      }
    } else {
      // 新增
      const { error } = await supabase
        .from('events')
        .insert(event)
      
      if (!error) {
        this.stats.added++
        console.log(`  ✨ Added: ${event.title}`)
      }
    }
  }
  
  /**
   * 关闭所有浏览器
   */
  async cleanup() {
    for (const crawler of Object.values(this.crawlers)) {
      await crawler.closeBrowser?.()
    }
  }
}

export default CrawlerManager
