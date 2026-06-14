import { MovieModel } from '../models/MovieModel.js'
import { ReviewModel } from '../models/ReviewModel.js'
import { WatchlistModel } from '../models/WatchlistModel.js'
import { InteractionModel } from '../models/InteractionModel.js'
import {
    addMovieCounts,
    getTopValue,
    getMoviePersonality,
    getWatchingStyle
} from '../utils/auraHelper.js'
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
import {
    getRecommendationFallback,
    getJourneyFallback,
    getAuraFallback,
    getPerfectPicksFallback,
    getPicksInput,
    getMovieInput
} from '../utils/narrativeHelper.js'
import { createAINarrative } from '../utils/aiHelper.js'

// Recommendation Narrative
export const getRecommendationNarrative = async (req, res) => {
    try {
        const { movieId } = req.params

        const movie = isNaN(movieId)
            ? await MovieModel.findById(movieId)
            : await MovieModel.findOne({ tmdbId: Number(movieId) })

        if (!movie) {
            return res.status(404).json({ message: "Movie Not Found" })
        }

        const fallbackNarrative = getRecommendationFallback(movie)
        const narrative = await createAINarrative(
            `Create a recommendation narrative for this movie. ${getMovieInput(movie)}`,
            fallbackNarrative
        )

        res.status(200).json({
            message: "Narrative Generated",
            payload: { narrative }
        })
    } catch (err) {
        res.status(500).json({ message: "error", error: err.message })
    }
}

// Journey Narrative
export const getJourneyNarrative = async (req, res) => {
    try {
        const { movieId } = req.params

        const movie = isNaN(movieId)
            ? await MovieModel.findById(movieId)
            : await MovieModel.findOne({ tmdbId: Number(movieId) })

        if (!movie) {
            return res.status(404).json({ message: "Movie Not Found" })
        }

        const relatedMovie = await MovieModel.findOne({
            _id: { $ne: movie._id },
            $or: [
                { genres: { $in: movie.genres } },
                { keywords: { $in: movie.keywords } },
                { language: movie.language }
            ]
        }).sort({ popularity: -1, averageRating: -1 })

        const fallbackNarrative = getJourneyFallback(movie, relatedMovie)
        const narrative = await createAINarrative(
            `Create a cinematic journey narrative. Start movie: ${getMovieInput(movie)} Related movie: ${relatedMovie ? getMovieInput(relatedMovie) : "None"}.`,
            fallbackNarrative
        )

        res.status(200).json({
            message: "Narrative Generated",
            payload: { narrative }
        })
    } catch (err) {
        res.status(500).json({ message: "error", error: err.message })
    }
}

// Aura Narrative
export const getAuraNarrative = async (req, res) => {
    try {
        const userId = req.user._id
        const genreCount = {}
        const languageCount = {}
        const keywordCount = {}

        const reviewsList = await ReviewModel.find({ user: userId }).populate("movie")
        const watchlist = await WatchlistModel.find({ user: userId }).populate("movie")
        const interactionsList = await InteractionModel.find({ user: userId }).populate("movie")

        for (const review of reviewsList) {
            if (review.rating >= 4) {
                addMovieCounts(review.movie, genreCount, languageCount, keywordCount)
            }
        }

        for (const watchlistMovie of watchlist) {
            addMovieCounts(watchlistMovie.movie, genreCount, languageCount, keywordCount)
        }

        for (const interaction of interactionsList) {
            addMovieCounts(interaction.movie, genreCount, languageCount, keywordCount)
        }

        const profile = {
            favoriteGenre: getTopValue(genreCount, "Drama"),
            favoriteLanguage: getTopValue(languageCount, "English"),
            moviePersonality: getMoviePersonality(getTopValue(genreCount, "Drama")),
            watchingStyle: getWatchingStyle(interactionsList)
        }

        const fallbackNarrative = getAuraFallback(profile)
        const narrative = await createAINarrative(
            `Create an aura profile narrative for this user. Favorite genre: ${profile.favoriteGenre}. Favorite language: ${profile.favoriteLanguage}. Personality: ${profile.moviePersonality}. Watching style: ${profile.watchingStyle}.`,
            fallbackNarrative
        )

        res.status(200).json({
            message: "Narrative Generated",
            payload: { narrative }
        })
    } catch (err) {
        res.status(500).json({ message: "error", error: err.message })
    }
}

// Perfect Picks Narrative
export const getPerfectPicksNarrative = async (req, res) => {
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
        }

        const fallbackNarrative = getPerfectPicksFallback(picks)
        const narrative = await createAINarrative(
            `Create a narrative for tonight's three perfect movie picks: ${getPicksInput(picks)}`,
            fallbackNarrative
        )

        res.status(200).json({
            message: "Narrative Generated",
            payload: { narrative }
        })
    } catch (err) {
        res.status(500).json({ message: "error", error: err.message })
    }
}
