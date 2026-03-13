#!/usr/bin/env node
import { runOnce } from './scheduler.js'

const platform = process.argv[2] || 'all'

console.log('🎵 看了没 - CLI 爬虫工具\n')
console.log('用法: node cli.js [platform]')
console.log('  platform: all | xiudong | damai | maoyan')
console.log('\n开始爬取...\n')

runOnce(platform)
  .then(stats => {
    console.log('\n✅ Done!')
    process.exit(0)
  })
  .catch(error => {
    console.error('\n❌ Error:', error.message)
    process.exit(1)
  })
