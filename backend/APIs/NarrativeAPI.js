import exp from 'express'
import { verifyToken } from '../middlewares/verifyToken.js'
import {
    getRecommendationNarrative,
    getJourneyNarrative,
    getAuraNarrative,
    getPerfectPicksNarrative
} from '../services/NarrativeService.js'

export const narrativeApp = exp.Router()

// Recommendation Narrative
narrativeApp.get("/narrative/recommendation/:movieId", getRecommendationNarrative)

// Journey Narrative
narrativeApp.get("/narrative/journey/:movieId", getJourneyNarrative)

// Aura Narrative
narrativeApp.get("/narrative/aura", verifyToken, getAuraNarrative)

// Perfect Picks Narrative
narrativeApp.get("/narrative/perfect-picks", verifyToken, getPerfectPicksNarrative)
