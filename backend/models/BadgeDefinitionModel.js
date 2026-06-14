import { Schema, model } from 'mongoose'
import { BADGE_RARITIES, UNLOCK_CONDITION_TYPES } from '../config/identityTypes.js'

const unlockConditionSchema = new Schema({
    type: {
        type: String,
        enum: UNLOCK_CONDITION_TYPES,
        required: true,
    },
    achievementId: { type: String },
    titleId: { type: String },
    badgeId: { type: String },
    seasonKey: { type: String },
    description: { type: String },
}, { _id: false })

const badgeDefinitionSchema = new Schema({
    badgeId: {
        type: String,
        required: [true, 'badgeId is required'],
        unique: true,
        trim: true,
    },
    badgeName: {
        type: String,
        required: [true, 'badgeName is required'],
        trim: true,
    },
    description: {
        type: String,
        default: '',
        trim: true,
    },
    icon: {
        type: String,
        default: '',
        trim: true,
    },
    rarity: {
        type: String,
        enum: BADGE_RARITIES,
        default: 'common',
    },
    unlockCondition: {
        type: unlockConditionSchema,
        required: [true, 'unlockCondition is required'],
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

export const BadgeDefinitionModel = model('badgeDefinition', badgeDefinitionSchema)
