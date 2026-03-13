<template>
  <div class="container mx-auto px-4 py-8">
    <!-- 筛选器 -->
    <div class="mb-8 space-y-4">
      <div class="flex flex-wrap items-center gap-4">
        <!-- 城市筛选 -->
        <div class="relative">
          <select 
            v-model="filters.city"
            class="appearance-none bg-dark-800 border border-dark-700 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:border-primary-500"
          >
            <option value="">全部城市</option>
            <option v-for="city in cities" :key="city" :value="city">{{ city }}</option>
          </select>
          <Icon name="ph:caret-down" class="absolute right-2 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none" />
        </div>
        
        <!-- 类型筛选 -->
        <div class="relative">
          <select 
            v-model="filters.type"
            class="appearance-none bg-dark-800 border border-dark-700 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:border-primary-500"
          >
            <option value="">全部类型</option>
            <option value="concert">演唱会</option>
            <option value="livehouse">Livehouse</option>
            <option value="festival">音乐节</option>
          </select>
          <Icon name="ph:caret-down" class="absolute right-2 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none" />
        </div>
        
        <!-- 时间筛选 -->
        <div class="relative">
          <select 
            v-model="filters.time"
            class="appearance-none bg-dark-800 border border-dark-700 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:border-primary-500"
          >
            <option value="">全部时间</option>
            <option value="week">本周</option>
            <option value="month">本月</option>
            <option value="quarter">三个月内</option>
          </select>
          <Icon name="ph:caret-down" class="absolute right-2 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none" />
        </div>
        
        <!-- 重置按钮 -->
        <button 
          v-if="hasFilters"
          class="text-sm text-dark-400 hover:text-white transition-colors"
          @click="resetFilters"
        >
          <Icon name="ph:x" class="mr-1" />
          重置筛选
        </button>
      </div>
    </div>
    
    <!-- 结果统计 -->
    <div class="flex items-center justify-between mb-6">
      <p class="text-dark-400">
        共找到 <span class="text-white font-medium">{{ total }}</span> 场演出
      </p>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="pending" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="i in 6" :key="i" class="card">
        <div class="aspect-video bg-dark-800 animate-pulse" />
        <div class="p-4 space-y-2">
          <div class="h-4 bg-dark-800 rounded animate-pulse" />
          <div class="h-3 bg-dark-800 rounded w-2/3 animate-pulse" />
        </div>
      </div>
    </div>
    
    <!-- 演出列表 -->
    <div v-else-if="events?.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <NuxtLink 
        v-for="event in events" 
        :key="event.id" 
        :to="`/events/${event.id}`"
        class="card group cursor-pointer"
      >
        <!-- 海报 -->
        <div class="aspect-video relative overflow-hidden">
          <img 
            v-if="event.poster_url"
            :src="event.poster_url" 
            :alt="event.title"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div v-else class="w-full h-full bg-gradient-to-br from-dark-700 to-dark-800 flex items-center justify-center">
            <Icon name="ph:music-notes" class="text-5xl text-dark-600" />
          </div>
          
          <!-- 类型标签 -->
          <div class="absolute top-2 left-2">
            <span class="px-2 py-1 rounded text-xs font-medium" :class="getTypeClass(event.event_type)">
              {{ getTypeLabel(event.event_type) }}
            </span>
          </div>
          
          <!-- 状态标签 -->
          <div v-if="event.status !== 'active'" class="absolute top-2 right-2">
            <span class="px-2 py-1 rounded text-xs font-medium bg-dark-800/80">
              {{ getStatusLabel(event.status) }}
            </span>
          </div>
        </div>
        
        <!-- 信息 -->
        <div class="p-4">
          <h3 class="font-medium text-white group-hover:text-primary-400 transition-colors line-clamp-1">
            {{ event.title }}
          </h3>
          <p class="text-dark-400 text-sm mt-1 line-clamp-1">
            {{ event.artist_names?.join(' / ') || '待公布' }}
          </p>
          <div class="flex items-center gap-2 mt-2 text-xs text-dark-500">
            <Icon name="ph:calendar" />
            <span>{{ formatDateTime(event.event_date) }}</span>
          </div>
          <div class="flex items-center gap-2 mt-1 text-xs text-dark-500">
            <Icon name="ph:map-pin" />
            <span>{{ event.city }} · {{ event.venue_name }}</span>
          </div>
          <div class="flex items-center justify-between mt-3 pt-3 border-t border-dark-800">
            <span class="text-primary-400 font-medium">{{ event.price_range || '待定' }}</span>
            <div class="flex gap-1">
              <span 
                v-for="(platform, idx) in parseTicketPlatforms(event.ticket_platforms).slice(0, 2)" 
                :key="idx"
                class="px-1.5 py-0.5 bg-dark-800 rounded text-xs text-dark-400"
              >
                {{ platform.name }}
              </span>
            </div>
          </div>
        </div>
      </NuxtLink>
    </div>
    
    <!-- 空状态 -->
    <div v-else class="py-20 text-center">
      <Icon name="ph:music-notes-simple" class="text-5xl text-dark-600 mb-4" />
      <p class="text-dark-400">没有找到符合条件的演出</p>
      <p class="text-dark-600 text-sm mt-2">试试调整筛选条件</p>
    </div>
    
    <!-- 分页 -->
    <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-8">
      <button 
        class="p-2 rounded-lg bg-dark-800 text-dark-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="page === 1"
        @click="page--"
      >
        <Icon name="ph:caret-left" />
      </button>
      
      <template v-for="p in displayedPages" :key="p">
        <button 
          v-if="p === '...'"
          class="px-3 py-1 text-dark-500"
        >
          ...
        </button>
        <button 
          v-else
          class="px-3 py-1 rounded-lg text-sm transition-colors"
          :class="p === page ? 'bg-primary-600 text-white' : 'bg-dark-800 text-dark-400 hover:text-white'"
          @click="page = p as number"
        >
          {{ p }}
        </button>
      </template>
      
      <button 
        class="p-2 rounded-lg bg-dark-800 text-dark-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="page === totalPages"
        @click="page++"
      >
        <Icon name="ph:caret-right" />
      </button>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const router = useRouter()
