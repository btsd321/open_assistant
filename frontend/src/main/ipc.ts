import { ipcMain, BrowserWindow, app, shell } from 'electron'
import log from 'electron-log'

export function registerIpcHandlers(): void {
  // ─── 窗口控制 ────────────────────────────────────────────────
  ipcMain.handle('window:minimize', () => {
    BrowserWindow.getFocusedWindow()?.minimize()
  })

  ipcMain.handle('window:hide', () => {
    BrowserWindow.getFocusedWindow()?.hide()
  })

  ipcMain.handle('window:alwaysOnTop', (_, value: boolean) => {
    BrowserWindow.getAllWindows().forEach(win => win.setAlwaysOnTop(value))
    log.info('alwaysOnTop:', value)
  })

  ipcMain.handle('window:setPosition', (_, x: number, y: number) => {
    BrowserWindow.getFocusedWindow()?.setPosition(x, y)
  })

  ipcMain.handle('window:getPosition', () => {
    return BrowserWindow.getFocusedWindow()?.getPosition() ?? [0, 0]
  })

  // ─── 应用信息 ────────────────────────────────────────────────
  ipcMain.handle('app:getVersion', () => app.getVersion())

  ipcMain.handle('app:quit', () => app.quit())

  // ─── 外部链接 ────────────────────────────────────────────────
  ipcMain.handle('shell:openExternal', (_, url: string) => {
    shell.openExternal(url)
  })
}
