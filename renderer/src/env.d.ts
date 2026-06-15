/** 拖拽起始信息：鼠标屏幕坐标 */
interface DragStartInfo {
  screenX: number
  screenY: number
}

/** 屏幕坐标 */
interface ScreenPosition {
  x: number
  y: number
}

/** 渲染进程暴露的自定义 API */
interface PetApi {
  /** 窗口拖拽开始，传递鼠标屏幕坐标（主进程用 win.getPosition() 计算偏移） */
  startDrag: (info: DragStartInfo) => void
  /** 窗口拖拽移动，传递鼠标屏幕坐标 */
  dragMove: (screenPos: ScreenPosition) => void
  /** 窗口拖拽结束 */
  endDrag: () => void
  /** 获取素材路径 */
  getAssetPath: () => Promise<string>
  /** 获取配置 */
  getConfig: () => Promise<Record<string, unknown>>
  /** 保存配置 */
  saveConfig: (config: Record<string, unknown>) => Promise<void>
}

declare global {
  interface Window {
    api: PetApi
  }
}

export {}