-- 看了没 - 数据库初始化脚本
-- 在 Supabase SQL Editor 中执行

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. 艺人表 (artists)
-- ============================================
CREATE TABLE IF NOT EXISTS artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  name TEXT NOT NULL,                      -- 艺人名称
  name_en TEXT,                            -- 英文名
  aliases TEXT[],                          -- 别名数组
  
  type TEXT DEFAULT 'solo',                -- solo/band/dj
  
  avatar_url TEXT,                         -- 头像
  bio TEXT,                                -- 简介
  
  genres TEXT[],                           -- 风格标签
  
  source_platform TEXT,
  source_id TEXT,
  
  event_count INTEGER DEFAULT 0,           -- 演出场次
  follower_count INTEGER DEFAULT 0,        -- 关注人数
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(name)
);

CREATE INDEX IF NOT EXISTS idx_artists_aliases ON artists USING GIN(aliases);
CREATE INDEX IF NOT EXISTS idx_artists_name ON artists(name);

-- ============================================
-- 2. 场馆表 (venues)
-- ============================================
CREATE TABLE IF NOT EXISTS venues (
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
  
  event_count INTEGER DEFAULT 0,
  
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(name, city)
);

CREATE INDEX IF NOT EXISTS idx_venues_city ON venues(city);
CREATE INDEX IF NOT EXISTS idx_venues_name ON venues(name);

-- ============================================
-- 3. 演出表 (events)
-- ============================================
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  title TEXT NOT NULL,                     -- 演出名称
  description TEXT,                        -- 演出描述
  
  artist_ids UUID[],                       -- 艺人ID数组
  artist_names TEXT[],                     -- 艺人名称数组（冗余）
  
  venue_id UUID REFERENCES venues(id),
  venue_name TEXT,                         -- 场馆名称（冗余）
  
  city TEXT NOT NULL,                      -- 城市
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,  -- 演出日期
  event_end_date TIMESTAMP WITH TIME ZONE,        -- 结束日期
  
  event_type TEXT DEFAULT 'concert',       -- concert/festival/livehouse
  scale TEXT DEFAULT 'medium',             -- small/medium/large
  
  poster_url TEXT,                         -- 海报链接（原始）
  poster_storage_url TEXT,                 -- 海报链接（COS存储）
  
  ticket_platforms JSONB,                  -- 票务平台信息
  price_range TEXT,                        -- 价格区间
  
  source_platform TEXT,                    -- 来源平台
  source_url TEXT,                         -- 原始链接
  source_id TEXT,                          -- 来源平台ID
  
  status TEXT DEFAULT 'active',            -- active/sold_out/cancelled/ended
  
  view_count INTEGER DEFAULT 0,
  favorite_count INTEGER DEFAULT 0,
  
  search_vector tsvector,                  -- 全文检索向量
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(source_platform, source_id)
);

CREATE INDEX IF NOT EXISTS idx_events_city ON events(city);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_artist_names ON events USING GIN(artist_names);
CREATE INDEX IF NOT EXISTS idx_events_search ON events USING GIN(search_vector);

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

DROP TRIGGER IF EXISTS events_search_update ON events;
CREATE TRIGGER events_search_update
  BEFORE INSERT OR UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_search_vector();

-- ============================================
-- 4. 爬虫任务表 (crawler_tasks)
-- ============================================
CREATE TABLE IF NOT EXISTS crawler_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  platform TEXT NOT NULL,
  task_type TEXT NOT NULL,                 -- full/incremental
  
  status TEXT DEFAULT 'pending',           -- pending/running/completed/failed
  
  started_at TIMESTAMP WITH TIME ZONE,
  finished_at TIMESTAMP WITH TIME ZONE,
  
  events_found INTEGER DEFAULT 0,
  events_added INTEGER DEFAULT 0,
  events_updated INTEGER DEFAULT 0,
  
  error_message TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crawler_tasks_status ON crawler_tasks(status);
CREATE INDEX IF NOT EXISTS idx_crawler_tasks_platform ON crawler_tasks(platform);

-- ============================================
-- 5. 用户表 (users) - 预留，Phase 2 使用
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  auth_id UUID REFERENCES auth.users(id),
  
  nickname TEXT,
  avatar_url TEXT,
  phone TEXT,
  
  wechat_openid TEXT,
  qq_openid TEXT,
  
  preferred_cities TEXT[],
  preferred_genres TEXT[],
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(auth_id),
  UNIQUE(phone),
  UNIQUE(wechat_openid),
  UNIQUE(qq_openid)
);

-- ============================================
-- 6. 用户收藏表 (user_favorites) - 预留
-- ============================================
CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, event_id)
);

-- ============================================
-- 7. 用户关注艺人表 (user_following_artists) - 预留
-- ============================================
CREATE TABLE IF NOT EXISTS user_following_artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, artist_id)
);

-- ============================================
-- Row Level Security (RLS)
-- ============================================
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE crawler_tasks ENABLE ROW LEVEL SECURITY;

-- 公开读取策略
CREATE POLICY "Events are viewable by everyone" ON events
  FOR SELECT USING (true);

CREATE POLICY "Artists are viewable by everyone" ON artists
  FOR SELECT USING (true);

CREATE POLICY "Venues are viewable by everyone" ON venues
  FOR SELECT USING (true);

-- 匿名写入策略（爬虫用）
CREATE POLICY "Events can be inserted by anyone" ON events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Events can be updated by anyone" ON events
  FOR UPDATE USING (true);

CREATE POLICY "Artists can be inserted by anyone" ON artists
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Artists can be updated by anyone" ON artists
  FOR UPDATE USING (true);

CREATE POLICY "Venues can be inserted by anyone" ON venues
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Venues can be updated by anyone" ON venues
  FOR UPDATE USING (true);

CREATE POLICY "Crawler tasks can be managed by anyone" ON crawler_tasks
  FOR ALL USING (true);

-- ============================================
-- 视图：热门演出
-- ============================================
CREATE OR REPLACE VIEW hot_events AS
SELECT * FROM events
WHERE status = 'active'
  AND event_date >= NOW()
ORDER BY view_count DESC, favorite_count DESC
LIMIT 20;

-- ============================================
-- 视图：按城市统计
-- ============================================
CREATE OR REPLACE VIEW city_stats AS
SELECT 
  city,
  COUNT(*) as event_count,
  COUNT(*) FILTER (WHERE event_date >= NOW()) as upcoming_count
FROM events
WHERE status = 'active'
GROUP BY city
ORDER BY event_count DESC;
