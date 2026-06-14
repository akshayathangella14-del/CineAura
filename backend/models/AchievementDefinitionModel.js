import { Schema, model } from 'mongoose'
import { ACHIEVEMENT_CATEGORIES } from '../config/identityTypes.js'

const achievementDefinitionSchema = new Schema({
    achievementId: {
        type: String,
        required: [true, 'achievementId is required'],
        unique: true,
        trim: true,
    },
    title: {
        type: String,
        required: [true, 'title is required'],
        trim: true,
    },
    description: {
        type: String,
        default: '',
        trim: true,
    },
    category: {
        type: String,
        enum: ACHIEVEMENT_CATEGORIES,
        default: 'account',
    },
    icon: {
        type: String,
        default: '',
        trim: true,
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

export const AchievementDefinitionModel = model('achievementDefinition', achievementDefinitionSchema)
