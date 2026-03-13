import puppeteer from 'puppeteer'

async function test() {
  console.log('Starting browser test...')
  
  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    console.log('✅ Browser launched')
    
    const page = await browser.newPage()
    await page.goto('https://www.showstart.com')
    console.log('✅ Page loaded:', await page.title())
    
    // 获取演出链接
    const links = await page.evaluate(() => {
      const result = []
      document.querySelectorAll('a').forEach(a => {
        if (a.href.includes('/event/') || a.href.includes('/subject/')) {
          result.push(a.href)
        }
      })
      return [...new Set(result)].slice(0, 10)
    })
    
    console.log('Found', links.length, 'event links')
    console.log('Links:', links.slice(0, 5))
    
    await browser.close()
    console.log('✅ Test complete')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

test()
