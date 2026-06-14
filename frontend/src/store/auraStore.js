import { create } from 'zustand'

const useAuraStore = create((set) => ({
  aura: null,
  isLoading: false,
  error: null,

  setAura: (aura) => set({ aura }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error, isLoading: false }),

  fetchAura: async () => {
    set({ isLoading: true, error: null })
    try {
      const { default: auraService } = await import('../services/auraService')
      const res = await auraService.getAuraProfile()
      set({ aura: res.data?.payload || null, isLoading: false })
    } catch {
      set({ error: 'Failed to load your Aura', isLoading: false })
    }
  },

  clearAura: () => set({ aura: null, error: null }),
}))

export default useAuraStore
