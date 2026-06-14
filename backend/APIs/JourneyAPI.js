import exp from 'express'
import { verifyToken } from '../middlewares/verifyToken.js'
import {
    getMovieJourney,
    getUserJourney
} from '../services/JourneyService.js'

export const journeyApp = exp.Router()

// User Journey
journeyApp.get("/journey/user", verifyToken, getUserJourney)
journeyApp.get("/journey", verifyToken, getUserJourney)

// Movie Journey
journeyApp.get("/journey/:movieId", getMovieJourney)
