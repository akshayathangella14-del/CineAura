import { WatchlistModel } from '../models/WatchlistModel.js'
import { MovieModel } from '../models/MovieModel.js'
import { InteractionModel } from '../models/InteractionModel.js'
import { getUserTasteAnalytics, compactMovie } from '../utils/userTasteAnalytics.js'
import { processWatchlistIdentityUnlocks } from './identity/IdentityEventService.js'

// Add Watchlist
export const addToWatchlist = async (req, res) => {
    try {
        const { movieId } = req.body

        if (!movieId) {
            return res.status(400).json({ message: "Movie ID is required" })
        }

        const movie = isNaN(movieId)
            ? await MovieModel.findById(movieId)
            : await MovieModel.findOne({ tmdbId: Number(movieId) })

        if (!movie) {
            return res.status(404).json({ message: "Movie Not Found" })
        }

        const movieOfWatchlist = await WatchlistModel.findOne({
            user: req.user._id,
            movie: movie._id
        })

        if (movieOfWatchlist) {
            return res.status(409).json({ message: "Movie already exists in watchlist" })
        }

        const newWatchlistMovie = new WatchlistModel({
            user: req.user._id,
            movie: movie._id
        })

        await newWatchlistMovie.save()

        const newInteraction = new InteractionModel({
            user: req.user._id,
            movie: movie._id,
            interactionType: "watchlist_add",
            weight: 5,
            source: "watchlist"
        })

        await newInteraction.save()

        await processWatchlistIdentityUnlocks(req.user._id)

        res.status(201).json({
            message: "Watchlist Updated",
            payload: newWatchlistMovie
        })
    } catch (err) {
        res.status(500).json({ message: "error", error: err.message })
    }
}

// Get Watchlist
export const getWatchlist = async (req, res) => {
    try {
        const watchlist = await WatchlistModel.find({
            user: req.user._id
        })
            .populate("movie")
            .sort({ createdAt: -1 })

        const analytics = await getUserTasteAnalytics(req.user._id)
        const comfortGenres = new Set(analytics.topGenres.slice(0, 4).map(item => item.name))
        const topLanguages = new Set(analytics.topLanguages.slice(0, 3).map(item => item.name))
        const currentYear = new Date().getFullYear()

        const items = watchlist
            .filter(item => item.movie)
            .map(item => {
                const movie = item.movie
                const genreMatches = (movie.genres || []).filter(genre => comfortGenres.has(genre)).length
                const languageMatch = topLanguages.has(movie.language) ? 1 : 0
                const auraScore = Math.round((genreMatches * 22) + (languageMatch * 14) + ((movie.averageRating || 0) * 6) + ((movie.rating || 0) * 4))
                return {
                    _id: item._id,
                    savedAt: item.createdAt,
                    movie: compactMovie(movie, { savedAt: item.createdAt, auraScore }),
                    auraScore
                }
            })

        const pickMovies = (filter, sorter = null, limit = 12) => {
            const list = items.filter(filter)
            if (sorter) list.sort(sorter)
            return list.slice(0, limit).map(item => item.movie)
        }

        const recentlySaved = items.slice(0, 12).map(item => item.movie)
        const sections = [
            {
                key: "watching-soon",
                title: "Watching Soon",
                movies: recentlySaved.slice(0, 8),
                explainability: { sourceDataUsed: ["watchlist"], evidenceCount: recentlySaved.length }
            },
            {
                key: "aura-matches",
                title: "Aura Matches",
                movies: pickMovies(item => item.auraScore >= 45, (a, b) => b.auraScore - a.auraScore),
                explainability: { sourceDataUsed: ["watchlist", "aura signals"], evidenceCount: items.length }
            },
            {
                key: "hidden-gems",
                title: "Hidden Gems To Explore",
                movies: pickMovies(item => (item.movie.popularity || 0) < 45 && ((item.movie.averageRating || 0) >= 3.8 || (item.movie.rating || 0) >= 7)),
                explainability: { sourceDataUsed: ["watchlist", "movie ratings", "popularity"], evidenceCount: items.length }
            },
            {
                key: "high-priority",
                title: "High Priority Picks",
                movies: pickMovies(item => item.auraScore >= 55 || (item.movie.rating || 0) >= 8 || (item.movie.averageRating || 0) >= 4, (a, b) => b.auraScore - a.auraScore),
                explainability: { sourceDataUsed: ["watchlist", "ratings", "aura signals"], evidenceCount: items.length }
            },
            {
                key: "recently-saved",
                title: "Recently Saved",
                movies: recentlySaved,
                explainability: { sourceDataUsed: ["watchlist"], evidenceCount: recentlySaved.length }
            },
            {
                key: "waiting-release",
                title: "Waiting For Release",
                movies: pickMovies(item => (item.movie.releaseYear || 0) >= currentYear || (item.movie.releaseDate && new Date(item.movie.releaseDate) > new Date())),
                explainability: { sourceDataUsed: ["watchlist", "release dates"], evidenceCount: items.length }
            },
            {
                key: "mood-based",
                title: "Mood Based Picks",
                movies: pickMovies(item => (item.movie.genres || []).some(genre => comfortGenres.has(genre)), (a, b) => b.auraScore - a.auraScore),
                explainability: { sourceDataUsed: ["watchlist", "comfort genres"], evidenceCount: items.length }
            }
        ]

        res.status(200).json({
            message: "Watchlist Fetched",
            payload: watchlist,
            sections
        })
    } catch (err) {
        res.status(500).json({ message: "error", error: err.message })
    }
}

// Remove Watchlist
export const removeFromWatchlist = async (req, res) => {
    try {
        const { movieId } = req.params

        const movie = isNaN(movieId)
            ? await MovieModel.findById(movieId)
            : await MovieModel.findOne({ tmdbId: Number(movieId) })

        if (!movie) {
            return res.status(404).json({ message: "Movie Not Found" })
        }

        const removedMovie = await WatchlistModel.findOneAndDelete({
            user: req.user._id,
            movie: movie._id
        })

        if (!removedMovie) {
            return res.status(404).json({ message: "Movie not found in watchlist" })
        }

        res.status(200).json({ message: "Movie removed from watchlist" })
    } catch (err) {
        res.status(500).json({ message: "error", error: err.message })
    }
}
