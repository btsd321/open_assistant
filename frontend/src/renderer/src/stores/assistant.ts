import { defineStore } from 'pinia'

export const useAssistantStore = defineStore('assistant', () => {
  const isAlwaysOnTop = ref(true)
  const isChatVisible = ref(false)
  const isConnected = ref(false)
  const backendUrl = ref('http://localhost:8765')

  /** 切换聊天面板显示状态 */
  function toggleChat(): void {
    isChatVisible.value = !isChatVisible.value
  }

  /** 切换窗口置顶 */
  async function toggleAlwaysOnTop(): Promise<void> {
    isAlwaysOnTop.value = !isAlwaysOnTop.value
    await window.assistant.window.setAlwaysOnTop(isAlwaysOnTop.value)
  }

  /** 设置后端连接状态 */
  function setConnected(value: boolean): void {
    isConnected.value = value
  }

  return {
    isAlwaysOnTop,
    isChatVisible,
    isConnected,
    backendUrl,
    toggleChat,
    toggleAlwaysOnTop,
    setConnected
  }
},
{
  persist: {
    paths: ['isAlwaysOnTop', 'backendUrl']
  }
})
