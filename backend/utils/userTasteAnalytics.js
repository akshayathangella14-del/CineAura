import { ReviewModel } from '../models/ReviewModel.js'
import { WatchlistModel } from '../models/WatchlistModel.js'
import { InteractionModel } from '../models/InteractionModel.js'
import { ReactionModel } from '../models/ReactionModel.js'

export const EXPLORED_INTERACTION_TYPES = ["viewed", "movie_open", "movie_click", "clicked"]
export const WATCHED_INTERACTION_TYPES = ["watched", "rated", "reviewed", "rating"]
export const SIGNAL_INTERACTION_TYPES = [
    ...WATCHED_INTERACTION_TYPES,
    ...EXPLORED_INTERACTION_TYPES,
    "watchlisted",
    "watchlist_add",
    "reaction",
    "journey",
    "perfect-picks"
]

const addCount = (map, key, weight = 1) => {
    if (!key) return
    map[key] = (map[key] || 0) + weight
}

export const topEntries = (map, limit = 5) =>
    Object.entries(map || {})
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([name, count]) => ({ name, count }))

export const topName = (map, fallback = "Still emerging") => topEntries(map, 1)[0]?.name || fallback

export const compactMovie = (movie, extra = {}) => movie ? ({
    _id: movie._id,
    tmdbId: movie.tmdbId,
    title: movie.title,
    overview: movie.overview,
    genres: movie.genres,
    language: movie.language,
    releaseDate: movie.releaseDate,
    releaseYear: movie.releaseYear,
    rating: movie.rating,
    averageRating: movie.averageRating,
    popularity: movie.popularity,
    voteCount: movie.voteCount,
    poster: movie.poster,
    posterPath: movie.posterPath,
    posterOriginal: movie.posterOriginal,
    backdrop: movie.backdrop,
    backdropPath: movie.backdropPath,
    backdropOriginal: movie.backdropOriginal,
    keywords: movie.keywords,
    directors: movie.directors,
    cast: movie.cast,
    ...extra
}) : null

const storyFamilyForGenre = (genre = "") => {
    const g = genre.toLowerCase()
    if (["drama", "romance", "family"].includes(g)) return "Emotion"
    if (["thriller", "mystery", "crime", "horror"].includes(g)) return "Tension"
    if (["action", "adventure", "war"].includes(g)) return "Intensity"
    if (["science fiction", "sci-fi", "fantasy"].includes(g)) return "Imagination"
    if (["comedy", "animation"].includes(g)) return "Escape"
    return "Discovery"
}

const riskFromTaste = ({ genresExplored, languageCount, exploredCount, comfortGenreCount }) => {
    if (!exploredCount) return 0
    const variety = Math.min(60, genresExplored * 8 + languageCount * 6)
    const comfortPenalty = Math.min(28, comfortGenreCount * 3)
    return Math.max(0, Math.min(100, Math.round(variety + Math.min(exploredCount, 25) - comfortPenalty)))
}

export const computeSignalDensity = (sourceCounts = {}) =>
    (sourceCounts.reviews || 0) * 3 +
    (sourceCounts.reactions || 0) * 2 +
    (sourceCounts.watchlist || 0) * 1 +
    (sourceCounts.watchedFilms || 0) * 2

