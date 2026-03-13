#!/bin/bash

API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqZGp1bWx6cWF6dnVsdmFubWRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyODkxNjMsImV4cCI6MjA4ODg2NTE2M30.TWY_ftq6GYHU95zFb2JoIJZ0O_JCCwPt9AE_69DgCmI"
URL="https://fjdjumlzqazvulvanmdg.supabase.co/rest/v1/events"

insert_event() {
  local title="$1"
  local city="$2"
  local venue="$3"
  local price="$4"
  local date="$5"
  local poster="$6"
  local source_id="$7"
  local artist="$8"
  
  curl -s -X POST "$URL" \
    -H "apikey: $API_KEY" \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -H "Prefer: return=minimal,resolution=merge-duplicates" \
    -d "{
      \"title\":\"$title\",
      \"city\":\"$city\",
      \"venue_name\":\"$venue\",
      \"price_range\":\"$price\",
      \"event_date\":\"$date\",
      \"poster_url\":\"$poster\",
      \"source_platform\":\"xiudong\",
      \"source_id\":\"$source_id\",
      \"artist_names\":$(echo "$artist" | jq -R 'split("/")')
    }" && echo "OK: $title"
}

# 批量插入演出
insert_event "维也纳圆舞曲之夜交响音乐会" "北京" "五棵松爱乐汇艺术空间" "90" "2025-02-28T19:30:00" "https://s2.showstart.com/img/2026/0104/17/30/4f32d0e13d73443abbdb711ab012031c_3400_4580_5244508.0x0.jpg" "273182" "爱乐汇交响乐团"

insert_event "开心麻花沉浸式悬疑互动喜剧疯狂理发店" "北京" "疯狂理发店THE BOX朝外店" "168" "2025-05-10T14:30:00" "https://s2.showstart.com/img/2025/1201/17/30/34048b1b8a134528a7b0ed1b92b8135f_184_280_19407.0x0.jpg" "263199" ""

insert_event "琴键上的童年亲子互动科普演奏会" "北京" "三里屯爱乐汇城市演奏厅" "80" "2025-09-06T10:30:00" "https://s2.showstart.com/img/2025/0922/15/30/0a1a04bb6157412597421bcda1fcca0a_1280_1723_724863.0x0.jpg" "274641" "爱乐汇轻音乐团"

insert_event "浪漫古典世界经典名曲系列音乐会" "北京" "三里屯爱乐汇城市演奏厅" "70" "2025-09-20T14:00:00" "https://s2.showstart.com/img/2025/0820/12/00/1974fb7ae5234715ab1ae95e9146707f_664_878_897095.0x0.png" "274183" "A442乐团"

insert_event "沧海一声笑笑傲江湖武侠影视金曲视听交响演唱会" "北京" "五棵松爱乐汇艺术空间都市剧场" "196" "2025-10-06T19:30:00" "https://s2.showstart.com/img/2026/0129/14/30/3f8d270a719c47d5b1b259de73aa5c47_3400_4580_6606015.0x0.jpg" "278054" "爱乐汇交响乐团"

insert_event "坂本龙一经典名曲音乐会" "北京" "三里屯爱乐汇城市演奏厅" "70" "2025-10-11T19:30:00" "https://s2.showstart.com/img/2026/0121/09/30/8e82de4f627246b287977c19f7328683_4724_6298_980081.0x0.jpg" "274771" "VCP留声机乐团"

insert_event "青春乐团烛光音乐会动漫主题" "北京" "青春无限音乐厅北京朝阳店" "298" "2025-11-22T16:00:00" "https://s2.showstart.com/img/2025/1114/10/00/af78ddef8db74f539510cc482b500f25_957_1280_699292.0x0.jpg" "283418" ""

insert_event "青春无限乐团LALALAND爱乐之城烛光音乐会" "北京" "青春无限音乐厅北京朝阳店" "298" "2025-11-22T18:30:00" "https://s2.showstart.com/img/2025/1114/10/00/2b6af1a7a93649df9155520f838af2d8_1020_1360_1801086.0x0.png" "283420" ""

