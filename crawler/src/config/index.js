import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// Supabase 客户端
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// 配置
export const config = {
  concurrency: parseInt(process.env.CRAWLER_CONCURRENCY) || 3,
  delay: parseInt(process.env.CRAWLER_DELAY) || 1000,
  
  // 支持的城市（一线 + 新一线 + 港澳）
  cities: [
    // 一线城市
    '北京', '上海', '广州', '深圳',
    // 新一线城市
    '成都', '杭州', '重庆', '武汉',
    '西安', '苏州', '天津', '南京',
    '长沙', '郑州', '东莞', '青岛',
    '沈阳', '宁波', '昆明',
    // 港澳
    '香港', '澳门'
  ],
  
  // 平台配置
  platforms: {
    damai: {
      name: '大麦',
      baseUrl: 'https://www.damai.cn',
      enabled: true
    },
    xiudong: {
      name: '秀动',
      baseUrl: 'https://www.showstart.com',
      enabled: true
    },
    maoyan: {
      name: '猫眼',
      baseUrl: 'https://www.maoyan.com',
      enabled: true
    }
  },
  
  // 媒体服务配置
  media: {
    uploadUrl: 'http://media-singapore.rainping.com/p13111/upload',
    authToken: 'Bearer openclaw-mcp-a1b2c3d4e5f6g7h8',
    domain: 'https://media-singapore.rainping.com'
  }
};
