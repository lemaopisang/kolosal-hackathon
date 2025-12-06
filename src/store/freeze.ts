import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface FreezeState {
  freezeMode: boolean
  frozenData: {
    campaigns?: unknown
    bias?: unknown
    copy?: unknown
  }
  setFreezeMode: (mode: boolean) => void
  setFrozenData: (key: string, data: unknown) => void
  clearFrozenData: () => void
}

export const useFreezeStore = create<FreezeState>()(
  persist(
    (set) => ({
      freezeMode: false,
      frozenData: {},
      setFreezeMode: (mode) => set({ freezeMode: mode }),
      setFrozenData: (key, data) =>
        set((state) => ({
          frozenData: { ...state.frozenData, [key]: data },
        })),
      clearFrozenData: () => set({ frozenData: {} }),
    }),
    {
      name: 'inclusive-hub-freeze',
    }
  )
)
