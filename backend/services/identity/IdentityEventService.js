import { IDENTITY_MILESTONES } from '../../config/identityMilestones.js'
import {
    getUserReviewCount,
    getUserReactionCount,
    getUserWatchlistCount,
} from '../../utils/identityProgressHelper.js'
import { unlockAchievement } from './AchievementService.js'

const runIdentityUnlock = async (handler) => {
    try {
        await handler()
    } catch (err) {
        console.error('Identity unlock error:', err.message)
    }
}

export const onAccountEstablished = async (userId) =>
    unlockAchievement(userId, 'account_established')

export const onFirstReviewCreated = async (userId) =>
    unlockAchievement(userId, 'first_review')

export const onReactionMilestoneReached = async (userId) =>
    unlockAchievement(userId, 'reaction_master')

export const onWatchlistMilestoneReached = async (userId) =>
    unlockAchievement(userId, 'watchlist_builder')

export const onCollectionMilestoneReached = async (userId) =>
    unlockAchievement(userId, 'movie_collector')

export const processReviewIdentityUnlocks = async (userId) =>
    runIdentityUnlock(async () => {
        const reviewCount = await getUserReviewCount(userId)

        if (reviewCount >= 1) {
            await onFirstReviewCreated(userId)
        }
    })

export const processReactionIdentityUnlocks = async (userId) =>
    runIdentityUnlock(async () => {
        const reactionCount = await getUserReactionCount(userId)

        if (reactionCount >= IDENTITY_MILESTONES.REACTIONS) {
            await onReactionMilestoneReached(userId)
        }
    })

export const processWatchlistIdentityUnlocks = async (userId) =>
    runIdentityUnlock(async () => {
        const watchlistCount = await getUserWatchlistCount(userId)

        if (watchlistCount >= IDENTITY_MILESTONES.WATCHLIST_BUILDER) {
            await onWatchlistMilestoneReached(userId)
        }

        if (watchlistCount >= IDENTITY_MILESTONES.MOVIE_COLLECTOR) {
            await onCollectionMilestoneReached(userId)
        }
    })
