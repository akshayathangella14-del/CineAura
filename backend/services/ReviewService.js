import { ReviewModel } from '../models/ReviewModel.js'
import { MovieModel } from '../models/MovieModel.js'
import { InteractionModel } from '../models/InteractionModel.js'
import { TitleDefinitionModel } from '../models/TitleDefinitionModel.js'
import { processReviewIdentityUnlocks } from './identity/IdentityEventService.js'

const USER_POPULATE_FIELDS = 'username avatarImage avatarName profileImageUrl currentTitle'

const buildTitleNameMap = async (reviews) => {
    const titleIds = new Set()

    for (const review of reviews) {
        if (review.user?.currentTitle) {
            titleIds.add(review.user.currentTitle)
        }
    }

    if (!titleIds.size) return new Map()

    const definitions = await TitleDefinitionModel.find({
        titleId: { $in: [...titleIds] },
        isActive: true,
    }).select('titleId titleName').lean()

    return new Map(definitions.map((definition) => [definition.titleId, definition.titleName]))
}

const formatReview = (review, currentUserId = null, titleNameMap = new Map()) => {
    const helpfulCount = review.helpfulBy?.length || 0
    const notHelpfulCount = review.notHelpfulBy?.length || 0
    let userVote = null

    if (currentUserId) {
        const uid = String(currentUserId)
        if (review.helpfulBy?.some((id) => String(id) === uid)) userVote = "helpful"
        if (review.notHelpfulBy?.some((id) => String(id) === uid)) userVote = "not_helpful"
    }

    return {
        _id: review._id,
        userId: review.user?._id || review.user,
        username: review.user?.username,
        avatarImage: review.user?.avatarImage || review.user?.profileImageUrl || null,
        avatarName: review.user?.avatarName || null,
        profileTitle: titleNameMap.get(review.user?.currentTitle) || null,
        rating: review.rating,
        title: review.title || "",
        reviewText: review.reviewText,
        containsSpoiler: !!review.containsSpoiler,
        helpfulCount,
        notHelpfulCount,
        userVote,
        createdAt: review.createdAt
    }
}

const sortReviews = (reviews, sort = "newest") => {
    const list = [...reviews]

    if (sort === "helpful") {
        return list.sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0))
    }

    if (sort === "rating") {
        return list.sort((a, b) => b.rating - a.rating || new Date(b.createdAt) - new Date(a.createdAt))
    }

    if (sort === "oldest") {
        return list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    }

    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

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

// Add Review
export const addReview = async (req, res) => {
    try {
        const { movieId, rating, reviewText, title, containsSpoiler } = req.body

        if (!movieId || !rating) {
            return res.status(400).json({ message: "Movie and rating are required" })
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" })
        }

        if (reviewText && reviewText.length < 5) {
            return res.status(400).json({ message: "Review must be at least 5 characters" })
        }

        const movie = isNaN(movieId)
            ? await MovieModel.findById(movieId)
            : await MovieModel.findOne({ tmdbId: Number(movieId) })

        if (!movie) {
            return res.status(404).json({ message: "Movie Not Found" })
        }

        const reviewOfDB = await ReviewModel.findOne({
            user: req.user._id,
            movie: movie._id
        })

        if (reviewOfDB) {
            return res.status(409).json({ message: "You already reviewed this movie" })
        }

        const newReview = new ReviewModel({
            user: req.user._id,
            movie: movie._id,
            rating,
            reviewText,
            title: title?.trim() || "",
            containsSpoiler: !!containsSpoiler
        })

        await newReview.save()
        await updateMovieRating(movie._id)

        const newInteraction = new InteractionModel({
            user: req.user._id,
            movie: movie._id,
            interactionType: "rating",
            weight: 5,
            source: "review",
            metadata: { rating }
        })

        await newInteraction.save()

        await processReviewIdentityUnlocks(req.user._id)

        const populated = await ReviewModel.findById(newReview._id)
            .populate("user", USER_POPULATE_FIELDS)

        const titleNameMap = await buildTitleNameMap([populated])

        res.status(201).json({
            message: "Review Added Successfully",
            payload: formatReview(populated, req.user._id, titleNameMap)
        })
    } catch (err) {
        res.status(500).json({ message: "error", error: err.message })
    }
}

