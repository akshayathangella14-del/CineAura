import { buildAccountIdentityPayload } from '../../utils/profileIdentityHelper.js'
import { getAvailableTitles, equipTitle, unequipTitle } from './TitleService.js'
import { getAvailableBadges, getUnlockedBadges, equipBadge, unequipBadge } from './BadgeService.js'
import { getUserAchievements } from './AchievementService.js'
import { getAvatarCatalogForUser } from './AvatarUnlockService.js'

export const getProfileIdentitySummary = async (user) =>
    buildAccountIdentityPayload(user)

export const handleGetAvailableTitles = async (req, res) => {
    try {
        const titles = await getAvailableTitles(req.user._id)

        res.status(200).json({
            message: 'Titles fetched successfully',
            payload: titles,
        })
    } catch (err) {
        res.status(500).json({ message: 'error', error: err.message })
    }
}

export const handleEquipTitle = async (req, res) => {
    try {
        const { titleId } = req.body

        if (!titleId) {
            return res.status(400).json({ message: 'titleId is required' })
        }

        const result = await equipTitle(req.user._id, titleId)

        if (!result.success) {
            const status = result.reason === 'TITLE_NOT_UNLOCKED' ? 403 : 404
            return res.status(status).json({ message: result.reason })
        }

        res.status(200).json({
            message: 'Title equipped successfully',
            payload: result.title,
        })
    } catch (err) {
        res.status(500).json({ message: 'error', error: err.message })
    }
}

export const handleUnequipTitle = async (req, res) => {
    try {
        const result = await unequipTitle(req.user._id)

        if (!result.success) {
            return res.status(404).json({ message: result.reason })
        }

        res.status(200).json({
            message: 'Title unequipped successfully',
            payload: { currentTitle: null },
        })
    } catch (err) {
        res.status(500).json({ message: 'error', error: err.message })
    }
}

export const handleGetAvailableBadges = async (req, res) => {
    try {
        const badges = await getAvailableBadges(req.user._id)

        res.status(200).json({
            message: 'Badges fetched successfully',
            payload: badges,
        })
    } catch (err) {
        res.status(500).json({ message: 'error', error: err.message })
    }
}

export const handleGetUnlockedBadges = async (req, res) => {
    try {
        const badges = await getUnlockedBadges(req.user._id)

        res.status(200).json({
            message: 'Unlocked badges fetched successfully',
            payload: badges,
        })
    } catch (err) {
        res.status(500).json({ message: 'error', error: err.message })
    }
}

export const handleEquipBadge = async (req, res) => {
    try {
        const { badgeId } = req.body

        if (!badgeId) {
            return res.status(400).json({ message: 'badgeId is required' })
        }

        const result = await equipBadge(req.user._id, badgeId)

        if (!result.success) {
            const status = result.reason === 'BADGE_NOT_UNLOCKED' ? 403 : 404
            return res.status(status).json({ message: result.reason })
        }

        res.status(200).json({
            message: 'Badge equipped successfully',
            payload: result.badge,
        })
    } catch (err) {
        res.status(500).json({ message: 'error', error: err.message })
    }
}

export const handleUnequipBadge = async (req, res) => {
    try {
        const result = await unequipBadge(req.user._id)

        if (!result.success) {
            return res.status(404).json({ message: result.reason })
        }

        res.status(200).json({
            message: 'Badge unequipped successfully',
            payload: { equippedBadge: null },
        })
    } catch (err) {
        res.status(500).json({ message: 'error', error: err.message })
    }
}

export const handleGetUserAchievements = async (req, res) => {
    try {
        const achievements = await getUserAchievements(req.user._id)

        res.status(200).json({
            message: 'Achievements fetched successfully',
            payload: achievements,
        })
    } catch (err) {
        res.status(500).json({ message: 'error', error: err.message })
    }
}

export const handleGetAvatarCatalog = async (req, res) => {
    try {
        const avatars = await getAvatarCatalogForUser(req.user._id)

        res.status(200).json({
            message: 'Avatar catalog fetched successfully',
            payload: avatars,
        })
    } catch (err) {
        res.status(500).json({ message: 'error', error: err.message })
    }
}
