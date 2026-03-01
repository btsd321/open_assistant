import { app, shell, BrowserWindow, ipcMain, Tray, Menu, nativeImage } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import log from 'electron-log'
import { createMainWindow } from './windows/mainWindow'
import { startBackend, stopBackend } from './backend'
import { registerIpcHandlers } from './ipc'

log.transports.file.level = 'info'
log.info('应用启动', app.getVersion())

let tray: Tray | null = null
let mainWindow: BrowserWindow | null = null

app.whenReady().then(async () => {
  // 设置 Windows 应用 ID（用于任务栏分组）
  electronApp.setAppUserModelId('com.open-assistant.app')

  // 开发时快捷键：F12 开发者工具，刷新等
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // 启动 Python 后端
  await startBackend()

  // 注册 IPC 处理器
  registerIpcHandlers()

  // 创建主窗口
  mainWindow = createMainWindow()

  // 创建系统托盘
  createTray()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createMainWindow()
    }
  })
})

app.on('window-all-closed', () => {
  // Windows 下关闭所有窗口不退出，留在托盘
  if (process.platform !== 'darwin') {
    mainWindow = null
  }
})

app.on('before-quit', async () => {
  log.info('应用退出，停止后端')
  await stopBackend()
})

function createTray(): void {
  const iconPath = join(__dirname, '../../resources/tray-icon.png')
  const icon = nativeImage.createFromPath(iconPath)
  tray = new Tray(icon.isEmpty() ? nativeImage.createEmpty() : icon)

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示助手',
      click: () => {
        if (mainWindow) {
          mainWindow.show()
          mainWindow.focus()
        } else {
          mainWindow = createMainWindow()
        }
      }
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        app.quit()
      }
    }
  ])

  tray.setToolTip('OpenAssistant')
  tray.setContextMenu(contextMenu)
  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
    }
  })
}
