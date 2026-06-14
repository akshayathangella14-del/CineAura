// Recommendation Fallback
export const getRecommendationFallback = (movie) => {
    const genre = movie.genres?.[0] || "cinematic"
    const keyword = movie.keywords?.[0] || "memorable"

    return `You seem to enjoy ${genre} stories with ${keyword} themes. ${movie.title} continues that cinematic style in a way that feels familiar and rewarding.`
}

// Journey Fallback
export const getJourneyFallback = (movie, relatedMovie) => {
    const genre = movie.genres?.[0] || "movie"
    const relatedGenre = relatedMovie?.genres?.[0] || genre

    return `Your cinematic journey starts with ${movie.title} and gradually moves from ${genre} storytelling toward ${relatedGenre} movies with a fresh emotional direction.`
}

// Aura Fallback
export const getAuraFallback = (profile) => {
    return `You are a ${profile.moviePersonality} who often leans toward ${profile.favoriteGenre} movies and ${profile.favoriteLanguage} cinema. Your taste feels focused, personal, and full of pattern.`
}

// Perfect Picks Fallback
export const getPerfectPicksFallback = (picks) => {
    if (!picks || picks.length === 0) {
        return "Tonight's picks are selected to match your recent movie taste while still leaving room for discovery."
    }

    return `Tonight's three picks begin with ${picks[0].title}, then move toward discovery and surprise so your watch night feels personal, balanced, and intentional.`
}

// Picks Input
export const getPicksInput = (picks) => {
    let picksText = ""

    for (const pick of picks) {
        picksText = picksText + `${pick.category}: ${pick.title}. `
    }

    return picksText
}

// Build Movie Input
export const getMovieInput = (movie) => {
    return `Movie: ${movie.title}. Genres: ${(movie.genres || []).join(", ")}. Keywords: ${(movie.keywords || []).join(", ")}. Language: ${movie.language}.`
}
