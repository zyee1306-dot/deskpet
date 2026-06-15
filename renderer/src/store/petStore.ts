import { create } from 'zustand'

/** 宠物 Store 状态 */
interface PetStoreState {
  /** 宠物名称 */
  petName: string
  /** 缩放 */
  scale: number
}

/** 宠物 Store 操作 */
interface PetStoreActions {
  /** 设置宠物名称 */
  setPetName: (name: string) => void
  /** 设置缩放 */
  setScale: (scale: number) => void
}

/**
 * 宠物全局状态管理
 */
export const usePetStore = create<PetStoreState & PetStoreActions>((set) => ({
  petName: 'default',
  scale: 1.0,

  setPetName: (name) => set({ petName: name }),
  setScale: (scale) => set({ scale })
}))