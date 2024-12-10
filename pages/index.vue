<template>
  <v-row>
    <v-col cols="12" md="12" lg="9">
      <h1 class="mb-0">Wormhole <small class="text-blue-grey">CHAT</small></h1>
      <div class="text-grey">Usługa ma charakter wybitnie experymentalny, korzystasz z niej na własne ryzyko.</div>
    </v-col>
    <v-col cols="12" lg="3" class="text-right">
      <v-btn append-icon="mdi-chat-plus" class="mb-3 w-100" @click="openModal">Utwórz pokój</v-btn>
    </v-col>
  </v-row>
  <v-divider color="blue-grey mb-3"></v-divider>
  <v-btn
    v-for="(chat, cahtIndex) in chats"
    :key="cahtIndex"
    :to="`/chat/${chat.uid}`"
    :prepend-icon="chat.hidden ? 'mdi-eye-off' : null"
    :append-icon="chat.passwordRequired ? 'mdi-lock' : 'mdi-lock-open-variant'"
    class="justify-start mb-2 bg-blue-lighten-5"
    block
  >
    {{ chat.name }}
  </v-btn>

  <v-dialog v-model="showModal" max-width="600px">
    <v-card>
      <v-card-title class="text-h6">Utwórz nowy pokój</v-card-title>

      <v-card-text>
        <v-text-field
          ref="nameField"
          label="Nazwa"
          v-model="form.name"
          placeholder="Prywatny"
          outlined
        ></v-text-field>

        <v-checkbox
          v-model="form.publicVisible"
          label="Widoczny publicznie"
        ></v-checkbox>

        <v-text-field
          label="Hasło"
          v-model="form.password"
          type="password"
          outlined
        ></v-text-field>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey" text @click="cancel">Anuluj</v-btn>
        <v-btn color="primary" @click="createRoom">Utwórz pokój</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

let chats = ref([]);
let loadChatsInterval = null;
const nameField = ref(null);
const showModal = ref(false);

const cleanRoom = () =>
  JSON.parse(JSON.stringify({
  name: 'Grupa pod wezwaniem',
  publicVisible: true,
  password: '',
}));

const form = ref(cleanRoom());

const cancel = () => {
  showModal.value = false;
};

const openModal = async () => {
  showModal.value = true;
  await nextTick();
  nameField.value?.focus();
};

const createRoom = async () => {
  showModal.value = false;

  try {
    const payload = {
      name: form.value.name,
      private: !form.value.publicVisible,
      password: form.value.password,
    };

    const response = await fetch("/api/create-chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Błąd: ${response.statusText}`);
    }

    form.value = cleanRoom();
    const json = await response.json();

    if (json?.chat?.uid) {
      router.push(`/chat/${json.chat.uid}`);
    }

    await loadChats();
  } catch (error) {
    console.error("Błąd podczas tworzenia czatu:", error);
  }
};

const loadChats = async () => {
  const resp = await $fetch('/api/chats', {timeout: 3000});
  chats.value = resp?.chats || [];
};

onMounted(async () => {
  try {
    loadChats();
    loadChatsInterval = setInterval(loadChats, 3500);
  } catch (error) {
    console.error(error);
  }
});

onUnmounted(async () => {
  clearInterval(loadChatsInterval);
})
</script>
