import { Schema, model, Types } from 'mongoose'

const recommendationAnalyticsSchema = new Schema({
    user: {
        type: Types.ObjectId,
        ref: "user",
        required: [true, "User ID required"]
    },
    movie: {
        type: Types.ObjectId,
        ref: "movie",
        required: [true, "Movie ID required"]
    },
    action: {
        type: String,
        enum: ["shown", "clicked", "opened", "watched", "saved", "ignored"],
        required: [true, "Recommendation action is required"]
    },
    source: {
        type: String,
        default: "hybrid"
    },
    score: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    versionKey: false,
    strict: "throw"
})

//create recommendation analytics model
export const RecommendationAnalyticsModel = model("recommendationAnalytics", recommendationAnalyticsSchema)
