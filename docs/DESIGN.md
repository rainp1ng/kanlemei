# 「看了没」- 音乐演出信息聚合平台

## 项目概述

### 项目名称
看了没

### 项目定位
聚合全国音乐演出信息的一站式平台，帮助用户快速发现、筛选、关注感兴趣的音乐演出。

### 核心价值
- 一站式：聚合多平台演出信息，不再东找西找
- 全覆盖：大型演唱会 + 小型 Livehouse
- 智能化：按城市、艺人、时间智能推荐
- 便捷购票：直连各大票务平台

---

## 技术架构

### 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                        用户端（Web）                          │
│                    部署：腾讯云 EdgeOne                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Supabase（数据库）                        │
│            - 演出数据 / 用户数据 / 艺人库 / 场馆库              │
│            - 认证服务（微信/QQ/手机号）                         │
│            - 全文检索                                         │
└─────────────────────────────────────────────────────────────┘
                              ▲
                              │
┌─────────────────────────────────────────────────────────────┐
│                    爬虫服务（独立部署）                         │
│              定时任务 → 爬取 → 清洗 → 写入数据库                 │
│                      邮件通知异常                               │
└─────────────────────────────────────────────────────────────┘
                              ▲
                              │
┌─────────────────────────────────────────────────────────────┐
│                     腾讯云 COS                                │
│                   图片存储（海报等）                            │
└─────────────────────────────────────────────────────────────┘
```

### 技术选型

| 模块 | 技术选型 | 说明 |
|------|---------|------|
| **前端** | HTML/CSS/JavaScript | 轻量级，SEO 友好 |
| **部署** | 腾讯云 EdgeOne | CDN 加速，边缘计算 |
| **数据库** | Supabase (PostgreSQL) | 免费额度够用，支持全文检索 |
| **认证** | Supabase Auth + 微信/QQ OAuth | 统一用户体系 |
| **搜索** | PostgreSQL Full-Text Search | 初期够用 |
| **存储** | 腾讯云 COS | 图片存储 |
| **爬虫** | Node.js + Puppeteer | 模块化设计，定时任务 |
| **管理后台** | React/Vue SPA | 后期可考虑 |

---

## 数据模型设计

### 1. 演出表 (events)

```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 基本信息
  title TEXT NOT NULL,                    -- 演出名称
  description TEXT,                        -- 演出描述
  
  -- 艺人信息
  artist_ids UUID[],                       -- 艺人ID数组
  artist_names TEXT[],                     -- 艺人名称数组（冗余，方便查询）
  
  -- 场馆信息
  venue_id UUID,                           -- 场馆ID
  venue_name TEXT,                         -- 场馆名称（冗余）
  
  -- 时间地点
  city TEXT NOT NULL,                      -- 城市
  event_date TIMESTAMP NOT NULL,           -- 演出日期
  event_end_date TIMESTAMP,                -- 结束日期（多日演出）
  
  -- 分类
  event_type TEXT DEFAULT 'concert',       -- 类型：concert/festival/livehouse
  scale TEXT DEFAULT 'medium',             -- 规模：small/medium/large
  
  -- 图片
  poster_url TEXT,                         -- 海报链接（原始）
  poster_storage_url TEXT,                 -- 海报链接（COS存储）
  
  -- 票务
  ticket_platforms JSONB,                  -- 票务平台信息 [{name, url, price_range, status}]
  price_range TEXT,                        -- 价格区间（展示用）
  
  -- 来源
  source_platform TEXT,                    -- 来源平台
  source_url TEXT,                         -- 原始链接
  source_id TEXT,                          -- 来源平台ID（去重用）
  
  -- 状态
  status TEXT DEFAULT 'active',            -- active/sold_out/cancelled/ended
  
  -- 统计
  view_count INTEGER DEFAULT 0,
  favorite_count INTEGER DEFAULT 0,
  
  -- 全文检索
  search_vector tsvector,                  -- PostgreSQL 全文检索向量
  
  -- 时间戳
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- 索引
  UNIQUE(source_platform, source_id)       -- 去重
);

-- 索引
CREATE INDEX idx_events_city ON events(city);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_search ON events USING GIN(search_vector);

