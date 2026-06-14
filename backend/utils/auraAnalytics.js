import { compactMovie } from './userTasteAnalytics.js'
import { THEME_BLOCKLIST, THEME_CURATED, storyFamilyForGenre } from '../config/auraThemes.js'

const INTENT_INTERACTION_TYPES = new Set([
    "viewed",
    "movie_open",
    "movie_click",
    "clicked",
    "movie_hover"
])

const COMMITMENT_INTERACTION_TYPES = new Set([
    "watched",
    "rated",
    "reviewed",
    "rating"
])

const HIGH_RATING_THRESHOLD = 4
const MAINSTREAM_POPULARITY = 50
const VALID_REACTIONS = new Set(["Intense", "Loved It", "Mind Blown", "Emotional", "Favorite"])
const EMOTIONAL_GENRES = new Set(["Drama", "Romance", "Family"])
const KINETIC_GENRES = new Set(["Action", "Thriller", "Adventure", "Animation", "Fantasy"])

const addGenreWeight = (map, movie, weight = 1) => {
    const genres = movie?.genres || []
    if (!genres.length) return

    const splitWeight = weight / genres.length
    genres.forEach(genre => {
        map[genre] = (map[genre] || 0) + splitWeight
    })
}

const topGenreEntry = (map) => {
    const entries = Object.entries(map || {}).sort((a, b) => b[1] - a[1])
    return entries[0] ? { name: entries[0][0], count: Math.round(entries[0][1] * 10) / 10, weight: entries[0][1] } : null
}

const topGenreEntries = (map, limit = 5) =>
    Object.entries(map || {})
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([name, weight]) => ({ name, count: Math.round(weight * 10) / 10, weight }))

const addSelectedGenreWeight = (map, movie, weight, genreFilter) => {
    const genres = (movie?.genres || []).filter(genre => genreFilter(genre))
    if (!genres.length) return

    const splitWeight = weight / genres.length
    genres.forEach(genre => {
        map[genre] = (map[genre] || 0) + splitWeight
    })
}

const buildChannelMaps = (analytics) => {
    const intentGenres = {}
    const commitmentGenres = {}
    const watchlistGenres = {}
    const watchedGenres = {}
    const reactionGenres = {}
    const reviewGenres = {}
    const commitmentStoryDNA = {}
    const commitmentKeywords = {}
    const reactionMovies = []
    const commitmentMovies = new Map()
    const browseOnlyGenres = {}
    const emotionalReactionGenres = {}
    const kineticIntentGenres = {}

    let intentSignalCount = 0
    let commitmentSignalCount = 0
    let browseOnlySignalCount = 0

    analytics.watchlist.forEach(item => {
        if (!item.movie) return
        intentSignalCount += 1
        addGenreWeight(intentGenres, item.movie, 2)
        addGenreWeight(watchlistGenres, item.movie, 2)
    })

    analytics.interactions.forEach(interaction => {
        if (!interaction.movie) return

        const weight = Math.max(interaction.weight || 1, 1)

        if (INTENT_INTERACTION_TYPES.has(interaction.interactionType)) {
            intentSignalCount += weight
            browseOnlySignalCount += weight
            addGenreWeight(intentGenres, interaction.movie, weight)
            addGenreWeight(browseOnlyGenres, interaction.movie, weight)
            addSelectedGenreWeight(kineticIntentGenres, interaction.movie, weight, genre => KINETIC_GENRES.has(genre))
        }

        if (COMMITMENT_INTERACTION_TYPES.has(interaction.interactionType)) {
            commitmentSignalCount += weight
            addGenreWeight(commitmentGenres, interaction.movie, weight)
            addGenreWeight(watchedGenres, interaction.movie, weight)
            commitmentMovies.set(String(interaction.movie._id), interaction.movie)
        }
    })

    analytics.reviews.forEach(review => {
        if (!review.movie) return

        const weight = Math.max(review.rating || 1, 1)
        commitmentSignalCount += weight
        addGenreWeight(commitmentGenres, review.movie, weight)
        addGenreWeight(reviewGenres, review.movie, weight)
        addGenreWeight(watchedGenres, review.movie, weight)
        commitmentMovies.set(String(review.movie._id), review.movie)

        ;(review.movie.genres || []).forEach(genre => {
            const family = storyFamilyForGenre(genre)
            commitmentStoryDNA[family] = (commitmentStoryDNA[family] || 0) + weight
        })
    })

    analytics.reactions.forEach(reaction => {
        if (!reaction.movie) return
        if (!VALID_REACTIONS.has(reaction.reaction)) return

        commitmentSignalCount += 2
        addGenreWeight(commitmentGenres, reaction.movie, 4)
        addGenreWeight(reactionGenres, reaction.movie, 4)
        addSelectedGenreWeight(emotionalReactionGenres, reaction.movie, 4, genre => EMOTIONAL_GENRES.has(genre))
        reactionMovies.push({
            movie: reaction.movie,
            reaction: reaction.reaction
        })
        commitmentMovies.set(String(reaction.movie._id), reaction.movie)

        ;(reaction.movie.genres || []).forEach(genre => {
            const family = storyFamilyForGenre(genre)
            commitmentStoryDNA[family] = (commitmentStoryDNA[family] || 0) + 4
        })
    })

    commitmentMovies.forEach(movie => {
        ;(movie.keywords || []).forEach(keyword => {
            const normalized = String(keyword).trim().toLowerCase()
            if (!normalized || THEME_BLOCKLIST.has(normalized)) return
            commitmentKeywords[normalized] = (commitmentKeywords[normalized] || 0) + 1
        })
    })

    return {
        intentGenres,
        commitmentGenres,
        watchlistGenres,
        watchedGenres,
        reactionGenres,
        reviewGenres,
        browseOnlyGenres,
        emotionalReactionGenres,
        kineticIntentGenres,
        commitmentStoryDNA,
        commitmentKeywords,
        reactionMovies,
        commitmentMovies: [...commitmentMovies.values()],
        intentSignalCount: Math.round(intentSignalCount),
        commitmentSignalCount: Math.round(commitmentSignalCount),
        browseOnlySignalCount: Math.round(browseOnlySignalCount)
    }
}

