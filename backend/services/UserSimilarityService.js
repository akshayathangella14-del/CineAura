import { UserModel } from '../models/UserModel.js'
import { ReviewModel } from '../models/ReviewModel.js'
import { WatchlistModel } from '../models/WatchlistModel.js'
import { InteractionModel } from '../models/InteractionModel.js'
import { UserSimilarityModel } from '../models/UserSimilarityModel.js'

// Build User Vector
const buildUserVector = async (userId) => {
    const vector = {}
    const reviewsList = await ReviewModel.find({ user: userId }).populate("movie")
    const watchlist = await WatchlistModel.find({ user: userId }).populate("movie")
    const interactionsList = await InteractionModel.find({ user: userId }).populate("movie")

    for (const review of reviewsList) {
        for (const genre of review.movie?.genres || []) {
            vector[genre] = (vector[genre] || 0) + review.rating
        }
    }

    for (const watchlistMovie of watchlist) {
        for (const genre of watchlistMovie.movie?.genres || []) {
            vector[genre] = (vector[genre] || 0) + 2
        }
    }

    for (const interaction of interactionsList) {
        for (const genre of interaction.movie?.genres || []) {
            vector[genre] = (vector[genre] || 0) + 1
        }
    }

    return vector
}

// Cosine Similarity
const getCosineSimilarity = (firstVector, secondVector) => {
    let dotProduct = 0
    let firstLength = 0
    let secondLength = 0

    for (const key in firstVector) {
        dotProduct = dotProduct + ((firstVector[key] || 0) * (secondVector[key] || 0))
        firstLength = firstLength + (firstVector[key] * firstVector[key])
    }

    for (const key in secondVector) {
        secondLength = secondLength + (secondVector[key] * secondVector[key])
    }

    if (firstLength === 0 || secondLength === 0) {
        return 0
    }

    return dotProduct / (Math.sqrt(firstLength) * Math.sqrt(secondLength))
}

// Similar Users
export const getSimilarUsers = async (req, res) => {
    try {
        const { id } = req.params
        const user = await UserModel.findById(id).select("-password")

        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        const currentVector = await buildUserVector(user._id)
        const usersList = await UserModel.find({ _id: { $ne: user._id } }).select("-password")
        const similarUsers = []

        for (const otherUser of usersList) {
            const otherVector = await buildUserVector(otherUser._id)
            const score = getCosineSimilarity(currentVector, otherVector)

            if (score > 0) {
                await UserSimilarityModel.findOneAndUpdate(
                    { user: user._id, similarUser: otherUser._id },
                    { score },
                    { upsert: true, new: true }
                )

                similarUsers.push({
                    user: otherUser,
                    score
                })
            }
        }

        similarUsers.sort((a, b) => b.score - a.score)

        res.status(200).json({
            message: "Similar Users Fetched",
            payload: similarUsers.slice(0, 10)
        })
    } catch (err) {
        res.status(500).json({ message: "error", error: err.message })
    }
}
