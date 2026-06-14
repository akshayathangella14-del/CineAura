import { Schema, model } from 'mongoose'
import { UNLOCK_CONDITION_TYPES } from '../config/identityTypes.js'

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

const titleDefinitionSchema = new Schema({
    titleId: {
        type: String,
        required: [true, 'titleId is required'],
        unique: true,
        trim: true,
    },
    titleName: {
        type: String,
        required: [true, 'titleName is required'],
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

export const TitleDefinitionModel = model('titleDefinition', titleDefinitionSchema)