export const computeAuraState = (signalDensity, hasHistory) => {
    if (!hasHistory || signalDensity < 5) {
        return {
            auraState: "locked",
            tier: "Aura Locked",
            signalDensity
        }
    }

    if (signalDensity < 20) {
        return {
            auraState: "emerging",
            tier: "Emerging Aura",
            signalDensity
        }
    }

    return {
        auraState: "crystallized",
        tier: "Crystallized Aura",
        signalDensity
    }
}

export const buildAuraConfidence = (analytics, signalDensity) => {
    const signalBreakdown = {
        reviews: analytics.sourceCounts.reviews,
        reactions: analytics.sourceCounts.reactions,
        watchlist: analytics.sourceCounts.watchlist,
        watched: analytics.sourceCounts.watchedFilms
    }

    const state = computeAuraState(signalDensity, analytics.hasHistory)

    return {
        tier: state.tier,
        auraState: state.auraState,
        signalCount: signalDensity,
        signalBreakdown
    }
}

const buildSignatureEvidence = (channels, analytics, responseGenre, explorationGenre) => {
    const evidence = []
    const topReaction = analytics.topReactions.find(item => VALID_REACTIONS.has(item.name))

    if (responseGenre) {
        evidence.push({
            type: "genre",
            label: responseGenre.name,
            evidenceCount: responseGenre.count,
            source: "reactions and reviews"
        })
    }

    if (explorationGenre && explorationGenre.name !== responseGenre?.name) {
        evidence.push({
            type: "genre",
            label: explorationGenre.name,
            evidenceCount: explorationGenre.count,
            source: "browsing and watchlist"
        })
    }

    if (topReaction) {
        evidence.push({
            type: "reaction",
            label: topReaction.name,
            evidenceCount: topReaction.count,
            source: "reactions"
        })
    }

    return evidence
}

