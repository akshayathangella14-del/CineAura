import { MovieModel } from '../models/MovieModel.js'
import { ReviewModel } from '../models/ReviewModel.js'
import { WatchlistModel } from '../models/WatchlistModel.js'
import { InteractionModel } from '../models/InteractionModel.js'
import { createRecommendationObj } from '../utils/recommendationHelper.js'

const POSITIVE_INTERACTIONS = [
    "viewed",
    "clicked",
    "rated",
    "reviewed",
    "watchlisted",
    "watchlist_add",
    "movie_open",
    "movie_click",
    "reaction",
    "rating",
    "journey",
    "perfect-picks"
]

const WATCHED_INTERACTIONS = [
    "watched",
    "rated",
    "reviewed",
    "rating"
]

const HISTORY_INTERACTIONS = [
    ...POSITIVE_INTERACTIONS,
    "not_interested"
]

const scoreWeights = {
    director: 18,
    actor: 14,
    keyword: 8,
    genre: 5,
    language: 4,
    rating: 4,
    watchlist: 3,
    recent: 2,
    quality: 2
}

const normalize = (value) => String(value || '').trim().toLowerCase()

const addSignal = (map, value, weight = 1) => {
    const key = normalize(value)
    if (!key) return
    const existing = map.get(key) || { value, weight: 0 }
    existing.weight += weight
    map.set(key, existing)
}

const toValues = (map, limit = 40) =>
    [...map.values()]
        .sort((a, b) => b.weight - a.weight)
        .slice(0, limit)
        .map(item => item.value)

const movieActors = (movie) => (movie?.cast || []).map(actor => actor?.name).filter(Boolean)

const countMatches = (movieValues = [], userValues = []) => {
    const userSet = new Set(userValues.map(normalize))
    return movieValues.reduce((count, value) => count + (userSet.has(normalize(value)) ? 1 : 0), 0)
}

const pushMovieSignals = (movie, profile, weight = 1) => {
    if (!movie) return
    ;(movie.genres || []).forEach(genre => addSignal(profile.genres, genre, weight))
    ;(movie.keywords || []).forEach(keyword => addSignal(profile.keywords, keyword, weight))
    ;(movie.directors || []).forEach(director => addSignal(profile.directors, director, weight * 1.4))
    movieActors(movie).forEach(actor => addSignal(profile.actors, actor, weight * 1.25))
    addSignal(profile.languages, movie.language, weight)
}

const getUserProfile = async (userId) => {
    const profile = {
        genres: new Map(),
        keywords: new Map(),
        actors: new Map(),
        directors: new Map(),
        languages: new Map(),
        excludedMovieIds: new Set(),
        recentMovieIds: [],
        watchedMovieIds: new Set(),
        negativeMovieIds: new Set(),
        negativeGenres: new Map(),
        negativeDirectors: new Map(),
        negativeActors: new Map(),
        hasHistory: false
    }

    if (!userId) return profile

    const [reviews, watchlist, interactions] = await Promise.all([
        ReviewModel.find({ user: userId }).populate("movie").sort({ createdAt: -1 }).limit(100),
        WatchlistModel.find({ user: userId }).populate("movie").sort({ createdAt: -1 }).limit(100),
        InteractionModel.find({ user: userId, interactionType: { $in: HISTORY_INTERACTIONS } })
            .populate("movie")
            .sort({ createdAt: -1 })
            .limit(180)
    ])

    reviews.forEach(review => {
        if (!review.movie) return
        const ratingWeight = Math.max(Number(review.rating) || 0, 1)
        profile.hasHistory = true
        profile.excludedMovieIds.add(String(review.movie._id))
        profile.watchedMovieIds.add(String(review.movie._id))
        pushMovieSignals(review.movie, profile, ratingWeight)
    })

    watchlist.forEach(item => {
        if (!item.movie) return
        profile.hasHistory = true
        profile.excludedMovieIds.add(String(item.movie._id))
        pushMovieSignals(item.movie, profile, scoreWeights.watchlist)
    })

    interactions.forEach((interaction, index) => {
        if (!interaction.movie) return
        const movieId = String(interaction.movie._id)
        const recencyBoost = index < 20 ? scoreWeights.recent : 1
        const weight = Math.max(Number(interaction.weight) || 1, 1) + recencyBoost
        profile.recentMovieIds.push(movieId)

        if (interaction.interactionType === "not_interested") {
            profile.negativeMovieIds.add(movieId)
            addSignal(profile.negativeGenres, interaction.movie.genres?.[0], 1)
            ;(interaction.movie.directors || []).forEach(director => addSignal(profile.negativeDirectors, director, 1))
            addSignal(profile.negativeActors, movieActors(interaction.movie)[0], 1)
            return
        }

        profile.hasHistory = true

        if (WATCHED_INTERACTIONS.includes(interaction.interactionType)) {
            profile.excludedMovieIds.add(movieId)
            profile.watchedMovieIds.add(movieId)
        }

        pushMovieSignals(interaction.movie, profile, weight)
    })

    return profile
}

