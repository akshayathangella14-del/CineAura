import { TasteTimelineModel } from '../models/TasteTimelineModel.js'
import { ReviewModel } from '../models/ReviewModel.js'
import { WatchlistModel } from '../models/WatchlistModel.js'

// Taste Timeline
export const getTasteTimeline = async (req, res) => {
    try {
        const { id } = req.params
        const month = new Date().toISOString().slice(0, 7)
        const genreCount = {}

        const reviewsList = await ReviewModel.find({ user: id }).populate("movie")
        const watchlist = await WatchlistModel.find({ user: id }).populate("movie")

        for (const review of reviewsList) {
            for (const genre of review.movie?.genres || []) {
                genreCount[genre] = (genreCount[genre] || 0) + review.rating
            }
        }

        for (const watchlistMovie of watchlist) {
            for (const genre of watchlistMovie.movie?.genres || []) {
                genreCount[genre] = (genreCount[genre] || 0) + 2
            }
        }

        let total = 0

        for (const genre in genreCount) {
            total = total + genreCount[genre]
        }

        const genres = []

        for (const genre in genreCount) {
            genres.push({
                genre,
                percentage: total > 0 ? Math.round((genreCount[genre] / total) * 100) : 0
            })
        }

        await TasteTimelineModel.findOneAndUpdate(
            { user: id, month },
            { genres },
            { upsert: true, new: true }
        )

        const timeline = await TasteTimelineModel.find({ user: id }).sort({ month: 1 })

        res.status(200).json({
            message: "Taste Timeline",
            payload: timeline
        })
    } catch (err) {
        res.status(500).json({ message: "error", error: err.message })
    }
}
