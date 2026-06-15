import { app, BrowserWindow, Menu, Tray, nativeImage } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'

/** 托盘实例引用 */
let tray: Tray | null = null

/** 宠物是否可见 */
let petVisible = true

/**
 * 创建系统托盘
 * @param mainWindow - 主窗口实例
 * @returns Tray 实例
 */
export function createTray(mainWindow: BrowserWindow): Tray {
  const iconPath = join(__dirname, '../../resources/icon.png')
  const trayIcon = nativeImage.createFromPath(iconPath)

  tray = new Tray(trayIcon.resize({ width: 16, height: 16 }))

  /** 点击托盘图标切换显示/隐藏 */
  tray.on('click', () => {
    toggleVisibility(mainWindow)
  })

  /** 关闭窗口时隐藏到托盘而非退出 */
  mainWindow.on('close', (e) => {
    if (!app.isQuitting) {
      e.preventDefault()
      hideWindow(mainWindow)
    }
  })

  updateContextMenu(mainWindow)

  return tray
}

/**
 * 切换窗口显示/隐藏
 */
function toggleVisibility(win: BrowserWindow): void {
  if (petVisible) {
    hideWindow(win)
  } else {
    showWindow(win)
  }
}

/**
 * 隐藏窗口
 */
function hideWindow(win: BrowserWindow): void {
  petVisible = false
  win.hide()
  updateContextMenu(win)
}

/**
 * 显示窗口
 */
function showWindow(win: BrowserWindow): void {
  petVisible = true
  win.show()
  win.focus()
  updateContextMenu(win)
}

/**
 * 更新右键菜单
 */
function updateContextMenu(win: BrowserWindow): void {
  const contextMenu = Menu.buildFromTemplate([
    {
      label: petVisible ? '隐藏宠物' : '显示宠物',
      click: () => {
        toggleVisibility(win)
      }
    },
    { type: 'separator' },
    {
      label: '重置位置',
      click: () => {
        win.setBounds({ x: 100, y: 100, width: 400, height: 400 })
        if (!petVisible) showWindow(win)
      }
    },
    {
      label: '重新加载',
      click: () => {
        win.reload()
      }
    },
    { type: 'separator' },
    {
      label: '开机自启',
      type: 'checkbox',
      checked: app.getLoginItemSettings().openAtLogin,
      click: (menuItem) => {
        /** 开发模式下自启无意义，跳过 */
        if (is.dev) {
          console.log('[Tray] 开机自启在开发模式下不可用')
          return
        }
        app.setLoginItemSettings({
          openAtLogin: menuItem.checked,
          /** Windows 需要指定可执行文件路径 */
          path: app.getPath('exe'),
          /** Windows 注册表方式，更可靠 */
          args: []
        })
      }
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        app.isQuitting = true
        app.quit()
      }
    }
  ])

  tray?.setContextMenu(contextMenu)
}

/**
 * 销毁托盘
 */
export function destroyTray(): void {
  if (tray) {
    tray.destroy()
    tray = null
  }
}