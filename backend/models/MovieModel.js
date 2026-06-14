import { Schema, model, Types } from 'mongoose'

const castSchema = new Schema({
    actor: {
        type: Types.ObjectId,
        ref: "actor"
    },
    tmdbId: {
        type: Number
    },
    name: {
        type: String
    },
    character: {
        type: String
    },
    profileImageUrl: {
        type: String
    },
    profilePath: {
        type: String
    },
    profileOriginal: {
        type: String
    }
}, {
    versionKey: false,
    _id: false
})

const streamingProviderSchema = new Schema({
    providerName: {
        type: String
    },
    logoUrl: {
        type: String
    },
    watchUrl: {
        type: String
    },
    type: {
        type: String
    }
}, {
    versionKey: false,
    _id: false
})

const movieSchema = new Schema({
    tmdbId: {
        type: Number,
        required: [true, "TMDB ID is required"],
        unique: [true, "Movie already exists"]
    },
    title: {
        type: String,
        required: [true, "Title is required"]
    },
    overview: {
        type: String
    },
    shortDescription: {
        type: String
    },
    genres: {
        type: [String],
        default: []
    },
    language: {
        type: String
    },
    spokenLanguages: {
        type: [String],
        default: []
    },
    subtitleLanguages: {
        type: [String],
        default: []
    },
    productionCountries: {
        type: [String],
        default: []
    },
    status: {
        type: String
    },
    releaseDate: {
        type: String
    },
    releaseYear: {
        type: Number
    },
    runtime: {
        type: Number
    },
    rating: {
        type: Number
    },
    averageRating: {
        type: Number,
        default: 0
    },
    totalReviews: {
        type: Number,
        default: 0
    },
    voteCount: {
        type: Number
    },
    popularity: {
        type: Number
    },
    poster: {
        type: String
    },
    posterPath: {
        type: String
    },
    posterOriginal: {
        type: String
    },
    backdrop: {
        type: String
    },
    backdropPath: {
        type: String
    },
    backdropOriginal: {
        type: String
    },
    trailer: {
        type: String
    },
    trailerKey: {
        type: String
    },
    trailerEmbedUrl: {
        type: String
    },
    cast: {
        type: [castSchema],
        default: []
    },
    directors: {
        type: [String],
        default: []
    },
    writers: {
        type: [String],
        default: []
    },
    crew: {
        type: [String],
        default: []
    },
    providers: {
        type: [streamingProviderSchema],
        default: []
    },
    keywords: {
        type: [String],
        default: []
    }
}, {
    timestamps: true,
    versionKey: false,
    strict: "throw"
})

// Add indexes for recommendation queries
movieSchema.index({ popularity: -1, averageRating: -1 })
movieSchema.index({ genres: 1, popularity: -1 })
movieSchema.index({ language: 1 })
movieSchema.index({ directors: 1 })
movieSchema.index({ "cast.name": 1 })

//create movie model
export const MovieModel = model("movie", movieSchema)
