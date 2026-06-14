import exp from 'express'
import { optionalToken, verifyToken } from '../middlewares/verifyToken.js'
import {
    addReview,
    getMovieReviews,
    updateReview,
    deleteReview,
    voteReview
} from '../services/ReviewService.js'

export const reviewApp = exp.Router()

// Add Review
reviewApp.post("/reviews", verifyToken, addReview)

// Get Reviews (public read; optional auth for user vote state)
reviewApp.get("/reviews/:movieId", optionalToken, getMovieReviews)

// Vote Review
reviewApp.post("/reviews/:reviewId/vote", verifyToken, voteReview)

// Update Review
reviewApp.put("/reviews/:reviewId", verifyToken, updateReview)

// Delete Review
reviewApp.delete("/reviews/:reviewId", verifyToken, deleteReview)
