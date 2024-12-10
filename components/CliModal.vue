<template>
  <v-dialog max-width="600px">
    <v-card>
      <v-card-title class="text-h6">Wsparcie dla CLI</v-card-title>

      <v-card-text>

        <v-card>
          <v-tabs v-model="tab" bg-color="primary">
            <v-tab value="msg">wyślij wiadomość</v-tab>
            <v-tab value="file">wyślij plik</v-tab>
          </v-tabs>

          <v-card-text>
            <v-tabs-window v-model="tab">
              <v-tabs-window-item value="msg">
                <v-text-field v-model="msg" label="wiadomość" outlined></v-text-field>
                <small><pre class="code">{{ sendMsg }}</pre></small>
              </v-tabs-window-item>

              <v-tabs-window-item value="file">
                <v-text-field v-model="fp" label="ścieżka do pliku" outlined></v-text-field>
                <small><pre class="code">{{ sendFile }}</pre></small>
              </v-tabs-window-item>
            </v-tabs-window>
          </v-card-text>
        </v-card>
      </v-card-text>

      <v-card-actions>,
        <v-spacer></v-spacer>
        <v-btn color="grey" text @click="close">Anuluj</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, ref } from 'vue';

const tab = ref('msg');
const msg = ref('hello world');
const fp = ref('/home/sweet/home.txt');

const props = defineProps({
  connection: Object,
});

const emit = defineEmits(['update:modelValue']);

const close = () => {
  emit('update:modelValue', false);
};

const appUrl = computed(() => {
  let parts = ((window?.location || '') + '').split('/');
  parts.pop();
  parts.pop();
  return parts.join('/');
});

const sendMsg = computed(() => {
  return `
    SECRET="${props.connection?.secret || ''}"
    MSG=${JSON.stringify(msg.value)}

    JSON=$(cat <<EOF
    {
      "secret": "$SECRET",
      "kind": "message",
      "message": "$MSG"
    }
    EOF
    )

    curl -X POST \\
      -H "Content-Type: application/json" \\
      -d "$JSON" \\
      ${ appUrl.value }/api/send
  `.replace(/    /g, '');
});

const sendFile = computed(() => {
  return `
    SECRET="${props.connection?.secret || ''}"
    FILEPATH="${fp.value}"
    FILENAME="\${FILEPATH##*/}"
    FILEDATA=$(base64 "$FILEPATH")
    FILEURI="data:application/octet-stream;base64,$FILEDATA"
    MSG="{''name'':''$FILENAME''"
    MSG="$MSG,''data'':''$FILEURI''}"

    JSON=$(cat <<EOF
    {
      "secret": "$SECRET",
      "kind": "file",
      "message": "$MSG"
    }
    EOF
    )

    echo $JSON
    curl -X POST \\
      -H "Content-Type: application/json" \\
      -d "$JSON" \\
      ${ appUrl.value }/api/send
  `
    .replace(/    /g, '')
    .replace(/''/g, '\\\\\\\"');
});
</script>
