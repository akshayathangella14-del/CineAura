import { getUserTasteAnalytics, computeSignalDensity } from '../utils/userTasteAnalytics.js'
import { buildAuraAnalytics } from '../utils/auraAnalytics.js'

const getDiscoveryStyle = (analytics) => {
    if (analytics.riskTakingScore >= 75) return "Wide-range explorer"
    if (analytics.riskTakingScore >= 45) return "Selective explorer"
    return "Comfort-first curator"
}

const buildLockedProfile = (signalDensity, sourceCounts = {}) => {
    const signalBreakdown = {
        reviews: sourceCounts.reviews || 0,
        reactions: sourceCounts.reactions || 0,
        watchlist: sourceCounts.watchlist || 0,
        watched: sourceCounts.watchedFilms || 0
    }

    return {
    locked: true,
    auraState: "locked",
    title: "Aura Locked",
    archetype: "Aura Locked",
    description: "Your cinematic fingerprint is still forming. Unlock Aura through real viewing signals.",
    unlockRequirements: [
        "Add 3 movie interactions",
        "Add 1 movie to your watchlist",
        "Write 1 review"
    ],
    confidence: {
        tier: "Aura Locked",
        auraState: "locked",
        signalCount: signalDensity,
        signalBreakdown
    },
    signature: null,
    hiddenTruth: {
        available: false,
        fallback: "Unlock your Aura to reveal hidden viewing patterns.",
        requiredSignals: { intent: 0, commitment: 0 }
    },
    contradictions: [],
    emotionalResonance: [],
    thematicGravity: [],
    evidenceCount: signalDensity,
    whyThisAuraExists: {
        summary: "Aura unlocks once enough real viewing signals exist.",
        evidence: [],
        signalBreakdown,
        signalCount: signalDensity,
        evidenceCount: signalDensity,
        builtFrom: signalBreakdown,
        explanation: "Unlock your Aura after 3 interactions, 1 watchlist addition, or 1 review."
    },
    explainability: {
        sourceDataUsed: ["reviews", "reactions", "watch history", "watchlist", "ratings"],
        evidenceCount: signalDensity,
        computedAt: new Date().toISOString()
    }
}}

export const buildAuraProfile = async (userId) => {
    const analytics = await getUserTasteAnalytics(userId)
    const signalDensity = computeSignalDensity(analytics.sourceCounts)
    const aura = buildAuraAnalytics(analytics, signalDensity)

    if (!analytics.hasHistory || aura.confidence.auraState === "locked") {
        return buildLockedProfile(signalDensity, analytics.sourceCounts)
    }

    const signature = aura.signature
    const archetypeLabel = signature?.primary || "Emerging Viewer"
    const description = signature?.tagline || "Your Aura is still sharpening as new signals arrive."
    const evidenceCount = signalDensity

    return {
        locked: false,
        auraState: aura.confidence.auraState,
        archetype: archetypeLabel,
        title: archetypeLabel,
        description,
        confidence: aura.confidence,
        signature,
        hiddenTruth: aura.hiddenTruth,
        contradictions: aura.contradictions,
        emotionalResonance: aura.emotionalResonance,
        thematicGravity: aura.thematicGravity,
        definingMovie: aura.definingMovie,
        storyDNA: analytics.storyDNABreakdown,
        emotionalTriggers: aura.legacy.emotionalTriggers,
        discoveryStyle: getDiscoveryStyle(analytics),
        comfortZone: aura.legacy.comfortZone,
        riskTakingScore: analytics.riskTakingScore,
        evidenceCount,
        whyThisAuraExists: aura.whyThisAuraExists,
        explainability: {
            sourceDataUsed: ["reviews", "reactions", "watch history", "watchlist", "ratings"],
            evidenceCount,
            computedAt: new Date().toISOString()
        },
        dominantSignal: aura.legacy.dominantSignal
    }
}

export const getAuraProfile = async (req, res) => {
    try {
        const payload = await buildAuraProfile(req.user._id)
        res.status(200).json({
            message: "Aura Profile Generated",
            payload
        })
    } catch (err) {
        res.status(500).json({ message: "error", error: err.message })
    }
}

export const getAuraInsights = async (req, res) => {
    try {
        const aura = await buildAuraProfile(req.user._id)

        if (aura.locked) {
            return res.status(200).json({
                message: "Aura Insights",
                payload: []
            })
        }

        const insights = [
            {
                label: "Aura State",
                value: aura.confidence?.tier || aura.auraState,
                evidenceCount: aura.evidenceCount
            },
            {
                label: "Signature",
                value: aura.signature?.primary || aura.archetype,
                evidenceCount: aura.signature?.evidence?.length || 0
            }
        ]

        if (aura.hiddenTruth?.available) {
            insights.push({
                label: "Hidden Viewing Truth",
                value: aura.hiddenTruth.insight,
                evidenceCount: aura.hiddenTruth.requiredSignals?.commitment || 0
            })
        }

        if (aura.contradictions?.length) {
            insights.push({
                label: "Cinematic Contradiction",
                value: aura.contradictions[0].statement,
                evidenceCount: aura.contradictions[0].strength
            })
        }

        res.status(200).json({
            message: "Aura Insights",
            payload: insights
        })
    } catch (err) {
        res.status(500).json({ message: "error", error: err.message })
    }
}
