import {
    addUniqueValue,
    addMovieSignals,
    getRecommendationScore
} from './recommendationHelper.js'

// Journey Reason
export const getJourneyReason = (movie, stepNo) => {
    if (stepNo === 1) {
        return "Starting point"
    }

    if (movie.genres?.length > 0 && movie.keywords?.length > 0) {
        return `Moves into ${movie.keywords[0]} ${movie.genres[0]} movies`
    }

    if (movie.genres?.length > 0) {
        return `Continues with ${movie.genres[0]} movies`
    }

    if (movie.language) {
        return `Because you frequently watch ${movie.language} movies`
    }

    if (movie.averageRating >= 4) {
        return "Because this movie is loved by CineAura users"
    }

    return "Because this movie fits the journey"
}

// Journey Step
export const createJourneyStep = (movie, stepNo) => {
    return {
        step: stepNo,
        movie: movie.title,
        movieId: movie._id,
        tmdbId: movie.tmdbId,
        poster: movie.poster,
        genres: movie.genres,
        language: movie.language,
        reason: getJourneyReason(movie, stepNo)
    }
}

// Build Journey
export const buildJourney = (startMovie, moviesList) => {
    const genres = []
    const keywords = []
    const languages = []
    const journey = []
    const usedMovies = []

    addMovieSignals(startMovie, genres, keywords, languages)
    addUniqueValue(usedMovies, startMovie._id)
    journey.push(createJourneyStep(startMovie, 1))

    const scoredMovies = []

    for (const movie of moviesList) {
        let alreadyUsed = false

        for (const movieId of usedMovies) {
            if (String(movieId) === String(movie._id)) {
                alreadyUsed = true
            }
        }

        if (!alreadyUsed) {
            const score = getRecommendationScore(movie, genres, keywords, languages)

            scoredMovies.push({
                movie,
                score
            })
        }
    }

    scoredMovies.sort((a, b) => b.score - a.score)

    for (const item of scoredMovies) {
        if (journey.length < 5) {
            journey.push(createJourneyStep(item.movie, journey.length + 1))
            addUniqueValue(usedMovies, item.movie._id)
            addMovieSignals(item.movie, genres, keywords, languages)
        }
    }

    return journey
}

// User Signals
export const getUserJourneySignals = (reviewsList, watchlist) => {
    const genres = []
    const keywords = []
    const languages = []

    for (const review of reviewsList) {
        if (review.rating >= 4) {
            addMovieSignals(review.movie, genres, keywords, languages)
        }
    }

    for (const watchlistMovie of watchlist) {
        addMovieSignals(watchlistMovie.movie, genres, keywords, languages)
    }

    return { genres, keywords, languages }
}
