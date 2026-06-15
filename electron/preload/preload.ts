import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

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

/** 自定义 API 接口 */
const api = {
  /** 窗口拖拽开始，传递鼠标屏幕坐标（主进程用 win.getPosition() 计算偏移，避免 DPI 问题） */
  startDrag: (info: DragStartInfo): void => {
    ipcRenderer.send('window-drag-start', info)
  },
  /** 窗口拖拽移动，传递鼠标屏幕坐标 */
  dragMove: (screenPos: ScreenPosition): void => {
    ipcRenderer.send('window-drag-move', screenPos)
  },
  /** 窗口拖拽结束 */
  endDrag: (): void => {
    ipcRenderer.send('window-drag-end')
  },
  /** 获取素材路径 */
  getAssetPath: (): Promise<string> => ipcRenderer.invoke('get-asset-path'),
  /** 获取配置 */
  getConfig: (): Promise<Record<string, unknown>> => ipcRenderer.invoke('get-config'),
  /** 保存配置 */
  saveConfig: (config: Record<string, unknown>): Promise<void> =>
    ipcRenderer.invoke('save-config', config)
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(window as any).electron = electronAPI
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(window as any).api = api
}