const scoreMovie = (movie, signals = {}, sourceMovie = null) => {
    const genres = signals.genres || []
    const keywords = signals.keywords || []
    const actors = signals.actors || []
    const directors = signals.directors || []
    const languages = signals.languages || []
    const negativeGenres = signals.negativeGenres || []
    const negativeDirectors = signals.negativeDirectors || []
    const negativeActors = signals.negativeActors || []

    const directorMatches = countMatches(movie.directors, directors)
    const actorMatches = countMatches(movieActors(movie), actors)
    const keywordMatches = countMatches(movie.keywords, keywords)
    const genreMatches = countMatches(movie.genres, genres)
    const languageMatch = languages.some(language => normalize(language) === normalize(movie.language)) ? 1 : 0
    const negativeGenreMatches = countMatches(movie.genres?.slice(0, 1), negativeGenres)
    const negativeDirectorMatches = countMatches(movie.directors, negativeDirectors)
    const negativeActorMatches = countMatches(movieActors(movie).slice(0, 1), negativeActors)

    let score =
        directorMatches * scoreWeights.director +
        actorMatches * scoreWeights.actor +
        keywordMatches * scoreWeights.keyword +
        genreMatches * scoreWeights.genre +
        languageMatch * scoreWeights.language

    if (movie.averageRating >= 4 || movie.rating >= 7.5) score += scoreWeights.rating
    if (movie.popularity >= 40) score += scoreWeights.quality
    score -= negativeGenreMatches * 12
    score -= negativeDirectorMatches * 18
    score -= negativeActorMatches * 16
    if (sourceMovie && movie.releaseYear && sourceMovie.releaseYear) {
        const yearDistance = Math.abs(movie.releaseYear - sourceMovie.releaseYear)
        if (yearDistance <= 3) score += 3
    }

    return {
        score,
        directorMatches,
        actorMatches,
        keywordMatches,
        genreMatches,
        languageMatch,
        negativeGenreMatches,
        negativeDirectorMatches,
        negativeActorMatches
    }
}

const reasonForMovie = (movie, match, sourceMovie = null) => {
    if (sourceMovie) {
        if (match.directorMatches > 0) return `Echoes ${sourceMovie.title}'s filmmaker signature`
        if (match.actorMatches > 0) return `Shares key performers with ${sourceMovie.title}`
        if (match.keywordMatches > 0) return `Carries similar story DNA to ${sourceMovie.title}`
        if (match.genreMatches > 0) return `Continues the mood of ${sourceMovie.title}`
        if (match.languageMatch) return `Expands the same language lane as ${sourceMovie.title}`
        return `A nearby discovery from ${sourceMovie.title}'s orbit`
    }

    if (match.directorMatches > 0) return "Chosen for directors that keep appearing in your aura"
    if (match.actorMatches > 0) return "Chosen for performers you keep returning to"
    if (match.keywordMatches > 0) return "Chosen for story patterns you have been exploring"
    if (match.genreMatches > 0) return "Chosen for genres that shape your CineAura"
    if (match.languageMatch) return "Chosen from languages you watch often"
    return "Chosen from strong CineAura signals across the catalog"
}

const buildSignalQuery = (signals, excludedIds = []) => {
    const or = []
    if (signals.genres?.length) or.push({ genres: { $in: signals.genres } })
    if (signals.keywords?.length) or.push({ keywords: { $in: signals.keywords } })
    if (signals.directors?.length) or.push({ directors: { $in: signals.directors } })
    if (signals.actors?.length) or.push({ "cast.name": { $in: signals.actors } })
    if (signals.languages?.length) or.push({ language: { $in: signals.languages } })

    const query = {}
    if (excludedIds.length) query._id = { $nin: excludedIds }
    if (or.length) query.$or = or
    return query
}

