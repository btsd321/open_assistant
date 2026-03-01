<script setup lang="ts">
import { useAssistantStore } from '../stores/assistant'

const assistantStore = useAssistantStore()
</script>

<template>
  <div class="toolbar" @mousedown.stop>
    <button
      class="btn"
      :title="assistantStore.isAlwaysOnTop ? '取消置顶' : '置顶'"
      @click="assistantStore.toggleAlwaysOnTop()"
    >
      {{ assistantStore.isAlwaysOnTop ? '📌' : '📍' }}
    </button>
    <button class="btn" title="最小化" @click="window.assistant.window.hide()">➖</button>
    <button class="btn" title="退出" @click="window.assistant.app.quit()">✕</button>
  </div>
</template>

<style scoped>
.toolbar {
  position: absolute;
  top: 6px;
  right: 6px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 100;
}

.toolbar:hover,
.app-container:hover .toolbar {
  opacity: 1;
}

.btn {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}

.btn:hover {
  background: rgba(255, 255, 255, 0.95);
}
</style>
