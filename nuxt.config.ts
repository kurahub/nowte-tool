export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/style.css'],

  app: {
    baseURL: '/tool/'
  },

  routeRules: {
    '/**': {
      trailingSlash: true
    }
  },

  nitro: {
    prerender: {
      crawlLinks: false,
      routes: [
        '/',
        '/split-pdf/'
      ]
    }
  }
})