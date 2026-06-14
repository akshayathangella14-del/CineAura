import {
    getRecommendationReasons,
    getRecommendationExplanation
} from '../services/RecommendationExplanationService.js'

// Add Unique Value
export const addUniqueValue = (list, value) => {
    if (!value) return

    let isFound = false

    for (const item of list) {
        if (String(item).toLowerCase() === String(value).toLowerCase()) {
            isFound = true
        }
    }

    if (!isFound) {
        list.push(value)
    }
}

// Add Movie Signals
export const addMovieSignals = (movie, genres, keywords, languages) => {
    if (!movie) return

    for (const genre of movie.genres || []) {
        addUniqueValue(genres, genre)
    }

    for (const keyword of movie.keywords || []) {
        addUniqueValue(keywords, keyword)
    }

    addUniqueValue(languages, movie.language)
}

// Match Count
export const getMatchCount = (movieList, userList) => {
    let count = 0

    for (const movieItem of movieList || []) {
        for (const userItem of userList || []) {
            if (String(movieItem).toLowerCase() === String(userItem).toLowerCase()) {
                count++
            }
        }
    }

    return count
}

// Language Match
export const isLanguageMatch = (movie, languages) => {
    for (const language of languages || []) {
        if (movie.language === language) {
            return true
        }
    }

    return false
}

// Recommendation Score
export const getRecommendationScore = (movie, genres, keywords, languages) => {
    let score = 0

    const genreMatch = getMatchCount(movie.genres, genres)
    const keywordMatch = getMatchCount(movie.keywords, keywords)

    score = score + (genreMatch * 5)
    score = score + (keywordMatch * 3)

    if (isLanguageMatch(movie, languages)) {
        score = score + 2
    }

    if (movie.popularity >= 50) {
        score = score + 1
    }

    if (movie.averageRating >= 4 || movie.rating >= 7) {
        score = score + 1
    }

    return score
}

// Recommendation Reason
export const getRecommendationReason = (movie, genres, keywords, languages) => {
    const genreMatch = getMatchCount(movie.genres, genres)
    const keywordMatch = getMatchCount(movie.keywords, keywords)

    if (genreMatch > 0) {
        return `Because you enjoy ${movie.genres[0]} movies`
    }

    if (keywordMatch > 0) {
        return `Because you like ${movie.keywords[0]} movies`
    }

    if (isLanguageMatch(movie, languages)) {
        return `Because you frequently watch ${movie.language} movies`
    }

    if (movie.averageRating >= 4) {
        return "Because CineAura users rated this movie highly"
    }

    return "Because this movie is popular right now"
}

// Format Recommendation
export const createRecommendationObj = (movie, reason, score = 0, source = "hybrid", genres = [], keywords = [], languages = []) => {
    const recommendationReasons = getRecommendationReasons(movie, genres, keywords, languages)
    const evidenceCount = Math.max(0, Math.round(score))

    return {
        _id: movie._id,
        tmdbId: movie.tmdbId,
        title: movie.title,
        overview: movie.overview,
        genres: movie.genres,
        language: movie.language,
        releaseDate: movie.releaseDate,
        releaseYear: movie.releaseYear,
        runtime: movie.runtime,
        poster: movie.poster,
        posterPath: movie.posterPath,
        posterOriginal: movie.posterOriginal,
        backdrop: movie.backdrop,
        backdropPath: movie.backdropPath,
        backdropOriginal: movie.backdropOriginal,
        rating: movie.rating,
        voteAverage: movie.voteAverage,
        averageRating: movie.averageRating,
        totalReviews: movie.totalReviews,
        popularity: movie.popularity,
        cast: movie.cast,
        directors: movie.directors,
        keywords: movie.keywords,
        reason,
        movie,
        score,
        evidenceCount,
        recommendationReasons,
        recommendationSource: source,
        explanation: getRecommendationExplanation(movie, recommendationReasons, source)
    }
}