// Get Reviews
export const getMovieReviews = async (req, res) => {
    try {
        const { movieId } = req.params

        const movie = isNaN(movieId)
            ? await MovieModel.findById(movieId)
            : await MovieModel.findOne({ tmdbId: Number(movieId) })

        if (!movie) {
            return res.status(404).json({ message: "Movie Not Found" })
        }

        const { sort = "newest" } = req.query

        let reviewsList = await ReviewModel.find({ movie: movie._id })
            .populate("user", USER_POPULATE_FIELDS)

        if (sort === "following") {
            reviewsList = []
        }

        const titleNameMap = await buildTitleNameMap(reviewsList)

        const reviews = sortReviews(
            reviewsList.map((review) => formatReview(review, req.user?._id, titleNameMap)),
            sort
        )

        res.status(200).json({
            message: "Reviews Fetched",
            payload: reviews
        })
    } catch (err) {
        res.status(500).json({ message: "error", error: err.message })
    }
}

// Update Review
export const updateReview = async (req, res) => {
    try {
        const { reviewId } = req.params
        const { rating, reviewText, title, containsSpoiler } = req.body

        if (rating === undefined && !reviewText && title === undefined && containsSpoiler === undefined) {
            return res.status(400).json({ message: "Nothing to update" })
        }

        if (rating !== undefined && (rating < 1 || rating > 5)) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" })
        }

        if (reviewText && reviewText.length < 5) {
            return res.status(400).json({ message: "Review must be at least 5 characters" })
        }

        const review = await ReviewModel.findById(reviewId)

        if (!review) {
            return res.status(404).json({ message: "Review Not Found" })
        }

        if (String(review.user) !== String(req.user._id)) {
            return res.status(403).json({ message: "You are not authorised" })
        }

        if (rating !== undefined) review.rating = rating
        if (reviewText) review.reviewText = reviewText
        if (title !== undefined) review.title = title?.trim() || ""
        if (containsSpoiler !== undefined) review.containsSpoiler = !!containsSpoiler

        await review.save()
        await updateMovieRating(review.movie)

        if (rating !== undefined) {
            const newInteraction = new InteractionModel({
                user: req.user._id,
                movie: review.movie,
                interactionType: "rating",
                weight: 5,
                source: "review-update",
                metadata: { rating }
            })

            await newInteraction.save()
        }

        const populated = await ReviewModel.findById(review._id)
            .populate("user", USER_POPULATE_FIELDS)

        const titleNameMap = await buildTitleNameMap([populated])

        res.status(200).json({
            message: "Review Updated Successfully",
            payload: formatReview(populated, req.user._id, titleNameMap)
        })
    } catch (err) {
        res.status(500).json({ message: "error", error: err.message })
    }
}

// Vote Review
export const voteReview = async (req, res) => {
    try {
        const { reviewId } = req.params
        const { vote } = req.body

        if (!["helpful", "not_helpful", "clear"].includes(vote)) {
            return res.status(400).json({ message: "Invalid vote type" })
        }

        const review = await ReviewModel.findById(reviewId)

        if (!review) {
            return res.status(404).json({ message: "Review Not Found" })
        }

        const userId = req.user._id

        if (String(review.user) === String(userId)) {
            return res.status(403).json({ message: "You cannot vote on your own review" })
        }
        review.helpfulBy = (review.helpfulBy || []).filter((id) => String(id) !== String(userId))
        review.notHelpfulBy = (review.notHelpfulBy || []).filter((id) => String(id) !== String(userId))

        if (vote === "helpful") {
            review.helpfulBy.push(userId)
        } else if (vote === "not_helpful") {
            review.notHelpfulBy.push(userId)
        }

        await review.save()

        const populated = await ReviewModel.findById(review._id)
            .populate("user", USER_POPULATE_FIELDS)

        const titleNameMap = await buildTitleNameMap([populated])

        res.status(200).json({
            message: "Vote Recorded",
            payload: formatReview(populated, req.user._id, titleNameMap)
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

        if (String(review.user) !== String(req.user._id)) {
            return res.status(403).json({ message: "You are not authorised" })
        }

        const movieId = review.movie
        await ReviewModel.findByIdAndDelete(reviewId)
        await updateMovieRating(movieId)

        res.status(200).json({ message: "Review Deleted Successfully" })
    } catch (err) {
        res.status(500).json({ message: "error", error: err.message })
    }
}
