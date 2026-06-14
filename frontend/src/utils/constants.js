// CineAura Constants
// Central configuration and constant values

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

// App Info
export const APP_NAME = 'CineAura'
export const APP_TAGLINE = 'Your Cinematic Aura, Decoded.'

// Route Paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  SEARCH: '/search',
  MOVIE_DETAILS: '/movies/:movieId',
  PROFILE: '/profile',
  AURA: '/aura',
  JOURNEY: '/journey',
  WATCHLIST: '/watchlist',
  RECOMMENDATIONS: '/recommendations',
  SETTINGS: '/settings',
  ADMIN: '/admin',
  NOT_FOUND: '*',
}

// Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'cineaura_token',
  USER: 'cineaura_user',
  THEME: 'cineaura_theme',
  SEARCH_HISTORY: 'cineaura_search_history',
}

// Interaction Types (matches backend InteractionModel)
export const INTERACTION_TYPES = {
  VIEWED: 'viewed',
  CLICKED: 'clicked',
  RATED: 'rated',
  SEARCHED: 'searched',
  WATCHLISTED: 'watchlisted',
  REVIEWED: 'reviewed',
  JOURNEY: 'journey',
  PERFECT_PICKS: 'perfect-picks',
  MOVIE_OPEN: 'movie_open',
  MOVIE_HOVER: 'movie_hover',
  MOVIE_CLICK: 'movie_click',
  SEARCH_QUERY: 'search_query',
  WATCHLIST_ADD: 'watchlist_add',
  REACTION: 'reaction',
  RATING: 'rating',
  NOT_INTERESTED: 'not_interested',
  WATCHED: 'watched',
}

// Reaction Values
export const REACTION_TYPES = [
  'Intense',
  'Loved It',
  'Mind Blown',
  'Emotional',
  'Favorite',
]

// Feedback Values (matches backend FeedbackModel)
export const FEEDBACK_VALUES = {
  PERFECT_MATCH: 'PERFECT_MATCH',
  ENJOYED: 'ENJOYED',
  MIXED: 'MIXED',
  NOT_FOR_ME: 'NOT_FOR_ME',
}

// Provider Types (matches backend provider structure)
export const PROVIDER_TYPES = {
  FLATRATE: 'flatrate',
  RENT: 'rent',
  BUY: 'buy',
  FREE: 'free',
  ADS: 'ads',
}

// User Roles (matches backend UserModel)
export const USER_ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
}

// User Status (matches backend UserModel)
export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  BLOCKED: 'BLOCKED',
}

// Recommendation Sources (matches backend RecommendationExplanationService)
export const RECOMMENDATION_SOURCES = {
  HYBRID: 'hybrid',
  CONTENT_BASED: 'content-based',
  TRENDING: 'trending',
}

export const CINEAURA_SECTION_TITLES = {
  TRENDING: 'Lighting Up The Screen',
  FOR_YOU: 'Chosen By Your Aura',
  POPULAR: 'Crowd Favorites',
  CONTINUE: 'Continue Your Journey',
  TOP_RATED: "Critics' Obsessions",
  HIDDEN_GEMS: 'Hidden Gems',
  NEW_DISCOVERIES: 'New Discoveries',
  RECENTLY_RELEASED: 'Recently Released',
}

// Recommendation Analytics Actions (matches backend RecommendationAnalyticsModel)
export const ANALYTICS_ACTIONS = {
  SHOWN: 'shown',
  CLICKED: 'clicked',
  OPENED: 'opened',
  WATCHED: 'watched',
  SAVED: 'saved',
  IGNORED: 'ignored',
}

// Pagination Defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  ADMIN_LIMIT: 10,
}

// TMDB Image Base URL (for constructing fallback image URLs)
export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'

// Avatar Categories (matches backend avatarHelper)
export const AVATAR_CATEGORIES = [
  'Space',
  'Mystery',
  'Sci-Fi',
  'Detective',
  'Anime',
  'Cinema',
  'Fantasy',
]
