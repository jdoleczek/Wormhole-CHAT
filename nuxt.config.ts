// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: ['vuetify-nuxt-module'],
  app: {
    head: {
      link: [
        { rel: 'manifest', href: '/manifest.json' }
      ],
      meta: [
        { name: 'theme-color', content: '#ffffff' },
        { name: 'description', content: 'Just chat' },
        { name: 'keywords', content: 'nuxt, pwa, vue, meta' },
        { name: 'author', content: 'NiKO' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { property: 'og:title', content: 'Wormhole CHAT' },
        { property: 'og:description', content: 'Just chat' },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://github.com/jdoleczek/Wormhole-CHAT' },
        { property: 'og:image', content: 'https://raw.githubusercontent.com/jdoleczek/Wormhole-CHAT/refs/heads/main/public/android-chrome-512x512.png' }
      ],
      htmlAttrs: {
        lang: 'pl'
      },
      title: 'Wormhole CHAT',
    },
  },
  nitro: {
    prerender: {
      routes: ["/"]
    },
    routeRules: {
      "/**": {
        headers: {
          "Cache-Control": "max-age=0, must-revalidate",
          "Service-Worker-Allowed": "/"
        }
      }
    }
  }
})