const buildSignatureTagline = ({ responseGenre, explorationGenre, topReaction, hasContradiction }) => {
    const reactionPhrase = topReaction ? `${topReaction.name} reactions` : "strong reactions"

    if (explorationGenre && responseGenre && explorationGenre.name !== responseGenre.name) {
        return `You explore through ${explorationGenre.name}, but your deepest ${reactionPhrase} land in ${responseGenre.name}.`
    }

    if (hasContradiction) {
        return `Your taste holds tension between how you browse and how you emotionally respond.`
    }

    if (responseGenre) {
        return `Your cinematic identity is anchored in ${responseGenre.name}, backed by ${reactionPhrase}.`
    }

    return "Your cinematic identity is still sharpening as new signals arrive."
}

const genreSignatureLabel = (genre, role = "Responder") => {
    if (!genre) return "Emerging Viewer"
    return `${genre} ${role}`
}

export const composeAuraSignature = (analytics, channels, contradictions) => {
    const responseGenre = topGenreEntry(channels.reactionGenres) || topGenreEntry(channels.reviewGenres)
    const explorationGenre = topGenreEntry(channels.intentGenres)

    if (!responseGenre && !explorationGenre) {
        return null
    }

    const topReaction = analytics.topReactions.find(item => VALID_REACTIONS.has(item.name))
    const primary = genreSignatureLabel(responseGenre?.name || explorationGenre?.name, "Responder")
    const secondary = explorationGenre && responseGenre && explorationGenre.name !== responseGenre.name
        ? `Explores through ${explorationGenre.name}`
        : null
    const descriptor = contradictions.length > 0 ? "Layered contradiction" : null
    const evidence = buildSignatureEvidence(channels, analytics, responseGenre, explorationGenre)

    return {
        primary,
        secondary,
        responseGenre: responseGenre?.name || null,
        explorationGenre: explorationGenre?.name || null,
        topReaction: topReaction?.name || null,
        descriptor,
        tagline: buildSignatureTagline({
            responseGenre,
            explorationGenre,
            topReaction,
            hasContradiction: contradictions.length > 0
        }),
        evidence
    }
}

const countGenreSignalsInReviews = (reviews, genre) =>
    reviews.filter(review =>
        (review.movie?.genres || []).includes(genre) && (review.rating || 0) >= HIGH_RATING_THRESHOLD
    ).length

const countGenreSignalsInReactions = (reactions, genre) =>
    reactions.filter(reaction => (reaction.movie?.genres || []).includes(genre)).length

const buildMovieEvidence = (movies, limit = 3) =>
    movies
        .filter(Boolean)
        .slice(0, limit)
        .map(movie => compactMovie(movie))

const buildHiddenTruthPayload = (perceived, actual, analytics, channels, actualSource) => {
    const actualReviewSupport = countGenreSignalsInReviews(analytics.reviews, actual.name)
    const actualReactionSupport = countGenreSignalsInReactions(
        analytics.reactions.filter(reaction => VALID_REACTIONS.has(reaction.reaction)),
        actual.name
    )

    if (actualReviewSupport < 2 && actualReactionSupport < 2) {
        return null
    }

    const perceivedMovies = [
        ...analytics.watchlist.map(item => item.movie),
        ...analytics.interactions
            .filter(item => INTENT_INTERACTION_TYPES.has(item.interactionType))
            .map(item => item.movie)
    ].filter(movie => (movie?.genres || []).includes(perceived.name))

    const actualMovies = [
        ...analytics.reactions
            .filter(reaction => VALID_REACTIONS.has(reaction.reaction) && (reaction.movie?.genres || []).includes(actual.name))
            .map(reaction => reaction.movie),
        ...analytics.reviews
            .filter(review => (review.movie?.genres || []).includes(actual.name) && (review.rating || 0) >= HIGH_RATING_THRESHOLD)
            .map(review => review.movie)
    ]

    return {
        available: true,
        perceived: {
            label: perceived.name,
            evidenceCount: perceived.count,
            source: "browsing and watchlist"
        },
        actual: {
            label: actual.name,
            evidenceCount: actual.count,
            source: actualSource
        },
        insight: `You explore ${perceived.name} most often, but your strongest responses come from ${actual.name}.`,
        evidence: {
            perceivedMovies: buildMovieEvidence(perceivedMovies),
            actualMovies: buildMovieEvidence(actualMovies)
        },
        requiredSignals: {
            intent: channels.intentSignalCount,
            commitment: channels.commitmentSignalCount
        }
    }
}

