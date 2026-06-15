import { protocol, net, app } from 'electron'
import { join } from 'path'
import { pathToFileURL } from 'url'
import { is } from '@electron-toolkit/utils'

/** 自定义协议名 */
export const PROTOCOL_SCHEME = 'pet-assets'

/**
 * 注册协议为特权协议（必须在 app.whenReady 之前调用）
 * 允许 fetch API、CORS、stream 等特性
 */
export function registerSchemePrivilege(): void {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: PROTOCOL_SCHEME,
      privileges: {
        standard: true,
        secure: true,
        supportFetchAPI: true,
        stream: true,
        corsEnabled: true
      }
    }
  ])
}

/**
 * 注册 pet-assets:// 自定义协议处理器
 * URL 格式: pet-assets:///pets/default/pet.json
 * 注意：pet-assets:/// 被浏览器规范化为 pet-assets://pets/...，
 * 所以 host 部分需要拼回路径中
 */
/**
 * 获取素材目录路径
 * 开发环境: <project>/assets
 * 打包后: <exe>/resources/assets (extraResources)
 */
function getAssetsDir(): string {
  if (is.dev) {
    return join(__dirname, '../../assets')
  }
  return join(process.resourcesPath, 'assets')
}

export function registerAssetProtocol(): void {
  const assetsDir = getAssetsDir()

  protocol.handle(PROTOCOL_SCHEME, (request) => {
    try {
      const url = new URL(request.url)
      /**
       * pet-assets:///pets/default/pet.json 会被规范化为:
       *   host = "pets", pathname = "/default/pet.json"
       * 所以需要把 host 也拼进路径
       */
      const hostPart = url.hostname ? `${url.hostname}/` : ''
      const relativePath = (hostPart + url.pathname).replace(/^\/+/, '')
      const filePath = join(assetsDir, relativePath)
      const fileUrl = pathToFileURL(filePath).href
      return net.fetch(fileUrl)
    } catch (err) {
      console.error('[AssetProtocol] Error:', err)
      return new Response('Not Found', { status: 404 })
    }
  })
}