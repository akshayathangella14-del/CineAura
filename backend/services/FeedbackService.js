import { FeedbackModel } from '../models/FeedbackModel.js'
import { MovieModel } from '../models/MovieModel.js'

// Add Movie Feedback
export const addMovieFeedback = async (req, res) => {
    try {
        const { movieId, feedback } = req.body

        if (!movieId || !feedback) {
            return res.status(400).json({ message: "Movie and feedback are required" })
        }

        const allowedFeedback = ["PERFECT_MATCH", "ENJOYED", "MIXED", "NOT_FOR_ME"]

        if (!allowedFeedback.includes(feedback)) {
            return res.status(400).json({ message: "Invalid feedback" })
        }

        const movie = isNaN(movieId)
            ? await MovieModel.findById(movieId)
            : await MovieModel.findOne({ tmdbId: Number(movieId) })

        if (!movie) {
            return res.status(404).json({ message: "Movie Not Found" })
        }

        const savedFeedback = await FeedbackModel.findOneAndUpdate(
            {
                user: req.user._id,
                movie: movie._id
            },
            {
                user: req.user._id,
                movie: movie._id,
                feedback
            },
            {
                new: true,
                upsert: true
            }
        )

        res.status(201).json({
            message: "Feedback Saved",
            payload: savedFeedback
        })
    } catch (err) {
        res.status(500).json({ message: "error", error: err.message })
    }
}

// Feedback History
export const getFeedbackHistory = async (req, res) => {
    try {
        const feedbackList = await FeedbackModel.find({ user: req.user._id })
            .populate("movie", "title poster rating language genres")
            .sort({ updatedAt: -1 })

        res.status(200).json({
            message: "Feedback History",
            payload: feedbackList
        })
    } catch (err) {
        res.status(500).json({ message: "error", error: err.message })
    }
}
