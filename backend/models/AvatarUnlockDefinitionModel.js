import { Schema, model } from 'mongoose'
import { AVATAR_UNLOCK_TYPES } from '../config/identityTypes.js'

const unlockConditionSchema = new Schema({
    type: {
        type: String,
        enum: AVATAR_UNLOCK_TYPES,
        required: true,
    },
    achievementId: { type: String },
    titleId: { type: String },
    badgeId: { type: String },
    seasonKey: { type: String },
    description: { type: String },
}, { _id: false })

const avatarUnlockDefinitionSchema = new Schema({
    avatarId: {
        type: String,
        required: [true, 'avatarId is required'],
        unique: true,
        trim: true,
    },
    unlockType: {
        type: String,
        enum: AVATAR_UNLOCK_TYPES,
        default: 'default',
    },
    unlockCondition: {
        type: unlockConditionSchema,
        required: [true, 'unlockCondition is required'],
    },
    seasonKey: {
        type: String,
        trim: true,
    },
    isDefault: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    sortOrder: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
    versionKey: false,
    strict: 'throw',
})

export const AvatarUnlockDefinitionModel = model('avatarUnlockDefinition', avatarUnlockDefinitionSchema)
