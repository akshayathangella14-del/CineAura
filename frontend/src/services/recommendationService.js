// CineAura Recommendation Service
// Endpoints from: RecommendationAPI.js, HomeAPI.js, JourneyAPI.js,
// AuraAPI.js, PerfectPicksAPI.js, NarrativeAPI.js,
// RecommendationAnalyticsAPI.js, TensorFlowAPI.js
import api from './api'

const recommendationService = {
  // ─── Recommendations ───────────────────────────────
  // GET /recommendations
  getRecommendations: () => api.get('/recommendations'),

  // GET /recommendations/similar/:movieId
  getSimilarMovies: (movieId) => api.get(`/recommendations/similar/${movieId}`),

  // GET /recommendations/trending
  getTrendingRecs: () => api.get('/recommendations/trending'),

  // GET /recommendations/for-you
  getForYou: () => api.get('/recommendations/for-you'),

  // GET /recommendations/popular
  getPopularRecs: () => api.get('/recommendations/popular'),

  // GET /recommendations/because-you-watched
  getBecauseYouWatched: () => api.get('/recommendations/because-you-watched'),

  // GET /recommendations/continue-journey
  getContinueJourney: () => api.get('/recommendations/continue-journey'),

  // ─── Home Sections ─────────────────────────────────
  // GET /home/sections
  getHomeSections: () => api.get('/home/sections'),

  // GET /continue-exploring
  getContinueExploring: () => api.get('/continue-exploring'),

  // ─── Journey ───────────────────────────────────────
  // GET /journey/:movieId
  getMovieJourney: (movieId) => api.get(`/journey/${movieId}`),

  // GET /journey/user
  getUserJourney: () => api.get('/journey/user'),

  // ─── Aura ──────────────────────────────────────────
  // GET /aura/profile
  getAuraProfile: () => api.get('/aura/profile'),

  // GET /aura/insights
  getAuraInsights: () => api.get('/aura/insights'),

  // ─── Perfect Picks ─────────────────────────────────
  // GET /perfect-picks
  getPerfectPicks: () => api.get('/perfect-picks'),

  // ─── Narratives ────────────────────────────────────
  // GET /narrative/recommendation/:movieId
  getRecommendationNarrative: (movieId) => api.get(`/narrative/recommendation/${movieId}`),

  // GET /narrative/journey/:movieId
  getJourneyNarrative: (movieId) => api.get(`/narrative/journey/${movieId}`),

  // GET /narrative/aura
  getAuraNarrative: () => api.get('/narrative/aura'),

  // GET /narrative/perfect-picks
  getPerfectPicksNarrative: () => api.get('/narrative/perfect-picks'),

  // ─── Analytics ─────────────────────────────────────
  // POST /api/recommendation-analytics
  trackRecommendation: (data) => api.post('/api/recommendation-analytics', data),

  // GET /api/recommendation-analytics/metrics
  getRecommendationMetrics: () => api.get('/api/recommendation-analytics/metrics'),

  // ─── TensorFlow (Experimental) ─────────────────────
  // GET /api/tensorflow/recommendations
  getTensorFlowRecs: () => api.get('/api/tensorflow/recommendations'),
}

export default recommendationService
