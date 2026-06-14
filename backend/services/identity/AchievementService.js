import { AchievementDefinitionModel } from '../../models/AchievementDefinitionModel.js'
import { UserAchievementModel } from '../../models/UserAchievementModel.js'
import { syncIdentityUnlocks } from './IdentityGrantOrchestrator.js'

export const getAchievementDefinitions = async () =>
    AchievementDefinitionModel.find({ isActive: true })
        .sort({ sortOrder: 1, title: 1 })
        .lean()

export const getUserAchievements = async (userId) => {
    const [definitions, earnedRecords] = await Promise.all([
        getAchievementDefinitions(),
        UserAchievementModel.find({ user: userId }).sort({ earnedAt: -1 }).lean(),
    ])

    const earnedMap = new Map(
        earnedRecords.map((record) => [record.achievementId, record.earnedAt])
    )

    return definitions.map((definition) => ({
        achievementId: definition.achievementId,
        title: definition.title,
        description: definition.description,
        category: definition.category,
        icon: definition.icon,
        earnedAt: earnedMap.get(definition.achievementId) || null,
        isEarned: earnedMap.has(definition.achievementId),
    }))
}

export const hasAchievement = async (userId, achievementId) => {
    const record = await UserAchievementModel.findOne({
        user: userId,
        achievementId,
    }).select('_id')

    return Boolean(record)
}

export const unlockAchievement = async (userId, achievementId) => {
    const definition = await AchievementDefinitionModel.findOne({
        achievementId,
        isActive: true,
    })

    if (!definition) {
        return { success: false, reason: 'ACHIEVEMENT_NOT_FOUND' }
    }

    const existing = await UserAchievementModel.findOne({
        user: userId,
        achievementId,
    })

    if (existing) {
        return {
            success: true,
            alreadyUnlocked: true,
            achievement: {
                achievementId: definition.achievementId,
                title: definition.title,
                description: definition.description,
                category: definition.category,
                icon: definition.icon,
                earnedAt: existing.earnedAt,
            },
        }
    }

    const record = await UserAchievementModel.create({
        user: userId,
        achievementId,
        earnedAt: new Date(),
    })

    await syncIdentityUnlocks(userId)

    return {
        success: true,
        alreadyUnlocked: false,
        achievement: {
            achievementId: definition.achievementId,
            title: definition.title,
            description: definition.description,
            category: definition.category,
            icon: definition.icon,
            earnedAt: record.earnedAt,
        },
    }
}
