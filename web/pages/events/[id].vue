<template>
  <div class="container mx-auto px-4 py-8">
    <!-- 加载状态 -->
    <div v-if="pending" class="animate-pulse">
      <div class="h-80 bg-dark-800 rounded-xl mb-6" />
      <div class="h-6 bg-dark-800 rounded w-2/3 mb-4" />
      <div class="h-4 bg-dark-800 rounded w-1/2" />
    </div>
    
    <template v-else-if="event">
      <!-- 返回按钮 -->
      <NuxtLink 
        to="/events" 
        class="inline-flex items-center gap-1 text-dark-400 hover:text-white mb-6 transition-colors"
      >
        <Icon name="ph:arrow-left" />
        返回列表
      </NuxtLink>
      
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- 海报 -->
        <div class="lg:col-span-1">
          <div class="sticky top-24">
            <div class="card overflow-hidden">
              <img 
                v-if="event.poster_url"
                :src="event.poster_url" 
                :alt="event.title"
                class="w-full aspect-[3/4] object-cover"
              />
              <div v-else class="w-full aspect-[3/4] bg-gradient-to-br from-dark-700 to-dark-800 flex items-center justify-center">
                <Icon name="ph:music-notes" class="text-6xl text-dark-600" />
              </div>
            </div>
          </div>
        </div>
        
        <!-- 信息 -->
        <div class="lg:col-span-2 space-y-6">
          <!-- 标题和艺人 -->
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="px-2 py-1 rounded text-xs font-medium" :class="getTypeClass(event.event_type)">
                {{ getTypeLabel(event.event_type) }}
              </span>
              <span v-if="event.status !== 'active'" class="px-2 py-1 rounded text-xs font-medium bg-dark-800">
                {{ getStatusLabel(event.status) }}
              </span>
            </div>
            
            <h1 class="text-2xl md:text-3xl font-bold text-white mb-2">
              {{ event.title }}
            </h1>
            
            <div v-if="event.artist_names?.length" class="flex flex-wrap gap-2 mt-3">
              <NuxtLink 
                v-for="artist in event.artist_names" 
                :key="artist"
                :to="`/search?q=${encodeURIComponent(artist)}`"
                class="px-3 py-1 bg-dark-800 rounded-full text-sm text-dark-300 hover:text-primary-400 transition-colors"
              >
                {{ artist }}
              </NuxtLink>
            </div>
          </div>
          
          <!-- 时间地点 -->
          <div class="card p-6 space-y-4">
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-lg bg-dark-800 flex items-center justify-center flex-shrink-0">
                <Icon name="ph:calendar" class="text-primary-400 text-xl" />
              </div>
              <div>
                <p class="text-dark-400 text-sm">演出时间</p>
                <p class="text-white font-medium">{{ formatDateTime(event.event_date) }}</p>
                <p v-if="event.event_end_date" class="text-dark-500 text-sm">
                  至 {{ formatDateTime(event.event_end_date) }}
                </p>
              </div>
            </div>
            
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-lg bg-dark-800 flex items-center justify-center flex-shrink-0">
                <Icon name="ph:map-pin" class="text-primary-400 text-xl" />
              </div>
              <div>
                <p class="text-dark-400 text-sm">演出场馆</p>
                <p class="text-white font-medium">{{ event.venue_name }}</p>
                <p class="text-dark-500 text-sm">{{ event.city }}</p>
              </div>
            </div>
            
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-lg bg-dark-800 flex items-center justify-center flex-shrink-0">
                <Icon name="ph:ticket" class="text-primary-400 text-xl" />
              </div>
              <div>
                <p class="text-dark-400 text-sm">票价</p>
                <p class="text-primary-400 font-medium text-lg">{{ event.price_range || '待定' }}</p>
              </div>
            </div>
          </div>
          
          <!-- 购票链接 -->
          <div v-if="ticketPlatforms.length">
            <h3 class="text-lg font-medium mb-3">购票渠道</h3>
            <div class="flex flex-wrap gap-3">
              <a
                v-for="platform in ticketPlatforms"
                :key="platform.name"
                :href="platform.url"
                target="_blank"
                rel="noopener noreferrer"
                class="btn btn-primary flex items-center gap-2"
              >
                <Icon :name="getPlatformIcon(platform.name)" />
                {{ platform.name }}
                <Icon name="ph:arrow-square-out" class="text-sm" />
              </a>
            </div>
          </div>
          
          <!-- 演出介绍 -->
          <div v-if="event.description">
            <h3 class="text-lg font-medium mb-3">演出介绍</h3>
            <div class="card p-6">
              <p class="text-dark-300 leading-relaxed whitespace-pre-line">
                {{ event.description }}
              </p>
            </div>
          </div>
          
          <!-- 来源信息 -->
          <div class="text-dark-600 text-sm">
            数据来源: {{ event.source_platform || '未知' }}
            <span class="mx-2">·</span>
            更新于 {{ formatRelativeTime(event.updated_at) }}
          </div>
        </div>
      </div>
    </template>
    
    <!-- 错误状态 -->
    <div v-else class="py-20 text-center">
      <Icon name="ph:warning-circle" class="text-5xl text-dark-600 mb-4" />
      <p class="text-dark-400">演出信息不存在或已下架</p>
      <NuxtLink to="/events" class="btn btn-primary mt-4 inline-flex">
        返回列表
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const { getEventById } = useEvents()

const id = computed(() => route.params.id as string)

// 获取演出详情
const { data: event, pending } = await useAsyncData(
  `event-${id.value}`,
  () => getEventById(id.value)
)

// 解析票务平台
const ticketPlatforms = computed(() => {
  if (!event.value?.ticket_platforms) return []
  const platforms = event.value.ticket_platforms
  if (Array.isArray(platforms)) return platforms
  return []
})

// 方法
const formatDateTime = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    concert: '演唱会',
    livehouse: 'Livehouse',
    festival: '音乐节'
  }
  return labels[type] || '演出'
}

const getTypeClass = (type: string) => {
  const classes: Record<string, string> = {
    concert: 'bg-pink-500/80 text-white',
    livehouse: 'bg-purple-500/80 text-white',
    festival: 'bg-orange-500/80 text-white'
  }
  return classes[type] || 'bg-dark-700 text-white'
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    sold_out: '已售罄',
    cancelled: '已取消',
    ended: '已结束'
  }
  return labels[status] || ''
}

const getPlatformIcon = (name: string) => {
  const icons: Record<string, string> = {
    '大麦': 'simple-icons:douban',
    '秀动': 'ph:ticket',
    '猫眼': 'ph:cat',
    '纷玩岛': 'ph:island'
  }
  return icons[name] || 'ph:ticket'
}

const formatRelativeTime = (date: string) => {
  const now = new Date()
  const then = new Date(date)
  const diff = now.getTime() - then.getTime()
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  if (hours < 24) return `${hours} 小时前`
  if (days < 30) return `${days} 天前`
  return then.toLocaleDateString('zh-CN')
}

// SEO
useSeoMeta({
  title: computed(() => event.value ? `${event.value.title} - ${event.value.artist_names?.[0] || ''} | 看了没` : '加载中...'),
  description: computed(() => event.value ? `${event.value.title}，${event.value.artist_names?.join('、')}，${event.value.city} ${event.value.venue_name}，${formatDateTime(event.value.event_date)}` : ''),
  ogTitle: computed(() => event.value?.title || ''),
  ogDescription: computed(() => event.value ? `${event.value.artist_names?.join('、')} - ${formatDateTime(event.value.event_date)}` : ''),
  ogImage: computed(() => event.value?.poster_url || '')
})
</script>
