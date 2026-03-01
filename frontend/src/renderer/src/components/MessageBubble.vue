<script setup lang="ts">
import type { Message } from '../stores/chat'

const props = defineProps<{
  message: Message
}>()
</script>

<template>
  <div class="bubble-wrap" :class="message.role">
    <div class="bubble" :class="{ streaming: message.streaming }">
      <!-- eslint-disable-next-line vue/no-v-html -->
      <p class="text" v-html="message.content.replace(/\n/g, '<br>')" />
      <span v-if="message.streaming" class="cursor">▋</span>
    </div>
  </div>
</template>

<style scoped>
.bubble-wrap {
  display: flex;
}

.bubble-wrap.user {
  justify-content: flex-end;
}

.bubble-wrap.assistant {
  justify-content: flex-start;
}

.bubble {
  max-width: 80%;
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.5;
  word-break: break-word;
}

.user .bubble {
  background: #5b6af5;
  color: white;
  border-bottom-right-radius: 4px;
}

.assistant .bubble {
  background: #f3f3f7;
  color: #222;
  border-bottom-left-radius: 4px;
}

.cursor {
  animation: blink 0.8s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
</style>
