import exp from 'express'
import { verifyToken } from '../middlewares/verifyToken.js'
import { verifyAdmin } from '../middlewares/verifyAdmin.js'
import {
    getDashboard,
    getUsers,
    getMovies,
    getReviews,
    updateUserStatus,
    deleteReview,
    syncMovies
} from '../services/AdminService.js'

export const adminApp = exp.Router()

// Dashboard Data
adminApp.get("/admin/dashboard", verifyToken, verifyAdmin, getDashboard)

// Get Users
adminApp.get("/admin/users", verifyToken, verifyAdmin, getUsers)

// Get Movies
adminApp.get("/admin/movies", verifyToken, verifyAdmin, getMovies)

// Get Reviews
adminApp.get("/admin/reviews", verifyToken, verifyAdmin, getReviews)

// Update User Status
adminApp.patch("/admin/users/:userId/status", verifyToken, verifyAdmin, updateUserStatus)

// Delete Review
adminApp.delete("/admin/reviews/:reviewId", verifyToken, verifyAdmin, deleteReview)

// Sync Movies
adminApp.post("/admin/movies/sync", verifyToken, verifyAdmin, syncMovies)
