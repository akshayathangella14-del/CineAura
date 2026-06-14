// CineAura Search Store
// Manages: search queries, results, suggestions
import { create } from 'zustand'

const useSearchStore = create((set) => ({
  // State
  query: '',
  filters: {
    genres: [],
    languages: [],
    years: [],
  },
  results: [],
  suggestions: [],
  isLoading: false,
  isSearchFocused: false,
  hasCommittedSearch: false,
  pagination: {
    page: 1,
    limit: 20,
    totalResults: 0,
  },

  // Actions
  setIsSearchFocused: (isSearchFocused) => set({ isSearchFocused }),
  
  setHasCommittedSearch: (hasCommittedSearch) => set({ hasCommittedSearch }),

  setQuery: (query) =>
    set({ query }),

  setFilters: (filters) =>
    set((state) => ({
      filters: {
        ...state.filters,
        ...filters,
      },
    })),

  toggleFilter: (filterType, value) =>
    set((state) => {
      const currentValues = state.filters[filterType] || []
      const exists = currentValues.includes(value)

      return {
        filters: {
          ...state.filters,
          [filterType]: exists
            ? currentValues.filter(item => item !== value)
            : [...currentValues, value],
        },
      }
    }),

  clearFilters: () =>
    set({
      filters: {
        genres: [],
        languages: [],
        years: [],
      },
    }),

  setResults: (results) =>
    set({ results }),

  appendResults: (newResults) =>
    set((state) => ({ results: [...state.results, ...newResults] })),

  setSuggestions: (suggestions) =>
    set({ suggestions }),

  setPagination: (pagination) =>
    set((state) => ({
      pagination: { ...state.pagination, ...pagination },
    })),

  setLoading: (isLoading) =>
    set({ isLoading }),

  clearResults: () =>
    set({ results: [], suggestions: [], pagination: { page: 1, limit: 20, totalResults: 0 } }),

  clearSearch: () =>
    set({
      query: '',
      filters: {
        genres: [],
        languages: [],
        years: [],
      },
      results: [],
      suggestions: [],
      hasCommittedSearch: false,
      isSearchFocused: false,
      pagination: { page: 1, limit: 20, totalResults: 0 },
    }),

  clearSuggestions: () =>
    set({ suggestions: [] }),
}))

export default useSearchStore
