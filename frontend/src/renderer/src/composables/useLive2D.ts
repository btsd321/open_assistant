/**
 * Live2D Cubism Web SDK 集成 composable
 * SDK 通过全局 PIXI + Live2DCubismCore 加载
 */

export type MotionPriority = 0 | 1 | 2 | 3 // None / Idle / Normal / Force

export interface Live2DModel {
  // Cubism SDK 模型实例（类型由 SDK 提供，此处用 any 兼容）
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _model: any
  internalModel: {
    motionManager: {
      startMotion: (group: string, index: number, priority: MotionPriority) => boolean
    }
    focusController: {
      focus: (x: number, y: number) => void
    }
  }
  expression: (name: string) => void
}

const model = ref<Live2DModel | null>(null)
const isLoaded = ref(false)

export function useLive2D() {
  /**
   * 加载 Live2D 模型
   * @param canvasId  Canvas 元素 ID
   * @param modelPath  model3.json 路径
   */
  async function loadModel(canvasId: string, modelPath: string): Promise<void> {
    // 动态加载 pixi-live2d-display（避免 SSR 问题）
    const { Live2DModel: L2DModel } = await import('pixi-live2d-display')
    const { Application } = await import('pixi.js')

    const canvas = document.getElementById(canvasId) as HTMLCanvasElement
    if (!canvas) throw new Error(`Canvas #${canvasId} 不存在`)

    const app = new Application({ view: canvas, transparent: true, autoStart: true })
    const live2dModel = await L2DModel.from(modelPath)

    app.stage.addChild(live2dModel as unknown as import('pixi.js').DisplayObject)

    // 自适应填充 canvas
    live2dModel.x = canvas.width / 2
    live2dModel.y = canvas.height
    live2dModel.scale.set(canvas.width / live2dModel.internalModel.originalWidth)

    model.value = live2dModel as unknown as Live2DModel
    isLoaded.value = true
  }

  /**
   * 触发动作
   * @param group   动作组名，如 'TapBody'
   * @param index   动作索引
   * @param priority 优先级 0-3
   */
  function playMotion(group: string, index = 0, priority: MotionPriority = 2): boolean {
    if (!model.value) return false
    return model.value.internalModel.motionManager.startMotion(group, index, priority)
  }

  /**
   * 切换表情
   */
  function setExpression(name: string): void {
    model.value?.expression(name)
  }

  /**
   * 视线跟随鼠标
   */
  function focusAt(clientX: number, clientY: number): void {
    if (!model.value) return
    // 将屏幕坐标归一化到 [-1, 1]
    const nx = (clientX / window.innerWidth) * 2 - 1
    const ny = -((clientY / window.innerHeight) * 2 - 1)
    model.value.internalModel.focusController.focus(nx, ny)
  }

  /**
   * 口型同步（传入音频振幅 0-1）
   */
  function setMouthOpenY(value: number): void {
    if (!model.value) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params = (model.value._model as any).parameters
    const idx = params?.ids?.indexOf('ParamMouthOpenY')
    if (idx !== undefined && idx >= 0) {
      params.values[idx] = value
    }
  }

  return {
    model,
    isLoaded,
    loadModel,
    playMotion,
    setExpression,
    focusAt,
    setMouthOpenY
  }
}
