import { ChildProcess, spawn } from 'child_process'
import { join } from 'path'
import { app } from 'electron'
import { is } from '@electron-toolkit/utils'
import log from 'electron-log'

let backendProcess: ChildProcess | null = null

/** 获取后端可执行文件路径 */
function getBackendPath(): string {
  if (is.dev) {
    // 开发模式：直接用 Python 运行
    return 'python'
  }
  // 生产模式：使用 PyInstaller 打包的可执行文件
  return join(process.resourcesPath, 'backend', 'open_assistant_backend.exe')
}

/** 启动 Python 后端进程 */
export async function startBackend(): Promise<void> {
  return new Promise((resolve, reject) => {
    const backendPath = getBackendPath()
    const args = is.dev ? [join(app.getAppPath(), '../backend/app/main.py')] : []

    log.info('启动后端进程:', backendPath, args)

    backendProcess = spawn(backendPath, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, PYTHONUNBUFFERED: '1' }
    })

    backendProcess.stdout?.on('data', (data: Buffer) => {
      const output = data.toString().trim()
      log.info('[后端]', output)
      // 等待后端就绪信号
      if (output.includes('Application startup complete')) {
        log.info('后端已就绪')
        resolve()
      }
    })

    backendProcess.stderr?.on('data', (data: Buffer) => {
      log.warn('[后端 stderr]', data.toString().trim())
    })

    backendProcess.on('error', err => {
      log.error('后端进程启动失败:', err)
      reject(err)
    })

    backendProcess.on('exit', code => {
      log.info('后端进程退出，退出码:', code)
      backendProcess = null
    })

    // 5 秒超时
    setTimeout(() => resolve(), 5000)
  })
}

/** 停止 Python 后端进程 */
export async function stopBackend(): Promise<void> {
  if (backendProcess && !backendProcess.killed) {
    backendProcess.kill('SIGTERM')
    backendProcess = null
    log.info('后端进程已停止')
  }
}
