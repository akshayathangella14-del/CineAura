import { MovieModel } from '../models/MovieModel.js'
import { ReviewModel } from '../models/ReviewModel.js'
import { ActorModel } from '../models/ActorModel.js'
import { fetchFromTMDB, createMovieObj, fetchMovieLanguageMetadata } from '../utils/tmdbHelper.js'
import { createRecommendationObj, getRecommendationScore, getRecommendationReason } from '../utils/recommendationHelper.js'

const languageMap = {
    english: "en",
    hindi: "hi",
    telugu: "te",
    tamil: "ta",
    malayalam: "ml",
    kannada: "kn",
    japanese: "ja",
    korean: "ko"
}

// Escape Regex
const escapeRegex = (value = "") => {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

// Query List
const getQueryList = (value) => {
    if (!value) return []

    if (Array.isArray(value)) {
        return value
            .flatMap(item => String(item).split(","))
            .map(item => item.trim())
            .filter(Boolean)
    }

    return String(value)
        .split(",")
        .map(item => item.trim())
        .filter(Boolean)
}

// Language Code
const getLanguageCode = (language) => {
    const lowerLanguage = String(language).toLowerCase()

    return languageMap[lowerLanguage] || lowerLanguage
}

// Search Filter
const buildMovieSearchFilter = (query) => {
    const { q, genre, language } = query
    const genres = getQueryList(query.genres || genre)
    const languages = getQueryList(query.languages || language).map(getLanguageCode)
    const years = getQueryList(query.years || query.year)
        .map(year => Number(year))
        .filter(Boolean)
    const conditions = []

    if (q && q.trim()) {
        const safeQuery = escapeRegex(q.trim())
        const textConditions = [
            { title: { $regex: safeQuery, $options: "i" } },
            { overview: { $regex: safeQuery, $options: "i" } },
            { keywords: { $regex: safeQuery, $options: "i" } },
            { "cast.name": { $regex: safeQuery, $options: "i" } },
            { directors: { $regex: safeQuery, $options: "i" } },
            { genres: { $regex: safeQuery, $options: "i" } }
        ]

        const queryLanguage = getLanguageCode(q.trim())

        textConditions.push({
            language: {
                $regex: `^${escapeRegex(queryLanguage)}$`,
                $options: "i"
            }
        })

        if (/^\d{4}$/.test(q.trim())) {
            textConditions.push({ releaseYear: Number(q.trim()) })
        }

        conditions.push({ $or: textConditions })
    }

    if (genres.length > 0) {
        conditions.push({
            genres: {
                $in: genres.map(genreItem => new RegExp(`^${escapeRegex(genreItem)}$`, "i"))
            }
        })
    }

    if (languages.length > 0) {
        conditions.push({
            language: {
                $in: languages.map(languageItem => new RegExp(`^${escapeRegex(languageItem)}$`, "i"))
            }
        })
    }

    if (years.length > 0) {
        conditions.push({
            releaseYear: { $in: years }
        })
    }

    return conditions.length > 0 ? { $and: conditions } : {}
}

// Find Movie
const findMovie = async (movieId) => {
    const isTMDBId = !isNaN(movieId)

    const movie = isTMDBId
        ? await MovieModel.findOne({ tmdbId: Number(movieId) }).populate("cast.actor")
        : await MovieModel.findById(movieId).populate("cast.actor")

    return movie
}

// Get Movies
export const getMovies = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1
        const limit = Number(req.query.limit) || 10
        const skip = (page - 1) * limit
        const { sort } = req.query
        const filter = buildMovieSearchFilter(req.query)

        const sortObj = {}

        if (sort === "rating") sortObj.rating = -1
        else if (sort === "popularity") sortObj.popularity = -1
        else if (sort === "releaseDate") sortObj.releaseDate = -1
        else sortObj.createdAt = -1

        const moviesList = await MovieModel.find(filter)
            .sort(sortObj)
            .skip(skip)
            .limit(limit)

        res.status(200).json({
            message: "Movies Fetched",
            payload: moviesList
        })
    } catch (err) {
        res.status(500).json({ message: "error", error: err.message })
    }
}

// Search Movies
export const searchMovies = async (req, res) => {
    try {
        const { q } = req.query
        const page = Number(req.query.page) || 1
        const limit = Number(req.query.limit) || 20
        const skip = (page - 1) * limit

        const filter = buildMovieSearchFilter(req.query)

        if (!q && Object.keys(filter).length === 0) {
            return res.status(400).json({ message: "Search text or filter is required" })
        }

        const totalResults = await MovieModel.countDocuments(filter)
        const moviesList = await MovieModel.find(filter)
            .sort({ popularity: -1 })
            .skip(skip)
            .limit(limit)

        res.status(200).json({
            message: "Movies Fetched",
            totalResults,
            page,
            limit,
            payload: moviesList
        })
    } catch (err) {
        res.status(500).json({ message: "error", error: err.message })
    }
}

