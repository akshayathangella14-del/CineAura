import exp from 'express'
import {
    getActors,
    getActor,
    getActorMovies,
    searchActors,
    getActorCredits
} from '../services/ActorService.js'

export const actorApp = exp.Router()

// Get Actors
actorApp.get("/api/actors", getActors)

// Search Actors
actorApp.get("/api/actors/search", searchActors)

// Actor Movies
actorApp.get("/api/actors/:id/movies", getActorMovies)

// Actor Credits & Images
actorApp.get("/api/actors/:id/credits", getActorCredits)

// Get Actor
actorApp.get("/api/actors/:id", getActor)

