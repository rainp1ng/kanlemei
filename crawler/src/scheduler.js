import cron from 'node-cron'
import CrawlerManager from './manager.js'

const manager = new CrawlerManager()

/**
 * 定时任务：每天凌晨 2 点爬取
 */
export function startScheduler() {
  console.log('📅 Starting scheduler...')
  
  // 每天凌晨 2 点执行
  cron.schedule('0 2 * * *', async () => {
    console.log('\n⏰ Scheduled crawl started')
    try {
      await manager.run('all')
    } catch (error) {
      console.error('Scheduled crawl failed:', error)
    }
  })
  
  console.log('✅ Scheduler started (runs at 2:00 AM daily)')
}

/**
 * 手动运行
 */
export async function runOnce(platform = 'all') {
  try {
    const result = await manager.run(platform)
    await manager.cleanup()
    return result
  } catch (error) {
    await manager.cleanup()
    throw error
  }
}

export default { startScheduler, runOnce }
