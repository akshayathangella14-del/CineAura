import { Schema, model, Types } from 'mongoose'

const feedbackSchema = new Schema({
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
    feedback: {
        type: String,
        enum: ["PERFECT_MATCH", "ENJOYED", "MIXED", "NOT_FOR_ME"],
        required: [true, "Feedback is required"]
    }
}, {
    timestamps: true,
    versionKey: false,
    strict: "throw"
})

//create feedback model
export const FeedbackModel = model("feedback", feedbackSchema)