const lightlyShuffleTop = (items) => {
    return items.map((item, index) => ({
        ...item,
        diversityScore: item.match.score - (index * 0.02) + (Math.sin((index + 1) * 9.17) * 0.35)
    })).sort((a, b) => b.diversityScore - a.diversityScore)
}

const diversifyRanked = (ranked, limit) => {
    const genreCounts = new Map()
    const directorCounts = new Map()
    const actorCounts = new Map()
    const selected = []

    for (const item of lightlyShuffleTop(ranked.slice(0, 50))) {
        const dominantGenre = item.movie.genres?.[0] || "unknown"
        const director = item.movie.directors?.[0] || "unknown"
        const leadActor = movieActors(item.movie)[0] || "unknown"

        if ((genreCounts.get(dominantGenre) || 0) >= 3) continue
        if ((directorCounts.get(director) || 0) >= 2) continue
        if ((actorCounts.get(leadActor) || 0) >= 2) continue

        selected.push(item)
        genreCounts.set(dominantGenre, (genreCounts.get(dominantGenre) || 0) + 1)
        directorCounts.set(director, (directorCounts.get(director) || 0) + 1)
        actorCounts.set(leadActor, (actorCounts.get(leadActor) || 0) + 1)

        if (selected.length >= limit) break
    }

    if (selected.length < limit) {
        for (const item of ranked) {
            if (selected.some(selectedItem => String(selectedItem.movie._id) === String(item.movie._id))) continue
            selected.push(item)
            if (selected.length >= limit) break
        }
    }

    return selected.slice(0, limit)
}

const rankMovies = async ({
    signals,
    excludedIds = [],
    sourceMovie = null,
    limit = 20,
    fallbackSort = { popularity: -1, averageRating: -1, voteCount: -1 },
    source = "hybrid",
    minScore = 0,
    strictGenreFallback = false,
    disableShuffle = false
}) => {
    let candidates = await MovieModel.find(buildSignalQuery(signals, excludedIds))
        .sort(fallbackSort)
        .limit(140)

    if (candidates.length < limit) {
        const existing = new Set(candidates.map(movie => String(movie._id)))
        const fallbackQuery = {
            _id: { $nin: [...excludedIds, ...existing] }
        }

        if (strictGenreFallback && signals.genres?.length) {
            fallbackQuery.genres = { $in: signals.genres }
        }

        const fallback = await MovieModel.find(fallbackQuery)
            .sort(fallbackSort)
            .limit(limit - candidates.length)
        candidates = [...candidates, ...fallback]
    }

    const ranked = candidates
        .map(movie => {
            const match = scoreMovie(movie, signals, sourceMovie)
            return { movie, match }
        })
        .filter(({ match }) => match.score >= minScore)
        .sort((a, b) => {
            if (b.match.score !== a.match.score) return b.match.score - a.match.score
            return (b.movie.popularity || 0) - (a.movie.popularity || 0)
        })

    const selected = disableShuffle
        ? ranked.slice(0, limit)
        : diversifyRanked(ranked, limit)

    return selected
        .map(({ movie, match }) => createRecommendationObj(
            movie,
            reasonForMovie(movie, match, sourceMovie),
            match.score,
            source,
            signals.genres || [],
            signals.keywords || [],
            signals.languages || []
        ))
}

export const getPersonalizedPayload = async (userId, limit = 20) => {
    const profile = await getUserProfile(userId)
    const signals = {
        genres: toValues(profile.genres),
        keywords: toValues(profile.keywords),
        actors: toValues(profile.actors),
        directors: toValues(profile.directors),
        languages: toValues(profile.languages),
        negativeGenres: toValues(profile.negativeGenres),
        negativeDirectors: toValues(profile.negativeDirectors),
        negativeActors: toValues(profile.negativeActors)
    }

    if (!profile.hasHistory) return []

    return rankMovies({
        signals,
        excludedIds: [...profile.excludedMovieIds, ...profile.negativeMovieIds],
        limit,
        source: profile.hasHistory ? "for-you" : "catalog-discovery"
    })
}