export const detectHiddenViewingTruth = (analytics, channels) => {
    const fallbackBase = {
        requiredSignals: {
            intent: channels.intentSignalCount,
            commitment: channels.commitmentSignalCount
        }
    }

    const minIntent = 5
    const minCommitment = 3

    if (channels.intentSignalCount < minIntent || channels.commitmentSignalCount < minCommitment) {
        return {
            available: false,
            fallback: "Keep exploring and reacting — your hidden viewing pattern is still forming.",
            ...fallbackBase
        }
    }

    const perceived = topGenreEntry(channels.intentGenres)
    const reactionActual = topGenreEntry(channels.reactionGenres)

    if (perceived && reactionActual && perceived.name !== reactionActual.name) {
        const payload = buildHiddenTruthPayload(perceived, reactionActual, analytics, channels, "reactions")
        if (payload) return payload
    }

    const kineticPerceived = topGenreEntry(channels.kineticIntentGenres)
    const emotionalActual = topGenreEntry(channels.emotionalReactionGenres)

    if (
        kineticPerceived &&
        emotionalActual &&
        kineticPerceived.name !== emotionalActual.name &&
        channels.browseOnlySignalCount >= 3 &&
        analytics.sourceCounts.reactions >= 2
    ) {
        const payload = buildHiddenTruthPayload(
            kineticPerceived,
            emotionalActual,
            analytics,
            channels,
            "emotional reactions"
        )
        if (payload) return payload
    }

    const commitmentActual = topGenreEntry(channels.commitmentGenres)
    if (perceived && commitmentActual && perceived.name !== commitmentActual.name) {
        const payload = buildHiddenTruthPayload(perceived, commitmentActual, analytics, channels, "reviews and reactions")
        if (payload) return payload
    }

    return {
        available: false,
        fallback: "Your browsing and your emotional responses currently align — a clear pattern is building.",
        ...fallbackBase
    }
}

