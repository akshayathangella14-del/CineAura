import { TitleDefinitionModel } from '../models/TitleDefinitionModel.js'
import { BadgeDefinitionModel } from '../models/BadgeDefinitionModel.js'

const resolveEquippedTitle = async (titleId) => {
    if (!titleId) return null

    const definition = await TitleDefinitionModel.findOne({
        titleId,
        isActive: true,
    }).select('titleId titleName description icon')

    if (!definition) return null

    return {
        titleId: definition.titleId,
        titleName: definition.titleName,
        description: definition.description,
        icon: definition.icon,
    }
}

const resolveEquippedBadge = async (badgeId) => {
    if (!badgeId) return null

    const definition = await BadgeDefinitionModel.findOne({
        badgeId,
        isActive: true,
    }).select('badgeId badgeName description icon rarity')

    if (!definition) return null

    return {
        badgeId: definition.badgeId,
        badgeName: definition.badgeName,
        description: definition.description,
        icon: definition.icon,
        rarity: definition.rarity,
    }
}

export const buildAccountIdentityPayload = async (user) => {
    const unlockedTitles = user.unlockedTitles || []
    const unlockedBadges = user.unlockedBadges || []
    const unlockedAvatars = user.unlockedAvatars || []

    return {
        id: user._id,
        name: user.username,
        email: user.email,
        role: user.role,
        avatarId: user.avatarId || null,
        avatarName: user.avatarName || null,
        avatarImage: user.avatarImage || null,
        createdAt: user.createdAt,
        currentTitle: await resolveEquippedTitle(user.currentTitle),
        equippedBadge: await resolveEquippedBadge(user.equippedBadge),
        unlockedTitleCount: unlockedTitles.length,
        unlockedBadgeCount: unlockedBadges.length,
        unlockedAvatarCount: unlockedAvatars.length,
    }
}
