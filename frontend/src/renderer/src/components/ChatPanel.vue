<script setup lang="ts">
import { nextTick } from 'vue'
import { useWebSocket } from '../composables/useWebSocket'
import { useChatStore } from '../stores/chat'
import { useAssistantStore } from '../stores/assistant'
import MessageBubble from './MessageBubble.vue'

const chatStore = useChatStore()
const assistantStore = useAssistantStore()
const { sendMessage } = useWebSocket()

const messagesEl = ref<HTMLDivElement | null>(null)

/** 发送消息 */
function handleSend(): void {
  const text = chatStore.inputText.trim()
  if (!text || chatStore.isLoading) return
  sendMessage(text)
  chatStore.inputText = ''
}

/** 回车发送（Shift+Enter 换行） */
function handleKeydown(e: KeyboardEvent): void {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

/** 新消息时自动滚动到底部 */
watch(
  () => chatStore.messages.length,
  async () => {
    await nextTick()
    if (messagesEl.value) {
      messagesEl.value.scrollTop = messagesEl.value.scrollHeight
    }
  }
)
</script>

<template>
  <Transition name="slide-up">
    <div v-if="assistantStore.isChatVisible" class="chat-panel" @mousedown.stop>
      <!-- 消息列表 -->
      <div ref="messagesEl" class="messages">
        <MessageBubble v-for="msg in chatStore.messages" :key="msg.id" :message="msg" />
        <div v-if="chatStore.isLoading && !chatStore.messages.at(-1)?.streaming" class="typing">
          <span />
          <span />
          <span />
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="input-area">
        <textarea
          v-model="chatStore.inputText"
          class="input"
          placeholder="有什么我可以帮你的？"
          rows="2"
          :disabled="chatStore.isLoading"
          @keydown="handleKeydown"
        />
        <button class="send-btn" :disabled="chatStore.isLoading" @click="handleSend">发送</button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.chat-panel {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60%;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px);
  border-radius: 16px 16px 0 0;
  display: flex;
  flex-direction: column;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-area {
  display: flex;
  gap: 8px;
  padding: 10px 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.input {
  flex: 1;
  resize: none;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 13px;
  outline: none;
  font-family: inherit;
}

.send-btn {
  padding: 0 16px;
  background: #5b6af5;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  transition: background 0.2s;
}

.send-btn:hover:not(:disabled) {
  background: #4457f0;
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.typing {
  display: flex;
  gap: 4px;
  padding: 4px 8px;
}

.typing span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #5b6af5;
  animation: bounce 1.2s infinite;
}

.typing span:nth-child(2) { animation-delay: 0.2s; }
.typing span:nth-child(3) { animation-delay: 0.4s; }

@keyframes bounce {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-6px); }
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
