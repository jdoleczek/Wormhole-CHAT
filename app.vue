<template>
  <div>
    <NuxtRouteAnnouncer />
  </div>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
import { onMounted } from "vue";

useHead({
  meta: [
    // Windows icons
    { name: 'application-name', content: 'Nazwa aplikacji' },
    { name: 'msapplication-TileColor', content: '#FFFFFF' },
    { name: 'msapplication-TileImage', content: '/mstile-144x144.png' },
    { name: 'msapplication-square70x70logo', content: '/mstile-70x70.png' },
    { name: 'msapplication-square150x150logo', content: '/mstile-150x150.png' },
    { name: 'msapplication-square270x270logo', content: '/mstile-270x270.png' },
    { name: 'msapplication-square310x310logo', content: '/mstile-310x310.png' },
    { name: 'msapplication-wide310x150logo', content: '/mstile-310x150.png' },
  ],
  link: [
    // Favicons
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
    { rel: 'icon', type: 'image/png', href: '/favicon-16x16.png', size: '16x16' },
    { rel: 'icon', type: 'image/png', href: '/favicon-32x32.png', size: '32x32' },
    { rel: 'icon', type: 'image/png', href: '/favicon-96x96.png', size: '96x96' },
    { rel: 'icon', type: 'image/png', href: '/favicon-128x128.png', size: '128x128' },
    { rel: 'icon', type: 'image/png', href: '/favicon-196x196.png', size: '196x196' },
    // Apple icons
    { rel: 'apple-touch-icon-precomposed', href: '/apple-touch-icon.png', size: '144x144' },
    { rel: 'apple-touch-icon-precomposed', href: '/apple-touch-icon-57x57.png', size: '57x57' },
    { rel: 'apple-touch-icon-precomposed', href: '/apple-touch-icon-60x60.png', size: '60x60' },
    { rel: 'apple-touch-icon-precomposed', href: '/apple-touch-icon-72x72.png', size: '72x72' },
    { rel: 'apple-touch-icon-precomposed', href: '/apple-touch-icon-76x76.png', size: '76x76' },
    { rel: 'apple-touch-icon-precomposed', href: '/apple-touch-icon-114x114.png', size: '114x114' },
    { rel: 'apple-touch-icon-precomposed', href: '/apple-touch-icon-120x120.png', size: '120x120' },
    { rel: 'apple-touch-icon-precomposed', href: '/apple-touch-icon-144x144.png', size: '144x144' },
    { rel: 'apple-touch-icon-precomposed', href: '/apple-touch-icon-152x152.png', size: '152x152' },
    { rel: 'apple-touch-icon-precomposed', href: '/apple-touch-icon-167x167.png', size: '167x167' },
    { rel: 'apple-touch-icon-precomposed', href: '/apple-touch-icon-180x180.png', size: '180x180' },
    // Other icons
    { rel: 'icon', type: 'image/png', href: '/favicon-228x228.png', size: '228x228' },
  ],
});

onMounted(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then(() => {
        console.log('Service Worker zarejestrowany');
      })
      .catch((error) => {
        console.error('Błąd podczas rejestracji Service Workera:', error);
      });
  }
});
</script>