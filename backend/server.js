import exp from 'express'
import { config } from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { connectDB } from './config/db.js'
import { userApp } from './APIs/UserAPI.js'
import { actorApp } from './APIs/ActorAPI.js'
import { avatarApp } from './APIs/AvatarAPI.js'
import { movieApp } from './APIs/MovieAPI.js'
import { reviewApp } from './APIs/ReviewAPI.js'
import { watchlistApp } from './APIs/WatchlistAPI.js'
import { reactionApp } from './APIs/ReactionAPI.js'
import { feedbackApp } from './APIs/FeedbackAPI.js'
import { adminApp } from './APIs/AdminAPI.js'
import { recommendationApp } from './APIs/RecommendationAPI.js'
import { journeyApp } from './APIs/JourneyAPI.js'
import { auraApp } from './APIs/AuraAPI.js'
import { perfectPicksApp } from './APIs/PerfectPicksAPI.js'
import { narrativeApp } from './APIs/NarrativeAPI.js'
import { interactionApp } from './APIs/InteractionAPI.js'
import { homeApp } from './APIs/HomeAPI.js'
import { userInsightApp } from './APIs/UserInsightAPI.js'
import { profileIdentityApp } from './APIs/ProfileIdentityAPI.js'
import { recommendationAnalyticsApp } from './APIs/RecommendationAnalyticsAPI.js'
import { notFound } from './middlewares/notFound.js'
import { errorHandler } from './middlewares/errorHandler.js'

config()
const app = exp()

app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'https://cine-aura-6jojbkavs-akshayathangella14-dels-projects.vercel.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

//body parser middleware
app.use(exp.json())
app.use(cookieParser())

app.use((req, res, next) => {
    console.log("REQUEST:", req.method, req.originalUrl)
    next()
})

//root route
app.get("/", (req, res) => {
    res.status(200).json({ message: "Welcome to CineAura API" })
})

app.get("/test123", (req, res) => {
    res.json({
        success: true,
        route: "/test123"
    })
})

//render test route
app.get("/render-check", (req, res) => {
    res.status(200).json({
        status: "render-check-ok",
        timestamp: Date.now()
    })
})

app.get("/version", (req, res) => {
    res.json({
        version: "2026-06-14-test"
    })
})

//health route
app.get("/health", (req, res) => {
    res.status(200).json({ message: "CineAura server is running" })
})

//api routes
app.use(userApp)
app.use(profileIdentityApp)
app.use(actorApp)
app.use(avatarApp)
app.use(movieApp)
app.use(reviewApp)
app.use(watchlistApp)
app.use(reactionApp)
app.use(feedbackApp)
app.use(adminApp)
app.use(recommendationApp)
app.use(journeyApp)
app.use(auraApp)
app.use(perfectPicksApp)
app.use(narrativeApp)
app.use(interactionApp)
app.use(homeApp)
app.use(userInsightApp)
app.use(recommendationAnalyticsApp)

//error middlewares
app.use(notFound)
app.use(errorHandler)

//assign port
const port = process.env.PORT || 5000

//connect to db
const startServer = async () => {
    await connectDB()
    app.listen(port, () => console.log(`server listening on ${port}..`))
}

startServer()
