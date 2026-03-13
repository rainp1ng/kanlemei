<template>
  <div class="container mx-auto px-4 py-8">
    <!-- 搜索框 -->
    <div class="max-w-2xl mx-auto mb-8">
      <div class="relative">
        <Icon name="ph:magnifying-glass" class="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400 text-xl" />
        <input
          ref="searchInput"
          v-model="query"
          type="text"
          placeholder="搜索艺人、演出、场馆..."
          class="w-full pl-12 pr-4 py-3 bg-dark-800 border border-dark-700 rounded-xl focus:outline-none focus:border-primary-500 text-lg"
          @keyup.enter="handleSearch"
        />
      </div>
      <p class="text-dark-500 text-sm mt-2">
        按 Enter 搜索
      </p>
    </div>
    
    <!-- 搜索结果 -->
    <template v-if="searchQuery">
      <!-- Tab 切换 -->
      <div class="flex items-center gap-4 border-b border-dark-800 mb-6">
        <button 
          class="pb-3 text-sm font-medium transition-colors border-b-2 -mb-px"
          :class="activeTab === 'events' ? 'text-primary-400 border-primary-400' : 'text-dark-400 border-transparent hover:text-white'"
          @click="activeTab = 'events'"
        >
          演出 ({{ results.events.length }})
        </button>
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
      
      <!-- 演出结果 -->
      <div v-else-if="results.events.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <NuxtLink 
          v-for="event in results.events" 
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
              <span>{{ formatDate(event.event_date) }}</span>
            </div>
            <div class="flex items-center gap-2 mt-1 text-xs text-dark-500">
              <Icon name="ph:map-pin" />
              <span>{{ event.city }} · {{ event.venue_name }}</span>
            </div>
          </div>
        </NuxtLink>
      </div>
      
      <!-- 空结果 -->
      <div v-else class="py-20 text-center">
        <Icon name="ph:magnifying-glass" class="text-5xl text-dark-600 mb-4" />
        <p class="text-dark-400">没有找到"{{ searchQuery }}"相关的演出</p>
        <p class="text-dark-600 text-sm mt-2">换个关键词试试？</p>
      </div>
    </template>
    
    <!-- 初始状态 -->
    <div v-else class="py-20 text-center">
      <Icon name="ph:magnifying-glass" class="text-5xl text-dark-600 mb-4" />
      <p class="text-dark-400">输入关键词搜索演出</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { search } = useSearch()

const query = ref('')
const searchQuery = ref('')
const activeTab = ref('events')

// 从 URL 初始化搜索词
onMounted(() => {
  if (route.query.q) {
    query.value = route.query.q as string
    searchQuery.value = route.query.q as string
  }
})

// 搜索结果
const results = ref({
  events: [] as any[]
})

// 执行搜索
const { pending, refresh } = await useAsyncData(
  () => search(searchQuery.value, { limit: 30 }),
  {
    watch: [searchQuery],
    transform: (data) => {
      if (!data) return { events: [] }
      return data
    }
  }
)

watch(results, (newResults) => {
  if (newResults) {
    results.value = newResults as any
  }
})

// 方法
const handleSearch = () => {
  if (query.value.trim()) {
    searchQuery.value = query.value.trim()
    // 更新 URL
    navigateTo(`/search?q=${encodeURIComponent(searchQuery.value)}`)
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric'
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

// SEO
useSeoMeta({
  title: computed(() => searchQuery.value ? `"${searchQuery.value}" 搜索结果 | 看了没` : '搜索 | 看了没'),
  description: '搜索演出、艺人、场馆信息'
})
</script>
