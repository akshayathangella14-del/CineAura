import { TitleDefinitionModel } from '../../models/TitleDefinitionModel.js'
import { BadgeDefinitionModel } from '../../models/BadgeDefinitionModel.js'
import { AvatarUnlockDefinitionModel } from '../../models/AvatarUnlockDefinitionModel.js'
import { UserModel } from '../../models/UserModel.js'
import { unlockTitle } from './TitleService.js'
import { unlockBadge } from './BadgeService.js'
import { unlockAvatar } from './AvatarUnlockService.js'

export const syncIdentityUnlocks = async (userId) => {
    const user = await UserModel.findById(userId).select('unlockedTitles unlockedBadges unlockedAvatars')

    if (!user) {
        return { success: false, reason: 'USER_NOT_FOUND' }
    }

    const unlockedTitles = new Set(user.unlockedTitles || [])
    const unlockedBadges = new Set(user.unlockedBadges || [])
    const unlockedAvatars = new Set(user.unlockedAvatars || [])

    const [titles, badges, avatars] = await Promise.all([
        TitleDefinitionModel.find({ isActive: true }).select('titleId'),
        BadgeDefinitionModel.find({ isActive: true }).select('badgeId'),
        AvatarUnlockDefinitionModel.find({ isActive: true }).select('avatarId'),
    ])

    const results = {
        titles: [],
        badges: [],
        avatars: [],
    }

    for (const title of titles) {
        if (unlockedTitles.has(title.titleId)) continue

        const result = await unlockTitle(userId, title.titleId)

        if (result.success && !result.alreadyUnlocked) {
            results.titles.push(title.titleId)
            unlockedTitles.add(title.titleId)
        }
    }

    for (const badge of badges) {
        if (unlockedBadges.has(badge.badgeId)) continue

        const result = await unlockBadge(userId, badge.badgeId)

        if (result.success && !result.alreadyUnlocked) {
            results.badges.push(badge.badgeId)
            unlockedBadges.add(badge.badgeId)
        }
    }

    for (const avatar of avatars) {
        if (unlockedAvatars.has(avatar.avatarId)) continue

        const result = await unlockAvatar(userId, avatar.avatarId)

        if (result.success && !result.alreadyUnlocked) {
            results.avatars.push(avatar.avatarId)
            unlockedAvatars.add(avatar.avatarId)
        }
    }

    return { success: true, granted: results }
}
