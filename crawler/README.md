# 看了没 - 爬虫服务

音乐演出信息爬虫，支持多平台数据采集。

## 支持平台

| 平台 | 状态 | 说明 |
|------|------|------|
| MoreTickets (摩天轮) | ✅ | 主要数据源 |
| 秀动 | ⚠️ | 可能需要登录 |
| 大麦 | 🔲 | 待开发 |
| 猫眼 | 🔲 | 待开发 |

## 安装

```bash
pnpm install
```

## 配置

创建 `.env` 文件：

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 运行

```bash
# 爬取所有平台
node src/cli.js all

# 爬取指定平台
node src/cli.js xiudong
node src/cli.js moretickets
```

## 图片上传

### 重要说明

上传图片到媒体服务后，**必须使用返回结果中的 `url` 字段作为图片 URL**。

### 示例

```bash
# 上传图片
curl -X POST http://media-singapore.rainping.com/p13111/upload \
  -H "Authorization: Bearer openclaw-mcp-a1b2c3d4e5f6g7h8" \
  -F "file=@poster.jpg"

# 返回结果
{
  "success": true,
  "file": {
    "id": "8f9463a3-3134-492d-aa81-1ef21da8a060",
    "originalName": "poster.jpg",
    "mimeType": "image/jpeg",
    "size": 12345,
    "url": "http://media-singapore.rainping.com/p13111/MT_1741881500000.jpg"
  }
}

# 使用返回的 url 作为 poster_url
```

### 代码示例

```javascript
import { uploadImageFromUrl } from './utils/media-upload.js'

// 从 URL 上传图片
const { url, postfix } = await uploadImageFromUrl(imageUrl)

// url: http://media-singapore.rainping.com/p13111/MT_xxx.jpg
// postfix: MT_xxx.jpg (可存储到 poster_postfix 字段)
```

### 数据库字段

- `poster_url`: 完整图片 URL（来自上传返回结果）
- `poster_postfix`: 图片 postfix（便于后续 CDN 迁移）

## 城市支持

一线、新一线、港澳：
- 北京、上海、广州、深圳
- 成都、杭州、重庆、武汉、西安、苏州、天津、南京、长沙、郑州、东莞、青岛、沈阳、宁波、昆明
- 香港、澳门

## 项目结构

```
crawler/
├── src/
│   ├── cli.js           # 命令行入口
│   ├── manager.js       # 爬虫管理器
│   ├── scheduler.js     # 定时任务
│   ├── config/          # 配置
│   ├── crawlers/        # 爬虫模块
│   │   ├── base.js      # 基类
│   │   ├── xiudong.js   # 秀动
│   │   └── moretickets.js # 摩天轮
│   ├── processors/      # 数据处理
│   │   ├── cleaner.js   # 数据清洗
│   │   ├── deduplicator.js # 去重
│   │   └── artist-matcher.js # 艺人匹配
│   └── utils/           # 工具
│       ├── logger.js    # 日志
│       ├── notifier.js  # 通知
│       └── media-upload.js # 图片上传
└── .env                 # 配置文件
```

## 注意事项

1. 控制请求频率，避免被封
2. 图片必须上传到媒体服务，不要使用原始链接
3. 存储 postfix 便于后续迁移 CDN
