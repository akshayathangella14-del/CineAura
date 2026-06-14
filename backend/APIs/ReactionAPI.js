import exp from 'express'
import { verifyToken } from '../middlewares/verifyToken.js'
import {
    saveReaction,
    removeReaction,
    getMovieReactions,
    getUserReaction
} from '../services/ReactionService.js'

export const reactionApp = exp.Router()

// Save Reaction
reactionApp.post("/reactions", verifyToken, saveReaction)

// Remove Reaction
reactionApp.delete("/reactions/:movieId", verifyToken, removeReaction)

// User Reaction
reactionApp.get("/reactions/user/:movieId", verifyToken, getUserReaction)

// Movie Reactions
reactionApp.get("/reactions/:movieId", getMovieReactions)
