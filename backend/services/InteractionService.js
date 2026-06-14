import { InteractionModel } from '../models/InteractionModel.js'
import { MovieModel } from '../models/MovieModel.js'

const interactionWeights = {
    viewed: 1,
    clicked: 2,
    rated: 5,
    searched: 1,
    watchlisted: 5,
    reviewed: 5,
    watched: 8,
    journey: 3,
    "perfect-picks": 4,
    movie_open: 1,
    movie_hover: 1,
    movie_click: 2,
    search_query: 1,
    watchlist_add: 5,
    reaction: 7,
    rating: 5,
    not_interested: -5
}

// Add Interaction
export const addInteraction = async (req, res) => {
    try {
        const { movieId, interactionType, query, source, metadata } = req.body

        if (!interactionType) {
            return res.status(400).json({ message: "Interaction type is required" })
        }

        const allowedTypes = Object.keys(interactionWeights)

        if (!allowedTypes.includes(interactionType)) {
            return res.status(400).json({ message: "Invalid interaction type" })
        }

        let movie = null

        if (movieId) {
            movie = isNaN(movieId)
                ? await MovieModel.findById(movieId)
                : await MovieModel.findOne({ tmdbId: Number(movieId) })

            if (!movie) {
                return res.status(404).json({ message: "Movie Not Found" })
            }
        }

        if (interactionType !== "search_query" && !movie) {
            return res.status(400).json({ message: "Movie ID is required" })
        }

        if (interactionType === "search_query" && !query) {
            return res.status(400).json({ message: "Search query is required" })
        }

        const newInteraction = new InteractionModel({
            user: req.user._id,
            movie: movie?._id,
            interactionType,
            query,
            weight: interactionWeights[interactionType],
            source,
            metadata
        })

        await newInteraction.save()

        res.status(201).json({
            message: "Interaction Saved",
            payload: newInteraction
        })
    } catch (err) {
        res.status(500).json({ message: "error", error: err.message })
    }
}
