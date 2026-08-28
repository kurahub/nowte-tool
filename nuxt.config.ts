export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/style.css'],

  app: {
    baseURL: '/tool/',

    head: {
      script: [
        {
          innerHTML: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-WPW82J');`
        }
      ],
      noscript: [
        {
          innerHTML: '<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-WPW82J" height="0" width="0" style="display:none;visibility:hidden"></iframe>',
          tagPosition: 'bodyOpen'
        }
      ]
    }
  },

  routeRules: {
    '/**': {
      trailingSlash: true
    }
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      concurrency: 1,
      interval: 50
    }
  }
})
