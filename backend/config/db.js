import { connect } from 'mongoose'
import { MONGODB_URL } from './env.js'

// Database Connection
export const connectDB = async () => {
    try {
        if (!MONGODB_URL) {
            console.log("MONGODB_URL not found")
            return
        }

        await connect(MONGODB_URL)
        console.log("DB connected")
    } catch (err) {
        console.log("Error in DB connect", err)
    }
}
