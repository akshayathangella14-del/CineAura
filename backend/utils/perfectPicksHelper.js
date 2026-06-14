import {
    addUniqueValue,
    addMovieSignals,
    getRecommendationScore,
    getMatchCount,
    isLanguageMatch
} from './recommendationHelper.js'

// Movie Used
export const isMovieUsed = (movie, usedMovies) => {
    for (const movieId of usedMovies) {
        if (String(movieId) === String(movie._id)) {
            return true
        }
    }

    return false
}

// Safe Choice
export const getSafeChoice = (moviesList, genres, keywords, languages, usedMovies) => {
    let selectedMovie = null
    let selectedScore = -1

    for (const movie of moviesList) {
        if (!isMovieUsed(movie, usedMovies)) {
            const genreMatch = getMatchCount(movie.genres, genres)
            const languageMatch = isLanguageMatch(movie, languages)
            const score = getRecommendationScore(movie, genres, keywords, languages)

            if ((genreMatch > 0 || languageMatch) && score > selectedScore) {
                selectedMovie = movie
                selectedScore = score
            }
        }
    }

    return selectedMovie
}

// Discovery Choice
export const getDiscoveryChoice = (moviesList, genres, keywords, languages, usedMovies) => {
    let selectedMovie = null
    let selectedScore = -1

    for (const movie of moviesList) {
        if (!isMovieUsed(movie, usedMovies)) {
            const score = getRecommendationScore(movie, genres, keywords, languages)

            if (movie.averageRating >= 4 && movie.popularity < 80 && score > selectedScore) {
                selectedMovie = movie
                selectedScore = score
            }
        }
    }

    return selectedMovie
}

// Surprise Choice
export const getSurpriseChoice = (moviesList, genres, keywords, languages, usedMovies) => {
    let selectedMovie = null
    let selectedScore = -1

    for (const movie of moviesList) {
        if (!isMovieUsed(movie, usedMovies)) {
            const genreMatch = getMatchCount(movie.genres, genres)
            const score = getRecommendationScore(movie, genres, keywords, languages)

            if (genreMatch === 0 && score > selectedScore) {
                selectedMovie = movie
                selectedScore = score
            }
        }
    }

    return selectedMovie
}

// Fallback Choice
export const getFallbackChoice = (moviesList, usedMovies) => {
    for (const movie of moviesList) {
        if (!isMovieUsed(movie, usedMovies)) {
            return movie
        }
    }

    return null
}

// Pick Reason
export const getPickReason = (movie, category, genres, languages) => {
    if (category === "Safe Choice") {
        if (movie.genres?.length > 0) {
            return `Matches your favorite ${movie.genres[0]} movies`
        }

        return "Matches your usual movie taste"
    }

    if (category === "Discovery Choice") {
        if (movie.keywords?.length > 0) {
            return `A hidden gem for ${movie.keywords[0]} lovers`
        }

        return "A hidden gem you may enjoy"
    }

    if (category === "Surprise Choice") {
        return "A fresh experience outside your normal preferences"
    }

    return "Because this movie matches your interests"
}

// Perfect Pick
export const createPerfectPick = (movie, category, genres, languages) => {
    return {
        category,
        _id: movie._id,
        tmdbId: movie.tmdbId,
        title: movie.title,
        poster: movie.poster,
        rating: movie.rating,
        averageRating: movie.averageRating,
        language: movie.language,
        reason: getPickReason(movie, category, genres, languages)
    }
}

// User Signals
export const addUserSignals = (user, genres, languages) => {
    for (const genre of user.favoriteGenres || []) {
        addUniqueValue(genres, genre)
    }

    for (const language of user.favoriteLanguages || []) {
        addUniqueValue(languages, language)
    }
}

export { addUniqueValue, addMovieSignals }
