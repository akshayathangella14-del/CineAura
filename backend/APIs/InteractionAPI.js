import exp from 'express'
import { verifyToken } from '../middlewares/verifyToken.js'
import { addInteraction } from '../services/InteractionService.js'

export const interactionApp = exp.Router()

// Add Interaction
interactionApp.post("/interactions", verifyToken, addInteraction)
