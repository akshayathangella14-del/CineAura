import exp from 'express'
import { verifyToken } from '../middlewares/verifyToken.js'
import { getTensorFlowRecommendations } from '../services/TensorFlowService.js'

export const tensorFlowApp = exp.Router()

// TensorFlow Recommendations
tensorFlowApp.get("/api/tensorflow/recommendations", verifyToken, getTensorFlowRecommendations)