export const detectContradictions = (analytics, channels) => {
    const contradictions = []

    const watchlistTop = topGenreEntry(channels.watchlistGenres)
    const watchedTop = topGenreEntry(channels.watchedGenres)

    if (
        watchlistTop &&
        watchedTop &&
        watchlistTop.name !== watchedTop.name &&
        analytics.sourceCounts.watchlist >= 2 &&
        analytics.sourceCounts.watchedFilms >= 2 &&
        watchlistTop.weight >= 2 &&
        watchedTop.weight >= 2
    ) {
        contradictions.push({
            type: "watchlist_vs_watched",
            statement: `You save ${watchlistTop.name.toLowerCase()} films, but your watched history leans toward ${watchedTop.name.toLowerCase()}.`,
            evidence: [
                { label: watchlistTop.name, evidenceCount: watchlistTop.count, source: "watchlist" },
                { label: watchedTop.name, evidenceCount: watchedTop.count, source: "watched films" }
            ],
            strength: Math.round(watchlistTop.weight + watchedTop.weight)
        })
    }

    const reactionTop = topGenreEntry(channels.reactionGenres)

    if (
        watchlistTop &&
        reactionTop &&
        watchlistTop.name !== reactionTop.name &&
        analytics.sourceCounts.watchlist >= 2 &&
        analytics.sourceCounts.reactions >= 2 &&
        watchlistTop.weight >= 2 &&
        reactionTop.weight >= 2
    ) {
        contradictions.push({
            type: "watchlist_vs_reaction",
            statement: `You save ${watchlistTop.name} films, but react most strongly to ${reactionTop.name}.`,
            evidence: [
                { label: watchlistTop.name, evidenceCount: watchlistTop.count, source: "watchlist" },
                { label: reactionTop.name, evidenceCount: reactionTop.count, source: "reactions" }
            ],
            strength: Math.round(watchlistTop.weight + reactionTop.weight)
        })
    }

    const browseTop = topGenreEntry(channels.browseOnlyGenres)
    const emotionalReactionTop = topGenreEntry(channels.emotionalReactionGenres)

    if (
        browseTop &&
        emotionalReactionTop &&
        browseTop.name !== emotionalReactionTop.name &&
        channels.browseOnlySignalCount >= 3 &&
        analytics.sourceCounts.reactions >= 2 &&
        emotionalReactionTop.weight >= 2
    ) {
        contradictions.push({
            type: "browse_vs_emotional_reaction",
            statement: `You browse ${browseTop.name} often, but your emotional reactions center on ${emotionalReactionTop.name}.`,
            evidence: [
                { label: browseTop.name, evidenceCount: browseTop.count, source: "browsing" },
                { label: emotionalReactionTop.name, evidenceCount: emotionalReactionTop.count, source: "reactions" }
            ],
            strength: Math.round(browseTop.weight + emotionalReactionTop.weight)
        })
    } else if (
        browseTop &&
        reactionTop &&
        browseTop.name !== reactionTop.name &&
        channels.browseOnlySignalCount >= 3 &&
        analytics.sourceCounts.reactions >= 2 &&
        reactionTop.weight >= 2
    ) {
        contradictions.push({
            type: "browse_vs_reaction",
            statement: `You browse ${browseTop.name} often, but react most strongly to ${reactionTop.name}.`,
            evidence: [
                { label: browseTop.name, evidenceCount: browseTop.count, source: "browsing" },
                { label: reactionTop.name, evidenceCount: reactionTop.count, source: "reactions" }
            ],
            strength: Math.round(browseTop.weight + reactionTop.weight)
        })
    }

    const highRatedReviews = analytics.reviews.filter(review => (review.rating || 0) >= HIGH_RATING_THRESHOLD)
    const nicheRated = highRatedReviews.filter(review => (review.movie?.popularity || 0) < MAINSTREAM_POPULARITY)
    const mainstreamBrowsed = analytics.interactions.filter(interaction =>
        INTENT_INTERACTION_TYPES.has(interaction.interactionType) &&
        (interaction.movie?.popularity || 0) >= MAINSTREAM_POPULARITY
    )

    if (
        nicheRated.length >= 2 &&
        mainstreamBrowsed.length >= 3 &&
        analytics.sourceCounts.reactions >= 1
    ) {
        contradictions.push({
            type: "mainstream_browse_vs_deep_response",
            statement: "You browse mainstream titles, but your strongest ratings gravitate toward less obvious films.",
            evidence: [
                { label: "Mainstream browsing", evidenceCount: mainstreamBrowsed.length, source: "interactions" },
                { label: "High-rated niche films", evidenceCount: nicheRated.length, source: "reviews" }
            ],
            strength: mainstreamBrowsed.length + nicheRated.length
        })
    }

    return contradictions.slice(0, 2)
}

const mapKeywordToTheme = (keyword) => {
    const normalized = String(keyword).trim().toLowerCase()
    if (!normalized || THEME_BLOCKLIST.has(normalized)) return null

    for (const [theme, aliases] of Object.entries(THEME_CURATED)) {
        if (aliases.some(alias => normalized === alias || normalized.includes(alias))) {
            return theme
        }
    }

    return null
}

export const computeEmotionalResonance = (analytics, channels) => {
    if (analytics.sourceCounts.reactions < 2) {
        return []
    }

    const resonanceMap = {}

    channels.reactionMovies.forEach(({ movie, reaction }) => {
        if (!resonanceMap[reaction]) {
            resonanceMap[reaction] = {
                reaction,
                genres: {},
                themes: {},
                movies: [],
                evidenceCount: 0
            }
        }

        resonanceMap[reaction].evidenceCount += 1
        resonanceMap[reaction].movies.push(movie)

        ;(movie.genres || []).forEach(genre => {
            resonanceMap[reaction].genres[genre] = (resonanceMap[reaction].genres[genre] || 0) + 1
        })

        ;(movie.keywords || []).forEach(keyword => {
            const theme = mapKeywordToTheme(keyword)
            if (theme) {
                resonanceMap[reaction].themes[theme] = (resonanceMap[reaction].themes[theme] || 0) + 1
            }
        })
    })

    return Object.values(resonanceMap)
        .sort((a, b) => b.evidenceCount - a.evidenceCount)
        .map(entry => ({
            reaction: entry.reaction,
            evidenceCount: entry.evidenceCount,
            topGenres: topGenreEntries(entry.genres, 3).map(item => item.name),
            topThemes: topGenreEntries(entry.themes, 3).map(item => item.name),
            movies: buildMovieEvidence(entry.movies, 3)
        }))
}

