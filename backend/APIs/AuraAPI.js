import exp from 'express'
import { verifyToken } from '../middlewares/verifyToken.js'
import {
    getAuraProfile,
    getAuraInsights
} from '../services/AuraService.js'

export const auraApp = exp.Router()

// Aura Profile
auraApp.get("/aura/profile", verifyToken, getAuraProfile)
auraApp.get("/aura", verifyToken, getAuraProfile)

// Aura Insights
auraApp.get("/aura/insights", verifyToken, getAuraInsights)
