import exp from 'express'
import { verifyToken } from '../middlewares/verifyToken.js'
import { getPerfectPicks } from '../services/PerfectPicksService.js'

export const perfectPicksApp = exp.Router()

// Perfect Picks
perfectPicksApp.get("/perfect-picks", verifyToken, getPerfectPicks)
