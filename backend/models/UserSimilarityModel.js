import { Schema, model, Types } from 'mongoose'

const userSimilaritySchema = new Schema({
    user: {
        type: Types.ObjectId,
        ref: "user",
        required: [true, "User ID required"]
    },
    similarUser: {
        type: Types.ObjectId,
        ref: "user",
        required: [true, "Similar user ID required"]
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

//create user similarity model
export const UserSimilarityModel = model("userSimilarity", userSimilaritySchema)
