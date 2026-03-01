import { useChatStore } from '../stores/chat'
import { useAssistantStore } from '../stores/assistant'

let ws: WebSocket | null = null
let reconnectTimer: ReturnType<typeof setTimeout> | null = null
const MAX_RECONNECT_DELAY = 10000

/** WebSocket 聊天 composable */
export function useWebSocket() {
  const chatStore = useChatStore()
  const assistantStore = useAssistantStore()
  const isConnecting = ref(false)

  /** 建立 WebSocket 连接 */
  function connect(): void {
    if (ws?.readyState === WebSocket.OPEN || isConnecting.value) return

    const wsUrl = assistantStore.backendUrl.replace('http', 'ws') + '/ws/chat'
    isConnecting.value = true

    try {
      ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        isConnecting.value = false
        assistantStore.setConnected(true)
        console.log('[WS] 已连接:', wsUrl)
        if (reconnectTimer) clearTimeout(reconnectTimer)
      }

      ws.onmessage = event => {
        const data = event.data as string
        if (data === '[DONE]') {
          chatStore.finishStreaming()
        } else if (data.startsWith('[ERROR]')) {
          chatStore.appendToLastMessage('\n\n> ⚠️ ' + data.slice(7))
          chatStore.finishStreaming()
        } else {
          chatStore.appendToLastMessage(data)
        }
      }

      ws.onclose = () => {
        isConnecting.value = false
        assistantStore.setConnected(false)
        console.warn('[WS] 连接断开，将在 3 秒后重连...')
        scheduleReconnect(3000)
      }

      ws.onerror = err => {
        console.error('[WS] 连接错误:', err)
        isConnecting.value = false
      }
    } catch (e) {
      isConnecting.value = false
      scheduleReconnect(3000)
    }
  }

  /** 计划重连 */
  function scheduleReconnect(delay: number): void {
    if (reconnectTimer) clearTimeout(reconnectTimer)
    reconnectTimer = setTimeout(() => {
      connect()
    }, Math.min(delay, MAX_RECONNECT_DELAY))
  }

  /** 发送消息 */
  function sendMessage(content: string): void {
    if (!content.trim()) return
    if (ws?.readyState !== WebSocket.OPEN) {
      console.warn('[WS] 未连接，尝试重新连接...')
      connect()
      return
    }

    chatStore.addUserMessage(content)
    chatStore.addAssistantMessage()
    chatStore.isLoading = true

    ws.send(JSON.stringify({ content, role: 'user' }))
  }

  /** 断开连接 */
  function disconnect(): void {
    if (reconnectTimer) clearTimeout(reconnectTimer)
    ws?.close()
    ws = null
  }

  onMounted(() => connect())
  onUnmounted(() => disconnect())

  return {
    isConnecting,
    connect,
    disconnect,
    sendMessage
  }
}
