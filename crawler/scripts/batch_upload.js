import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fjdjumlzqazvulvanmdg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqZGp1bWx6cWF6dnVsdmFubWRnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzI4OTE2MywiZXhwIjoyMDg4ODY1MTYzfQ.n-LxPp9nP4r0zT1nLnOKzOKQ-xUQZyNAELvZQrxTnHk'

const supabase = createClient(supabaseUrl, supabaseKey)

async function uploadImage(imageUrl, eventId) {
  try {
    const response = await fetch(imageUrl)
    if (!response.ok) throw new Error(`Failed: ${response.status}`)
    
    const buffer = await response.arrayBuffer()
    const filename = `event_${eventId}_${Date.now()}.jpg`
    
    const { data, error } = await supabase.storage
      .from('posters')
      .upload(filename, buffer, { contentType: 'image/jpeg', upsert: true })
    
    if (error) return imageUrl
    
    const { data: urlData } = supabase.storage.from('posters').getPublicUrl(filename)
    return urlData.publicUrl
  } catch (error) {
    return imageUrl
  }
}

const events = [
  { title: "维也纳圆舞曲之夜—纪念小约翰施特劳斯经典作品交响音乐会", price: "90", time: "2025/02/28 19:30", venue: "[北京]五棵松爱乐汇艺术空间都市音乐厅", artist: "爱乐汇交响乐团", posterUrl: "https://s2.showstart.com/img/2026/0104/17/30/4f32d0e13d73443abbdb711ab012031c_3400_4580_5244508.0x0.jpg", sourceId: "273182" },
  { title: "开心麻花沉浸式悬疑互动喜剧疯狂理发店", price: "168", time: "2025/05/10 14:30", venue: "[北京]疯狂理发店THE BOX朝外店", artist: "", posterUrl: "https://s2.showstart.com/img/2025/1201/17/30/34048b1b8a134528a7b0ed1b92b8135f_184_280_19407.0x0.jpg", sourceId: "263199" },
  { title: "琴键上的童年—猫和老鼠狮子王冰雪奇缘经典影视名曲音乐亲子互动科普演奏会", price: "80", time: "2025/09/06 10:30", venue: "[北京]三里屯爱乐汇城市演奏厅", artist: "爱乐汇轻音乐团", posterUrl: "https://s2.showstart.com/img/2025/0922/15/30/0a1a04bb6157412597421bcda1fcca0a_1280_1723_724863.0x0.jpg", sourceId: "274641" },
  { title: "浪漫古典—卡农欢乐颂世界经典名曲系列音乐会", price: "70", time: "2025/09/20 14:00", venue: "[北京]三里屯爱乐汇城市演奏厅", artist: "A442乐团", posterUrl: "https://s2.showstart.com/img/2025/0820/12/00/1974fb7ae5234715ab1ae95e9146707f_664_878_897095.0x0.png", sourceId: "274183" },
  { title: "沧海一声笑笑傲江湖神雕侠侣武侠影视金曲视听交响演唱会", price: "196", time: "2025/10/06 19:30", venue: "[北京]五棵松爱乐汇艺术空间都市剧场", artist: "爱乐汇交响乐团", posterUrl: "https://s2.showstart.com/img/2026/0129/14/30/3f8d270a719c47d5b1b259de73aa5c47_3400_4580_6606015.0x0.jpg", sourceId: "278054" },
  { title: "坂本龙一经典名曲音乐会", price: "70", time: "2025/10/11 19:30", venue: "[北京]三里屯爱乐汇城市演奏厅", artist: "VCP留声机乐团", posterUrl: "https://s2.showstart.com/img/2026/0121/09/30/8e82de4f627246b287977c19f7328683_4724_6298_980081.0x0.jpg", sourceId: "274771" },
  { title: "青春乐团烛光音乐会动漫主题天空之城权力的游戏", price: "298", time: "2025/11/22 16:00", venue: "[北京]青春无限音乐厅北京朝阳店", artist: "", posterUrl: "https://s2.showstart.com/img/2025/1114/10/00/af78ddef8db74f539510cc482b500f25_957_1280_699292.0x0.jpg", sourceId: "283418" },
  { title: "青春无限乐团LALALAND爱乐之城世界影视作品曲目烛光音乐会", price: "298", time: "2025/11/22 18:30", venue: "[北京]青春无限音乐厅北京朝阳店", artist: "", posterUrl: "https://s2.showstart.com/img/2025/1114/10/00/2b6af1a7a93649df9155520f838af2d8_1020_1360_1801086.0x0.png", sourceId: "283420" },
  { title: "奇妙嘿夜烛光音乐会最伟大的作品JJ曲目梦幻联动", price: "298", time: "2025/11/29 20:20", venue: "[北京]青春无限音乐厅北京朝阳店", artist: "", posterUrl: "https://s2.showstart.com/img/2025/1127/16/00/b81f8404161d4dd4909b8e6a7ffe663f_1020_1360_1524488.0x0.png", sourceId: "284674" },
  { title: "超燃交响史诗级电影金曲交响音乐会", price: "224", time: "2025/12/05 19:30", venue: "[北京]五棵松爱乐汇艺术空间都市音乐厅", artist: "爱乐汇交响乐团", posterUrl: "https://s2.showstart.com/img/2025/1119/18/00/377b7db3c4be4b1881909b628e4e2883_1080_1456_217000.0x0.jpg", sourceId: "283964" },
  { title: "欢乐颂致爱丽丝一生必听的百年浪漫经典名曲音乐会", price: "80", time: "2025/12/07 14:00", venue: "[北京]五棵松爱乐汇艺术空间都市剧场", artist: "爱乐汇轻音乐团", posterUrl: "https://s2.showstart.com/img/2026/0212/19/00/f7fffa80c2144f1b8a98efc5201e0d0c_1280_1725_230339.0x0.jpg", sourceId: "282115" },
  { title: "开心麻花大型贺岁宫廷剧甄嬛传沉浸版", price: "168", time: "2025/12/31 19:30", venue: "[北京]开心麻花A88剧场", artist: "", posterUrl: "https://s2.showstart.com/img/2025/1230/16/30/199da52bf15a47c7ba2cf5ed47e72ddb_336_504_217429.0x0.jpg", sourceId: "285385" },
  { title: "既往未来—小西天文物撷珍与悬塑艺术特展", price: "69", time: "2026/01/01 20:30", venue: "[北京]国家典籍博物馆", artist: "", posterUrl: "https://s2.showstart.com/img/2026/0105/09/30/fca2a88cd6c94046b29cd064c9a58e6a_960_1290_834457.0x0.jpg", sourceId: "287513" },
  { title: "小红帽经典童话励志儿童剧", price: "59", time: "2026/01/03 11:00", venue: "[北京]枫蓝熙剧场", artist: "", posterUrl: "https://s2.showstart.com/img/2025/0308/08/30/0737710799dd4631b73e2757766a32fd_2000_2667_1226836.0x0.jpg", sourceId: "283463" },
  { title: "全英文脱口秀开放麦北京城堡喜剧", price: "88", time: "2026/01/03 17:00", venue: "[北京]南阳共享际剧场", artist: "", posterUrl: "https://s2.showstart.com/img/2025/1230/10/30/aa05487bed6a4b3cbcfc02adb9ddacf9_1020_1360_187947.0x0.jpg", sourceId: "287182" },
  { title: "开心麻花最疯环境式悬疑喜剧谁杀了罗伯特沉浸版", price: "80", time: "2026/01/09 19:30", venue: "[北京]开心麻花A66剧场望京花花世界店", artist: "", posterUrl: "https://s2.showstart.com/img/2025/1216/15/30/0c3fc4a1b09243cf9ea1527de739c396_320_450_29839.0x0.jpg", sourceId: "286163" },
  { title: "Kei Gambit一人千声", price: "88", time: "2026/01/10 19:30", venue: "[北京]南阳共享际剧场", artist: "", posterUrl: "https://s2.showstart.com/img/2025/1230/12/00/b8f8c657a9f34d53ba6de690f2e28c99_800_1067_1704653.0x0.png", sourceId: "287179" },
  { title: "魔术脱口秀三块巧克力", price: "90", time: "2026/01/11 15:30", venue: "[北京]爱乐汇艺术空间", artist: "脱口秀孙峥", posterUrl: "https://s2.showstart.com/img/2025/1219/11/30/00ca9f9bfba84a48b64dae6535141853_1280_1862_120345.0x0.jpg", sourceId: "286437" },
  { title: "北京民族乐团民乐知多少亲子鉴赏音乐会", price: "84", time: "2026/01/17 10:30", venue: "[北京]三里屯爱乐汇城市演奏厅", artist: "北京民族乐团玖乐室内乐组合", posterUrl: "https://s2.showstart.com/img/2026/0115/17/30/42b8cf5f37d54926b641b320112bfbba_1284_1728_1787528.0x0.jpg", sourceId: "288327" },
  { title: "白雪公主经典童话梦幻儿童剧", price: "59", time: "2026/01/17 11:00", venue: "[北京]枫蓝熙剧场", artist: "", posterUrl: "https://s2.showstart.com/img/2025/0814/19/00/3faba8b1f64d45eba0fbbf16ae6940d1_1020_1360_237728.0x0.jpg", sourceId: "283475" }
]

