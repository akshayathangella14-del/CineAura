import { ActorModel } from '../models/ActorModel.js'
import { MovieModel } from '../models/MovieModel.js'
import { fetchFromTMDB, getTMDBImage } from '../utils/tmdbHelper.js'

// Sync Actor Details
const syncActorDetails = async (tmdbId) => {
    const actorDetails = await fetchFromTMDB(`/person/${tmdbId}`)
    const actorCredits = await fetchFromTMDB(`/person/${tmdbId}/movie_credits`)
    const knownFor = []

    const cast = actorCredits.cast || []
    const crew = actorCredits.crew || []
    const combined = []
    const seen = new Set()

    for (const item of [...cast, ...crew]) {
        if (!item.id || seen.has(item.id)) continue
        seen.add(item.id)
        combined.push(item)
    }

    const sortedCredits = combined.sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    for (const movie of sortedCredits.slice(0, 5)) {
        knownFor.push({
            tmdbId: movie.id,
            title: movie.title,
            poster: getTMDBImage(movie.poster_path, "original")
        })
    }

    const actor = await ActorModel.findOneAndUpdate(
        { tmdbId: actorDetails.id },
        {
            tmdbId: actorDetails.id,
            name: actorDetails.name,
            biography: actorDetails.biography,
            birthday: actorDetails.birthday,
            placeOfBirth: actorDetails.place_of_birth,
            profileImage: getTMDBImage(actorDetails.profile_path, "original"),
            profilePath: actorDetails.profile_path,
            profileOriginal: getTMDBImage(actorDetails.profile_path, "original"),
            knownFor,
            popularity: actorDetails.popularity
        },
        { upsert: true, new: true }
    )

    return actor
}

// Get Actors
export const getActors = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1
        const limit = Number(req.query.limit) || 20
        const skip = (page - 1) * limit

        const actorsList = await ActorModel.find()
            .sort({ popularity: -1 })
            .skip(skip)
            .limit(limit)

        res.status(200).json({
            message: "Actors Fetched",
            payload: actorsList
        })
    } catch (err) {
        res.status(500).json({ message: "error", error: err.message })
    }
}

// Get Actor
export const getActor = async (req, res) => {
    try {
        const { id } = req.params

        let actor = isNaN(id)
            ? await ActorModel.findById(id).populate("movies", "title poster rating language")
            : await ActorModel.findOne({ tmdbId: Number(id) }).populate("movies", "title poster rating language")

        if (!actor && !isNaN(id)) {
            actor = await syncActorDetails(Number(id))
        }

        if (!actor) {
            return res.status(404).json({ message: "Actor Not Found" })
        }

        res.status(200).json({
            message: "Actor Found",
            payload: actor
        })
    } catch (err) {
        res.status(500).json({ message: "error", error: err.message })
    }
}

// Actor Movies
export const getActorMovies = async (req, res) => {
    try {
        const { id } = req.params

        const actor = isNaN(id)
            ? await ActorModel.findById(id)
            : await ActorModel.findOne({ tmdbId: Number(id) })

        if (!actor) {
            return res.status(404).json({ message: "Actor Not Found" })
        }

        const moviesList = await MovieModel.find({
            $or: [
                { _id: { $in: actor.movies } },
                { "cast.tmdbId": actor.tmdbId },
                { "cast.actor": actor._id }
            ]
        }).sort({ popularity: -1 })

        res.status(200).json({
            message: "Actor Movies Fetched",
            payload: moviesList
        })
    } catch (err) {
        res.status(500).json({ message: "error", error: err.message })
    }
}

// Search Actors
export const searchActors = async (req, res) => {
    try {
        const { q } = req.query

        if (!q) {
            return res.status(400).json({ message: "Search text is required" })
        }

        let actorsList = await ActorModel.find({
            name: { $regex: q, $options: "i" }
        })
            .sort({ popularity: -1 })
            .limit(20)

        if (actorsList.length === 0) {
            const tmdbSearch = await fetchFromTMDB(`/search/person?query=${encodeURIComponent(q)}`)
            if (tmdbSearch.results && tmdbSearch.results.length > 0) {
                actorsList = tmdbSearch.results.slice(0, 10).map(member => ({
                    tmdbId: member.id,
                    name: member.name,
                    profileImage: getTMDBImage(member.profile_path, "w185"),
                    profilePath: member.profile_path,
                    profileOriginal: getTMDBImage(member.profile_path, "original"),
                    popularity: member.popularity
                }))
            }
        }

        res.status(200).json({
            message: "Actors Fetched",
            payload: actorsList
        })
    } catch (err) {
        res.status(500).json({ message: "error", error: err.message })
    }
}

