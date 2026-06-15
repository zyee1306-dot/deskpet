import { join } from 'path'
import { BrowserWindow, ipcMain, shell, screen } from 'electron'
import { is } from '@electron-toolkit/utils'

/** 窗口拖拽偏移量（鼠标点击位置相对于窗口左上角的偏移，全部在屏幕坐标系计算） */
interface DragOffset {
  x: number
  y: number
}

/** 当前拖拽偏移 */
let dragOffset: DragOffset = { x: 0, y: 0 }
/** 是否正在拖拽 */
let isDragging = false

/**
 * 注册窗口拖拽相关 IPC 事件
 * 偏移量在主进程通过 win.getPosition() + 鼠标屏幕坐标计算，
 * 避免 renderer 的 DPI 缩放导致 clientX/screenX 坐标不一致
 * @param win - 目标窗口
 */
function registerDragHandlers(win: BrowserWindow): void {
  ipcMain.on('window-drag-start', (_event, info: { screenX: number; screenY: number }) => {
    isDragging = true
    /** 用主进程的 win.getPosition() 获取窗口位置，计算偏移量 */
    const [winX, winY] = win.getPosition()
    dragOffset = { x: info.screenX - winX, y: info.screenY - winY }
  })

  ipcMain.on('window-drag-move', (_event, screenPos: { x: number; y: number }) => {
    if (!isDragging || win.isDestroyed()) return
    const newX = Math.round(screenPos.x - dragOffset.x)
    const newY = Math.round(screenPos.y - dragOffset.y)
    win.setPosition(newX, newY)
  })

  ipcMain.on('window-drag-end', () => {
    isDragging = false
  })
}

/**
 * 创建主窗口
 * 透明、无边框、永远置顶、不显示任务栏图标
 * @returns BrowserWindow 实例
 */
export function createMainWindow(): BrowserWindow {
  const mainWindow = new BrowserWindow({
    width: 400,
    height: 400,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    hasShadow: false,
    maximizable: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: true,
      contextIsolation: true
    }
  })

  /** 初始位置：屏幕右下角 */
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize
  mainWindow.setBounds({
    x: screenWidth - 400 - 20,
    y: screenHeight - 400 - 20,
    width: 400,
    height: 400
  })

  registerDragHandlers(mainWindow)

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return mainWindow
}
