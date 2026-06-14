import { UserModel } from '../models/UserModel.js'
import { MovieModel } from '../models/MovieModel.js'
import { ReviewModel } from '../models/ReviewModel.js'
import { WatchlistModel } from '../models/WatchlistModel.js'
import { syncMovies as syncMoviesOfService } from './MovieService.js'

// Update Movie Rating
const updateMovieRating = async (movieId) => {
    const reviewsList = await ReviewModel.find({ movie: movieId })

    const totalReviews = reviewsList.length
    const totalRating = reviewsList.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0

    await MovieModel.findByIdAndUpdate(
        movieId,
        { averageRating, totalReviews },
        { new: true }
    )
}

// Dashboard Data
export const getDashboard = async (req, res) => {
    try {
        const totalUsers = await UserModel.countDocuments()
        const totalMovies = await MovieModel.countDocuments()
        const totalReviews = await ReviewModel.countDocuments()
        const totalWatchlists = await WatchlistModel.countDocuments()

        res.status(200).json({
            message: "Dashboard Data",
            payload: {
                totalUsers,
                totalMovies,
                totalReviews,
                totalWatchlists
            }
        })
    } catch (err) {
        res.status(500).json({ message: "error", error: err.message })
    }
}

// Get Users
export const getUsers = async (req, res) => {
    try {
        const usersList = await UserModel.find()
            .select("username email role status createdAt")
            .sort({ createdAt: -1 })

        res.status(200).json({
            message: "Users Fetched",
            payload: usersList
        })
    } catch (err) {
        res.status(500).json({ message: "error", error: err.message })
    }
}

// Get Movies
export const getMovies = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1
        const limit = Number(req.query.limit) || 10
        const skip = (page - 1) * limit

        const moviesList = await MovieModel.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)

        res.status(200).json({
            message: "Movies Fetched",
            payload: moviesList
        })
    } catch (err) {
        res.status(500).json({ message: "error", error: err.message })
    }
}

// Get Reviews
export const getReviews = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1
        const limit = Number(req.query.limit) || 10
        const skip = (page - 1) * limit

        const reviewsList = await ReviewModel.find()
            .populate("user", "username email")
            .populate("movie", "title poster")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)

        res.status(200).json({
            message: "Reviews Fetched",
            payload: reviewsList
        })
    } catch (err) {
        res.status(500).json({ message: "error", error: err.message })
    }
}

// Update User Status
export const updateUserStatus = async (req, res) => {
    try {
        const { userId } = req.params
        const { status } = req.body

        if (status !== "ACTIVE" && status !== "BLOCKED") {
            return res.status(400).json({ message: "Invalid status" })
        }

        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { status },
            { new: true }
        ).select("username email role status createdAt")

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" })
        }

        res.status(200).json({
            message: status === "BLOCKED" ? "User Blocked" : "User Activated",
            payload: updatedUser
        })
    } catch (err) {
        res.status(500).json({ message: "error", error: err.message })
    }
}

// Delete Review
export const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params
        const review = await ReviewModel.findById(reviewId)

        if (!review) {
            return res.status(404).json({ message: "Review Not Found" })
        }

        const movieId = review.movie

        await ReviewModel.findByIdAndDelete(reviewId)
        await updateMovieRating(movieId)

        res.status(200).json({ message: "Review Deleted Successfully" })
    } catch (err) {
        res.status(500).json({ message: "error", error: err.message })
    }
}

// Sync Movies
export const syncMovies = async (req, res) => {
    await syncMoviesOfService(req, res)
}
