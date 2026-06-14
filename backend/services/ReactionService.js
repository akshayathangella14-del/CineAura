import { ReactionModel } from '../models/ReactionModel.js'
import { MovieModel } from '../models/MovieModel.js'
import { InteractionModel } from '../models/InteractionModel.js'
import { processReactionIdentityUnlocks } from './identity/IdentityEventService.js'

const allowedReactions = ["Intense", "Loved It", "Mind Blown", "Emotional", "Favorite"]
const reactionWeights = {
    Intense: 8,
    "Loved It": 10,
    "Mind Blown": 9,
    Emotional: 8,
    Favorite: 10
}

// Find Movie
const findMovie = async (movieId) => {
    const movie = isNaN(movieId)
        ? await MovieModel.findById(movieId)
        : await MovieModel.findOne({ tmdbId: Number(movieId) })

    return movie
}

// Get Reaction Counts
const getReactionCountsList = async (movieId) => {
    const counts = await ReactionModel.aggregate([
        { $match: { movie: movieId } },
        { $group: { _id: "$reaction", count: { $sum: 1 } } }
    ])

    const reactionCounts = {}

    for (const reaction of allowedReactions) {
        reactionCounts[reaction] = 0
    }

    for (const item of counts) {
        reactionCounts[item._id] = item.count
    }

    return reactionCounts
}

const buildReactionResponse = async (movie, savedReaction = null, message = "Reaction Saved") => {
    const reactionCounts = await getReactionCountsList(movie._id)

    return {
        message,
        payload: savedReaction,
        reactionCounts
    }
}

// Save Reaction
export const saveReaction = async (req, res) => {
    try {
        const { movieId, reaction } = req.body

        if (!movieId || !reaction) {
            return res.status(400).json({ message: "Movie and reaction are required" })
        }

        if (!allowedReactions.includes(reaction)) {
            return res.status(400).json({ message: "Invalid reaction" })
        }

        const movie = await findMovie(movieId)

        if (!movie) {
            return res.status(404).json({ message: "Movie Not Found" })
        }

        const existingReaction = await ReactionModel.findOne({
            user: req.user._id,
            movie: movie._id
        })

        if (existingReaction && existingReaction.reaction === reaction) {
            await ReactionModel.deleteOne({ _id: existingReaction._id })

            return res.status(200).json(
                await buildReactionResponse(movie, null, "Reaction Removed")
            )
        }

        const savedReaction = await ReactionModel.findOneAndUpdate(
            {
                user: req.user._id,
                movie: movie._id
            },
            {
                user: req.user._id,
                movie: movie._id,
                reaction
            },
            {
                new: true,
                upsert: true
            }
        )

        const newInteraction = new InteractionModel({
            user: req.user._id,
            movie: movie._id,
            interactionType: "reaction",
            weight: reactionWeights[reaction],
            source: "reaction",
            metadata: { reaction }
        })

        await newInteraction.save()
        await processReactionIdentityUnlocks(req.user._id)

        res.status(201).json(
            await buildReactionResponse(movie, savedReaction, "Reaction Saved")
        )
    } catch (err) {
        res.status(500).json({ message: "error", error: err.message })
    }
}

// Remove Reaction
export const removeReaction = async (req, res) => {
    try {
        const { movieId } = req.params
        const movie = await findMovie(movieId)

        if (!movie) {
            return res.status(404).json({ message: "Movie Not Found" })
        }

        await ReactionModel.deleteOne({
            user: req.user._id,
            movie: movie._id
        })

        res.status(200).json(
            await buildReactionResponse(movie, null, "Reaction Removed")
        )
    } catch (err) {
        res.status(500).json({ message: "error", error: err.message })
    }
}

// Get Movie Reactions
export const getMovieReactions = async (req, res) => {
    try {
        const { movieId } = req.params
        const movie = await findMovie(movieId)

        if (!movie) {
            return res.status(404).json({ message: "Movie Not Found" })
        }

        const reactionCounts = await getReactionCountsList(movie._id)

        res.status(200).json({
            message: "Reaction Counts",
            payload: reactionCounts
        })
    } catch (err) {
        res.status(500).json({ message: "error", error: err.message })
    }
}

// Get User Reaction
export const getUserReaction = async (req, res) => {
    try {
        const { movieId } = req.params
        const movie = await findMovie(movieId)

        if (!movie) {
            return res.status(404).json({ message: "Movie Not Found" })
        }

        const reaction = await ReactionModel.findOne({
            user: req.user._id,
            movie: movie._id
        })

        res.status(200).json({
            message: "User Reaction",
            payload: reaction
        })
    } catch (err) {
        res.status(500).json({ message: "error", error: err.message })
    }
}
