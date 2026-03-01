import { defineStore } from 'pinia'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  streaming?: boolean
}

export const useChatStore = defineStore('chat', () => {
  const messages = ref<Message[]>([])
  const isLoading = ref(false)
  const inputText = ref('')

  /** 添加用户消息 */
  function addUserMessage(content: string): Message {
    const msg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: Date.now()
    }
    messages.value.push(msg)
    return msg
  }

  /** 添加助手消息（支持流式更新） */
  function addAssistantMessage(): Message {
    const msg: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      streaming: true
    }
    messages.value.push(msg)
    return msg
  }

  /** 向最后一条助手消息追加内容（流式） */
  function appendToLastMessage(chunk: string): void {
    const last = messages.value.at(-1)
    if (last?.role === 'assistant') {
      last.content += chunk
    }
  }

  /** 完成流式输出 */
  function finishStreaming(): void {
    const last = messages.value.at(-1)
    if (last) last.streaming = false
    isLoading.value = false
  }

  /** 清空对话 */
  function clearMessages(): void {
    messages.value = []
  }

  return {
    messages,
    isLoading,
    inputText,
    addUserMessage,
    addAssistantMessage,
    appendToLastMessage,
    finishStreaming,
    clearMessages
  }
})
