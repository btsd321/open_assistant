<script setup lang="ts">
import { useLive2D } from '../composables/useLive2D'
import { useAssistantStore } from '../stores/assistant'

const MODEL_PATH = './live2d/models/default/default.model3.json'
const canvasRef = ref<HTMLCanvasElement | null>(null)

const { loadModel, focusAt, playMotion } = useLive2D()
const assistantStore = useAssistantStore()

onMounted(async () => {
  try {
    await loadModel('live2d-canvas', MODEL_PATH)
  } catch (e) {
    console.warn('Live2D 模型加载失败:', e)
  }
})

/** 鼠标移动时，视线跟随 */
function handleMouseMove(e: MouseEvent): void {
  focusAt(e.clientX, e.clientY)
}

/** 点击角色触发动作并切换聊天面板 */
function handleClick(): void {
  playMotion('TapBody', 0, 2)
  assistantStore.toggleChat()
}
</script>

<template>
  <div class="live2d-wrapper" @mousemove="handleMouseMove" @click="handleClick">
    <canvas id="live2d-canvas" ref="canvasRef" class="live2d-canvas" />
  </div>
</template>

<style scoped>
.live2d-wrapper {
  position: absolute;
  inset: 0;
  cursor: pointer;
}

.live2d-canvas {
  width: 100%;
  height: 100%;
  background: transparent;
}
</style>
