import { useEffect, useRef, useCallback, useState } from 'react'

/** 窗口尺寸 */
const WINDOW_WIDTH = 400
const WINDOW_HEIGHT = 400

/** GIF 素材路径（通过自定义协议加载本地文件） */
const PET_GIF_URL = 'pet-assets:///pets/default/pet.gif'

/**
 * 宠物画布组件
 * 使用 <img> 标签直接播放 GIF 动画，无需 PixiJS
 */
function PetCanvas(): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef<boolean>(false)
  const [isDragging, setIsDragging] = useState(false)

  /**
   * 指针按下——开始拖拽
   */
  const handlePointerDown = useCallback((e: PointerEvent): void => {
    if (e.button !== 0) return
    isDraggingRef.current = true
    setIsDragging(true)
    const target = e.currentTarget as HTMLElement
    target.setPointerCapture(e.pointerId)
    window.api.startDrag({ screenX: e.screenX, screenY: e.screenY })
  }, [])

  /**
   * 指针移动——拖拽中移动窗口
   */
  const handlePointerMove = useCallback((e: PointerEvent): void => {
    if (!isDraggingRef.current) return
    window.api.dragMove({ x: e.screenX, y: e.screenY })
  }, [])

  /**
   * 指针释放——结束拖拽
   */
  const handlePointerUp = useCallback((e: PointerEvent): void => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false
      setIsDragging(false)
      try {
        const target = e.currentTarget as HTMLElement
        target.releasePointerCapture(e.pointerId)
      } catch {
        /* pointerCapture 可能已被释放 */
      }
      window.api.endDrag()
    }
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('pointerdown', handlePointerDown)
    container.addEventListener('pointermove', handlePointerMove)
    container.addEventListener('pointerup', handlePointerUp)

    return () => {
      container.removeEventListener('pointerdown', handlePointerDown)
      container.removeEventListener('pointermove', handlePointerMove)
      container.removeEventListener('pointerup', handlePointerUp)
    }
  }, [handlePointerDown, handlePointerMove, handlePointerUp])

  return (
    <div
      ref={containerRef}
      style={{
        width: '100vw',
        height: '100vh',
        background: 'transparent',
        overflow: 'hidden',
        cursor: isDragging ? 'grabbing' : 'grab',
        position: 'absolute',
        top: 0,
        left: 0,
        userSelect: 'none',
        touchAction: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <img
        src={PET_GIF_URL}
        alt="pet"
        draggable={false}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain',
          pointerEvents: 'none'
        }}
      />
    </div>
  )
}

export default PetCanvas