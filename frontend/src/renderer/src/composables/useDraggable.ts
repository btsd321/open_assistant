/**
 * 窗口拖拽 composable
 * 通过 Electron IPC 移动原生窗口位置
 */
export function useDraggable() {
  let isDragging = false
  let startMouseX = 0
  let startMouseY = 0
  let startWinX = 0
  let startWinY = 0

  async function startDrag(e: MouseEvent): Promise<void> {
    // 仅响应左键
    if (e.button !== 0) return

    isDragging = true
    startMouseX = e.screenX
    startMouseY = e.screenY

    const pos = await window.assistant.window.getPosition()
    startWinX = pos[0]
    startWinY = pos[1]

    const onMouseMove = (ev: MouseEvent): void => {
      if (!isDragging) return
      const dx = ev.screenX - startMouseX
      const dy = ev.screenY - startMouseY
      window.assistant.window.setPosition(startWinX + dx, startWinY + dy)
    }

    const onMouseUp = (): void => {
      isDragging = false
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  return { startDrag }
}
