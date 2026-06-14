// Recommendation Reasons
export const getRecommendationReasons = (movie, genres, keywords, languages) => {
    const reasons = []

    for (const genre of movie.genres || []) {
        for (const userGenre of genres || []) {
            if (String(genre).toLowerCase() === String(userGenre).toLowerCase()) {
                reasons.push(`Matches your ${genre} preference`)
            }
        }
    }

    for (const keyword of movie.keywords || []) {
        for (const userKeyword of keywords || []) {
            if (String(keyword).toLowerCase() === String(userKeyword).toLowerCase()) {
                reasons.push(`Matches your interest in ${keyword}`)
            }
        }
    }

    for (const language of languages || []) {
        if (movie.language === language) {
            reasons.push(`Matches your ${language} language preference`)
        }
    }

    if (movie.directors?.length) {
        reasons.push("Director Match")
    }

    if (movie.cast?.length) {
        reasons.push("Actor Match")
    }

    if (movie.averageRating >= 4) {
        reasons.push("Strong Aura Match")
    }

    if (movie.popularity >= 50) {
        reasons.push("Trending Match")
    }

    if (reasons.length === 0) {
        reasons.push("Catalog Discovery")
    }

    return reasons
}

// Recommendation Explanation
export const getRecommendationExplanation = (movie, reasons, source) => {
    const firstReason = reasons[0] || "catalog discovery"

    return `${movie.title} is recommended because ${firstReason.toLowerCase()}. Source: ${source}.`
}
