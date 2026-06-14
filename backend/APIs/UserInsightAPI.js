import exp from 'express'
import { verifyToken } from '../middlewares/verifyToken.js'
import { getSimilarUsers } from '../services/UserSimilarityService.js'
import { getTasteTimeline } from '../services/TasteTimelineService.js'

export const userInsightApp = exp.Router()

// Similar Users
userInsightApp.get("/api/users/:id/similar-users", verifyToken, getSimilarUsers)

// Taste Timeline
userInsightApp.get("/api/users/:id/taste-timeline", verifyToken, getTasteTimeline)
