// CineAura Recommendation Store
// Manages: recommendations, journey, aura, perfect picks, home sections, narratives
import { create } from 'zustand'

const useRecommendationStore = create((set) => ({
  // State
  recommendations: [],
  similarMovies: [],
  forYouMovies: [],
  trendingRecs: [],
  homeSections: [],
  continueExploring: [],
  becauseYouWatched: [],
  journey: null,
  auraProfile: null,
  auraInsights: [],
  perfectPicks: null,
  narratives: {},
  isLoading: false,
  error: null,

  // Actions
  setRecommendations: (recommendations) =>
    set({ recommendations }),

  setSimilarMovies: (similarMovies) =>
    set({ similarMovies }),

  setForYouMovies: (forYouMovies) =>
    set({ forYouMovies }),

  setTrendingRecs: (trendingRecs) =>
    set({ trendingRecs }),

  setHomeSections: (homeSections) =>
    set({ homeSections }),

  setContinueExploring: (continueExploring) =>
    set({ continueExploring }),

  setJourney: (journey) =>
    set({ journey }),

  setAuraProfile: (auraProfile) =>
    set({ auraProfile }),

  setAuraInsights: (auraInsights) =>
    set({ auraInsights }),

  setPerfectPicks: (perfectPicks) =>
    set({ perfectPicks }),

  setNarrative: (key, narrative) =>
    set((state) => ({
      narratives: { ...state.narratives, [key]: narrative },
    })),

  setLoading: (isLoading) =>
    set({ isLoading }),

  setError: (error) =>
    set({ error, isLoading: false }),

  clearRecommendations: () =>
    set({
      recommendations: [],
      similarMovies: [],
      forYouMovies: [],
      trendingRecs: [],
      becauseYouWatched: [],
    }),

  // ─── Async Actions ───────────────────────────────────

  fetchHomeSections: async () => {
    set({ isLoading: true, error: null })
    try {
      const { default: recommendationService } = await import('../services/recommendationService')
      const res = await recommendationService.getHomeSections()
      set({ homeSections: res.data?.payload || [], isLoading: false })
    } catch (err) {
      set({ error: 'Failed to load home sections', isLoading: false })
    }
  },

  fetchForYou: async () => {
    set({ isLoading: true, error: null })
    try {
      const { default: recommendationService } = await import('../services/recommendationService')
      const res = await recommendationService.getForYou()
      set({ forYouMovies: res.data?.payload || [], isLoading: false })
    } catch (err) {
      set({ error: 'Failed to load recommendations', isLoading: false })
    }
  },

  fetchBecauseYouWatched: async () => {
    set({ isLoading: true, error: null })
    try {
      const { default: recommendationService } = await import('../services/recommendationService')
      const res = await recommendationService.getBecauseYouWatched()
      set({ becauseYouWatched: res.data?.payload || [], isLoading: false })
    } catch (err) {
      set({ error: 'Failed to load recommendations', isLoading: false })
    }
  },

  fetchContinueJourney: async () => {
    set({ isLoading: true, error: null })
    try {
      const { default: recommendationService } = await import('../services/recommendationService')
      const res = await recommendationService.getContinueJourney()
      set({ continueExploring: res.data?.payload || [], isLoading: false })
    } catch (err) {
      set({ error: 'Failed to load journey recommendations', isLoading: false })
    }
  },

  fetchJourney: async () => {
    set({ isLoading: true, error: null })
    try {
      const { default: recommendationService } = await import('../services/recommendationService')
      const res = await recommendationService.getUserJourney()
      set({ journey: res.data?.payload || null, isLoading: false })
    } catch (err) {
      set({ error: 'Failed to load journey', isLoading: false })
    }
  },

  fetchAuraProfile: async () => {
    set({ isLoading: true, error: null })
    try {
      const { default: recommendationService } = await import('../services/recommendationService')
      const res = await recommendationService.getAuraProfile()
      set({ auraProfile: res.data?.payload || null, isLoading: false })
    } catch (err) {
      set({ error: 'Failed to load aura', isLoading: false })
    }
  },
}))

export default useRecommendationStore
