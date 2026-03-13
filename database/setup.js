import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const supabaseUrl = 'https://fjdjumlzqazvulvanmdg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqZGp1bWx6cWF6dnVsdmFubWRnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzI4OTE2MywiZXhwIjoyMDg4ODY1MTYzfQ.OvaN-2frEnYHBcIS7R_9PP_b05lQNwKMf3RbTWysHNQ'

const supabase = createClient(supabaseUrl, supabaseKey)

// 创建表
const createTables = async () => {
  console.log('Creating tables...')
  
  // 演出表
  const { error: eventsError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        description TEXT,
        artist_names TEXT[],
        venue_name TEXT,
        city TEXT NOT NULL,
        event_date TIMESTAMP WITH TIME ZONE NOT NULL,
        event_end_date TIMESTAMP WITH TIME ZONE,
        event_type TEXT DEFAULT 'concert',
        scale TEXT DEFAULT 'medium',
        poster_url TEXT,
        poster_storage_url TEXT,
        ticket_platforms JSONB,
        price_range TEXT,
        source_platform TEXT,
        source_url TEXT,
        source_id TEXT,
        status TEXT DEFAULT 'active',
        view_count INTEGER DEFAULT 0,
        favorite_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(source_platform, source_id)
      );
    `
  })
  
  if (eventsError) {
    console.log('Using direct SQL execution...')
    // 直接用 REST API 创建表
  }
}

createTables()
