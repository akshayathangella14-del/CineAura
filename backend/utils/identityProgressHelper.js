import { ReviewModel } from '../models/ReviewModel.js'
import { ReactionModel } from '../models/ReactionModel.js'
import { WatchlistModel } from '../models/WatchlistModel.js'

export const getUserReviewCount = (userId) =>
    ReviewModel.countDocuments({ user: userId })

export const getUserReactionCount = (userId) =>
    ReactionModel.countDocuments({ user: userId })

export const getUserWatchlistCount = (userId) =>
    WatchlistModel.countDocuments({ user: userId })
