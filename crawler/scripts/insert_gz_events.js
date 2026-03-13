const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqZGp1bWx6cWF6dnVsdmFubWRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyODkxNjMsImV4cCI6MjA4ODg2NTE2M30.TWY_ftq6GYHU95zFb2JoIJZ0O_JCCwPt9AE_69DgCmI'
const URL = 'https://fjdjumlzqazvulvanmdg.supabase.co/rest/v1/events'

// 广州演出数据（正确的未来日期）
const guangzhouEvents = [
  { title: "缪斯与黄金时代阿尔丰斯穆夏真迹世纪回顾展", city: "广州", venue_name: "广州K11购物艺术中心", price_range: "55", event_date: "2026-04-15T10:00:00", poster_url: "https://s2.showstart.com/img/2025/1107/09/30/522226f46d834a3fabb16ce095cf85eb_1080_1440_1499958.0x0.jpg", source_id: "282735", artist_names: [] },
  { title: "2025-2026赛季CBA广州朗肽海本队主场赛事套票", city: "广州", venue_name: "奥冠体育华南农业大学综合体育馆", price_range: "1298", event_date: "2026-03-23T19:35:00", poster_url: "https://s2.showstart.com/img/2025/1207/14/00/a4df604816f74b0fb7d0289968418d37_960_1280_353333.0x0.jpg", source_id: "284126", artist_names: [] },
  { title: "CBA广州朗肽海本队主场赛事单场票华农", city: "广州", venue_name: "奥冠体育华南农业大学综合体育馆", price_range: "68", event_date: "2026-03-23T19:35:00", poster_url: "https://s2.showstart.com/img/2025/1205/12/30/6b29f1a1a26c4d59ae71a9bd063fa993_1200_1600_943584.0x0.jpg", source_id: "284189", artist_names: [] },
  { title: "海珠广州塔网红拍照点珠影青深民谣音乐会", city: "广州", venue_name: "青深民谣现场珠影店", price_range: "39", event_date: "2026-03-27T20:00:00", poster_url: "https://s2.showstart.com/img/2025/0630/21/00/3374189138804e42a43abbf423c7f7a9_1020_1360_1449833.0x0.jpg", source_id: "288937", artist_names: [] },
  { title: "广州沉浸式爆笑悬疑喜剧民国特烦恼", city: "广州", venue_name: "好说喜剧客村珠影店", price_range: "180", event_date: "2026-03-21T14:00:00", poster_url: "https://s2.showstart.com/img/2025/0708/15/30/f6fc4960baac4df18cf10c035d984a88_1020_1360_3179262.0x0.png", source_id: "290925", artist_names: [] },
  { title: "CBA广州朗肽海本队主场赛事单场票广州体育馆", city: "广州", venue_name: "广州体育馆1号馆", price_range: "68", event_date: "2026-03-25T19:35:00", poster_url: "https://s2.showstart.com/img/2026/0210/16/00/7162dffa8bef4624b6a8b253f025f60c_1242_2208_342510.0x0.jpg", source_id: "290220", artist_names: [] },
  { title: "守麦乐队独立民谣专场", city: "广州", venue_name: "游声场FreeField", price_range: "66", event_date: "2026-03-26T20:00:00", poster_url: "https://s2.showstart.com/img/2026/0305/10/30/28441652f8fe4fd08daf2f49448e5c43_1472_2122_2779383.0x0.jpg", source_id: "291573", artist_names: ["守麦乐队"] },
  { title: "大笑喜剧天河路脱口秀串烧专场", city: "广州", venue_name: "大笑喜剧脱口秀广州天河路店", price_range: "85", event_date: "2026-03-28T19:30:00", poster_url: "https://s2.showstart.com/img/2025/0913/10/00/0977a6ac9e31471483cf9ac639e31a57_1197_1575_4027089.0x0.png", source_id: "291324", artist_names: ["大笑喜剧"] },
  { title: "开花BLOOM脱口秀国语粤语开放麦", city: "广州", venue_name: "平安大戏院上楼有戏新空间3楼", price_range: "9.90", event_date: "2026-03-22T19:30:00", poster_url: "https://s2.showstart.com/img/2026/0311/16/30/4f53716857134551aa3e7fd19e415a86_340_458_97335.0x0.jpg", source_id: "292262", artist_names: [] },
  { title: "MeloMini Fes1.0萌萌乐女仆咖啡厅魔法少女", city: "广州", venue_name: "MAO Livehouse广州中大店二号馆", price_range: "0.10", event_date: "2026-03-23T19:30:00", poster_url: "https://s2.showstart.com/img/2026/0311/17/30/0e0ff73d5e6f4e60af48197401d65466_5400_8444_1528144.0x0.jpg", source_id: "292272", artist_names: ["MoeMelo", "午前四时"] },
  { title: "RB金曲现场客厅沉浸式LIVE", city: "广州", venue_name: "游声场FreeField", price_range: "66", event_date: "2026-03-23T20:00:00", poster_url: "https://s2.showstart.com/img/2025/1229/04/00/af1cf383d6d746cc8b61a09770a14018_1170_1677_2496624.0x0.jpg", source_id: "292464", artist_names: [] },
  { title: "对角巷乐队2026巡演广州站", city: "广州", venue_name: "疆进酒OMNI SPACE广州1号馆", price_range: "98", event_date: "2026-03-23T20:00:00", poster_url: "https://s2.showstart.com/img/2026/0123/10/00/294fc87d3c69442e9c9073f8a7228d2c_1240_1653_1568569.0x0.jpg", source_id: "288811", artist_names: ["对角巷乐队"] },
  { title: "蜕镜Metamirror Eriko生日公演", city: "广州", venue_name: "MAO Livehouse广州中大店二号馆", price_range: "75", event_date: "2026-03-24T13:00:00", poster_url: "https://s2.showstart.com/img/2026/0311/18/30/364795f35dfb460bbd1e8302791664c8_2146_3815_7076995.0x0.jpg", source_id: "292264", artist_names: [] },
  { title: "开花BLOOM脱口秀金梗秀全冠军阵容", city: "广州", venue_name: "平安大戏院上楼有戏新空间3楼", price_range: "75", event_date: "2026-03-24T16:00:00", poster_url: "https://s2.showstart.com/img/2026/0306/14/00/61436b8325f24c7ab9f3f92245294648_1020_1360_299776.0x0.jpg", source_id: "291873", artist_names: [] },
  { title: "白举纲荒野爱人伟大的冒险2026巡回演唱会广州站", city: "广州", venue_name: "广州亚运城综合体育馆", price_range: "380", event_date: "2026-03-24T19:00:00", poster_url: "https://s2.showstart.com/img/2026/0105/15/30/e3a147e489b341f88175f43285e7a0a5_840_1158_1894360.0x0.png", source_id: "287541", artist_names: ["白举纲"] },
  { title: "TRAP CN广州站", city: "广州", venue_name: "广州媒棚LIVE", price_range: "99", event_date: "2026-03-24T19:00:00", poster_url: "https://s2.showstart.com/img/2026/0220/23/30/e8c776fcf38544318795c64c5a3a241a_1333_2880_619388.0x0.jpg", source_id: "290737", artist_names: [] },
  { title: "开花BLOOM脱口秀金梗赛", city: "广州", venue_name: "平安大戏院上楼有戏新空间3楼", price_range: "55", event_date: "2026-03-24T19:30:00", poster_url: "https://s2.showstart.com/img/2026/0310/10/00/bc2e78de740441f6a77c0a730e529c1e_1020_1360_339562.0x0.jpg", source_id: "291878", artist_names: [] },
  { title: "声声不息宝岛季华语流行金曲演唱会", city: "广州", venue_name: "广州中山纪念堂", price_range: "70", event_date: "2026-03-24T19:30:00", poster_url: "https://s2.showstart.com/img/2025/1209/14/00/cef599edb8ac4d66a913ee9d92af9741_2362_3543_970799.0x0.jpg", source_id: "285686", artist_names: [] },
  { title: "白色情人节专场梁祝卡农浪漫爱情主题交响音乐会", city: "广州", venue_name: "广东艺术剧院", price_range: "40", event_date: "2026-03-24T19:30:00", poster_url: "https://s2.showstart.com/img/2026/0131/14/30/b77c743d9ac947e8b694d431318080aa_1020_1360_922646.0x0.jpg", source_id: "289458", artist_names: ["深圳城市爱乐乐团"] },
  { title: "VKNOW感觉团2026广州专场", city: "广州", venue_name: "MAOLivehouse广州永庆坊店", price_range: "60", event_date: "2026-03-24T20:00:00", poster_url: "https://s2.showstart.com/img/2026/0126/14/30/a6f7e21c49fa420eb322df7eb6dc2b51_1440_1920_4761107.0x0.png", source_id: "288976", artist_names: ["VKNOW感觉团", "木秦"] }
]

async function insertEvent(event) {
  const body = {
    ...event,
    source_platform: 'xiudong',
    source_url: `https://www.showstart.com/event/${event.source_id}`,
    status: 'active'
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
  console.log('插入广州演出数据...\n')
  
  let success = 0
  for (const event of guangzhouEvents) {
    if (await insertEvent(event)) success++
    await new Promise(r => setTimeout(r, 100))
  }
  
  console.log(`\n完成! 成功: ${success}/${guangzhouEvents.length}`)
}

main().catch(console.error)
