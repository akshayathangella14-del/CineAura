import { create } from 'zustand'
import movieService from '../services/movieService'

const normalizeId = (id) => String(id)

const useWatchlistStore = create((set, get) => ({
  movieIds: new Set(),
  isLoaded: false,
  isLoading: false,

  fetchWatchlistIds: async () => {
    if (get().isLoading) return
    set({ isLoading: true })
    try {
      const res = await movieService.getWatchlist()
      const list = res.data?.payload || []
      const ids = new Set(
        list.map((item) => normalizeId(item.movie?._id || item.movie || item.movieId)).filter(Boolean)
      )
      set({ movieIds: ids, isLoaded: true, isLoading: false })
    } catch {
      set({ isLoaded: true, isLoading: false })
    }
  },

  isWatchlisted: (movieId) => {
    if (!movieId) return false
    return get().movieIds.has(normalizeId(movieId))
  },

  toggleWatchlist: async (movieId) => {
    const id = normalizeId(movieId)
    const wasSaved = get().movieIds.has(id)

    if (wasSaved) {
      await movieService.removeFromWatchlist(movieId)
      set((state) => {
        const next = new Set(state.movieIds)
        next.delete(id)
        return { movieIds: next }
      })
      return false
    }

    await movieService.addToWatchlist({ movieId })
    set((state) => {
      const next = new Set(state.movieIds)
      next.add(id)
      return { movieIds: next }
    })
    return true
  },

  setWatchlisted: (movieId, saved) => {
    const id = normalizeId(movieId)
    set((state) => {
      const next = new Set(state.movieIds)
      if (saved) next.add(id)
      else next.delete(id)
      return { movieIds: next }
    })
  },

  clearWatchlist: () => set({ movieIds: new Set(), isLoaded: false }),
}))

export default useWatchlistStore
