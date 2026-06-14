import exp from 'express'
import { verifyToken } from '../middlewares/verifyToken.js'
import {
    getAvatars,
    updateProfileAvatar
} from '../services/AvatarService.js'

export const avatarApp = exp.Router()

// Get Avatars
avatarApp.get("/avatars", getAvatars)

// Update Profile Avatar
avatarApp.put("/profile/avatar", verifyToken, updateProfileAvatar)
