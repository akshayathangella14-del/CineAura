import { getSimilarMoviesPayload } from './RecommendationService.js'
import { compactMovie, getUserTasteAnalytics } from '../utils/userTasteAnalytics.js'

const MILESTONES = [25, 50, 100, 250, 500]

const calculateStreaks = (dates) => {
    const sortedDays = [...new Set(dates.map(date => new Date(date).setHours(0, 0, 0, 0)))]
        .sort((a, b) => a - b)

    if (!sortedDays.length) return { longestStreak: 0, currentStreak: 0, streakHistory: [] }

    const streakHistory = []
    let streakStart = sortedDays[0]
    let active = 1
    let longestStreak = 1

    for (let i = 1; i < sortedDays.length; i += 1) {
        const diffDays = Math.round((sortedDays[i] - sortedDays[i - 1]) / (1000 * 60 * 60 * 24))
        if (diffDays === 1) {
            active += 1
        } else if (diffDays > 1) {
            streakHistory.push({ start: new Date(streakStart), end: new Date(sortedDays[i - 1]), days: active })
            longestStreak = Math.max(longestStreak, active)
            streakStart = sortedDays[i]
            active = 1
        }
    }

    streakHistory.push({ start: new Date(streakStart), end: new Date(sortedDays[sortedDays.length - 1]), days: active })
    longestStreak = Math.max(longestStreak, active)

    const today = new Date().setHours(0, 0, 0, 0)
    const latest = sortedDays[sortedDays.length - 1]
    const daysSinceLatest = Math.round((today - latest) / (1000 * 60 * 60 * 24))

    return {
        longestStreak,
        currentStreak: daysSinceLatest <= 1 ? active : 0,
        streakHistory: streakHistory.sort((a, b) => b.days - a.days).slice(0, 5)
    }
}

const eraName = (genre) => {
    if (!genre) return "Cinematic Beginning"
    if (["Action", "Adventure"].includes(genre)) return "Action Fan"
    if (["Thriller", "Mystery", "Crime"].includes(genre)) return "Thriller Explorer"
    if (["Drama", "Romance"].includes(genre)) return "Drama Discoverer"
    if (["Science Fiction", "Sci-Fi", "Fantasy"].includes(genre)) return "World Builder"
    if (["Comedy", "Animation"].includes(genre)) return "Escape Seeker"
    return `${genre} Explorer`
}

const buildTimeline = (analytics) => {
    const ordered = analytics.interactions
        .filter(item => item.movie)
        .sort(
            (a, b) =>
                new Date(a.createdAt) -
                new Date(b.createdAt)
        )
    const chapters = []
    let currentChapter = null

    ordered.forEach(item => {
        const topGenre = item.movie?.genres?.[0]

        if (!topGenre) return

        const currentEra = eraName(topGenre)


        if (!currentChapter) {
            currentChapter = {
                label: currentEra,
                dominantGenre: topGenre,
                from: item.createdAt,
                to: item.createdAt,
                evidenceCount: 1
            }

            chapters.push(currentChapter)
            return
        }

        if (currentChapter.label === currentEra) {
            currentChapter.to = item.createdAt
            currentChapter.evidenceCount += 1
        } else {
            currentChapter = {
                label: currentEra,
                dominantGenre: topGenre,
                from: item.createdAt,
                to: item.createdAt,
                evidenceCount: 1,
                summary: `${topGenre} stories defined this phase of your journey.`
            }

            chapters.push(currentChapter)
        }
    })

    const mergedChapters = []

    chapters.forEach(chapter => {
        const last = mergedChapters[mergedChapters.length - 1]

        if (last && last.label === chapter.label) {
            last.evidenceCount += chapter.evidenceCount
            last.to = chapter.to
        } else {
            mergedChapters.push(chapter)
        }
    })

    return mergedChapters
}

export const getMovieJourney = async (req, res) => {
    try {
        const recommendations = await getSimilarMoviesPayload(req.params.movieId, null, 8)
        if (!recommendations) return res.status(404).json({ message: "Movie Not Found" })

        res.status(200).json({
            message: "Journey Generated",
            payload: recommendations
        })
    } catch (err) {
        res.status(500).json({ message: "error", error: err.message })
    }
}

export const getUserJourney = async (req, res) => {
    try {
        const analytics = await getUserTasteAnalytics(req.user._id)
        const hasJourneyData =
            analytics.sourceCounts.interactions > 0 ||
            analytics.sourceCounts.reviews > 0 ||
            analytics.sourceCounts.reactions > 0 ||
            analytics.sourceCounts.watchlist > 0
        const orderedEvents = analytics.interactions.filter(item => item.movie)
        const timeline = buildTimeline(analytics)
        orderedEvents.sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        )
        const firstMovie = orderedEvents[0]?.movie || analytics.watchedMovies[0]
        const latestMovie = orderedEvents[orderedEvents.length - 1]?.movie || analytics.watchedMovies[analytics.watchedMovies.length - 1]
        const streaks = calculateStreaks(analytics.dates)

        const milestones = MILESTONES.map(target => ({
            target,
            title: `${target} Movies Explored`,
            achieved: analytics.sourceCounts.watchedFilms >= target,
            progress: Math.min(100, Math.round((analytics.sourceCounts.watchedFilms / target) * 100)),
            evidenceCount: analytics.sourceCounts.watchedFilms,
            confidenceScore: 100
        }))

        const genreEvolution = timeline.map(item => ({
            genre: item.dominantGenre,
            era: item.label,
            evidenceCount: item.evidenceCount,
            confidenceScore: item.confidenceScore
        }))

        const majorDiscoveryMoments = []

        res.status(200).json({
            message: "Journey Generated",
            payload: {
                hasJourneyData: analytics.hasHistory,
                beginningEra: timeline[0]?.label || "Cinematic Beginning",
                turningPoints: timeline.slice(1, -1),
                currentEra: timeline[timeline.length - 1]?.label || "Still Forming",
                tasteEvolutionTimeline: timeline,
                firstMovie: compactMovie(firstMovie),
                latestMovie: compactMovie(latestMovie),
                genreEvolution,
                majorDiscoveryMoments,
                watchMilestones: milestones,
                milestones,
                streakHistory: streaks.streakHistory,
                longestStreak: streaks.longestStreak,
                currentStreak: streaks.currentStreak,
                explorationGrowth: {
                    genresExplored: analytics.genresExplored,
                    languagesExplored: analytics.languagesExplored,
                    riskTakingScore: analytics.riskTakingScore,
                    evidenceCount: analytics.sourceCounts.watchedFilms,
                    confidenceScore: analytics.auraConfidenceScore
                },
                totalMoviesWatched: analytics.sourceCounts.watchedFilms,
                totalJourneySignals:
                    analytics.sourceCounts.interactions +
                    analytics.sourceCounts.reviews +
                    analytics.sourceCounts.reactions +
                    analytics.sourceCounts.watchlist,
                totalGenresExplored: Math.min(
                    analytics.genresExplored,
                    timeline.length + 2
                ),
                explainability: {
                    sourceDataUsed: ["watch history", "reviews", "ratings", "reactions"],
                    evidenceCount: analytics.sourceCounts.interactions + analytics.sourceCounts.reviews + analytics.sourceCounts.reactions,
                    confidenceScore: analytics.auraConfidenceScore
                }
            }
        })
    } catch (err) {
        res.status(500).json({ message: "error", error: err.message })
    }
}