// In-memory cache for actor credits and images
const creditsCache = new Map()
const CACHE_TTL = 10 * 60 * 1000 // 10 minutes

export const getActorCredits = async (req, res) => {
    try {
        const { id } = req.params
        let tmdbId = Number(id)
        if (isNaN(tmdbId)) {
            const actor = await ActorModel.findById(id)
            if (!actor) {
                return res.status(404).json({ message: "Actor Not Found" })
            }
            tmdbId = actor.tmdbId
        }

        const cached = creditsCache.get(tmdbId)
        if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
            return res.status(200).json({
                message: "Credits and images fetched from cache",
                payload: cached.data
            })
        }

        // Fetch credits and images in parallel from TMDB
        const [credits, images] = await Promise.all([
            fetchFromTMDB(`/person/${tmdbId}/combined_credits`),
            fetchFromTMDB(`/person/${tmdbId}/images`).catch(() => ({ profiles: [] }))
        ])

        // Calculate collaborators from top 3 popular credits
        const castCredits = credits.cast || []
        const sortedCredits = [...castCredits].sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
        const topMedia = sortedCredits.slice(0, 3)

        const collaborators = {
            directors: [],
            costars: []
        }

        try {
            const creditsPromises = topMedia.map(media => {
                const type = media.media_type === 'tv' ? 'tv' : 'movie'
                return fetchFromTMDB(`/${type}/${media.id}/credits`).catch(() => null)
            })

            const mediaCreditsList = await Promise.all(creditsPromises)
            const directorCounts = {}
            const costarCounts = {}

            mediaCreditsList.forEach(mCredits => {
                if (!mCredits) return

                // Directors
                const crew = mCredits.crew || []
                crew.forEach(member => {
                    if (member.job === 'Director') {
                        if (!directorCounts[member.id]) {
                            directorCounts[member.id] = {
                                tmdbId: member.id,
                                name: member.name,
                                profilePath: member.profile_path,
                                count: 0
                            }
                        }
                        directorCounts[member.id].count++
                    }
                })

                // Co-stars
                const cast = mCredits.cast || []
                cast.forEach(member => {
                    if (member.id === tmdbId) return // skip self
                    if (!costarCounts[member.id]) {
                        costarCounts[member.id] = {
                            tmdbId: member.id,
                            name: member.name,
                            profilePath: member.profile_path,
                            count: 0
                        }
                    }
                    costarCounts[member.id].count++
                })
            })

            // Format and sort directors (top 5)
            collaborators.directors = Object.values(directorCounts)
                .sort((a, b) => b.count - a.count || b.tmdbId - a.tmdbId)
                .slice(0, 5)
                .map(d => ({
                    tmdbId: d.tmdbId,
                    name: d.name,
                    profileImage: getTMDBImage(d.profilePath, "w185"),
                    role: "Director"
                }))

            // Format and sort co-stars (top 8)
            collaborators.costars = Object.values(costarCounts)
                .sort((a, b) => b.count - a.count || b.tmdbId - a.tmdbId)
                .slice(0, 8)
                .map(c => ({
                    tmdbId: c.tmdbId,
                    name: c.name,
                    profileImage: getTMDBImage(c.profilePath, "w185"),
                    role: "Co-Star"
                }))
        } catch (collabErr) {
            console.error("Failed to fetch collaborators:", collabErr)
        }

        const data = {
            credits,
            images: images.profiles || [],
            collaborators
        }

        creditsCache.set(tmdbId, {
            timestamp: Date.now(),
            data
        })

        res.status(200).json({
            message: "Credits and images fetched from TMDB",
            payload: data
        })
    } catch (err) {
        res.status(500).json({ message: "error", error: err.message })
    }
}

