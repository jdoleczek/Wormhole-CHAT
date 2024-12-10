<template>
  <v-dialog max-width="600px">
    <v-card>
      <v-card-title class="text-h6">Uczestnicy pokoju</v-card-title>

      <v-card-text>
        <p class="mb-3">Wszyscy uczestnicy którzy przewinęli się przez ten pokój.</p>

        <v-chip
          v-for="participant in participants"
          :variant="participant.isMe ? 'elevated' : 'tonal'"
          :class="{'font-weight-bold': false && participant.isAdmin}"
          :color="participant.isActive ? 'primary' : 'dark'"
          :title="participant.isMe ? 'to ja :-)' : participant.isActive ? 'aktywny' : 'nieaktywny'"
          class="mr-1 mb-1"
        >
          {{ participant.nick }}
        </v-chip>
      </v-card-text>

      <v-card-actions>,
        <v-spacer></v-spacer>
        <v-btn color="grey" text @click="close">Anuluj</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
const props = defineProps({
  participants: Array
});

const emit = defineEmits(['update:modelValue']);

const close = () => {
  emit('update:modelValue', false);
};
</script>
