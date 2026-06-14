import { Schema, model, Types } from 'mongoose'

const userAchievementSchema = new Schema({
    user: {
        type: Types.ObjectId,
        ref: 'user',
        required: [true, 'User ID required'],
    },
    achievementId: {
        type: String,
        required: [true, 'achievementId is required'],
        trim: true,
    },
    earnedAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
    versionKey: false,
    strict: 'throw',
})

userAchievementSchema.index({ user: 1, achievementId: 1 }, { unique: true })

export const UserAchievementModel = model('userAchievement', userAchievementSchema)
