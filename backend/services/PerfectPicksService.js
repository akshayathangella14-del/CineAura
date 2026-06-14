import { MovieModel } from '../models/MovieModel.js'
import { ReviewModel } from '../models/ReviewModel.js'
import { WatchlistModel } from '../models/WatchlistModel.js'
import { InteractionModel } from '../models/InteractionModel.js'
import {
    addUniqueValue,
    addMovieSignals,
    addUserSignals,
    getSafeChoice,
    getDiscoveryChoice,
    getSurpriseChoice,
    getFallbackChoice,
    createPerfectPick
} from '../utils/perfectPicksHelper.js'

// Perfect Picks
export const getPerfectPicks = async (req, res) => {
    try {
        const userId = req.user._id
        const genres = []
        const keywords = []
        const languages = []
        const excludedMovies = []
        const usedMovies = []
        const picks = []

        addUserSignals(req.user, genres, languages)

        const reviewsList = await ReviewModel.find({ user: userId }).populate("movie")
        const watchlist = await WatchlistModel.find({ user: userId }).populate("movie")
        const interactionsList = await InteractionModel.find({ user: userId }).populate("movie")

        for (const review of reviewsList) {
            addUniqueValue(excludedMovies, review.movie?._id)

            if (review.rating >= 4) {
                addMovieSignals(review.movie, genres, keywords, languages)
            }
        }

        for (const watchlistMovie of watchlist) {
            addUniqueValue(excludedMovies, watchlistMovie.movie?._id)
            addMovieSignals(watchlistMovie.movie, genres, keywords, languages)
        }

        for (const interaction of interactionsList) {
            if (interaction.interactionType === "viewed" || interaction.interactionType === "watchlisted") {
                addUniqueValue(excludedMovies, interaction.movie?._id || interaction.movie)
            }

            addMovieSignals(interaction.movie, genres, keywords, languages)
        }

        const moviesList = await MovieModel.find({
            _id: { $nin: excludedMovies }
        })
            .sort({ popularity: -1, averageRating: -1 })
            .limit(50)

        const safeMovie = getSafeChoice(moviesList, genres, keywords, languages, usedMovies) ||
            getFallbackChoice(moviesList, usedMovies)

        if (safeMovie) {
            picks.push(createPerfectPick(safeMovie, "Safe Choice", genres, languages))
            usedMovies.push(safeMovie._id)
        }

        const discoveryMovie = getDiscoveryChoice(moviesList, genres, keywords, languages, usedMovies) ||
            getFallbackChoice(moviesList, usedMovies)

        if (discoveryMovie) {
            picks.push(createPerfectPick(discoveryMovie, "Discovery Choice", genres, languages))
            usedMovies.push(discoveryMovie._id)
        }

        const surpriseMovie = getSurpriseChoice(moviesList, genres, keywords, languages, usedMovies) ||
            getFallbackChoice(moviesList, usedMovies)

        if (surpriseMovie) {
            picks.push(createPerfectPick(surpriseMovie, "Surprise Choice", genres, languages))
            usedMovies.push(surpriseMovie._id)
        }

        res.status(200).json({
            message: "Perfect Picks Generated",
            payload: picks
        })
    } catch (err) {
        res.status(500).json({ message: "error", error: err.message })
    }
}
