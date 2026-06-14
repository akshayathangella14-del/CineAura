import { BadgeDefinitionModel } from '../../models/BadgeDefinitionModel.js'
import { UserModel } from '../../models/UserModel.js'
import { evaluateUnlockCondition } from '../../utils/identityUnlockEvaluator.js'

const formatBadgeRecord = (definition, { isUnlocked, isEquipped }) => ({
    badgeId: definition.badgeId,
    badgeName: definition.badgeName,
    description: definition.description,
    icon: definition.icon,
    rarity: definition.rarity,
    unlockCondition: definition.unlockCondition,
    isUnlocked,
    isEquipped,
})

export const getAvailableBadges = async (userId) => {
    const [definitions, user] = await Promise.all([
        BadgeDefinitionModel.find({ isActive: true }).sort({ sortOrder: 1, badgeName: 1 }).lean(),
        UserModel.findById(userId).select('unlockedBadges equippedBadge'),
    ])

    if (!user) {
        throw new Error('User not found')
    }

    const unlockedSet = new Set(user.unlockedBadges || [])

    return definitions.map((definition) =>
        formatBadgeRecord(definition, {
            isUnlocked: unlockedSet.has(definition.badgeId),
            isEquipped: user.equippedBadge === definition.badgeId,
        })
    )
}

export const getUnlockedBadges = async (userId) => {
    const user = await UserModel.findById(userId).select('unlockedBadges equippedBadge')

    if (!user) {
        throw new Error('User not found')
    }

    const definitions = await BadgeDefinitionModel.find({
        badgeId: { $in: user.unlockedBadges || [] },
        isActive: true,
    }).sort({ sortOrder: 1, badgeName: 1 }).lean()

    return definitions.map((definition) =>
        formatBadgeRecord(definition, {
            isUnlocked: true,
            isEquipped: user.equippedBadge === definition.badgeId,
        })
    )
}

export const unlockBadge = async (userId, badgeId) => {
    const definition = await BadgeDefinitionModel.findOne({
        badgeId,
        isActive: true,
    })

    if (!definition) {
        return { success: false, reason: 'BADGE_NOT_FOUND' }
    }

    const user = await UserModel.findById(userId).select('unlockedBadges')

    if (!user) {
        return { success: false, reason: 'USER_NOT_FOUND' }
    }

    if (user.unlockedBadges.includes(badgeId)) {
        return {
            success: true,
            alreadyUnlocked: true,
            badge: formatBadgeRecord(definition.toObject(), {
                isUnlocked: true,
                isEquipped: false,
            }),
        }
    }

    const conditionMet = await evaluateUnlockCondition(userId, definition.unlockCondition)

    if (!conditionMet) {
        return { success: false, reason: 'UNLOCK_CONDITION_NOT_MET' }
    }

    user.unlockedBadges.push(badgeId)
    await user.save()

    return {
        success: true,
        alreadyUnlocked: false,
        badge: formatBadgeRecord(definition.toObject(), {
            isUnlocked: true,
            isEquipped: false,
        }),
    }
}

export const equipBadge = async (userId, badgeId) => {
    const user = await UserModel.findById(userId).select('unlockedBadges equippedBadge')

    if (!user) {
        return { success: false, reason: 'USER_NOT_FOUND' }
    }

    if (!user.unlockedBadges.includes(badgeId)) {
        return { success: false, reason: 'BADGE_NOT_UNLOCKED' }
    }

    const definition = await BadgeDefinitionModel.findOne({
        badgeId,
        isActive: true,
    })

    if (!definition) {
        return { success: false, reason: 'BADGE_NOT_FOUND' }
    }

    user.equippedBadge = badgeId
    await user.save()

    return {
        success: true,
        badge: formatBadgeRecord(definition.toObject(), {
            isUnlocked: true,
            isEquipped: true,
        }),
    }
}

export const unequipBadge = async (userId) => {
    const user = await UserModel.findByIdAndUpdate(
        userId,
        { $set: { equippedBadge: null } },
        { new: true }
    ).select('equippedBadge')

    if (!user) {
        return { success: false, reason: 'USER_NOT_FOUND' }
    }

    return { success: true, equippedBadge: null }
}
