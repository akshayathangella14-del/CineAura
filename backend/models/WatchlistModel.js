import { Schema, model, Types } from 'mongoose'

const watchlistSchema = new Schema({
    user: {
        type: Types.ObjectId,
        ref: "user",
        required: [true, "User ID required"]
    },
    movie: {
        type: Types.ObjectId,
        ref: "movie",
        required: [true, "Movie ID required"]
    }
}, {
    timestamps: true,
    versionKey: false,
    strict: "throw"
})

//create watchlist model
export const WatchlistModel = model("watchlist", watchlistSchema)
