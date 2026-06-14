import { HOME_SECTIONS } from '../config/homeSections.js'
import { getUserTasteAnalytics } from '../utils/userTasteAnalytics.js'
import {
    getBecauseYouWatchedPayload,
    getContinueJourneyPayload,
    getHiddenGemsPayload,
    getNewDiscoveriesPayload,
    getPersonalizedPayload,
    getPopularPayload,
    getRecentlyReleasedPayload,
    getTopRatedPayload,
    getTrendingPayload
} from './RecommendationService.js'

const ensureMovies = async (primary, fallback) => {
    const result = await primary()
    if (Array.isArray(result) && result.length > 0) return result
    return fallback ? fallback() : []
}

export const getHomeSections = async (req, res) => {
    try {
        const userId = req.user?._id
        const analytics = userId ? await getUserTasteAnalytics(userId) : null
        const hasHistory = !!analytics?.hasHistory
        const popularFallback = () => getPopularPayload(12)

        const sectionLoaders = {
            trending: () => ensureMovies(() => getTrendingPayload(12), popularFallback),
            aura: () => ensureMovies(() => getPersonalizedPayload(userId, 12), popularFallback),
            "continue-journey": () => ensureMovies(() => getContinueJourneyPayload(userId, 12), () => getRecentlyReleasedPayload(12)),
            "because-watched": () => ensureMovies(() => getBecauseYouWatchedPayload(userId, 12), () => getPersonalizedPayload(userId, 12)),
            "crowd-favorites": () => ensureMovies(() => getPopularPayload(12), () => getTrendingPayload(12)),
            "critics-obsessions": () => ensureMovies(() => getTopRatedPayload(12), popularFallback),
            "hidden-gems": () => ensureMovies(() => getHiddenGemsPayload(12), popularFallback),
            "new-discoveries": () => ensureMovies(() => getNewDiscoveriesPayload(userId, 12), () => getRecentlyReleasedPayload(12)),
            "recently-released": () => ensureMovies(() => getRecentlyReleasedPayload(12), popularFallback),
            "top-rated": () => ensureMovies(() => getTopRatedPayload(12), popularFallback)
        }

        const visibleSections = HOME_SECTIONS.filter(section => {
            if (hasHistory) return true
            return ["trending", "crowd-favorites", "critics-obsessions", "recently-released", "top-rated"].includes(section.key)
        })

        const sections = await Promise.all(visibleSections.map(async (section) => ({
            ...section,
            movies: await sectionLoaders[section.key]()
        })))

        res.status(200).json({
            message: "Home Sections",
            payload: sections
        })
    } catch (err) {
        res.status(500).json({ message: "error", error: err.message })
    }
}

export const getContinueExploring = async (req, res) => {
    try {
        const payload = await getContinueJourneyPayload(req.user?._id, 20)
        res.status(200).json({
            message: "Continue Exploring",
            payload
        })
    } catch (err) {
        res.status(500).json({ message: "error", error: err.message })
    }
}
