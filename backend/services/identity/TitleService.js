import { TitleDefinitionModel } from '../../models/TitleDefinitionModel.js'
import { UserModel } from '../../models/UserModel.js'
import { evaluateUnlockCondition } from '../../utils/identityUnlockEvaluator.js'

const formatTitleRecord = (definition, { isUnlocked, isEquipped }) => ({
    titleId: definition.titleId,
    titleName: definition.titleName,
    description: definition.description,
    icon: definition.icon,
    unlockCondition: definition.unlockCondition,
    isUnlocked,
    isEquipped,
})

export const getAvailableTitles = async (userId) => {
    const [definitions, user] = await Promise.all([
        TitleDefinitionModel.find({ isActive: true }).sort({ sortOrder: 1, titleName: 1 }).lean(),
        UserModel.findById(userId).select('unlockedTitles currentTitle'),
    ])

    if (!user) {
        throw new Error('User not found')
    }

    const unlockedSet = new Set(user.unlockedTitles || [])

    return definitions.map((definition) =>
        formatTitleRecord(definition, {
            isUnlocked: unlockedSet.has(definition.titleId),
            isEquipped: user.currentTitle === definition.titleId,
        })
    )
}

export const unlockTitle = async (userId, titleId) => {
    const definition = await TitleDefinitionModel.findOne({
        titleId,
        isActive: true,
    })

    if (!definition) {
        return { success: false, reason: 'TITLE_NOT_FOUND' }
    }

    const user = await UserModel.findById(userId).select('unlockedTitles')

    if (!user) {
        return { success: false, reason: 'USER_NOT_FOUND' }
    }

    if (user.unlockedTitles.includes(titleId)) {
        return {
            success: true,
            alreadyUnlocked: true,
            title: formatTitleRecord(definition.toObject(), {
                isUnlocked: true,
                isEquipped: false,
            }),
        }
    }

    const conditionMet = await evaluateUnlockCondition(userId, definition.unlockCondition)

    if (!conditionMet) {
        return { success: false, reason: 'UNLOCK_CONDITION_NOT_MET' }
    }

    user.unlockedTitles.push(titleId)
    await user.save()

    return {
        success: true,
        alreadyUnlocked: false,
        title: formatTitleRecord(definition.toObject(), {
            isUnlocked: true,
            isEquipped: false,
        }),
    }
}

export const equipTitle = async (userId, titleId) => {
    const user = await UserModel.findById(userId).select('unlockedTitles currentTitle')

    if (!user) {
        return { success: false, reason: 'USER_NOT_FOUND' }
    }

    if (!user.unlockedTitles.includes(titleId)) {
        return { success: false, reason: 'TITLE_NOT_UNLOCKED' }
    }

    const definition = await TitleDefinitionModel.findOne({
        titleId,
        isActive: true,
    })

    if (!definition) {
        return { success: false, reason: 'TITLE_NOT_FOUND' }
    }

    user.currentTitle = titleId
    await user.save()

    return {
        success: true,
        title: formatTitleRecord(definition.toObject(), {
            isUnlocked: true,
            isEquipped: true,
        }),
    }
}

export const unequipTitle = async (userId) => {
    const user = await UserModel.findByIdAndUpdate(
        userId,
        { $set: { currentTitle: null } },
        { new: true }
    ).select('currentTitle')

    if (!user) {
        return { success: false, reason: 'USER_NOT_FOUND' }
    }

    return { success: true, currentTitle: null }
}
