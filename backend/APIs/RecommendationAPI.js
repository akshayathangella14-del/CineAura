import exp from 'express'
import { optionalToken, verifyToken } from '../middlewares/verifyToken.js'
import {
    getRecommendations,
    getSimilarMovies,
    getTrendingRecommendations,
    getPopularRecommendations,
    getBecauseYouWatched,
    getContinueJourneyRecommendations,
    getPersonalizedRecommendations
} from '../services/RecommendationService.js'

export const recommendationApp = exp.Router()

// Personalized Recommendations
recommendationApp.get("/recommendations", verifyToken, getRecommendations)

// Similar Movies
recommendationApp.get("/recommendations/similar/:movieId", optionalToken, getSimilarMovies)

// Trending Recommendations
recommendationApp.get("/recommendations/trending", getTrendingRecommendations)
recommendationApp.get("/trending", getTrendingRecommendations)

// Popular Recommendations
recommendationApp.get("/recommendations/popular", getPopularRecommendations)

// Because You Watched
recommendationApp.get("/recommendations/because-you-watched", verifyToken, getBecauseYouWatched)
recommendationApp.get("/because-you-watched", verifyToken, getBecauseYouWatched)

// Continue Journey
recommendationApp.get("/recommendations/continue-journey", verifyToken, getContinueJourneyRecommendations)
recommendationApp.get("/continue-journey", verifyToken, getContinueJourneyRecommendations)

// For You Recommendations
recommendationApp.get("/recommendations/for-you", verifyToken, getPersonalizedRecommendations)
recommendationApp.get("/for-you", verifyToken, getPersonalizedRecommendations)

// Similar Movies Alias
recommendationApp.get("/similar/:movieId", optionalToken, getSimilarMovies)