export const getUserTasteAnalytics = async (userId) => {
    const [reviews, watchlist, interactions, reactions] = await Promise.all([
        ReviewModel.find({ user: userId }).populate("movie").sort({ createdAt: 1 }),
        WatchlistModel.find({ user: userId }).populate("movie").sort({ createdAt: -1 }),
        InteractionModel.find({ user: userId, movie: { $ne: null }, interactionType: { $in: SIGNAL_INTERACTION_TYPES } })
            .populate("movie")
            .sort({ createdAt: 1 })
            .limit(500),
        ReactionModel.find({ user: userId }).populate("movie").sort({ createdAt: 1 })
    ])

    const genres = {}
    const languages = {}
    const decades = {}
    const actors = {}
    const directors = {}
    const reactionsMap = {}
    const keywords = {}
    const storyDNA = {}
    const watchedMovies = new Map()
    const exploredMovies = new Map()
    const signalMovies = new Map()
    const dates = []

    let ratingSum = 0
    let ratedCount = 0

    const absorbMovie = (movie, weight = 1, watched = false, date = null) => {
        if (!movie) return
        signalMovies.set(String(movie._id), movie)
        exploredMovies.set(String(movie._id), movie)
        if (watched) watchedMovies.set(String(movie._id), movie)
        if (date) dates.push(date)

        ;(movie.genres || []).forEach(genre => {
            addCount(genres, genre, weight)
            addCount(storyDNA, storyFamilyForGenre(genre), weight)
        })
        ;(movie.keywords || []).forEach(keyword => addCount(keywords, keyword, weight))
        ;(movie.cast || []).forEach(actor => addCount(actors, actor?.name, weight))
        ;(movie.directors || []).forEach(director => addCount(directors, director, weight))
        addCount(languages, movie.language, weight)

        if (movie.releaseYear) {
            addCount(decades, `${Math.floor(movie.releaseYear / 10) * 10}s`, 1)
        }
    }

    reviews.forEach(review => {
        const weight = Math.max(review.rating || 1, 1)
        ratingSum += review.rating || 0
        ratedCount += 1
        absorbMovie(review.movie, weight, true, review.createdAt)
    })

    watchlist.forEach(item => absorbMovie(item.movie, 2, false, item.createdAt))

    interactions.forEach(interaction => {
        absorbMovie(
            interaction.movie,
            Math.max(interaction.weight || 1, 1),
            WATCHED_INTERACTION_TYPES.includes(interaction.interactionType),
            interaction.createdAt
        )
    })

    reactions.forEach(reaction => {
        addCount(reactionsMap, reaction.reaction, 1)
        absorbMovie(reaction.movie, 4, false, reaction.createdAt)
    })

    const watchedCount = watchedMovies.size
    const exploredCount = exploredMovies.size
    const genreEntries = topEntries(genres, 8)
    const comfortGenreCount = genreEntries[0]?.count || 0
    const sourceCounts = {
        watchedFilms: watchedCount,
        exploredFilms: exploredCount,
        reviews: reviews.length,
        reactions: reactions.length,
        watchlist: watchlist.length,
        ratings: ratedCount,
        interactions: interactions.length
    }

    const storyDNATotal = Object.values(storyDNA).reduce((sum, count) => sum + count, 0) || 1
    const storyDNABreakdown = topEntries(storyDNA, 6).map(item => ({
        ...item,
        percent: Math.round((item.count / storyDNATotal) * 100)
    }))
    const auraConfidenceScore = computeSignalDensity(sourceCounts)

    return {
        sourceCounts,
        reviews,
        watchlist,
        interactions,
        reactions,
        watchedMovies: [...watchedMovies.values()],
        signalMovies: [...signalMovies.values()],
        watchedMovieIds: [...watchedMovies.keys()],
        counts: {
            genres,
            languages,
            decades,
            actors,
            directors,
            reactions: reactionsMap,
            keywords,
            storyDNA
        },
        topGenres: genreEntries,
        topLanguages: topEntries(languages, 5),
        topDecades: topEntries(decades, 5),
        topActors: topEntries(actors, 5),
        topDirectors: topEntries(directors, 5),
        topReactions: topEntries(reactionsMap, 5),
        topKeywords: topEntries(keywords, 8),
        storyDNABreakdown,
        favoriteDecade: topName(decades),
        favoriteLanguage: topName(languages),
        comfortGenre: topName(genres),
        mostExploredGenre: topName(genres),
        averageRating: ratedCount ? Number((ratingSum / ratedCount).toFixed(1)) : 0,
        riskTakingScore: riskFromTaste({
            genresExplored: Object.keys(genres).length,
            languageCount: Object.keys(languages).length,
            exploredCount,
            comfortGenreCount
        }),
        evidenceCount: interactions.length + reviews.length + reactions.length + watchlist.length,
        signalDensity: auraConfidenceScore,
        auraConfidenceScore,
        hasHistory: interactions.length >= 3 || watchlist.length >= 1 || reviews.length >= 1,
        genresExplored: Object.keys(genres).length,
        languagesExplored: Object.keys(languages).length,
        dates
    }
}
