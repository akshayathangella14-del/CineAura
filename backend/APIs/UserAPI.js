import exp from 'express'
import { verifyToken } from '../middlewares/verifyToken.js'
import {
    registerUser,
    loginUser,
    getProfile,
    updateProfile,
    logoutUser
} from '../services/UserService.js'

export const userApp = exp.Router()

// User Registration
userApp.post("/register", registerUser)

// User Login
userApp.post("/login", loginUser)

// Get User Profile
userApp.get("/profile", verifyToken, getProfile)

// Update Profile
userApp.put("/profile", verifyToken, updateProfile)

// User Logout
userApp.post("/logout", logoutUser)
