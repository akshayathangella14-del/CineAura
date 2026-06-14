import { Schema, model, Types } from 'mongoose'

const knownForSchema = new Schema({
    tmdbId: {
        type: Number
    },
    title: {
        type: String
    },
    poster: {
        type: String
    }
}, {
    versionKey: false,
    _id: false
})

const actorSchema = new Schema({
    tmdbId: {
        type: Number,
        required: [true, "TMDB actor ID is required"],
        unique: [true, "Actor already exists"]
    },
    name: {
        type: String,
        required: [true, "Actor name is required"]
    },
    biography: {
        type: String
    },
    birthday: {
        type: String
    },
    placeOfBirth: {
        type: String
    },
    profileImage: {
        type: String
    },
    profilePath: {
        type: String
    },
    profileOriginal: {
        type: String
    },
    knownFor: {
        type: [knownForSchema],
        default: []
    },
    popularity: {
        type: Number
    },
    movieCount: {
        type: Number,
        default: 0
    },
    movies: [{
        type: Types.ObjectId,
        ref: "movie"
    }]
}, {
    timestamps: true,
    versionKey: false,
    strict: "throw"
})

//create actor model
export const ActorModel = model("actor", actorSchema)
