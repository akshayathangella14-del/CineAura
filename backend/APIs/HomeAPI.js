import exp from 'express'
import { optionalToken, verifyToken } from '../middlewares/verifyToken.js'
import {
    getHomeSections,
    getContinueExploring
} from '../services/HomeService.js'

export const homeApp = exp.Router()

// Home Sections
homeApp.get("/home/sections", optionalToken, getHomeSections)

// Continue Exploring
homeApp.get("/continue-exploring", verifyToken, getContinueExploring)