// Search Suggestions
export const getSearchSuggestions = async (req, res) => {
    try {
        const { q = "", limit = 10 } = req.query
        const safeQuery = escapeRegex(q.trim())

        if (!safeQuery) {
            return res.status(200).json({
                message: "Search Suggestions",
                payload: []
            })
        }

        const suggestionLimit = Number(limit) || 10
        const movieLimit = Math.ceil(suggestionLimit / 2)
        const actorLimit = suggestionLimit - movieLimit

        const movieSuggestions = await MovieModel.find({
            title: { $regex: safeQuery, $options: "i" }
        })
            .select("title poster tmdbId popularity releaseYear")
            .sort({ popularity: -1 })
            .limit(movieLimit)

        const actorSuggestions = await ActorModel.find({
            name: { $regex: safeQuery, $options: "i" }
        })
            .select("name profileImage profileOriginal tmdbId popularity")
            .sort({ popularity: -1 })
            .limit(actorLimit)

        const suggestions = [
            ...movieSuggestions.map(movie => ({
                _id: movie._id,
                tmdbId: movie.tmdbId,
                title: movie.title,
                poster: movie.poster,
                releaseYear: movie.releaseYear,
                mediaType: "movie"
            })),
            ...actorSuggestions.map(actor => ({
                _id: actor._id,
                tmdbId: actor.tmdbId,
                name: actor.name,
                profileImage: actor.profileImage || actor.profileOriginal,
                mediaType: "person"
            }))
        ]

        res.status(200).json({
            message: "Search Suggestions",
            payload: suggestions
        })
    } catch (err) {
        res.status(500).json({
            message: "Failed to fetch suggestions",
            error: err.message
        })
    }
}

// Get Search Metadata (Dynamic Genres/Languages/Years)
export const getSearchMetadata = async (req, res) => {
    try {
        const [genres, languages, years] = await Promise.all([
            MovieModel.distinct("genres"),
            MovieModel.distinct("language"),
            MovieModel.distinct("releaseYear")
        ]);
        
        // clean and sort
        const cleanGenres = [...new Set(genres.filter(Boolean))].sort();
        const cleanLanguages = [...new Set(languages.filter(Boolean))].sort();
        const cleanYears = [...new Set(years.filter(Boolean))].sort((a,b) => b - a).map(String);
        
        res.status(200).json({
            message: "Search Metadata Fetched",
            payload: {
                genres: cleanGenres,
                languages: cleanLanguages,
                years: cleanYears
            }
        });
    } catch (err) {
        res.status(500).json({
            message: "Failed to fetch search metadata",
            error: err.message
        });
    }
}

// Trending Movies
export const getTrendingMovies = async (req, res) => {
    try {
        const moviesList = await MovieModel.find()
            .sort({ popularity: -1 })
            .limit(20)

        res.status(200).json({
            message: "Trending Movies Fetched",
            payload: moviesList
        })
    } catch (err) {
        res.status(500).json({ message: "error", error: err.message })
    }
}

// Popular Movies
export const getPopularMovies = async (req, res) => {
    try {
        const moviesList = await MovieModel.find()
            .sort({ popularity: -1 })
            .limit(20)

        res.status(200).json({
            message: "Popular Movies Fetched",
            payload: moviesList
        })
    } catch (err) {
        res.status(500).json({ message: "error", error: err.message })
    }
}

// Top Rated Movies
export const getTopRatedMovies = async (req, res) => {
    try {
        const moviesList = await MovieModel.find()
            .sort({ rating: -1, voteCount: -1 })
            .limit(20)

        res.status(200).json({
            message: "Top Rated Movies Fetched",
            payload: moviesList
        })
    } catch (err) {
        res.status(500).json({ message: "error", error: err.message })
    }
}

// Upcoming Movies
export const getUpcomingMovies = async (req, res) => {
    try {
        const today = new Date().toISOString().split("T")[0]

        const moviesList = await MovieModel.find({
            releaseDate: { $gte: today }
        })
            .sort({ releaseDate: 1 })
            .limit(20)

        res.status(200).json({
            message: "Upcoming Movies Fetched",
            payload: moviesList
        })
    } catch (err) {
        res.status(500).json({ message: "error", error: err.message })
    }
}

// Hero Movie
export const getHeroMovie = async (req, res) => {
    try {
        const movie = await MovieModel.findOne()
            .sort({ popularity: -1, averageRating: -1, rating: -1 })

        if (!movie) {
            return res.status(404).json({ message: "Movie Not Found" })
        }

        res.status(200).json({
            message: "Hero Movie",
            payload: {
                movie,
                backdrop: movie.backdrop,
                trailer: movie.trailer,
                trailerEmbedUrl: movie.trailerEmbedUrl
            }
        })
    } catch (err) {
        res.status(500).json({ message: "error", error: err.message })
    }
}

// Movie Preview
export const getMoviePreview = async (req, res) => {
    try {
        const { movieId } = req.params
        const movie = await findMovie(movieId)

        if (!movie) {
            return res.status(404).json({ message: "Movie Not Found" })
        }

        res.status(200).json({
            message: "Movie Preview",
            payload: {
                id: movie._id,
                tmdbId: movie.tmdbId,
                title: movie.title,
                shortDescription: movie.shortDescription,
                poster: movie.poster,
                backdrop: movie.backdrop,
                rating: movie.rating,
                runtime: movie.runtime,
                releaseYear: movie.releaseYear,
                genres: movie.genres,
                overview: movie.overview
            }
        })
    } catch (err) {
        res.status(500).json({ message: "error", error: err.message })
    }
}

