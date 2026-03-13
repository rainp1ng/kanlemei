import { runOnce, startScheduler } from './scheduler.js'

const args = process.argv.slice(2)
const platform = args[0] || 'all'
const mode = args[1] || 'once'

async function main() {
  console.log('🎵 看了没 - 演出信息爬虫')
  console.log('========================\n')
  
  if (mode === 'schedule' || args.includes('--schedule')) {
    // 定时任务模式
    startScheduler()
    // 保持进程运行
    process.on('SIGINT', () => {
      console.log('\n👋 Shutting down...')
      process.exit(0)
    })
  } else {
    // 单次运行模式
    try {
      await runOnce(platform)
    } catch (error) {
      console.error('Error:', error.message)
      process.exit(1)
    }
  }
}

main()
