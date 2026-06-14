import { RecommendationAnalyticsModel } from '../models/RecommendationAnalyticsModel.js'
import { MovieModel } from '../models/MovieModel.js'

// Track Recommendation
export const trackRecommendation = async (req, res) => {
    try {
        const { movieId, action, source, score } = req.body

        if (!movieId || !action) {
            return res.status(400).json({ message: "Movie and action are required" })
        }

        const movie = isNaN(movieId)
            ? await MovieModel.findById(movieId)
            : await MovieModel.findOne({ tmdbId: Number(movieId) })

        if (!movie) {
            return res.status(404).json({ message: "Movie Not Found" })
        }

        const analytics = new RecommendationAnalyticsModel({
            user: req.user._id,
            movie: movie._id,
            action,
            source: source || "hybrid",
            score: score || 0
        })

        await analytics.save()

        res.status(201).json({
            message: "Recommendation Analytics Saved",
            payload: analytics
        })
    } catch (err) {
        res.status(500).json({ message: "error", error: err.message })
    }
}

// Recommendation Metrics
export const getRecommendationMetrics = async (req, res) => {
    try {
        const shown = await RecommendationAnalyticsModel.countDocuments({ action: "shown" })
        const clicked = await RecommendationAnalyticsModel.countDocuments({ action: "clicked" })
        const watched = await RecommendationAnalyticsModel.countDocuments({ action: "watched" })
        const saved = await RecommendationAnalyticsModel.countDocuments({ action: "saved" })

        const ctr = shown > 0 ? clicked / shown : 0
        const watchConversionRate = shown > 0 ? watched / shown : 0
        const saveRate = shown > 0 ? saved / shown : 0
        const recommendationSuccessScore = Number(((ctr + watchConversionRate + saveRate) / 3).toFixed(2))

        res.status(200).json({
            message: "Recommendation Metrics",
            payload: {
                recommendationCTR: ctr,
                watchConversionRate,
                saveRate,
                recommendationSuccessScore
            }
        })
    } catch (err) {
        res.status(500).json({ message: "error", error: err.message })
    }
}
