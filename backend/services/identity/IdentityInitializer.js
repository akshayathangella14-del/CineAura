import { TitleDefinitionModel } from '../../models/TitleDefinitionModel.js'
import { BadgeDefinitionModel } from '../../models/BadgeDefinitionModel.js'
import { initializeDefaultAvatars } from './AvatarUnlockService.js'
import { unlockTitle } from './TitleService.js'
import { unlockBadge } from './BadgeService.js'
import { unlockAchievement } from './AchievementService.js'
import { syncIdentityUnlocks } from './IdentityGrantOrchestrator.js'

const grantDefaultIdentityItems = async (userId) => {
    const [defaultTitles, defaultBadges] = await Promise.all([
        TitleDefinitionModel.find({
            isActive: true,
            'unlockCondition.type': 'default',
        }).select('titleId'),
        BadgeDefinitionModel.find({
            isActive: true,
            'unlockCondition.type': 'default',
        }).select('badgeId'),
    ])

    await Promise.all([
        ...defaultTitles.map((title) => unlockTitle(userId, title.titleId)),
        ...defaultBadges.map((badge) => unlockBadge(userId, badge.badgeId)),
    ])
}

export const initializeUserIdentity = async (userId) => {
    await initializeDefaultAvatars(userId)
    await grantDefaultIdentityItems(userId)
    await unlockAchievement(userId, 'account_established')
    await syncIdentityUnlocks(userId)

    return { success: true }
}