export const getContinueJourneyPayload = async (userId, limit = 20) => {
    const profile = await getUserProfile(userId)
    const signals = {
        genres: toValues(profile.genres, 8),
        keywords: toValues(profile.keywords, 24),
        actors: toValues(profile.actors, 16),
        directors: toValues(profile.directors, 12),
        languages: toValues(profile.languages, 6),
        negativeGenres: toValues(profile.negativeGenres),
        negativeDirectors: toValues(profile.negativeDirectors),
        negativeActors: toValues(profile.negativeActors)
    }

    if (!profile.hasHistory) return []

    return rankMovies({
        signals,
        excludedIds: [...profile.watchedMovieIds, ...profile.negativeMovieIds],
        limit,
        fallbackSort: { createdAt: -1, popularity: -1 },
        source: "continue-journey"
    })
}

export const getBecauseYouWatchedPayload = async (userId, limit = 20) => {
    if (!userId) return []

    const lastInteraction = await InteractionModel.findOne({
        user: userId,
        interactionType: { $in: POSITIVE_INTERACTIONS },
        movie: { $ne: null }
    }).sort({ createdAt: -1 }).populate("movie")

    if (!lastInteraction?.movie) return []

    const sourceMovie = lastInteraction.movie
    const watched = await InteractionModel.find({
        user: userId,
        interactionType: { $in: WATCHED_INTERACTIONS },
        movie: { $ne: null }
    }).distinct("movie")

    const signals = {
        genres: sourceMovie.genres || [],
        keywords: sourceMovie.keywords || [],
        actors: movieActors(sourceMovie),
        directors: sourceMovie.directors || [],
        languages: [sourceMovie.language].filter(Boolean)
    }

    const ranked = await rankMovies({
        signals,
        excludedIds: [sourceMovie._id, ...watched],
        sourceMovie,
        limit,
        source: "because-you-watched"
    })

    return ranked.map(item => ({
        ...item,
        reason: `Because you watched ${sourceMovie.title}`,
        sourceMovie: {
            _id: sourceMovie._id,
            tmdbId: sourceMovie.tmdbId,
            title: sourceMovie.title
        }
    }))
}

export const getSimilarMoviesPayload = async (movieId, userId = null, limit = 20) => {
    const sourceMovie = isNaN(movieId)
        ? await MovieModel.findById(movieId)
        : await MovieModel.findOne({ tmdbId: Number(movieId) })

    if (!sourceMovie) return null

    const watched = userId
        ? await InteractionModel.find({
            user: userId,
            interactionType: { $in: WATCHED_INTERACTIONS },
            movie: { $ne: null }
        }).distinct("movie")
        : []

    const signals = {
        genres: sourceMovie.genres || [],
        keywords: sourceMovie.keywords || [],
        actors: movieActors(sourceMovie),
        directors: sourceMovie.directors || [],
        languages: [sourceMovie.language].filter(Boolean)
    }

    return rankMovies({
        signals,
        excludedIds: [sourceMovie._id, ...watched],
        sourceMovie,
        limit,
        source: "content-based",
        minScore: 5,
        strictGenreFallback: true,
        disableShuffle: true
    })
}

export const getTrendingPayload = async (limit = 20) => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const movies = await MovieModel.aggregate([
        {
            $lookup: {
                from: "reviews",
                localField: "_id",
                foreignField: "movie",
                as: "reviews"
            }
        },
        {
            $lookup: {
                from: "watchlists",
                localField: "_id",
                foreignField: "movie",
                as: "watchlists"
            }
        },
        {
            $lookup: {
                from: "interactions",
                localField: "_id",
                foreignField: "movie",
                pipeline: [
                    { $match: { interactionType: { $in: POSITIVE_INTERACTIONS }, createdAt: { $gte: thirtyDaysAgo } } }
                ],
                as: "recentInteractions"
            }
        },
        {
            $addFields: {
                trendingScore: {
                    $add: [
                        { $multiply: [{ $size: "$reviews" }, 4] },
                        { $multiply: [{ $size: "$watchlists" }, 3] },
                        { $multiply: [{ $size: "$recentInteractions" }, 6] },
                        { $ifNull: ["$popularity", 0] }
                    ]
                }
            }
        },
        { $sort: { trendingScore: -1, averageRating: -1, rating: -1 } },
        { $limit: limit }
    ])

    if (movies.length) {
        return movies.map(movie => createRecommendationObj(
            movie,
            "Lighting up CineAura through recent attention",
            movie.trendingScore || 1,
            "trending"
        ))
    }

    const fallback = await MovieModel.find().sort({ popularity: -1, averageRating: -1 }).limit(limit)
    return fallback.map(movie => createRecommendationObj(movie, "Lighting up the catalog right now", movie.popularity || 1, "trending"))
}

