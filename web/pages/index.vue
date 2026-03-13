<template>
  <div>
    <!-- Hero Section -->
    <section class="relative py-16 md:py-24 overflow-hidden">
      <div class="absolute inset-0 gradient-primary opacity-10" />
      <div class="container mx-auto px-4 relative">
        <div class="max-w-2xl">
          <h1 class="text-4xl md:text-5xl font-bold mb-4">
            发现你喜欢的<span class="text-gradient">演出</span>
          </h1>
          <p class="text-dark-400 text-lg mb-8">
            聚合全国音乐演出信息，一站式发现演唱会、Livehouse、音乐节
          </p>
          <div class="flex gap-4">
            <NuxtLink to="/events" class="btn btn-primary">
              <Icon name="ph:compass" class="mr-2" />
              浏览演出
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>
    
    <!-- 热门城市 -->
    <section class="py-8 border-b border-dark-800">
      <div class="container mx-auto px-4">
        <div class="flex items-center gap-3 overflow-x-auto pb-2">
          <span class="text-dark-400 text-sm whitespace-nowrap">热门城市:</span>
          <button
            v-for="city in hotCities"
            :key="city.name"
            class="px-3 py-1 rounded-full text-sm whitespace-nowrap transition-all"
            :class="selectedCity === city.name 
              ? 'bg-primary-600 text-white' 
              : 'bg-dark-800 text-dark-300 hover:bg-dark-700'"
            @click="selectCity(city.name)"
          >
            {{ city.name }}
          </button>
        </div>
      </div>
    </section>
    
    <!-- 本周热门演出 -->
    <section class="py-12">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold">本周热门</h2>
          <NuxtLink to="/events" class="text-primary-400 hover:text-primary-300 text-sm flex items-center gap-1">
            查看全部
            <Icon name="ph:arrow-right" />
          </NuxtLink>
        </div>
        
        <!-- 加载状态 -->
        <div v-if="pending" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="i in 4" :key="i" class="card">
            <div class="aspect-[3/4] bg-dark-800 animate-pulse" />
            <div class="p-4 space-y-2">
              <div class="h-4 bg-dark-800 rounded animate-pulse" />
              <div class="h-3 bg-dark-800 rounded w-2/3 animate-pulse" />
            </div>
          </div>
        </div>
        
        <!-- 演出卡片 -->
        <div v-else-if="events?.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <NuxtLink 
            v-for="event in events" 
            :key="event.id" 
            :to="`/events/${event.id}`"
            class="card group cursor-pointer"
          >
            <!-- 海报 -->
            <div class="aspect-[3/4] relative overflow-hidden">
              <img 
                v-if="event.poster_url"
                :src="event.poster_url" 
                :alt="event.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div v-else class="w-full h-full bg-gradient-to-br from-dark-700 to-dark-800 flex items-center justify-center">
                <Icon name="ph:music-notes" class="text-4xl text-dark-600" />
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
                <span class="line-clamp-1">{{ event.venue_name }}</span>
              </div>
              <div class="flex items-center justify-between mt-3">
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
          <p class="text-dark-400">暂无演出信息</p>
          <p class="text-dark-600 text-sm mt-2">请稍后再来看看</p>
        </div>
      </div>
    </section>
    
    <!-- 分类入口 -->
    <section class="py-12 border-t border-dark-800">
      <div class="container mx-auto px-4">
        <h2 class="text-2xl font-bold mb-6">演出分类</h2>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <NuxtLink 
            v-for="category in categories" 
            :key="category.type"
            :to="`/events?type=${category.type}`"
            class="card p-6 group hover:border-primary-500 border border-transparent"
          >
            <div class="flex items-center gap-4">
              <div :class="`w-12 h-12 rounded-lg flex items-center justify-center ${category.bgClass}`">
                <Icon :name="category.icon" class="text-2xl" />
              </div>
              <div>
                <h3 class="font-medium group-hover:text-primary-400 transition-colors">{{ category.label }}</h3>
                <p class="text-dark-500 text-sm">{{ category.desc }}</p>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
const { getHotEvents } = useEvents()

// 热门城市
const hotCities = [
  { name: '北京' },
  { name: '上海' },
  { name: '广州' },
  { name: '深圳' },
  { name: '成都' },
  { name: '杭州' },
  { name: '武汉' },
  { name: '南京' }
]

const selectedCity = ref('广州')

// 分类
const categories = [
  { type: 'concert', label: '演唱会', desc: '大型演唱会、巡演', icon: 'ph:microphone-stage', bgClass: 'bg-pink-500/20 text-pink-400' },
  { type: 'livehouse', label: 'Livehouse', desc: '小型现场演出', icon: 'ph:speaker-high', bgClass: 'bg-purple-500/20 text-purple-400' },
  { type: 'festival', label: '音乐节', desc: '户外音乐节', icon: 'ph:tent', bgClass: 'bg-orange-500/20 text-orange-400' }
]

// 获取热门演出
const { data: events, pending } = await useAsyncData('hot-events', () => getHotEvents(8))

// 方法
const selectCity = (city: string) => {
  selectedCity.value = city
  navigateTo(`/events?city=${city}`)
}

const formatDate = (date: string) => {
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

const parseTicketPlatforms = (platforms: any) => {
  if (!platforms) return []
  if (Array.isArray(platforms)) return platforms
  return []
}

// SEO
useSeoMeta({
  title: '看了没 - 发现你喜欢的演出',
  description: '聚合全国音乐演出信息，一站式发现演唱会、Livehouse、音乐节',
  ogTitle: '看了没 - 发现你喜欢的演出',
  ogDescription: '聚合全国音乐演出信息，一站式发现演唱会、Livehouse、音乐节'
})
</script>
