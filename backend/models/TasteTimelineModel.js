import { Schema, model, Types } from 'mongoose'

const genreSnapshotSchema = new Schema({
    genre: {
        type: String
    },
    percentage: {
        type: Number
    }
}, {
    versionKey: false,
    _id: false
})

const tasteTimelineSchema = new Schema({
    user: {
        type: Types.ObjectId,
        ref: "user",
        required: [true, "User ID required"]
    },
    month: {
        type: String,
        required: [true, "Month is required"]
    },
    genres: {
        type: [genreSnapshotSchema],
        default: []
    }
}, {
    timestamps: true,
    versionKey: false,
    strict: "throw"
})

//create taste timeline model
export const TasteTimelineModel = model("tasteTimeline", tasteTimelineSchema)
