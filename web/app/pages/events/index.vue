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
            @change="loadEvents"
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
            @change="loadEvents"
          >
            <option value="">全部类型</option>
            <option value="concert">演唱会</option>
            <option value="livehouse">Livehouse</option>
            <option value="festival">音乐节</option>
          </select>
          <Icon name="ph:caret-down" class="absolute right-2 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none" />
        </div>
        
        <!-- 重置按钮 -->
        <button 
          v-if="filters.city || filters.type"
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
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="i in 6" :key="i" class="card">
        <div class="aspect-video bg-dark-800 animate-pulse" />
        <div class="p-4 space-y-2">
          <div class="h-4 bg-dark-800 rounded animate-pulse" />
          <div class="h-3 bg-dark-800 rounded w-2/3 animate-pulse" />
        </div>
      </div>
    </div>
    
    <!-- 演出列表 -->
    <div v-else-if="events.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
  </div>
</template>

<script setup lang="ts">
import { createClient } from '@supabase/supabase-js'

const config = useRuntimeConfig()
const supabase = createClient(
  config.public.supabaseUrl,
  config.public.supabaseKey
)

const cities = [
  '北京', '上海', '广州', '深圳', '成都', '杭州', 
  '重庆', '武汉', '西安', '苏州', '天津', '南京',
  '长沙', '郑州', '东莞', '青岛', '沈阳', '宁波', '昆明'
]

const filters = reactive({
  city: '',
  type: ''
})

const events = ref([])
const loading = ref(true)
const total = ref(0)

const loadEvents = async () => {
  loading.value = true
  
  try {
    let query = supabase
      .from('events')
      .select('*', { count: 'exact' })
      .eq('status', 'active')
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true })
    
    if (filters.city) {
      query = query.eq('city', filters.city)
    }
    
    if (filters.type) {
      query = query.eq('event_type', filters.type)
    }
    
    const { data, count, error } = await query
    
    if (error) throw error
    events.value = data || []
    total.value = count || 0
  } catch (e) {
    console.error('Failed to load events:', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadEvents()
})

const resetFilters = () => {
  filters.city = ''
  filters.type = ''
  loadEvents()
}

const formatDateTime = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'short'
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

useSeoMeta({
  title: '演出列表 | 看了没',
  description: '浏览全国音乐演出信息'
})
</script>
