// Add Count
export const addCount = (obj, value) => {
    if (!value) return

    if (!obj[value]) {
        obj[value] = 0
    }

    obj[value]++
}

// Get Top Value
export const getTopValue = (obj, defaultValue) => {
    let topValue = defaultValue
    let topCount = 0

    for (const key in obj) {
        if (obj[key] > topCount) {
            topValue = key
            topCount = obj[key]
        }
    }

    return topValue
}

// Add Movie Counts
export const addMovieCounts = (movie, genreCount, languageCount, keywordCount) => {
    if (!movie) return

    for (const genre of movie.genres || []) {
        addCount(genreCount, genre)
    }

    for (const keyword of movie.keywords || []) {
        addCount(keywordCount, keyword)
    }

    addCount(languageCount, movie.language)
}

// Movie Personality
export const getMoviePersonality = (favoriteGenre) => {
    if (favoriteGenre === "Thriller") return "Thriller Hunter"
    if (favoriteGenre === "Sci-Fi") return "Sci-Fi Explorer"
    if (favoriteGenre === "Mystery") return "Mystery Seeker"
    if (favoriteGenre === "Action") return "Action Lover"
    if (favoriteGenre === "Drama") return "Drama Enthusiast"
    if (favoriteGenre === "Horror") return "Horror Explorer"

    return `${favoriteGenre} Explorer`
}

// Watching Style
export const getWatchingStyle = (interactionsList) => {
    let nightCount = 0
    let weekendCount = 0
    let lateNightCount = 0

    for (const interaction of interactionsList) {
        const date = new Date(interaction.createdAt)
        const hour = date.getHours()
        const day = date.getDay()

        if (hour >= 20 && hour < 24) {
            nightCount++
        }

        if (day === 0 || day === 6) {
            weekendCount++
        }

        if (hour >= 0 && hour < 4) {
            lateNightCount++
        }
    }

    if (lateNightCount >= nightCount && lateNightCount >= weekendCount && lateNightCount > 0) {
        return "Late Night Explorer"
    }

    if (weekendCount >= nightCount && weekendCount > 0) {
        return "Weekend Binge Watcher"
    }

    return "Night Watcher"
}

// Aura Insights
export const createAuraInsights = (favoriteGenre, favoriteLanguage, moviePersonality, topKeyword) => {
    const insights = []

    insights.push(`You frequently watch ${favoriteGenre} movies`)
    insights.push(`You prefer ${favoriteLanguage} cinema`)

    if (topKeyword !== "movie") {
        insights.push(`You enjoy movies with ${topKeyword} themes`)
    }

    insights.push(`Your movie personality is ${moviePersonality}`)

    return insights
}
