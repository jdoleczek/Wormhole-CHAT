<template>
  <v-row>
    <v-col cols="12" sm="12" md="8">
      <h1>
        <span :title="`utworzony ${chat?.created?.substring(0, 19)?.replace('T', ' ')}`">{{ chat.name || '...' }}</span>
        <small class="text-blue-grey">
          <v-icon v-if="chat.passwordRequired" icon="mdi-lock" title="chat zabezpieczony hasłem" />
          <v-icon v-else icon="mdi-lock-open-variant" title="dostęp do chata nie wymaga hasła" />
        </small>
      </h1>
    </v-col>
    <v-col cols="12" sm="12" md="4" class="text-right">
      <span class="mr-2" title="lista chatów">
        <v-btn to="/" icon="mdi-home"></v-btn>
      </span>
      <span class="mr-6" title="uczestnicy">
        <v-btn icon="mdi-account-group" @click="showParticipantsModal = true"></v-btn>
      </span>

      <span class="mr-2 ml-4" title="wyślij plik">
        <input type="file" ref="fileInput" class="d-none" multiple @change="onFilesChange" />
        <v-btn icon="mdi-file-upload" @click="triggerFileInput"></v-btn>
      </span>
      <span class="mr-2" title="wsparcie dla konsoli">
        <v-btn icon="mdi-console" @click="showCliModal = true"></v-btn>
      </span>
      <span class="mr-2" title="qrcode z linkiem do chatu">
        <v-btn icon="mdi-qrcode" @click="showQr"></v-btn>
      </span>
    </v-col>
  </v-row>

  <v-divider color="blue-grey mt-2 mb-2"></v-divider>

  <div>
    <v-chip
      v-for="participant in participantsList"
      :variant="participant.isMe ? 'elevated' : 'tonal'"
      :class="{'font-weight-bold': false && participant.isAdmin, 'd-none': !participant.isActive}"
      :color="participant.isActive ? 'primary' : 'dark'"
      :title="participant.isMe ? 'to ja :-)' : participant.isActive ? 'aktywny' : 'nieaktywny'"
      class="mr-1 mb-1"
    >
      {{ participant.nick }}
    </v-chip>
  </div>

  <div>
    <div ref="content" class="content mt-1 mb-3">
      <chat-content :messages="msgs" :participants="participants" :me-uid="connection.uid"></chat-content>
    </div>
    <div class="compose d-flex align-start">
      <v-textarea
        v-model="msg"
        ref="msgtextarea"
        class="flex-grow-1"
        label="wiadomość"
        rows="3"
        no-resize
        @keyup.enter="onMsgEnter"
      ></v-textarea>

      <div class="ml-3">
        <div class="mb-2" title="wyślij widomość: ctrl + enter">
          <v-btn :disabled="!trimedMsg" icon="mdi-send" size="small" @click="sendMessage"></v-btn>
        </div>
        <div f-if="false" class="mb-1" title="wyślij nagranie audio">
          <v-btn icon="mdi-microphone" size="small" disabled></v-btn>
        </div>
      </div>
    </div>
  </div>

  <v-dialog v-model="showModal" max-width="600px" persistent>
    <v-card>
      <v-card-title class="text-h6">Wejdź</v-card-title>

      <v-card-text>
        <v-text-field
          v-model="form.nick"
          ref="nameField"
          label="Twój nick"
          placeholder="może być losowy"
          outlined
          autofocus
          @keyup.enter="checkIfPasswordNeeded"
        ></v-text-field>

        <v-text-field
          v-if="chat.passwordRequired"
          v-model="form.password"
          ref="passwordField"
          label="Hasło"
          type="password"
          outlined
          @keyup.enter="login"
        ></v-text-field>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey" text @click="cancel">Anuluj</v-btn>
        <v-btn color="primary" @click="login">Ustaw</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="showQrModal" max-width="600px">
    <v-card>
      <v-card-title class="text-h6">QR code link</v-card-title>

      <v-card-text>
        <div>
          <strong>{{ qrlink }}</strong>
        </div>

        <div class="d-flex justify-center mt-6">
          <canvas ref="qrcanvas"></canvas>
        </div>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey" text @click="showQrModal = false">Anuluj</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <participants-modal
    v-model="showParticipantsModal"
    :participants="participantsList"
    @click:outside="showParticipantsModal = false"
  />

  <cli-modal
    v-model="showCliModal"
    :connection="connection"
    @click:outside="showCliModal = false"
  />

  <v-snackbar v-model="snackbar" color="primary" variant="tonal" :timeout="3000">
    {{ notification }}
  </v-snackbar>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import MarkdownIt from 'markdown-it';
import QRCode from 'qrcode';

const route = useRoute();
const router = useRouter();
const md = new MarkdownIt();

