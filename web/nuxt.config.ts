// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  
  // 应用配置
  app: {
    head: {
      title: '看了没 - 音乐演出信息聚合平台',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '聚合全国音乐演出信息，发现你喜欢的演唱会、Livehouse、音乐节' },
        { name: 'keywords', content: '演唱会,Livehouse,音乐节,演出信息,购票' }
      ]
    }
  },
  
  // 运行时配置
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.SUPABASE_URL || '',
      supabaseKey: process.env.SUPABASE_ANON_KEY || ''
    }
  },
  
  // 模块
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/icon'
  ],
  
  // Tailwind CSS 配置
  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    configPath: 'tailwind.config.js'
  },
  
  // Nitro 配置 - Vercel 部署
  nitro: {
    preset: 'vercel'
  }
})
