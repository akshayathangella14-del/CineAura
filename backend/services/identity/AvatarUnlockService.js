import { AvatarUnlockDefinitionModel } from '../../models/AvatarUnlockDefinitionModel.js'
import { UserModel } from '../../models/UserModel.js'
import { getAvatarsList, findAvatar } from '../../utils/avatarHelper.js'
import { evaluateUnlockCondition } from '../../utils/identityUnlockEvaluator.js'

const formatAvatarRecord = (avatar, definition, { isUnlocked, isEquipped }) => ({
    avatarId: avatar.avatarId,
    avatarName: avatar.avatarName,
    avatarImage: avatar.avatarImage,
    category: avatar.category,
    unlockType: definition?.unlockType || 'manual',
    unlockCondition: definition?.unlockCondition || null,
    seasonKey: definition?.seasonKey || null,
    isDefault: definition?.isDefault ?? false,
    isUnlocked,
    isEquipped,
})

export const getDefaultAvatarIds = async () => {
    const definitions = await AvatarUnlockDefinitionModel.find({
        isActive: true,
        isDefault: true,
    }).select('avatarId')

    return definitions.map((definition) => definition.avatarId)
}

export const canUseAvatar = async (userId, avatarId) => {
    const user = await UserModel.findById(userId).select('unlockedAvatars avatarId')

    if (!user) return false

    return (user.unlockedAvatars || []).includes(avatarId)
}

export const unlockAvatar = async (userId, avatarId) => {
    const avatar = findAvatar(avatarId)

    if (!avatar) {
        return { success: false, reason: 'AVATAR_NOT_FOUND' }
    }

    const definition = await AvatarUnlockDefinitionModel.findOne({
        avatarId,
        isActive: true,
    })

    if (!definition) {
        return { success: false, reason: 'AVATAR_UNLOCK_DEFINITION_NOT_FOUND' }
    }

    const user = await UserModel.findById(userId).select('unlockedAvatars avatarId')

    if (!user) {
        return { success: false, reason: 'USER_NOT_FOUND' }
    }

    if (user.unlockedAvatars.includes(avatarId)) {
        return {
            success: true,
            alreadyUnlocked: true,
            avatar: formatAvatarRecord(avatar, definition.toObject(), {
                isUnlocked: true,
                isEquipped: user.avatarId === avatarId,
            }),
        }
    }

    const conditionMet = await evaluateUnlockCondition(userId, definition.unlockCondition)

    if (!conditionMet) {
        return { success: false, reason: 'UNLOCK_CONDITION_NOT_MET' }
    }

    user.unlockedAvatars.push(avatarId)
    await user.save()

    return {
        success: true,
        alreadyUnlocked: false,
        avatar: formatAvatarRecord(avatar, definition.toObject(), {
            isUnlocked: true,
            isEquipped: user.avatarId === avatarId,
        }),
    }
}

export const grantAvatarUnlock = async (userId, avatarId) => {
    const avatar = findAvatar(avatarId)

    if (!avatar) {
        return { success: false, reason: 'AVATAR_NOT_FOUND' }
    }

    const user = await UserModel.findById(userId).select('unlockedAvatars avatarId')

    if (!user) {
        return { success: false, reason: 'USER_NOT_FOUND' }
    }

    if (user.unlockedAvatars.includes(avatarId)) {
        return { success: true, alreadyUnlocked: true }
    }

    user.unlockedAvatars.push(avatarId)
    await user.save()

    return { success: true, alreadyUnlocked: false }
}

export const initializeDefaultAvatars = async (userId) => {
    const defaultAvatarIds = await getDefaultAvatarIds()
    const user = await UserModel.findById(userId).select('unlockedAvatars')

    if (!user) {
        return { success: false, reason: 'USER_NOT_FOUND' }
    }

    const existing = new Set(user.unlockedAvatars || [])
    const toGrant = defaultAvatarIds.filter((avatarId) => !existing.has(avatarId))

    if (toGrant.length === 0) {
        return { success: true, granted: [] }
    }

    user.unlockedAvatars = [...existing, ...toGrant]
    await user.save()

    return { success: true, granted: toGrant }
}

export const getAvatarCatalogForUser = async (userId) => {
    const [avatars, definitions, user] = await Promise.all([
        Promise.resolve(getAvatarsList()),
        AvatarUnlockDefinitionModel.find({ isActive: true }).lean(),
        UserModel.findById(userId).select('unlockedAvatars avatarId'),
    ])

    if (!user) {
        throw new Error('User not found')
    }

    const definitionMap = new Map(definitions.map((definition) => [definition.avatarId, definition]))
    const unlockedSet = new Set(user.unlockedAvatars || [])

    return avatars.map((avatar) => {
        const definition = definitionMap.get(avatar.avatarId) || null

        return formatAvatarRecord(avatar, definition, {
            isUnlocked: unlockedSet.has(avatar.avatarId),
            isEquipped: user.avatarId === avatar.avatarId,
        })
    })
}
