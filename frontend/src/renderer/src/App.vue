<script setup lang="ts">
import { onMounted } from 'vue'
import { useDraggable } from './composables/useDraggable'
import Live2DCanvas from './components/Live2DCanvas.vue'
import ChatPanel from './components/ChatPanel.vue'
import ToolBar from './components/ToolBar.vue'

// 实现窗口拖拽
const { startDrag } = useDraggable()
</script>

<template>
  <div class="app-container" @mousedown="startDrag">
    <!-- Live2D 角色画布 -->
    <Live2DCanvas />

    <!-- 聊天面板（点击角色展开/收起） -->
    <ChatPanel />

    <!-- 顶部工具栏（最小化、置顶等） -->
    <ToolBar />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body,
#app {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: transparent;
}

.app-container {
  width: 100%;
  height: 100%;
  position: relative;
  user-select: none;
}
</style>
