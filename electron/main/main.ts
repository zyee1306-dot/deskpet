import { app, BrowserWindow } from 'electron'
import { createMainWindow } from './window'
import { createTray, destroyTray } from './tray'
import { registerAssetProtocol, registerSchemePrivilege } from './protocol'

/** 标记应用是否正在真正退出（区别于隐藏到托盘） */
declare module 'electron' {
  interface App {
    isQuitting?: boolean
  }
}

/** 必须在 app.whenReady 之前注册协议特权，否则 fetch 不支持自定义协议 */
registerSchemePrivilege()

/** 主窗口实例 */
let mainWindow: BrowserWindow | null = null

/**
 * 应用初始化
 */
function initialize(): void {
  mainWindow = createMainWindow()
  createTray(mainWindow)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  /** 注册自定义素材协议，必须在 app.ready 之后 */
  registerAssetProtocol()

  initialize()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createMainWindow()
    }
  })
})

/** 关闭所有窗口时不退出，保持托盘运行 */
app.on('window-all-closed', (e: Event) => {
  if (!app.isQuitting) {
    e.preventDefault()
  }
})

/** 真正退出前清理 */
app.on('before-quit', () => {
  app.isQuitting = true
  destroyTray()
})
