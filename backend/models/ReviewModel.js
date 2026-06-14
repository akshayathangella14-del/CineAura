import { Schema, model, Types } from 'mongoose'

const reviewSchema = new Schema({
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
    rating: {
        type: Number,
        required: [true, "Rating is required"],
        min: 1,
        max: 5
    },
    reviewText: {
        type: String,
        minlength: [5, "Review must be at least 5 characters"]
    },
    title: {
        type: String,
        maxlength: [120, "Review title cannot exceed 120 characters"]
    },
    containsSpoiler: {
        type: Boolean,
        default: false
    },
    helpfulBy: {
        type: [Types.ObjectId],
        ref: "user",
        default: []
    },
    notHelpfulBy: {
        type: [Types.ObjectId],
        ref: "user",
        default: []
    }
}, {
    timestamps: true,
    versionKey: false,
    strict: "throw"
})

//create review model
export const ReviewModel = model("review", reviewSchema)