const { getEvents, getCities } = useEvents()

// 城市列表
const cities = [
  '北京', '上海', '广州', '深圳', '成都', '杭州', 
  '重庆', '武汉', '西安', '苏州', '天津', '南京',
  '长沙', '郑州', '东莞', '青岛', '沈阳', '宁波', '昆明'
]

// 筛选条件
const filters = reactive({
  city: '',
  type: '',
  time: ''
})

// 分页
const page = ref(1)
const pageSize = 12

// 从 URL 初始化筛选条件
onMounted(() => {
  if (route.query.city) filters.city = route.query.city as string
  if (route.query.type) filters.type = route.query.type as string
  if (route.query.time) filters.time = route.query.time as string
})

// 计算是否有筛选条件
const hasFilters = computed(() => {
  return filters.city || filters.type || filters.time
})

// 计算时间范围
const getTimeRange = (time: string) => {
  const now = new Date()
  switch (time) {
    case 'week':
      return { start: now.toISOString(), end: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString() }
    case 'month':
      return { start: now.toISOString(), end: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString() }
    case 'quarter':
      return { start: now.toISOString(), end: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString() }
    default:
      return {}
  }
}

// 获取演出列表
const { data: eventsData, pending, refresh } = await useAsyncData(
  () => {
    const timeRange = getTimeRange(filters.time)
    return getEvents({
      city: filters.city || undefined,
      eventType: filters.type || undefined,
      startDate: timeRange.start,
      endDate: timeRange.end,
      page: page.value,
      pageSize
    })
  },
  {
    watch: [filters, page],
    transform: (data) => data || { data: [], total: 0 }
  }
)

const events = computed(() => eventsData.value?.data || [])
const total = computed(() => eventsData.value?.total || 0)
const totalPages = computed(() => Math.ceil(total.value / pageSize))

// 显示的页码
const displayedPages = computed(() => {
  const pages: (number | string)[] = []
  const total = totalPages.value
  const current = page.value
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i)
      pages.push('...', total)
    } else if (current >= total - 3) {
      pages.push(1, '...')
      for (let i = total - 4; i <= total; i++) pages.push(i)
    } else {
      pages.push(1, '...', current - 1, current, current + 1, '...', total)
    }
  }
  
  return pages
})

// 方法
const resetFilters = () => {
  filters.city = ''
  filters.type = ''
  filters.time = ''
  page.value = 1
  router.push('/events')
}

const formatDateTime = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
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

const parseTicketPlatforms = (platforms: any) => {
  if (!platforms) return []
  if (Array.isArray(platforms)) return platforms
  return []
}

// SEO
useSeoMeta({
  title: computed(() => {
    const parts = ['演出列表']
    if (filters.city) parts.push(filters.city)
    if (filters.type) parts.push(getTypeLabel(filters.type))
    return parts.join(' - ') + ' | 看了没'
  }),
  description: '浏览全国音乐演出信息，筛选城市、类型、时间，找到你喜欢的演出。'
})
</script>
