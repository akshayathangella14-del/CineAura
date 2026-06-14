// CineAura Movie Service
// Endpoints from: MovieAPI.js, ReviewAPI.js, WatchlistAPI.js,
// FeedbackAPI.js, InteractionAPI.js, ActorAPI.js
import api from './api'

const movieService = {
  // ─── Movie Listing ─────────────────────────────────
  // GET /movies?page=&limit=&genre=&language=&sort=
  getMovies: (params = {}) => api.get('/movies', { params }),

  // GET /movies/trending
  getTrending: () => api.get('/movies/trending'),

  // GET /movies/popular
  getPopular: () => api.get('/movies/popular'),

  // GET /movies/top-rated
  getTopRated: () => api.get('/movies/top-rated'),

  // GET /movies/upcoming
  getUpcoming: () => api.get('/movies/upcoming'),

  // GET /movies/hero
  getHeroMovie: () => api.get('/movies/hero'),

  // ─── Movie Details ─────────────────────────────────
  // GET /movies/preview/:movieId
  getMoviePreview: (movieId) => api.get(`/movies/preview/${movieId}`),

  // GET /movies/modal/:movieId
  getMovieModal: (movieId) => api.get(`/movies/modal/${movieId}`),

  // GET /movies/:movieId
  getMovieDetails: (movieId) => api.get(`/movies/${movieId}`),

  // ─── Search ────────────────────────────────────────
  // GET /movies/search?q=&page=&limit=
  searchMovies: (params = {}) => api.get('/movies/search', { params }),

  // GET /movies/search/suggestions?q=&limit=
  getSearchSuggestions: (params = {}) => api.get('/movies/search/suggestions', { params }),

  // GET /movies/search/metadata
  getSearchMetadata: () => api.get('/movies/search/metadata'),

  // ─── Reviews ───────────────────────────────────────
  // POST /reviews
  addReview: (data) => api.post('/reviews', data),

  // GET /reviews/:movieId?sort=
  getReviews: (movieId, params = {}) => api.get(`/reviews/${movieId}`, { params }),

  // POST /reviews/:reviewId/vote
  voteReview: (reviewId, data) => api.post(`/reviews/${reviewId}/vote`, data),

  // PUT /reviews/:reviewId
  updateReview: (reviewId, data) => api.put(`/reviews/${reviewId}`, data),

  // DELETE /reviews/:reviewId
  deleteReview: (reviewId) => api.delete(`/reviews/${reviewId}`),

  // ─── Watchlist ─────────────────────────────────────
  // POST /watchlist
  addToWatchlist: (data) => api.post('/watchlist', data),

  // GET /watchlist
  getWatchlist: () => api.get('/watchlist'),

  // DELETE /watchlist/:movieId
  removeFromWatchlist: (movieId) => api.delete(`/watchlist/${movieId}`),

  // ─── Feedback ──────────────────────────────────────
  // POST /feedback/movie
  submitFeedback: (data) => api.post('/feedback/movie', data),

  // GET /feedback/history
  getFeedbackHistory: () => api.get('/feedback/history'),

  // POST /reactions
  saveReaction: (data) => api.post('/reactions', data),

  // DELETE /reactions/:movieId
  removeReaction: (movieId) => api.delete(`/reactions/${movieId}`),

  // GET /reactions/:movieId
  getMovieReactions: (movieId) => api.get(`/reactions/${movieId}`),

  // GET /reactions/user/:movieId
  getUserReaction: (movieId) => api.get(`/reactions/user/${movieId}`),

  // ─── Interactions ──────────────────────────────────
  // POST /interactions
  saveInteraction: (data) => api.post('/interactions', data),

  // ─── Actors ────────────────────────────────────────
  // GET /api/actors?page=&limit=
  getActors: (params = {}) => api.get('/api/actors', { params }),

  // GET /api/actors/search?q=
  searchActors: (params = {}) => api.get('/api/actors/search', { params }),

  // GET /api/actors/:id
  getActor: (id) => api.get(`/api/actors/${id}`),

  // GET /api/actors/:id/movies
  getActorMovies: (id) => api.get(`/api/actors/${id}/movies`),

  // GET /api/actors/:id/credits
  getActorCredits: (id) => api.get(`/api/actors/${id}/credits`),
}

export default movieService