// Movie Modal
export const getMovieModal = async (req, res) => {
    try {
        const { movieId } = req.params
        const movie = await findMovie(movieId)

        if (!movie) {
            return res.status(404).json({ message: "Movie Not Found" })
        }

        const similarMovies = await MovieModel.find({
            _id: { $ne: movie._id },
            $or: [
                { genres: { $in: movie.genres } },
                { keywords: { $in: movie.keywords } },
                { language: movie.language }
            ]
        })
            .sort({ popularity: -1, averageRating: -1 })
            .limit(10)

        res.status(200).json({
            message: "Movie Modal",
            payload: {
                movie,
                trailer: movie.trailer,
                trailerKey: movie.trailerKey,
                trailerEmbedUrl: movie.trailerEmbedUrl,
                providers: movie.providers,
                cast: movie.cast,
                similarMovies
            }
        })
    } catch (err) {
        res.status(500).json({ message: "error", error: err.message })
    }
}

const enrichMovieMetadata = async (movie) => {
    const needsLanguageData = !movie.spokenLanguages?.length
        || !movie.subtitleLanguages?.length
        || !movie.productionCountries?.length
        || !movie.status

    if (!needsLanguageData || !movie.tmdbId) {
        return movie
    }

    try {
        const metadata = await fetchMovieLanguageMetadata(movie.tmdbId)

        movie.spokenLanguages = metadata.spokenLanguages
        movie.subtitleLanguages = metadata.subtitleLanguages
        movie.productionCountries = metadata.productionCountries
        movie.status = metadata.status

        await MovieModel.findByIdAndUpdate(movie._id, {
            spokenLanguages: metadata.spokenLanguages,
            subtitleLanguages: metadata.subtitleLanguages,
            productionCountries: metadata.productionCountries,
            status: metadata.status
        })
    } catch {
        // Keep existing movie payload if TMDB enrichment fails
    }

    return movie
}

// Movie Details
export const getMovieDetails = async (req, res) => {
    try {
        const { movieId } = req.params
        let movie = await findMovie(movieId)

        if (!movie) {
            return res.status(404).json({ message: "Movie Not Found" })
        }

        movie = await enrichMovieMetadata(movie)

        const reviews = await ReviewModel.find({ movie: movie._id })
            .populate("user", "username avatarImage")
            .sort({ createdAt: -1 })
            .limit(10)

        const similarMovies = await MovieModel.find({
            _id: { $ne: movie._id },
            $or: [
                { genres: { $in: movie.genres } },
                { keywords: { $in: movie.keywords } },
                { language: movie.language }
            ]
        })
            .sort({ popularity: -1, averageRating: -1 })
            .limit(10)

        const recommendations = []

        for (const similarMovie of similarMovies) {
            const score = getRecommendationScore(
                similarMovie,
                movie.genres,
                movie.keywords,
                [movie.language]
            )

            recommendations.push(createRecommendationObj(
                similarMovie,
                getRecommendationReason(similarMovie, movie.genres, movie.keywords, [movie.language]),
                score,
                "content-based",
                movie.genres,
                movie.keywords,
                [movie.language]
            ))
        }

        res.status(200).json({
            message: "Movie Found",
            payload: movie,
            reviews,
            similarMovies,
            recommendations
        })
    } catch (err) {
        res.status(500).json({ message: "error", error: err.message })
    }
}

// Sync Movies
export const syncMovies = async (req, res) => {
    try {
        const page = Number(req.body.page) || 1
        const syncType = req.body.type || "popular"

        let tmdbPath = `/movie/popular?page=${page}`

        if (syncType === "trending") tmdbPath = `/trending/movie/week?page=${page}`
        if (syncType === "top-rated") tmdbPath = `/movie/top_rated?page=${page}`
        if (syncType === "upcoming") tmdbPath = `/movie/upcoming?page=${page}`

        const tmdbMovies = await fetchFromTMDB(tmdbPath)
        const savedMovies = []

        for (const movie of tmdbMovies.results) {
            const movieOfDB = await MovieModel.findOne({ tmdbId: movie.id })

            if (!movieOfDB) {
                const movieObj = await createMovieObj(movie)
                const newMovie = new MovieModel(movieObj)
                await newMovie.save()

                for (const castMember of newMovie.cast || []) {
                    if (castMember.actor) {
                        await ActorModel.findByIdAndUpdate(castMember.actor, {
                            $addToSet: { movies: newMovie._id },
                            $inc: { movieCount: 1 }
                        })
                    }
                }

                savedMovies.push(newMovie)
            }
        }

        res.status(201).json({
            message: "Movies Synced",
            payload: savedMovies
        })
    } catch (err) {
        res.status(500).json({ message: "error", error: err.message })
    }
}
