// CineAura Movie Store
// Manages: movie listings, details, hero, categories
// Async actions fetch from real backend endpoints
import { create } from 'zustand'
import movieService from '../services/movieService'

// Normalize Movie List
const getMovieList = (response) => {
  const payload = response?.data?.payload

  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.movies)) return payload.movies

  return []
}

// Normalize Hero Movie
const getHeroMovie = (response) => {
  const payload = response?.data?.payload

  if (!payload) return null

  if (Array.isArray(payload)) {
    return payload.map(item => {
      if (item.movie) {
        return {
          ...item.movie,
          backdrop: item.movie.backdrop || item.backdrop,
          trailer: item.movie.trailer || item.trailer,
          trailerEmbedUrl: item.movie.trailerEmbedUrl || item.trailerEmbedUrl,
        }
      }
      return item
    })
  }

  if (payload.movie) {
    return {
      ...payload.movie,
      backdrop: payload.movie.backdrop || payload.backdrop,
      trailer: payload.movie.trailer || payload.trailer,
      trailerEmbedUrl: payload.movie.trailerEmbedUrl || payload.trailerEmbedUrl,
    }
  }

  return payload
}

const useMovieStore = create((set) => ({
  // State
  movies: [],
  currentMovie: null,
  heroMovie: null,
  trendingMovies: [],
  popularMovies: [],
  topRatedMovies: [],
  upcomingMovies: [],
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    totalResults: 0,
  },

  // ─── Sync Actions ────────────────────────────────────
  setMovies: (movies) =>
    set({ movies }),

  setCurrentMovie: (currentMovie) =>
    set({ currentMovie }),

  setHeroMovie: (heroMovie) =>
    set({ heroMovie }),

  setTrendingMovies: (trendingMovies) =>
    set({ trendingMovies }),

  setPopularMovies: (popularMovies) =>
    set({ popularMovies }),

  setTopRatedMovies: (topRatedMovies) =>
    set({ topRatedMovies }),

  setUpcomingMovies: (upcomingMovies) =>
    set({ upcomingMovies }),

  setPagination: (pagination) =>
    set((state) => ({
      pagination: { ...state.pagination, ...pagination },
    })),

  setLoading: (isLoading) =>
    set({ isLoading }),

  setError: (error) =>
    set({ error, isLoading: false }),

 clearCurrentMovie: () =>
  set({
    currentMovie: null,
    error: null
  }),

  // ─── Async Actions ───────────────────────────────────

  // Fetch hero movie for banner
  fetchHeroMovie: async () => {
    try {
      const res = await movieService.getHeroMovie()
      set({ heroMovie: getHeroMovie(res) })
    } catch (err) {
      console.warn('CineAura: Failed to fetch hero movie', err.message)
    }
  },

  // Fetch trending movies
  fetchTrending: async () => {
    try {
      const res = await movieService.getTrending()
      set({ trendingMovies: getMovieList(res) })
    } catch (err) {
      console.warn('CineAura: Failed to fetch trending', err.message)
    }
  },

  // Fetch popular movies
  fetchPopular: async () => {
    try {
      const res = await movieService.getPopular()
      set({ popularMovies: getMovieList(res) })
    } catch (err) {
      console.warn('CineAura: Failed to fetch popular', err.message)
    }
  },

  // Fetch top rated movies
  fetchTopRated: async () => {
    try {
      const res = await movieService.getTopRated()
      set({ topRatedMovies: getMovieList(res) })
    } catch (err) {
      console.warn('CineAura: Failed to fetch top rated', err.message)
    }
  },

  // Fetch upcoming movies
  fetchUpcoming: async () => {
    try {
      const res = await movieService.getUpcoming()
      set({ upcomingMovies: getMovieList(res) })
    } catch (err) {
      console.warn('CineAura: Failed to fetch upcoming', err.message)
    }
  },

  // Fetch all homepage movie data in parallel
  fetchHomeMovies: async () => {
    set({ isLoading: true, error: null })
    try {
      const [hero, trending, popular, topRated, upcoming] = await Promise.allSettled([
        movieService.getHeroMovie(),
        movieService.getTrending(),
        movieService.getPopular(),
        movieService.getTopRated(),
        movieService.getUpcoming(),
      ])

      set({
        heroMovie: hero.status === 'fulfilled' ? getHeroMovie(hero.value) : null,
        trendingMovies: trending.status === 'fulfilled' ? getMovieList(trending.value) : [],
        popularMovies: popular.status === 'fulfilled' ? getMovieList(popular.value) : [],
        topRatedMovies: topRated.status === 'fulfilled' ? getMovieList(topRated.value) : [],
        upcomingMovies: upcoming.status === 'fulfilled' ? getMovieList(upcoming.value) : [],
        isLoading: false,
      })
    } catch {
      set({ error: 'Failed to load movies', isLoading: false })
    }
  },

  // Fetch movie details
  fetchMovieDetails: async (movieId) => {
    set({ isLoading: true, currentMovie: null, error: null })
    try {
      const res = await movieService.getMovieDetails(movieId)
      set({ currentMovie: res.data.payload, isLoading: false })
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load movie'
      set({ error: message, isLoading: false })
    }
  },
}))

export default useMovieStore