export const getPopularPayload = async (limit = 20) => {
    const movies = await MovieModel.find()
        .sort({ popularity: -1, averageRating: -1, voteCount: -1 })
        .limit(limit)

    return movies.map(movie => createRecommendationObj(
        movie,
        "Loved across the CineAura crowd",
        movie.popularity || 1,
        "popular"
    ))
}

export const getTopRatedPayload = async (limit = 20) => {
    const movies = await MovieModel.find()
        .sort({ averageRating: -1, rating: -1, voteCount: -1 })
        .limit(limit)

    return movies.map(movie => createRecommendationObj(
        movie,
        "Critics and viewers keep circling back to this",
        (movie.averageRating || 0) * 10 + (movie.rating || 0),
        "critics-obsessions"
    ))
}

export const getHiddenGemsPayload = async (limit = 20) => {
    const movies = await MovieModel.find({
        $or: [
            { popularity: { $lt: 45 } },
            { voteCount: { $lt: 500 } }
        ]
    })
        .sort({ averageRating: -1, rating: -1, popularity: 1 })
        .limit(limit)

    return movies.map(movie => createRecommendationObj(movie, "A quieter discovery with strong signals", movie.averageRating || movie.rating || 1, "hidden-gems"))
}

export const getNewDiscoveriesPayload = async (userId, limit = 20) => {
    const profile = await getUserProfile(userId)
    const knownGenres = toValues(profile.genres, 8)
    const excluded = [...profile.excludedMovieIds]

    const query = knownGenres.length
        ? { _id: { $nin: excluded }, genres: { $nin: knownGenres } }
        : { _id: { $nin: excluded } }

    const movies = await MovieModel.find(query)
        .sort({ popularity: -1, averageRating: -1, createdAt: -1 })
        .limit(limit)

    return movies.map(movie => createRecommendationObj(movie, "A fresh lane outside your usual aura", movie.popularity || 1, "new-discoveries"))
}

export const getRecentlyReleasedPayload = async (limit = 20) => {
    const movies = await MovieModel.find()
        .sort({ releaseYear: -1, releaseDate: -1, popularity: -1 })
        .limit(limit)

    return movies.map(movie => createRecommendationObj(movie, "Freshly released into the CineAura catalog", movie.releaseYear || 1, "recently-released"))
}

export const getTrendingRecommendations = async (req, res) => {
    try {
        const recommendations = await getTrendingPayload(20)
        res.status(200).json({ message: "Trending Recommendations Fetched", payload: recommendations })
    } catch (err) {
        res.status(500).json({ message: "error", error: err.message })
    }
}

export const getPopularRecommendations = async (req, res) => {
    try {
        const recommendations = await getPopularPayload(20)
        res.status(200).json({ message: "Popular Recommendations Fetched", payload: recommendations })
    } catch (err) {
        res.status(500).json({ message: "error", error: err.message })
    }
}

export const getPersonalizedRecommendations = async (req, res) => {
    try {
        const recommendations = await getPersonalizedPayload(req.user?._id, 20)
        res.status(200).json({ message: "For You Recommendations Fetched", payload: recommendations })
    } catch (err) {
        res.status(500).json({ message: "error", error: err.message })
    }
}

export const getRecommendations = getPersonalizedRecommendations

export const getBecauseYouWatched = async (req, res) => {
    try {
        let recommendations = await getBecauseYouWatchedPayload(req.user?._id, 20)
        if (!recommendations.length) recommendations = await getPersonalizedPayload(req.user?._id, 20)
        res.status(200).json({ message: "Because You Watched Fetched", payload: recommendations })
    } catch (err) {
        res.status(500).json({ message: "error", error: err.message })
    }
}

export const getContinueJourneyRecommendations = async (req, res) => {
    try {
        const recommendations = await getContinueJourneyPayload(req.user?._id, 20)
        res.status(200).json({ message: "Continue Your Journey Fetched", payload: recommendations })
    } catch (err) {
        res.status(500).json({ message: "error", error: err.message })
    }
}

export const getSimilarMovies = async (req, res) => {
    try {
        const recommendations = await getSimilarMoviesPayload(req.params.movieId, req.user?._id, 20)
        if (!recommendations) return res.status(404).json({ message: "Movie Not Found" })
        res.status(200).json({ message: "Similar Movies Fetched", payload: recommendations })
    } catch (err) {
        res.status(500).json({ message: "error", error: err.message })
    }
}
