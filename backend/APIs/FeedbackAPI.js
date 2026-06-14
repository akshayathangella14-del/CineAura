import exp from 'express'
import { verifyToken } from '../middlewares/verifyToken.js'
import {
    addMovieFeedback,
    getFeedbackHistory
} from '../services/FeedbackService.js'

export const feedbackApp = exp.Router()

// Add Movie Feedback
feedbackApp.post("/feedback/movie", verifyToken, addMovieFeedback)

// Feedback History
feedbackApp.get("/feedback/history", verifyToken, getFeedbackHistory)
