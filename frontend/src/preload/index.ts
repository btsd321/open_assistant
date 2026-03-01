import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

/** 暴露给渲染进程的 API */
const assistantAPI = {
  // ─── 窗口控制 ─────────────────────────────────────────────────
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    hide: () => ipcRenderer.invoke('window:hide'),
    setAlwaysOnTop: (value: boolean) => ipcRenderer.invoke('window:alwaysOnTop', value),
    setPosition: (x: number, y: number) => ipcRenderer.invoke('window:setPosition', x, y),
    getPosition: (): Promise<[number, number]> => ipcRenderer.invoke('window:getPosition')
  },

  // ─── 应用信息 ─────────────────────────────────────────────────
  app: {
    getVersion: (): Promise<string> => ipcRenderer.invoke('app:getVersion'),
    quit: () => ipcRenderer.invoke('app:quit')
  },

  // ─── 工具 ─────────────────────────────────────────────────────
  shell: {
    openExternal: (url: string) => ipcRenderer.invoke('shell:openExternal', url)
  }
}

// 通过 contextBridge 安全暴露，避免直接暴露 Node.js API
if (process.contextIsolated) {
  contextBridge.exposeInMainWorld('electron', electronAPI)
  contextBridge.exposeInMainWorld('assistant', assistantAPI)
} else {
  // @ts-ignore（非隔离模式降级，仅开发调试用）
  window.electron = electronAPI
  // @ts-ignore
  window.assistant = assistantAPI
}
