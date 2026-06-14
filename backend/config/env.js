import { config } from 'dotenv'

config()

// Environment Variables
export const PORT = process.env.PORT || 5000
export const MONGODB_URL = process.env.MONGODB_URL
export const JWT_SECRET = process.env.JWT_SECRET
export const TMDB_API_KEY = process.env.TMDB_API_KEY
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY
export const TENSORFLOW_SERVICE_URL = process.env.TENSORFLOW_SERVICE_URL
export const TOKEN_EXPIRE = process.env.TOKEN_EXPIRE || "1d"
export const COOKIE_NAME = process.env.COOKIE_NAME || "token"
