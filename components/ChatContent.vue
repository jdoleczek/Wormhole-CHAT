<template>
  <div v-for="(message, messageIndex) in messages" :title="message?.created?.substring(0, 19)?.replace('T', ' ')">
    <small v-if="message.kind === 'system'" class="d-block text-secondary mb-2">{{ message.content }}</small>

    <div v-if="message.kind === 'message'" :class="{'my justify-end': message.fromUid === meUid}" class="d-flex">
      <div class="bg-white px-3 py-1 text-pre-line msg" @dblclick="copyToClipboard(message.content)">
        <div v-if="participantsByUid[message.fromUid || ''] && !message.isSame">
          <small>
            {{ participantsByUid[message.fromUid].nick }}
            <span class="text-secondary">{{ message?.created?.substring(0, 19).replace('T', ' ') }}</span>
          </small>
        </div>

        <div v-if="message.md" v-html="message.md"></div>
        <div v-else>{{ message.content }}</div>
      </div>
    </div>

    <div v-if="message.kind === 'file'" class="mb-1">
      <v-alert icon="mdi-file-download" :title="message.fileName">
        <div class="mb-2">
          <span class="text-secondary">rozmiar:</span>
          {{ Math.ceil((message.fileData.length - 20) * 3 / 4098) }}
          <small class="text-secondary">KB</small>
        </div>
        <v-btn :href="message.fileData" :download="message.fileName" variant="flat" title="pobierz">pobierz</v-btn>
        <v-btn class="ml-3" variant="flat" title="skopiuj polecenie dla cli" @click="cliCopy(message)">cli</v-btn>
      </v-alert>
    </div>
  </div>

  <v-snackbar v-model="snackbar" color="primary" variant="tonal" :timeout="3000">
    {{ notification }}
  </v-snackbar>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  messages: {
    type: Array,
    default: () => ([]),
  },
  participants: {
    type: Array,
    default: () => ([]),
  },
  meUid: {
    type: String,
    default: '',
  },
});


const snackbar = ref(false);
let notification = ref('');

const copyToClipboard = text => {
  try {
    navigator.clipboard.writeText(text);
    notification.value = 'skopiowano do schowka';
  } catch (error) {
    console.error(error);
    notification.value = 'kopiowanie nie powiodło się';
  } finally {
    snackbar.value = true;
  }
};

const cliCopy = message => {
  let data = message.fileData.split(',').pop();
  copyToClipboard(`base64 -d <<< "${data}" > "${message.fileName}"`)
};

const participantsByUid = computed(() => {
  let result = {};

  for (let i = 0; i < props.participants.length; i++) {
    result[props.participants[i].uid] = props.participants[i];
  }

  return result;
});
</script>

<style>
.msg {
  margin-top: 1px;
  border-radius: 0 12px 12px 0;
}

.my .msg {
  border-radius: 12px 0 0 12px;
  text-align: right;
}

.my .msg pre {
  text-align: left;
}
</style>
