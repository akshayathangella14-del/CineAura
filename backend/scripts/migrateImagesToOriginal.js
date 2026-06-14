import mongoose from 'mongoose'
import { connectDB } from '../config/db.js'
import { MONGODB_URL } from '../config/env.js'
import { tmdbImageUrl } from '../config/tmdb.js'
import { MovieModel } from '../models/MovieModel.js'
import { ActorModel } from '../models/ActorModel.js'

// Original Image URL
const getOriginalImage = (path) => {
    if (!path) return ""

    return `${tmdbImageUrl}/original${path}`
}

// Replace Image Size
const replaceImageSize = (url) => {
    if (!url) return ""

    return url
        .replace("/w185/", "/original/")
        .replace("/w342/", "/original/")
        .replace("/w500/", "/original/")
        .replace("/w780/", "/original/")
        .replace("/w1280/", "/original/")
}

// Migrate Movie Images
const migrateMovieImages = async () => {
    const moviesList = await MovieModel.find()
    let updatedMovies = 0

    for (const movie of moviesList) {
        if (movie.posterPath) {
            movie.poster = getOriginalImage(movie.posterPath)
            movie.posterOriginal = getOriginalImage(movie.posterPath)
        } else {
            movie.poster = replaceImageSize(movie.poster)
            movie.posterOriginal = replaceImageSize(movie.posterOriginal)
        }

        if (movie.backdropPath) {
            movie.backdrop = getOriginalImage(movie.backdropPath)
            movie.backdropOriginal = getOriginalImage(movie.backdropPath)
        } else {
            movie.backdrop = replaceImageSize(movie.backdrop)
            movie.backdropOriginal = replaceImageSize(movie.backdropOriginal)
        }

        for (const castMember of movie.cast || []) {
            if (castMember.profilePath) {
                castMember.profileImageUrl = getOriginalImage(castMember.profilePath)
                castMember.profileOriginal = getOriginalImage(castMember.profilePath)
            } else {
                castMember.profileImageUrl = replaceImageSize(castMember.profileImageUrl)
                castMember.profileOriginal = replaceImageSize(castMember.profileOriginal)
            }
        }

        for (const provider of movie.providers || []) {
            provider.logoUrl = replaceImageSize(provider.logoUrl)
        }

        await movie.save()
        updatedMovies++
    }

    return updatedMovies
}

// Migrate Actor Images
const migrateActorImages = async () => {
    const actorsList = await ActorModel.find()
    let updatedActors = 0

    for (const actor of actorsList) {
        if (actor.profilePath) {
            actor.profileImage = getOriginalImage(actor.profilePath)
            actor.profileOriginal = getOriginalImage(actor.profilePath)
        } else {
            actor.profileImage = replaceImageSize(actor.profileImage)
            actor.profileOriginal = replaceImageSize(actor.profileOriginal)
        }

        for (const movie of actor.knownFor || []) {
            movie.poster = replaceImageSize(movie.poster)
        }

        await actor.save()
        updatedActors++
    }

    return updatedActors
}

// Image Migration
const migrateImagesToOriginal = async () => {
    try {
        if (!MONGODB_URL) {
            console.log("MONGODB_URL not found")
            return
        }

        await connectDB()

        const updatedMovies = await migrateMovieImages()
        const updatedActors = await migrateActorImages()

        console.log("Image migration completed")
        console.log(`Movies Updated: ${updatedMovies}`)
        console.log(`Actors Updated: ${updatedActors}`)
    } catch (err) {
        console.log("Image migration failed", err.message)
    } finally {
        await mongoose.connection.close()
    }
}

migrateImagesToOriginal()
