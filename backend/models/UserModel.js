import { Schema, model, Types } from 'mongoose'

const userSchema = new Schema({
    username: {
        type: String,
        required: [true, "Username is required"]
    },
    email: {
        type: String,
        required: [true, "Email required"],
        unique: [true, "Email already exists"]
    },
    password: {
        type: String,
        required: [true, "Password required"]
    },
    profileImageUrl: {
        type: String
    },
    avatarId: {
        type: String
    },
    avatarName: {
        type: String
    },
    avatarImage: {
        type: String
    },
    currentTitle: {
        type: String,
        default: null,
    },
    equippedBadge: {
        type: String,
        default: null,
    },
    unlockedTitles: {
        type: [String],
        default: [],
    },
    unlockedBadges: {
        type: [String],
        default: [],
    },
    unlockedAvatars: {
        type: [String],
        default: [],
    },
    role: {
        type: String,
        enum: ["USER", "ADMIN"],
        default: "USER"
    },
    status: {
        type: String,
        enum: ["ACTIVE", "BLOCKED"],
        default: "ACTIVE"
    },
    favoriteGenres: {
        type: [String],
        default: []
    },
    favoriteLanguages: {
        type: [String],
        default: []
    },
    favoriteMoods: {
        type: [String],
        default: []
    },
    watchlistCount: {
        type: Number,
        default: 0
    },
    reviewCount: {
        type: Number,
        default: 0
    },
    auraProfile: {
        type: String
    },
    journeyMovies: [{
        type: Types.ObjectId,
        ref: "movie"
    }]
}, {
    timestamps: true,
    versionKey: false,
    strict: "throw"
})

//create user model
export const UserModel = model("user", userSchema)
