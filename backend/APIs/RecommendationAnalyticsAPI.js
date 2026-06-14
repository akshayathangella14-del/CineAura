import exp from 'express'
import { verifyToken } from '../middlewares/verifyToken.js'
import {
    trackRecommendation,
    getRecommendationMetrics
} from '../services/RecommendationAnalyticsService.js'

export const recommendationAnalyticsApp = exp.Router()

// Track Recommendation
recommendationAnalyticsApp.post("/api/recommendation-analytics", verifyToken, trackRecommendation)

// Recommendation Metrics
recommendationAnalyticsApp.get("/api/recommendation-analytics/metrics", verifyToken, getRecommendationMetrics)