export const computeThematicGravity = (channels) => {
    const themeCounts = {}

    Object.entries(channels.commitmentKeywords).forEach(([keyword, count]) => {
        const theme = mapKeywordToTheme(keyword)
        if (!theme) return
        themeCounts[theme] = (themeCounts[theme] || 0) + count
    })

    return Object.entries(themeCounts)
        .filter(([, count]) => count >= 2)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([theme, evidenceCount]) => ({
            theme,
            evidenceCount,
            source: "watched, reviewed, and reacted films"
        }))
}

export const buildWhyThisAuraExists = (analytics, channels, signature, hiddenTruth, contradictions, emotionalResonance, thematicGravity, signalDensity, definingMovie) => {
    const evidence = []

    if (definingMovie?.movie?.title) {
        evidence.push({
            type: "defining_movie",
            detail: `${definingMovie.movie.title} carries your strongest combined signal (${definingMovie.signalScore} points)`
        })
    }

    if (analytics.sourceCounts.reactions > 0) {
        const topReaction = analytics.topReactions[0]
        if (topReaction) {
            evidence.push({
                type: "reaction",
                detail: `${topReaction.count} ${topReaction.name} reaction${topReaction.count === 1 ? "" : "s"} across your library`
            })
        }
    }

    if (analytics.sourceCounts.reviews > 0) {
        evidence.push({
            type: "review",
            detail: `${analytics.sourceCounts.reviews} review${analytics.sourceCounts.reviews === 1 ? "" : "s"} shaping your committed taste`
        })
    }

    if (hiddenTruth?.available) {
        evidence.push({
            type: "hidden_truth",
            detail: `Browsing leans ${hiddenTruth.perceived.label}, responses lean ${hiddenTruth.actual.label}`
        })
    }

    contradictions.forEach(contradiction => {
        evidence.push({
            type: "contradiction",
            detail: contradiction.statement
        })
    })

    if (emotionalResonance[0]) {
        evidence.push({
            type: "emotional_resonance",
            detail: `${emotionalResonance[0].reaction} reactions cluster around ${emotionalResonance[0].topGenres[0] || "character-driven stories"}`
        })
    }

    if (thematicGravity[0]) {
        evidence.push({
            type: "theme",
            detail: `Recurring ${thematicGravity[0].theme} theme across committed films`
        })
    }

    const signalBreakdown = {
        reviews: analytics.sourceCounts.reviews,
        reactions: analytics.sourceCounts.reactions,
        watchlist: analytics.sourceCounts.watchlist,
        watched: analytics.sourceCounts.watchedFilms
    }

    let summary = "This Aura formed from your reviews, reactions, watchlist, and viewing history."

    if (hiddenTruth?.available) {
        summary = `This Aura exists because your browsing leans ${hiddenTruth.perceived.label}, while your strongest responses land in ${hiddenTruth.actual.label}.`
    } else if (signature?.responseGenre && signature?.explorationGenre && signature.responseGenre !== signature.explorationGenre) {
        summary = `This Aura exists because you explore ${signature.explorationGenre}, but respond most deeply through ${signature.responseGenre}.`
    } else if (signature?.responseGenre) {
        summary = `This Aura exists because your strongest committed signals keep returning to ${signature.responseGenre}.`
    } else if (signature?.primary) {
        summary = `This Aura exists because your viewing pattern consistently reflects ${signature.primary}.`
    }

    return {
        summary,
        evidence,
        signalBreakdown,
        signalCount: signalDensity,
        evidenceCount: signalDensity,
        builtFrom: signalBreakdown,
        explanation: `Built from ${signalBreakdown.watched} watched films, ${signalBreakdown.reviews} reviews, ${signalBreakdown.reactions} reactions, and ${signalBreakdown.watchlist} watchlist saves.`
    }
}

