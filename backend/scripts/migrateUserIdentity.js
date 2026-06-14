import { config } from 'dotenv'
import { connectDB } from '../config/db.js'
import { UserModel } from '../models/UserModel.js'
import { initializeUserIdentity } from '../services/identity/IdentityInitializer.js'

config()

const migrateUserIdentity = async () => {
    await connectDB()

    const users = await UserModel.find().select('_id username')

    for (const user of users) {
        await initializeUserIdentity(user._id)
    }

    console.log(`User identity migration complete for ${users.length} users`)

    process.exit(0)
}

migrateUserIdentity().catch((err) => {
    console.error('User identity migration failed:', err)
    process.exit(1)
})
