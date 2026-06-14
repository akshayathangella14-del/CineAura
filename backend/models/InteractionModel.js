import { Schema, model, Types } from 'mongoose'

const interactionSchema = new Schema({
    user: {
        type: Types.ObjectId,
        ref: "user",
        required: [true, "User ID required"]
    },
    movie: {
        type: Types.ObjectId,
        ref: "movie"
    },
    interactionType: {
        type: String,
        enum: [
            "viewed",
            "clicked",
            "rated",
            "searched",
            "watchlisted",
            "reviewed",
            "watched",
            "journey",
            "perfect-picks",
            "movie_open",
            "movie_hover",
            "movie_click",
            "search_query",
            "watchlist_add",
            "reaction",
            "rating",
            "not_interested"
        ],
        required: [true, "Interaction type is required"]
    },
    query: {
        type: String
    },
    weight: {
        type: Number,
        default: 1
    },
    source: {
        type: String
    },
    metadata: {
        type: Schema.Types.Mixed
    }
}, {
    timestamps: true,
    versionKey: false,
    strict: "throw"
})

// Add indexes for recommendation aggregations
interactionSchema.index({ user: 1, interactionType: 1 })
interactionSchema.index({ movie: 1, interactionType: 1, createdAt: -1 })
interactionSchema.index({ interactionType: 1, createdAt: -1 })

//create interaction model
export const InteractionModel = model("interaction", interactionSchema)