insert_event "奇妙嘿夜烛光音乐会最伟大的作品" "北京" "青春无限音乐厅北京朝阳店" "298" "2025-11-29T20:20:00" "https://s2.showstart.com/img/2025/1127/16/00/b81f8404161d4dd4909b8e6a7ffe663f_1020_1360_1524488.0x0.png" "284674" ""

insert_event "超燃交响史诗级电影金曲交响音乐会" "北京" "五棵松爱乐汇艺术空间都市音乐厅" "224" "2025-12-05T19:30:00" "https://s2.showstart.com/img/2025/1119/18/00/377b7db3c4be4b1881909b628e4e2883_1080_1456_217000.0x0.jpg" "283964" "爱乐汇交响乐团"

insert_event "欢乐颂致爱丽丝百年浪漫经典名曲音乐会" "北京" "五棵松爱乐汇艺术空间都市剧场" "80" "2025-12-07T14:00:00" "https://s2.showstart.com/img/2026/0212/19/00/f7fffa80c2144f1b8a98efc5201e0d0c_1280_1725_230339.0x0.jpg" "282115" "爱乐汇轻音乐团"

insert_event "开心麻花大型贺岁宫廷剧甄嬛传沉浸版" "北京" "开心麻花A88剧场" "168" "2025-12-31T19:30:00" "https://s2.showstart.com/img/2025/1230/16/30/199da52bf15a47c7ba2cf5ed47e72ddb_336_504_217429.0x0.jpg" "285385" ""

insert_event "既往未来小西天文物撷珍与悬塑艺术特展" "北京" "国家典籍博物馆" "69" "2026-01-01T20:30:00" "https://s2.showstart.com/img/2026/0105/09/30/fca2a88cd6c94046b29cd064c9a58e6a_960_1290_834457.0x0.jpg" "287513" ""

insert_event "小红帽经典童话励志儿童剧" "北京" "枫蓝熙剧场" "59" "2026-01-03T11:00:00" "https://s2.showstart.com/img/2025/0308/08/30/0737710799dd4631b73e2757766a32fd_2000_2667_1226836.0x0.jpg" "283463" ""

insert_event "全英文脱口秀开放麦北京城堡喜剧" "北京" "南阳共享际剧场" "88" "2026-01-03T17:00:00" "https://s2.showstart.com/img/2025/1230/10/30/aa05487bed6a4b3cbcfc02adb9ddacf9_1020_1360_187947.0x0.jpg" "287182" ""

insert_event "开心麻花最疯环境式悬疑喜剧谁杀了罗伯特沉浸版" "北京" "开心麻花A66剧场" "80" "2026-01-09T19:30:00" "https://s2.showstart.com/img/2025/1216/15/30/0c3fc4a1b09243cf9ea1527de739c396_320_450_29839.0x0.jpg" "286163" ""

insert_event "Kei Gambit一人千声" "北京" "南阳共享际剧场" "88" "2026-01-10T19:30:00" "https://s2.showstart.com/img/2025/1230/12/00/b8f8c657a9f34d53ba6de690f2e28c99_800_1067_1704653.0x0.png" "287179" ""

insert_event "魔术脱口秀三块巧克力" "北京" "爱乐汇艺术空间" "90" "2026-01-11T15:30:00" "https://s2.showstart.com/img/2025/1219/11/30/00ca9f9bfba84a48b64dae6535141853_1280_1862_120345.0x0.jpg" "286437" "脱口秀孙峥"

insert_event "北京民族乐团民乐知多少亲子鉴赏音乐会" "北京" "三里屯爱乐汇城市演奏厅" "84" "2026-01-17T10:30:00" "https://s2.showstart.com/img/2026/0115/17/30/42b8cf5f37d54926b641b320112bfbba_1284_1728_1787528.0x0.jpg" "288327" "北京民族乐团玖乐室内乐组合"

insert_event "白雪公主经典童话梦幻儿童剧" "北京" "枫蓝熙剧场" "59" "2026-01-17T11:00:00" "https://s2.showstart.com/img/2025/0814/19/00/3faba8b1f64d45eba0fbbf16ae6940d1_1020_1360_237728.0x0.jpg" "283475" ""

echo "完成!"
