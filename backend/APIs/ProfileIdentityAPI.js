import exp from 'express'
import { verifyToken } from '../middlewares/verifyToken.js'
import {
    handleGetAvailableTitles,
    handleEquipTitle,
    handleUnequipTitle,
    handleGetAvailableBadges,
    handleGetUnlockedBadges,
    handleEquipBadge,
    handleUnequipBadge,
    handleGetUserAchievements,
    handleGetAvatarCatalog,
} from '../services/identity/ProfileIdentityService.js'

export const profileIdentityApp = exp.Router()

profileIdentityApp.get('/profile/identity/titles', verifyToken, handleGetAvailableTitles)
profileIdentityApp.put('/profile/identity/titles/equip', verifyToken, handleEquipTitle)
profileIdentityApp.put('/profile/identity/titles/unequip', verifyToken, handleUnequipTitle)

profileIdentityApp.get('/profile/identity/badges', verifyToken, handleGetAvailableBadges)
profileIdentityApp.get('/profile/identity/badges/unlocked', verifyToken, handleGetUnlockedBadges)
profileIdentityApp.put('/profile/identity/badges/equip', verifyToken, handleEquipBadge)
profileIdentityApp.put('/profile/identity/badges/unequip', verifyToken, handleUnequipBadge)

profileIdentityApp.get('/profile/identity/achievements', verifyToken, handleGetUserAchievements)
profileIdentityApp.get('/profile/identity/avatars', verifyToken, handleGetAvatarCatalog)
