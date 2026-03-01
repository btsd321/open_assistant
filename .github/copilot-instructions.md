# GitHub Copilot 指引

本文件为 open_assistant 项目的 GitHub Copilot 自定义指令，帮助 AI 更准确地理解项目背景与约定。

---

## 项目背景

open_assistant 是一个运行在 **Windows** 桌面的开源 AI 助手，具备：
- 透明无边框桌面窗口 + Live2D 卡通角色动画
- 与 OpenAI 兼容 API 对话
- 通过 pyautogui / pywin32 / uiautomation 自动执行电脑操作

**架构：** Electron（主进程） ↔ Vue 3（渲染进程） ↔ WebSocket/HTTP ↔ Python FastAPI（后端）

---

## 技术栈速查

| 层 | 技术 |
|----|------|
| 桌面壳 | Electron 最新稳定版 |
| 前端框架 | Vue 3 + `<script setup>` + Pinia + TypeScript |
| 动画 | Live2D Cubism Web SDK 5 |
| 后端框架 | Python 3.11+ FastAPI + Pydantic v2 |
| 通信 | WebSocket（实时流式输出）+ REST HTTP（控制指令） |
| 自动化 | pyautogui、pywin32、uiautomation |
| 打包 | electron-builder（前端）+ PyInstaller（后端） |

---

## 代码生成规范

### 前端（Vue 3 / TypeScript）

- 始终使用 `<script setup lang="ts">` 语法
- Props 使用 `defineProps<{...}>()` 声明类型
- 状态管理使用 Pinia，store 文件放在 `frontend/src/renderer/stores/`
- 异步操作统一用 `async/await`
- 组件文件名 `PascalCase`，composable 文件名 `use` 开头
- 与后端通信的逻辑封装在 `composables/useWebSocket.ts` 或 `composables/useApi.ts`

### 后端（Python / FastAPI）

- 路由函数必须有类型注解 + docstring
- 请求/响应体使用 Pydantic BaseModel
- 异步路由用 `async def`，同步阻塞任务用 `asyncio.run_in_executor`
- 配置项通过 `app/core/config.py` 的 `Settings`（pydantic-settings）统一管理
- 不直接调用 OpenAI SDK，通过 `app/services/ai_service.py` 封装

### Electron 主进程

- IPC 通信使用 `ipcMain.handle` / `ipcRenderer.invoke` 模式
- 所有 Node.js 原生 API 调用集中在主进程，通过 `contextBridge` 暴露给渲染进程
- 窗口管理逻辑放在 `frontend/src/main/windows/`

---

## 项目约定

- Python 缩进 **4 空格**，JS/TS/Vue 缩进 **2 空格**
- 提交信息遵循 Conventional Commits：`feat(scope): message`
- 错误日志统一用 `loguru`（Python）/ `electron-log`（Electron）
- 所有用户可见文本使用中文，代码注释可中英文混用
- Live2D 模型文件放在 `live2d/models/<model-name>/`，不提交超过 50MB 的二进制文件到 Git

---

## 常用 Skill 参考

### Skill：流式 AI 输出（SSE / WebSocket）

后端通过 `StreamingResponse` 或 WebSocket 逐 token 推送，前端通过 composable 拼接显示：

```typescript
// frontend/src/renderer/composables/useChat.ts 示意
const { send, messages } = useWebSocket('ws://localhost:8765/ws/chat')
```

```python
# backend/app/api/chat.py 示意
@router.websocket("/ws/chat")
async def chat_ws(websocket: WebSocket):
    await websocket.accept()
    async for chunk in ai_service.stream_chat(payload):
        await websocket.send_text(chunk)
```

### Skill：电脑自动化操作

所有自动化操作封装在 `backend/app/services/automation_service.py`，通过工具调用（Tool Call）触发：

```python
async def take_screenshot() -> bytes: ...
async def click(x: int, y: int) -> None: ...
async def type_text(text: str) -> None: ...
async def find_window(title: str) -> WindowInfo: ...
```

### Skill：Electron IPC 通信模板

```typescript
// preload/index.ts
contextBridge.exposeInMainWorld('assistant', {
  minimize: () => ipcRenderer.invoke('window:minimize'),
  setAlwaysOnTop: (v: boolean) => ipcRenderer.invoke('window:alwaysOnTop', v),
})
```

```typescript
// main/index.ts
ipcMain.handle('window:minimize', () => mainWindow.minimize())
ipcMain.handle('window:alwaysOnTop', (_, v) => mainWindow.setAlwaysOnTop(v))
```

### Skill：Live2D 动作触发

```typescript
// renderer/composables/useLive2D.ts 示意
const { playMotion, startLipSync } = useLive2D()
// 说话时同步嘴型
startLipSync(audioBuffer)
// 触发指定动作组
playMotion('TapBody', 0, Priority.Force)
```

### Skill：PyInstaller 后端打包

```bash
pyinstaller backend/app/main.py \
  --onefile \
  --name open_assistant_backend \
  --add-data "backend/app/prompts;app/prompts" \
  --hidden-import=uvicorn.logging \
  --hidden-import=uvicorn.loops.auto
```

---

## 目录速查

| 需求 | 对应路径 |
|------|----------|
| 新增 Vue 组件 | `frontend/src/renderer/components/` |
| 新增页面 | `frontend/src/renderer/views/` |
| 新增 Pinia Store | `frontend/src/renderer/stores/` |
| 新增 API 路由 | `backend/app/api/` |
| 新增业务服务 | `backend/app/services/` |
| 新增 Pydantic 模型 | `backend/app/models/` |
| Live2D 模型 | `live2d/models/` |
| 构建脚本 | `scripts/` |
