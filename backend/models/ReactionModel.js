import { Schema, model, Types } from 'mongoose'

const reactionSchema = new Schema({
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
    reaction: {
        type: String,
        enum: ["Intense", "Loved It", "Mind Blown", "Emotional", "Favorite"],
        required: [true, "Reaction is required"]
    }
}, {
    timestamps: true,
    versionKey: false,
    strict: "throw"
})

reactionSchema.index({ user: 1, movie: 1 }, { unique: true })

//create reaction model
export const ReactionModel = model("reaction", reactionSchema)
