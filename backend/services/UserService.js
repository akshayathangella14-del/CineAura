import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { UserModel } from '../models/UserModel.js'
import { jwtSecret, tokenExpire } from '../config/jwt.js'
import { COOKIE_NAME } from '../config/env.js'
import { buildAccountIdentityPayload } from '../utils/profileIdentityHelper.js'
import { initializeUserIdentity } from './identity/IdentityInitializer.js'
const { hash, compare } = bcrypt
const { sign } = jwt

// User Registration
export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email and password are required" })
        }

        const userOfDB = await UserModel.findOne({ email })

        if (userOfDB) {
            return res.status(409).json({ message: "Email already exists" })
        }

        const hashedPassword = await hash(password, 10)

        const newUser = new UserModel({
            username: name,
            email,
            password: hashedPassword
        })

        await newUser.save()
        await initializeUserIdentity(newUser._id)

        const registeredUser = await UserModel.findById(newUser._id).select('-password')

        res.status(201).json({
            message: "User registered successfully",
            payload: await buildAccountIdentityPayload(registeredUser)
        })
    } catch (err) {
        res.status(500).json({ message: "error", error: err.message })
    }
}

// User Login
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" })
        }

        const user = await UserModel.findOne({ email })

        if (!user || !(await compare(password, user.password))) {
            return res.status(401).json({ message: "Invalid Credentials" })
        }

        if (user.status === "BLOCKED") {
            return res.status(403).json({ message: "Your account is blocked by admin" })
        }

        const token = sign(
            { id: user._id, email: user.email, role: user.role },
            jwtSecret,
            { expiresIn: tokenExpire }
        )

        res.cookie(COOKIE_NAME, token, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production"
        })

        const loggedInUser = await UserModel.findById(user._id).select('-password')

        res.status(200).json({
            message: "Login Successful",
            token: token,
            payload: {
                ...(await buildAccountIdentityPayload(loggedInUser)),
                status: user.status,
            }
        })
    } catch (err) {
        res.status(500).json({ message: "error", error: err.message })
    }
}

// Get User Profile — account identity only (no Aura / Journey analytics)
export const getProfile = async (req, res) => {
    try {
        res.status(200).json({
            message: "Profile fetched successfully",
            payload: await buildAccountIdentityPayload(req.user)
        })
    } catch (err) {
        res.status(500).json({ message: "error", error: err.message })
    }
}

// Update Profile
export const updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body

        if (!name && !email) {
            return res.status(400).json({ message: "Nothing to update" })
        }

        if (email) {
            const userOfDB = await UserModel.findOne({ email })

            if (userOfDB && String(userOfDB._id) !== String(req.user._id)) {
                return res.status(409).json({ message: "Email already exists" })
            }
        }

        const updatedData = {}

        if (name) updatedData.username = name
        if (email) updatedData.email = email

        const updatedUser = await UserModel.findByIdAndUpdate(
            req.user._id,
            { $set: updatedData },
            { new: true }
        ).select("-password")

        res.status(200).json({
            message: "Profile updated successfully",
            payload: await buildAccountIdentityPayload(updatedUser)
        })
    } catch (err) {
        res.status(500).json({ message: "error", error: err.message })
    }
}

// User Logout
export const logoutUser = async (req, res) => {
    try {
        res.clearCookie(COOKIE_NAME, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production"
        })

        res.status(200).json({ message: "Logged out successfully" })
    } catch (err) {
        res.status(500).json({ message: "error", error: err.message })
    }
}
