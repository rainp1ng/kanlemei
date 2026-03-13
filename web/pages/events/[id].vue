<template>
  <div class="container mx-auto px-4 py-8">
    <!-- 加载状态 -->
    <div v-if="loading" class="animate-pulse">
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
            </div>
            
            <h1 class="text-2xl md:text-3xl font-bold text-white mb-2">
              {{ event.title }}
            </h1>
            
            <div v-if="event.artist_names?.length" class="flex flex-wrap gap-2 mt-3">
              <span 
                v-for="artist in event.artist_names" 
                :key="artist"
                class="px-3 py-1 bg-dark-800 rounded-full text-sm text-dark-300"
              >
                {{ artist }}
              </span>
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
          
          <!-- 来源信息 -->
          <div class="text-dark-600 text-sm">
            数据来源: {{ event.source_platform || '未知' }}
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

<script setup lang="ts">
import { createClient } from '@supabase/supabase-js'

const route = useRoute()
const config = useRuntimeConfig()
const supabase = createClient(
  config.public.supabaseUrl,
  config.public.supabaseKey
)

const event = ref(null)
const loading = ref(true)

const loadEvent = async () => {
  const id = route.params.id
  if (!id) return
  
  loading.value = true
  
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    event.value = data
  } catch (e) {
    console.error('Failed to load event:', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadEvent()
})

const formatDateTime = (date) => {
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

useSeoMeta({
  title: computed(() => event.value ? `${event.value.title} | 看了没` : '加载中...'),
  description: computed(() => event.value?.title || '')
})
</script>
