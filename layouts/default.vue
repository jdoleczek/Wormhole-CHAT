<template>
  <header>
  </header>

  <div class="bg-blue-lighten-5">
    <v-container class="bg-white main-view pb-0">
      <NuxtPage />
    </v-container>
  </div>

  <footer class="bg-blue-lighten-5">
    <v-container class="bg-white main-bottom pt-0">
      <v-divider color="blue-grey mb-2 mt-0 pt-0"></v-divider>
      <v-row>
        <v-col>
          Wormhole CHAT <small class="text-grey">v1.0</small>
          <div><small class="text-grey">Vue3, Nuxt3, Vuetify, MarkDown, QR codes, Server-Sent Events</small></div>
        </v-col>
        <v-col class="text-right">
          zmajstrował NiKO
          <div><small class="text-grey">używasz na własną odpowiedzialność</small></div>
        </v-col>
      </v-row>
    </v-container>
  </footer>
</template>

<style scoped>
.main-view {
  min-height: calc(100vh - 72px);
}

.main-bottom {
  height: 72px;
  line-height: 107%;
}
</style>
