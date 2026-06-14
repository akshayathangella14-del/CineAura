import { UserModel } from '../models/UserModel.js'
import { UserAchievementModel } from '../models/UserAchievementModel.js'

export const hasUserAchievement = async (userId, achievementId) => {
    if (!achievementId) return false

    const record = await UserAchievementModel.findOne({
        user: userId,
        achievementId,
    }).select('_id')

    return Boolean(record)
}

export const getUserAchievementIds = async (userId) => {
    const records = await UserAchievementModel.find({ user: userId }).select('achievementId')
    return records.map((record) => record.achievementId)
}

export const evaluateUnlockCondition = async (userId, condition = {}) => {
    if (!condition?.type) return false

    switch (condition.type) {
        case 'default':
            return true

        case 'achievement':
            return hasUserAchievement(userId, condition.achievementId)

        case 'title': {
            const user = await UserModel.findById(userId).select('unlockedTitles')
            return user?.unlockedTitles?.includes(condition.titleId) ?? false
        }

        case 'badge': {
            const user = await UserModel.findById(userId).select('unlockedBadges')
            return user?.unlockedBadges?.includes(condition.badgeId) ?? false
        }

        case 'seasonal':
            return false

        case 'manual':
            return false

        default:
            return false
    }
}