const uid = route.params?.uid;
const showModal = ref(false);
const showParticipantsModal = ref(false);
const showCliModal = ref(false);
const showQrModal = ref(false);
const snackbar = ref(false);

let evSrc = null;
let chat = ref({});
let connection = ref({});
let participants = ref([]);
let msg = ref('');
let msgs = ref([]);
let msgtextarea = ref(null);
let content = ref(null);

let qrlink = ref('');
let qrcanvas = ref(null);
let fileInput = ref(null);
let passwordField = ref(null);
let notification = ref('');

const form = ref({
  nick: '',
  password: '',
});

const cancel = () => {
  showModal.value = false;
  router.push('/');
};

const login = async () => {
  let payload = {
    chatUid: chat.value.uid,
    nick: form.value.nick,
  };

  if (chat.value.passwordRequired) {
    payload.password = form.value.password;
  }

  const response = await fetch('/api/login-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (response.status == 401) {
    if (passwordField.value) {
      passwordField.value.focus();
    }

    form.value.password = '';
    notification.value = 'to nie to hasło';
    snackbar.value = true;
    return;
  } else if (response.status != 200) {
    router.push('/');
    return;
  }

  connection.value = await response.json();
  showModal.value = false;

  evSrc = new EventSource(`/api/events?secret=${connection.value.secret}`);

  evSrc.onmessage = (event) => {
    let data = JSON.parse(event.data);
    const lastMsg = msgs.value.slice(-1)[0];

    try {
      if (data.kind == 'message') {
        data.md = md.render(data.content).trim();
        data.isSame = data.fromUid == lastMsg?.fromUid && lastMsg?.kind === 'message';
      }

      if (data.kind == 'file') {
        const file = JSON.parse(data.content);
        data.fileName = file.name;
        data.fileData = file.data;
      }

      if (data.kind == 'participants') {
        participants.value = JSON.parse(data.content);
      }

      msgs.value.push(data);
    } catch (error) {
      console.error(error);
    }

    setTimeout(() => {
      if (content.value) {
        content.value.scrollTop = content.value.scrollHeight;
      }
    }, 50);
  };

  evSrc.onerror = () => {
    console.error('Błąd w SSE');
    evSrc?.close();
  };

  if (msgtextarea.value) {
    setTimeout(() => {
      msgtextarea.value.focus();
    }, 100);
  }
};

const checkIfPasswordNeeded = () => {
  if (chat.passwordRequired) {

  } else {
    login();
  }
};

const showQr = () => {
  showQrModal.value = true;

  setTimeout(() => {
    if (qrcanvas.value) {
      qrlink.value =  window.location + '';

      QRCode.toCanvas(qrcanvas.value, qrlink.value, function (error) {
        if (error) console.error(error);
      });
    }
  }, 100);
};

const sendRawMessage = async (message, kind) => {
  if (!connection.value.secret) {
    console.error('Brak konfiguracji połączenia');
    return;
  }

  await fetch('/api/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret: connection.value.secret,
      kind,
      message,
    }),
  });
};

const sendMessage = async () => {
  if (!trimedMsg.value) {
    return;
  }

  await sendRawMessage(trimedMsg.value, 'message');
  msg.value = '';
};

const onMsgEnter = (event) => {
  if (event.ctrlKey) {
    msg.value += '\n';
    return;
  }

  event.preventDefault();
  sendMessage();
};

const triggerFileInput = () => {
  if (fileInput.value) {
    fileInput.value.value = [];
    fileInput.value.click();
  }
};

const onFilesChange = async (event) => {
  const files = event.target.files;

  if (files && files.length > 0) {
    for (const file of files) {
      const result = await base64File(file);
      await sendRawMessage(JSON.stringify(result), 'file');
      notification.value = `trwa wysyłanie pliku: ${result.name}`;
      snackbar.value = true;
    }
  }
};

const base64File = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve({
        name: file.name,
        data: reader.result,
      });
    };

    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
};

const trimedMsg = computed(() => msg.value.trim());

const participantsList = computed(() => {
  if (!participants.value.length) {
    return [{nick: '...', isActive: true}];
  }

  return participants.value.map(item => ({
    ...item,
    isMe: item.uid === connection.value.uid,
  }));
});

watch(chat, val => {
  if (val?.name && !val?.nick) {
    showModal.value = true;
  }
});

try {
  const resp = await $fetch(`/api/chat/${uid}`);
  chat.value = resp?.chat || {};

  if (!chat.value.uid) {
    router.push('/');
  }
} catch (error) {
  console.error(error);
}

onUnmounted(() => evSrc?.close());
</script>

<style>
.content {
  height: calc(100vh - 340px);
  min-height: 200px;
  overflow-y: scroll;
  background-color: #f8f8f8;
  border-top: solid 1px #eee;
  border-bottom: solid 1px #eee;
  padding: .4rem .8rem;
}
</style>
