import { BrowserWindow, shell } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import log from 'electron-log'

export function createMainWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 300,
    height: 600,
    // 透明无边框窗口，用于桌面助手效果
    transparent: true,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    // 右下角贴边位置（后续可做拖拽记忆）
    x: 20,
    y: 100,
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  // 窗口准备好后再显示，避免白屏闪烁
  win.on('ready-to-show', () => {
    win.show()
  })

  // 外部链接通过系统浏览器打开
  win.webContents.setWindowOpenHandler(details => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // 开发模式加载 Vite 开发服务器，生产模式加载打包文件
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
    win.webContents.openDevTools({ mode: 'detach' })
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }

  log.info('主窗口已创建')
  return win
}
