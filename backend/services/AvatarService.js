import { UserModel } from '../models/UserModel.js'
import { getAvatarsList, findAvatar } from '../utils/avatarHelper.js'
import { buildAccountIdentityPayload } from '../utils/profileIdentityHelper.js'
import { canUseAvatar } from './identity/AvatarUnlockService.js'

// Get Avatars
export const getAvatars = async (req, res) => {
    try {
        res.status(200).json({
            message: "Avatars Fetched",
            payload: getAvatarsList()
        })
    } catch (err) {
        res.status(500).json({ message: "error", error: err.message })
    }
}

// Update Profile Avatar
export const updateProfileAvatar = async (req, res) => {
    try {
        const { avatarId } = req.body

        if (!avatarId) {
            return res.status(400).json({ message: "Avatar ID is required" })
        }

        const avatar = findAvatar(avatarId)

        if (!avatar) {
            return res.status(404).json({ message: "Avatar Not Found" })
        }

        const isUnlocked = await canUseAvatar(req.user._id, avatarId)

        if (!isUnlocked) {
            return res.status(403).json({ message: "Avatar is locked" })
        }

        const updatedUser = await UserModel.findByIdAndUpdate(
            req.user._id,
            {
                avatarId: avatar.avatarId,
                avatarName: avatar.avatarName,
                avatarImage: avatar.avatarImage
            },
            { new: true }
        ).select("-password")

        res.status(200).json({
            message: "Avatar Updated",
            payload: await buildAccountIdentityPayload(updatedUser)
        })
    } catch (err) {
        res.status(500).json({ message: "error", error: err.message })
    }
}