async function main() {
  console.log('开始处理演出数据...\n')
  
  let success = 0, failed = 0
  
  for (const event of events) {
    try {
      const timeMatch = event.time.match(/(\d{4})\/(\d{2})\/(\d{2})\s*(\d{1,2}):(\d{2})/)
      let eventDate = null
      if (timeMatch) {
        eventDate = new Date(parseInt(timeMatch[1]), parseInt(timeMatch[2]) - 1, parseInt(timeMatch[3]), parseInt(timeMatch[4]), parseInt(timeMatch[5])).toISOString()
      }
      
      const venueMatch = event.venue.match(/\[([^\]]+)\](.+)/)
      const city = venueMatch ? venueMatch[1] : '北京'
      const venueName = venueMatch ? venueMatch[2].trim() : event.venue
      
      console.log(`[${events.indexOf(event) + 1}/${events.length}] ${event.title.substring(0, 20)}...`)
      const uploadedUrl = await uploadImage(event.posterUrl, event.sourceId)
      
      const record = {
        title: event.title,
        venue_name: venueName,
        city: city,
        event_date: eventDate,
        poster_url: uploadedUrl,
        price_range: event.price,
        artist_names: event.artist ? event.artist.split('/').filter(a => a) : [],
        source_platform: 'xiudong',
        source_id: event.sourceId,
        source_url: `https://www.showstart.com/event/${event.sourceId}`
      }
      
      const { error } = await supabase.from('events').upsert(record, { onConflict: 'source_platform,source_id' })
      
      if (error) {
        console.log(`  保存失败: ${error.message}`)
        failed++
      } else {
        console.log(`  已保存`)
        success++
      }
      
      await new Promise(r => setTimeout(r, 200))
    } catch (err) {
      console.error(`  错误: ${err.message}`)
      failed++
    }
  }
  
  console.log(`\n完成! 成功: ${success}, 失败: ${failed}`)
}

main().catch(console.error)
