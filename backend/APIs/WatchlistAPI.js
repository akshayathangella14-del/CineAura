import exp from 'express'
import { verifyToken } from '../middlewares/verifyToken.js'
import {
    addToWatchlist,
    getWatchlist,
    removeFromWatchlist
} from '../services/WatchlistService.js'

export const watchlistApp = exp.Router()

// Add Watchlist
watchlistApp.post("/watchlist", verifyToken, addToWatchlist)

// Get Watchlist
watchlistApp.get("/watchlist", verifyToken, getWatchlist)

// Remove Watchlist
watchlistApp.delete("/watchlist/:movieId", verifyToken, removeFromWatchlist)