-- 全文检索触发器
CREATE OR REPLACE FUNCTION update_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('simple', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(NEW.artist_names::text, '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(NEW.venue_name, '')), 'C') ||
    setweight(to_tsvector('simple', COALESCE(NEW.city, '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER events_search_update
  BEFORE INSERT OR UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_search_vector();
```

### 2. 艺人表 (artists)

```sql
CREATE TABLE artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  name TEXT NOT NULL,                      -- 艺人名称
  name_en TEXT,                            -- 英文名
  aliases TEXT[],                          -- 别名数组
  
  type TEXT DEFAULT 'solo',                -- solo/band/dj
  
  avatar_url TEXT,                         -- 头像（COS存储）
  bio TEXT,                                -- 简介
  
  genres TEXT[],                           -- 风格标签
  
  -- 来源
  source_platform TEXT,
  source_id TEXT,
  
  -- 统计
  event_count INTEGER DEFAULT 0,           -- 演出场次
  follower_count INTEGER DEFAULT 0,        -- 关注人数
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(name)
);

-- 别名搜索索引
CREATE INDEX idx_artists_aliases ON artists USING GIN(aliases);
```

### 3. 场馆表 (venues)

```sql
CREATE TABLE venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  name TEXT NOT NULL,                      -- 场馆名称
  aliases TEXT[],                          -- 别名
  
  city TEXT NOT NULL,                      -- 城市
  district TEXT,                           -- 区域
  address TEXT,                            -- 详细地址
  
  capacity INTEGER,                        -- 容纳人数
  scale TEXT DEFAULT 'medium',             -- small(<500)/medium(500-3000)/large(>3000)
  
  venue_type TEXT DEFAULT 'livehouse',     -- livehouse/theater/stadium/arena
  
  cover_url TEXT,                          -- 封面图
  
  -- 统计
  event_count INTEGER DEFAULT 0,
  
  -- 坐标（地图用）
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(name, city)
);
```

### 4. 用户表 (users)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Supabase Auth 关联
  auth_id UUID REFERENCES auth.users(id),
  
  -- 基本信息
  nickname TEXT,
  avatar_url TEXT,
  phone TEXT,
  
  -- 第三方登录
  wechat_openid TEXT,
  qq_openid TEXT,
  
  -- 偏好设置
  preferred_cities TEXT[],                 -- 关注的城市
  preferred_genres TEXT[],                 -- 关注的风格
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(auth_id),
  UNIQUE(phone),
  UNIQUE(wechat_openid),
  UNIQUE(qq_openid)
);
```

### 5. 用户收藏表 (user_favorites)

```sql
CREATE TABLE user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, event_id)
);
```

### 6. 用户关注艺人表 (user_following_artists)

```sql
CREATE TABLE user_following_artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, artist_id)
);
```

### 7. 爬虫任务表 (crawler_tasks)

```sql
CREATE TABLE crawler_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  platform TEXT NOT NULL,                  -- 爬取平台
  task_type TEXT NOT NULL,                 -- 任务类型：full/incremental
  
  status TEXT DEFAULT 'pending',           -- pending/running/completed/failed
  
  started_at TIMESTAMP,
  finished_at TIMESTAMP,
  
  events_found INTEGER DEFAULT 0,          -- 发现的演出数
  events_added INTEGER DEFAULT 0,          -- 新增演出数
  events_updated INTEGER DEFAULT 0,        -- 更新演出数
  
  error_message TEXT,                      -- 错误信息
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 功能模块设计

### 一、用户端（Web 网站）

#### 1.1 首页

```
┌────────────────────────────────────────────────────────────┐
│  Logo    城市选择[广州 ▼]    搜索框[艺人/演出/场馆]    登录   │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │              热门演出轮播 / 本周推荐                     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
│  热门城市演出                                               │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐               │
│  │广州 │ │深圳 │ │北京 │ │上海 │ │成都 │               │
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘               │
│                                                            │
│  本周热门演出                                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │  演出1   │ │  演出2   │ │  演出3   │ │  演出4   │   │
│  │  海报    │ │  海报    │ │  海报    │ │  海报    │   │
│  │  艺人    │ │  艺人    │ │  艺人    │ │  艺人    │   │
│  │  时间    │ │  时间    │ │  时间    │ │  时间    │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

#### 1.2 演出列表页

```
┌────────────────────────────────────────────────────────────┐
│  城市：广州    时间：全部[▼]    类型：全部[▼]    规模：全部[▼] │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  找到 128 场演出                                            │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ ┌────┐  演出名称                                       │ │
│  │ │海报│  艺人：XXX  XXX                                 │ │
│  │ │    │  时间：2024-01-20 20:00                        │ │
│  │ └────┘  场馆：广州太空间 Livehouse                      │ │
│  │         票价：¥180-380    [大麦] [秀动]                │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ ...                                                   │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  [1] [2] [3] [4] ... [10]                                  │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

#### 1.3 演出详情页

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                     演出海报                          │  │
│  │                      (大图)                           │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
│  【演出名称】                                                │
│  艺人：艺人1 | 艺人2 | 艺人3                                 │
│                                                            │
│  时间：2024-01-20 周六 20:00                               │
│  场馆：广州太空间 Livehouse                                 │
│  地址：广州市海珠区...                                      │
│                                                            │
│  票价：¥180（预售）/ ¥220（现场）                           │
│                                                            │
│  购票链接：                                                 │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                     │
│  │  大麦   │ │  秀动   │ │  猫眼   │                     │
│  └─────────┘ └─────────┘ └─────────┘                     │
│                                                            │
│  演出介绍：                                                 │
│  这是一场...                                                │
│                                                            │
│  [❤️ 收藏]  [🔔 提醒]  [📤 分享]                           │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

#### 1.4 搜索结果页

```
┌────────────────────────────────────────────────────────────┐
│  搜索：[周杰伦        ]  [搜索]                             │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  演出（5）    艺人（1）    场馆（0）                         │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ 演出名称（高亮 周杰伦）                                │ │
│  │ 艺人：周杰伦                                          │ │
│  │ 时间：2024-03-15  场馆：广州海心沙                     │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

#### 1.5 用户中心

```
┌────────────────────────────────────────────────────────────┐
│  [头像]  用户昵称                                           │
│          关注城市：广州、深圳                                │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  [我的收藏]    [关注的艺人]    [设置]                        │
│                                                            │
│  我的收藏                                                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                 │
│  │  演出1   │ │  演出2   │ │  演出3   │                 │
│  └──────────┘ └──────────┘ └──────────┘                 │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### 二、管理后台

#### 2.1 功能列表

| 功能 | 说明 |
|------|------|
| 演出管理 | 查看、编辑、删除演出信息 |
| 艺人管理 | 维护艺人库、合并重复艺人 |
| 场馆管理 | 维护场馆信息 |
| 爬虫管理 | 查看爬虫任务状态、手动触发 |
| 用户管理 | 查看用户数据 |
| 数据统计 | 访问量、演出数量等统计 |

### 三、爬虫模块

#### 3.1 支持平台

| 平台 | 类型 | 爬取方式 | 备注 |
|------|------|---------|------|
| 大麦 | 票务 | API + 网页 | 主要票务平台 |
| 猫眼 | 票务 | API + 网页 | 主要票务平台 |
| 秀动 | Livehouse | API + 网页 | Livehouse 主要平台 |
| 纷玩岛 | 票务 | 网页 | - |
| Livehouse 预订 | Livehouse | 网页 | - |
| Bilibili 会员购 | 票务 | API | - |
| 小红书 | 社交媒体 | 桌面辅助 | 需手动辅助 |
| 微博 | 社交媒体 | 桌面辅助 | 需手动辅助 |
| Livehouse 公众号 | 微信 | 手动录入 | 后期考虑 |

#### 3.2 爬虫架构

```
┌─────────────────────────────────────────────────────────────┐
│                      爬虫调度器                              │
│                    (node-cron 定时任务)                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      爬虫管理器                              │
│              - 任务队列管理                                   │
│              - 并发控制                                       │
│              - 错误重试                                       │
│              - 日志记录                                       │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   大麦爬虫    │     │   秀动爬虫    │     │   猫眼爬虫    │
│  (模块化)    │     │  (模块化)    │     │  (模块化)    │
└──────────────┘     └──────────────┘     └──────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      数据处理器                              │
│              - 数据清洗                                       │
│              - 去重判断                                       │
│              - 艺人识别                                       │
│              - 场馆匹配                                       │
│              - 图片上传 COS                                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase 数据库                           │
└─────────────────────────────────────────────────────────────┘
```

#### 3.3 爬虫目录结构

```
crawler/
├── src/
│   ├── index.js              # 入口，定时任务
│   ├── scheduler.js          # 调度器
│   ├── manager.js            # 管理器
│   ├── processors/           # 数据处理器
│   │   ├── cleaner.js        # 数据清洗
│   │   ├── deduplicator.js   # 去重
│   │   ├── artist-matcher.js # 艺人匹配
│   │   └── image-uploader.js # 图片上传
│   ├── crawlers/             # 各平台爬虫
│   │   ├── base.js           # 基类
│   │   ├── damai.js          # 大麦
│   │   ├── maoyan.js         # 猫眼
│   │   ├── xiudong.js        # 秀动
│   │   ├── bilibili.js       # B站
│   │   └── ...
│   ├── utils/
│   │   ├── logger.js         # 日志
│   │   ├── notifier.js       # 通知（邮件）
│   │   └── proxy.js          # 代理池（可选）
│   └── config/
│       ├── index.js          # 配置入口
│       └── platforms.js      # 平台配置
├── package.json
└── README.md
```

---

## API 接口设计

### 前端 API

#### 演出相关

```
GET  /api/events                    # 获取演出列表
GET  /api/events/:id                # 获取演出详情
GET  /api/events/hot                # 获取热门演出
GET  /api/events/city/:city         # 按城市获取演出

GET  /api/search?q=xxx              # 全文搜索

GET  /api/artists                   # 艺人列表
GET  /api/artists/:id               # 艺人详情
GET  /api/artists/:id/events        # 艺人演出

GET  /api/venues                    # 场馆列表
GET  /api/venues/:id                # 场馆详情

# 需要登录
POST /api/user/favorites            # 收藏演出
DELETE /api/user/favorites/:id      # 取消收藏
POST /api/user/following/:artistId  # 关注艺人
DELETE /api/user/following/:artistId
GET  /api/user/favorites            # 我的收藏
GET  /api/user/following            # 关注的艺人
```

### 管理后台 API

```
GET  /api/admin/events              # 演出列表（分页）
PUT  /api/admin/events/:id          # 更新演出
DELETE /api/admin/events/:id        # 删除演出

GET  /api/admin/artists             # 艺人列表
POST /api/admin/artists             # 创建艺人
PUT  /api/admin/artists/:id         # 更新艺人
POST /api/admin/artists/merge       # 合并艺人

GET  /api/admin/venues              # 场馆列表
POST /api/admin/venues              # 创建场馆
PUT  /api/admin/venues/:id          # 更新场馆

GET  /api/admin/crawler/tasks       # 爬虫任务列表
POST /api/admin/crawler/run         # 手动触发爬虫
```

---

## 项目目录结构

```
kanliao/
├── web/                          # 前端网站
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── app.js
│   │   ├── api.js
│   │   ├── auth.js
│   │   └── components/
│   ├── pages/
│   │   ├── index.html            # 首页
│   │   ├── events.html           # 演出列表
│   │   ├── event-detail.html     # 演出详情
│   │   ├── search.html           # 搜索结果
│   │   └── user.html             # 用户中心
│   ├── admin/                    # 管理后台
│   │   └── index.html
│   ├── vercel.json               # 部署配置（或 edgeone 配置）
│   └── README.md
│
├── crawler/                      # 爬虫服务
│   ├── src/
│   │   ├── index.js
│   │   ├── crawlers/
│   │   ├── processors/
│   │   └── utils/
│   ├── package.json
│   └── README.md
│
├── database/                     # 数据库
│   ├── migrations/               # 迁移文件
│   │   └── 001_init.sql
│   └── seeds/                    # 种子数据
│       ├── cities.sql
│       └── venues.sql
│
└── docs/                         # 文档
    ├── API.md
    ├── CRAWLER.md
    └── DEPLOYMENT.md
```

---

## 开发计划

### Phase 1: 基础框架（1-2周）

- [ ] 数据库设计与初始化
- [ ] 前端基础页面框架
- [ ] API 接口开发
- [ ] 用户认证（微信/QQ/手机号）

### Phase 2: 核心功能（2-3周）

- [ ] 演出列表/详情页
- [ ] 搜索功能
- [ ] 爬虫框架搭建
- [ ] 大麦/秀动爬虫

### Phase 3: 完善功能（2周）

- [ ] 更多爬虫平台
- [ ] 用户收藏/关注
- [ ] 管理后台
- [ ] SEO 优化

### Phase 4: 优化迭代（持续）

- [ ] 性能优化
- [ ] 更多城市
- [ ] 小红书/微博集成
- [ ] 通知提醒功能

---

## 部署方案

### 前端部署（EdgeOne）

1. 构建静态文件
2. 上传到 EdgeOne
3. 配置域名和 HTTPS
4. 配置边缘函数（如有后端需求）

### 爬虫部署

选项：
- 独立服务器（推荐）
- 腾讯云函数 SCF
- Docker 容器

### 数据库

- Supabase 云服务
- 后期可迁移到腾讯云数据库

---

## 风险与应对

| 风险 | 应对措施 |
|------|---------|
| 爬虫被封 | 控制频率、使用代理池、多账号轮换 |
| 网站改版 | 模块化设计，单平台爬虫不影响其他 |
| 数据重复 | 智能去重算法（标题+艺人+时间+城市） |
| 图片失效 | 优先存储到 COS，定期检查链接 |
| 搜索性能 | 数据量大后迁移到专业搜索引擎 |

---

## 下一步

确认此设计文档后，即可开始开发。
