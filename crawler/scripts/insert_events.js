const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqZGp1bWx6cWF6dnVsdmFubWRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyODkxNjMsImV4cCI6MjA4ODg2NTE2M30.TWY_ftq6GYHU95zFb2JoIJZ0O_JCCwPt9AE_69DgCmI'
const URL = 'https://fjdjumlzqazvulvanmdg.supabase.co/rest/v1/events'

const events = [
  { title: "维也纳圆舞曲之夜交响音乐会", city: "北京", venue_name: "五棵松爱乐汇艺术空间", price_range: "90", event_date: "2025-02-28T19:30:00", poster_url: "https://s2.showstart.com/img/2026/0104/17/30/4f32d0e13d73443abbdb711ab012031c_3400_4580_5244508.0x0.jpg", source_id: "273182", artist_names: ["爱乐汇交响乐团"] },
  { title: "开心麻花沉浸式悬疑互动喜剧疯狂理发店", city: "北京", venue_name: "疯狂理发店THE BOX朝外店", price_range: "168", event_date: "2025-05-10T14:30:00", poster_url: "https://s2.showstart.com/img/2025/1201/17/30/34048b1b8a134528a7b0ed1b92b8135f_184_280_19407.0x0.jpg", source_id: "263199", artist_names: [] },
  { title: "琴键上的童年亲子互动科普演奏会", city: "北京", venue_name: "三里屯爱乐汇城市演奏厅", price_range: "80", event_date: "2025-09-06T10:30:00", poster_url: "https://s2.showstart.com/img/2025/0922/15/30/0a1a04bb6157412597421bcda1fcca0a_1280_1723_724863.0x0.jpg", source_id: "274641", artist_names: ["爱乐汇轻音乐团"] },
  { title: "浪漫古典世界经典名曲系列音乐会", city: "北京", venue_name: "三里屯爱乐汇城市演奏厅", price_range: "70", event_date: "2025-09-20T14:00:00", poster_url: "https://s2.showstart.com/img/2025/0820/12/00/1974fb7ae5234715ab1ae95e9146707f_664_878_897095.0x0.png", source_id: "274183", artist_names: ["A442乐团"] },
  { title: "沧海一声笑笑傲江湖武侠影视金曲视听交响演唱会", city: "北京", venue_name: "五棵松爱乐汇艺术空间都市剧场", price_range: "196", event_date: "2025-10-06T19:30:00", poster_url: "https://s2.showstart.com/img/2026/0129/14/30/3f8d270a719c47d5b1b259de73aa5c47_3400_4580_6606015.0x0.jpg", source_id: "278054", artist_names: ["爱乐汇交响乐团"] },
  { title: "坂本龙一经典名曲音乐会", city: "北京", venue_name: "三里屯爱乐汇城市演奏厅", price_range: "70", event_date: "2025-10-11T19:30:00", poster_url: "https://s2.showstart.com/img/2026/0121/09/30/8e82de4f627246b287977c19f7328683_4724_6298_980081.0x0.jpg", source_id: "274771", artist_names: ["VCP留声机乐团"] },
  { title: "青春乐团烛光音乐会动漫主题", city: "北京", venue_name: "青春无限音乐厅北京朝阳店", price_range: "298", event_date: "2025-11-22T16:00:00", poster_url: "https://s2.showstart.com/img/2025/1114/10/00/af78ddef8db74f539510cc482b500f25_957_1280_699292.0x0.jpg", source_id: "283418", artist_names: [] },
  { title: "青春无限乐团LALALAND爱乐之城烛光音乐会", city: "北京", venue_name: "青春无限音乐厅北京朝阳店", price_range: "298", event_date: "2025-11-22T18:30:00", poster_url: "https://s2.showstart.com/img/2025/1114/10/00/2b6af1a7a93649df9155520f838af2d8_1020_1360_1801086.0x0.png", source_id: "283420", artist_names: [] },
  { title: "奇妙嘿夜烛光音乐会最伟大的作品", city: "北京", venue_name: "青春无限音乐厅北京朝阳店", price_range: "298", event_date: "2025-11-29T20:20:00", poster_url: "https://s2.showstart.com/img/2025/1127/16/00/b81f8404161d4dd4909b8e6a7ffe663f_1020_1360_1524488.0x0.png", source_id: "284674", artist_names: [] },
  { title: "超燃交响史诗级电影金曲交响音乐会", city: "北京", venue_name: "五棵松爱乐汇艺术空间都市音乐厅", price_range: "224", event_date: "2025-12-05T19:30:00", poster_url: "https://s2.showstart.com/img/2025/1119/18/00/377b7db3c4be4b1881909b628e4e2883_1080_1456_217000.0x0.jpg", source_id: "283964", artist_names: ["爱乐汇交响乐团"] },
  { title: "欢乐颂致爱丽丝百年浪漫经典名曲音乐会", city: "北京", venue_name: "五棵松爱乐汇艺术空间都市剧场", price_range: "80", event_date: "2025-12-07T14:00:00", poster_url: "https://s2.showstart.com/img/2026/0212/19/00/f7fffa80c2144f1b8a98efc5201e0d0c_1280_1725_230339.0x0.jpg", source_id: "282115", artist_names: ["爱乐汇轻音乐团"] },
  { title: "开心麻花大型贺岁宫廷剧甄嬛传沉浸版", city: "北京", venue_name: "开心麻花A88剧场", price_range: "168", event_date: "2025-12-31T19:30:00", poster_url: "https://s2.showstart.com/img/2025/1230/16/30/199da52bf15a47c7ba2cf5ed47e72ddb_336_504_217429.0x0.jpg", source_id: "285385", artist_names: [] },
  { title: "既往未来小西天文物撷珍与悬塑艺术特展", city: "北京", venue_name: "国家典籍博物馆", price_range: "69", event_date: "2026-01-01T20:30:00", poster_url: "https://s2.showstart.com/img/2026/0105/09/30/fca2a88cd6c94046b29cd064c9a58e6a_960_1290_834457.0x0.jpg", source_id: "287513", artist_names: [] },
  { title: "小红帽经典童话励志儿童剧", city: "北京", venue_name: "枫蓝熙剧场", price_range: "59", event_date: "2026-01-03T11:00:00", poster_url: "https://s2.showstart.com/img/2025/0308/08/30/0737710799dd4631b73e2757766a32fd_2000_2667_1226836.0x0.jpg", source_id: "283463", artist_names: [] },
  { title: "全英文脱口秀开放麦北京城堡喜剧", city: "北京", venue_name: "南阳共享际剧场", price_range: "88", event_date: "2026-01-03T17:00:00", poster_url: "https://s2.showstart.com/img/2025/1230/10/30/aa05487bed6a4b3cbcfc02adb9ddacf9_1020_1360_187947.0x0.jpg", source_id: "287182", artist_names: [] },
  { title: "开心麻花最疯环境式悬疑喜剧谁杀了罗伯特沉浸版", city: "北京", venue_name: "开心麻花A66剧场", price_range: "80", event_date: "2026-01-09T19:30:00", poster_url: "https://s2.showstart.com/img/2025/1216/15/30/0c3fc4a1b09243cf9ea1527de739c396_320_450_29839.0x0.jpg", source_id: "286163", artist_names: [] },
  { title: "Kei Gambit一人千声", city: "北京", venue_name: "南阳共享际剧场", price_range: "88", event_date: "2026-01-10T19:30:00", poster_url: "https://s2.showstart.com/img/2025/1230/12/00/b8f8c657a9f34d53ba6de690f2e28c99_800_1067_1704653.0x0.png", source_id: "287179", artist_names: [] },
  { title: "魔术脱口秀三块巧克力", city: "北京", venue_name: "爱乐汇艺术空间", price_range: "90", event_date: "2026-01-11T15:30:00", poster_url: "https://s2.showstart.com/img/2025/1219/11/30/00ca9f9bfba84a48b64dae6535141853_1280_1862_120345.0x0.jpg", source_id: "286437", artist_names: ["脱口秀孙峥"] },
  { title: "北京民族乐团民乐知多少亲子鉴赏音乐会", city: "北京", venue_name: "三里屯爱乐汇城市演奏厅", price_range: "84", event_date: "2026-01-17T10:30:00", poster_url: "https://s2.showstart.com/img/2026/0115/17/30/42b8cf5f37d54926b641b320112bfbba_1284_1728_1787528.0x0.jpg", source_id: "288327", artist_names: ["北京民族乐团玖乐室内乐组合"] },
  { title: "白雪公主经典童话梦幻儿童剧", city: "北京", venue_name: "枫蓝熙剧场", price_range: "59", event_date: "2026-01-17T11:00:00", poster_url: "https://s2.showstart.com/img/2025/0814/19/00/3faba8b1f64d45eba0fbbf16ae6940d1_1020_1360_237728.0x0.jpg", source_id: "283475", artist_names: [] }
]

async function insertEvent(event) {
  const body = {
    ...event,
    source_platform: 'xiudong',
    source_url: `https://www.showstart.com/event/${event.source_id}`
  }
  
  const res = await fetch(URL, {
    method: 'POST',
    headers: {
      'apikey': API_KEY,
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal,resolution=merge-duplicates'
    },
    body: JSON.stringify(body)
  })
  
  if (res.ok) {
    console.log(`✅ ${event.title}`)
    return true
  } else {
    const err = await res.text()
    console.log(`❌ ${event.title}: ${err}`)
    return false
  }
}

async function main() {
  console.log('开始插入演出数据...\n')
  
  let success = 0
  for (const event of events) {
    if (await insertEvent(event)) success++
    await new Promise(r => setTimeout(r, 100))
  }
  
  console.log(`\n完成! 成功: ${success}/${events.length}`)
}

main().catch(console.error)