export const computeDefiningMovie = (analytics) => {
    const movieScores = new Map()
    const movieSignals = new Map()

    const addScore = (movie, points, signalType) => {
        if (!movie?._id) return
        const key = String(movie._id)
        movieScores.set(key, (movieScores.get(key) || 0) + points)
        if (!movieSignals.has(key)) movieSignals.set(key, [])
        movieSignals.get(key).push(signalType)
    }

    analytics.reactions
        .filter(reaction => VALID_REACTIONS.has(reaction.reaction))
        .forEach(reaction => addScore(reaction.movie, 4, `reaction:${reaction.reaction}`))

    analytics.reviews.forEach(review => addScore(review.movie, Math.max(review.rating || 1, 1), "review"))
    analytics.watchlist.forEach(item => addScore(item.movie, 2, "watchlist"))

    analytics.interactions
        .filter(interaction => COMMITMENT_INTERACTION_TYPES.has(interaction.interactionType))
        .forEach(interaction => addScore(interaction.movie, Math.max(interaction.weight || 1, 1), "watched"))

    const ranked = [...movieScores.entries()]
        .sort((a, b) => b[1] - a[1])
        .filter(([, score]) => score >= 4)

    if (!ranked.length) return null

    const [movieId, score] = ranked[0]
    const movie = [
        ...analytics.reactions.map(reaction => reaction.movie),
        ...analytics.reviews.map(review => review.movie),
        ...analytics.watchlist.map(item => item.movie),
        ...analytics.interactions.map(interaction => interaction.movie)
    ].find(item => item && String(item._id) === movieId)

    if (!movie) return null

    return {
        movie: compactMovie(movie),
        signalScore: score,
        signals: [...new Set(movieSignals.get(movieId) || [])],
        evidenceCount: (movieSignals.get(movieId) || []).length
    }
}

export const buildLegacyEmotionalTriggers = (analytics, emotionalResonance) => {
    if (emotionalResonance.length > 0) {
        return emotionalResonance
            .slice(0, 3)
            .map(item => ({
                label: item.reaction,
                evidenceCount: item.evidenceCount,
                source: "reactions"
            }))
    }

    return analytics.topReactions
        .slice(0, 3)
        .map(item => ({
            label: item.name,
            evidenceCount: item.count,
            source: "reactions"
        }))
}

export const buildAuraAnalytics = (analytics, signalDensity) => {
    const channels = buildChannelMaps(analytics)
    const confidence = buildAuraConfidence(analytics, signalDensity)
    const contradictions = confidence.auraState === "locked" ? [] : detectContradictions(analytics, channels)
    const signature = confidence.auraState === "locked" ? null : composeAuraSignature(analytics, channels, contradictions)
    const hiddenTruth = confidence.auraState === "locked"
        ? { available: false, fallback: "Unlock your Aura to reveal hidden viewing patterns.", requiredSignals: { intent: 0, commitment: 0 } }
        : detectHiddenViewingTruth(analytics, channels)
    const emotionalResonance = confidence.auraState === "locked" ? [] : computeEmotionalResonance(analytics, channels)
    const thematicGravity = confidence.auraState === "locked" ? [] : computeThematicGravity(channels)
    const definingMovie = confidence.auraState === "locked" ? null : computeDefiningMovie(analytics)
    const whyThisAuraExists = buildWhyThisAuraExists(
        analytics,
        channels,
        signature,
        hiddenTruth,
        contradictions,
        emotionalResonance,
        thematicGravity,
        signalDensity,
        definingMovie
    )

    return {
        confidence,
        signature,
        hiddenTruth,
        contradictions,
        emotionalResonance,
        thematicGravity,
        whyThisAuraExists,
        channels,
        definingMovie,
        legacy: {
            emotionalTriggers: buildLegacyEmotionalTriggers(analytics, emotionalResonance),
            dominantSignal: signature?.responseGenre || signature?.explorationGenre || analytics.topReactions[0]?.name || "Still emerging",
            comfortZone: topGenreEntries(channels.reactionGenres, 4).map(item => ({
                name: item.name,
                count: item.count
            }))
        }
    }
}
