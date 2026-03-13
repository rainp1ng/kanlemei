<template>
  <div class="min-h-screen flex flex-col">
    <!-- 顶部导航 -->
    <header class="sticky top-0 z-50 bg-dark-900/95 backdrop-blur border-b border-dark-800">
      <nav class="container mx-auto px-4 h-16 flex items-center justify-between">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <Icon name="ph:music-notes-bold" class="text-white text-xl" />
          </div>
          <span class="text-xl font-bold text-gradient">看了没</span>
        </NuxtLink>
        
        <!-- 搜索框 -->
        <div class="hidden md:flex flex-1 max-w-md mx-8">
          <div class="relative w-full">
            <Icon name="ph:magnifying-glass" class="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索艺人、演出、场馆..."
              class="w-full pl-10 pr-4 py-2 bg-dark-800 border border-dark-700 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
              @keyup.enter="handleSearch"
            />
          </div>
        </div>
        
        <!-- 城市选择器 -->
        <div class="flex items-center gap-4">
          <button class="flex items-center gap-1 text-dark-300 hover:text-white transition-colors">
            <Icon name="ph:map-pin" />
            <span class="text-sm">{{ currentCity }}</span>
            <Icon name="ph:caret-down" class="text-xs" />
          </button>
          
          <!-- 移动端搜索按钮 -->
          <button class="md:hidden p-2 text-dark-400 hover:text-white" @click="showMobileSearch = true">
            <Icon name="ph:magnifying-glass" class="text-xl" />
          </button>
        </div>
      </nav>
    </header>
    
    <!-- 主内容 -->
    <main class="flex-1">
      <slot />
    </main>
    
    <!-- 底部 -->
    <footer class="bg-dark-900 border-t border-dark-800 py-8">
      <div class="container mx-auto px-4">
        <div class="flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 rounded gradient-primary flex items-center justify-center">
              <Icon name="ph:music-notes-bold" class="text-white text-sm" />
            </div>
            <span class="text-dark-400 text-sm">看了没 - 发现你喜欢的演出</span>
          </div>
          
          <div class="text-dark-600 text-sm">
            © 2024 看了没
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const searchQuery = ref('')
const showMobileSearch = ref(false)
const currentCity = ref('广州')

const router = useRouter()

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push(`/search?q=${encodeURIComponent(searchQuery.value.trim())}`)
    showMobileSearch.value = false
  }
}

const city = useCookie('city')
if (city.value) {
  currentCity.value = city.value
}
</script>
