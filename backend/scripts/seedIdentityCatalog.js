import { config } from 'dotenv'
import { connectDB } from '../config/db.js'
import { AchievementDefinitionModel } from '../models/AchievementDefinitionModel.js'
import { TitleDefinitionModel } from '../models/TitleDefinitionModel.js'
import { BadgeDefinitionModel } from '../models/BadgeDefinitionModel.js'
import { AvatarUnlockDefinitionModel } from '../models/AvatarUnlockDefinitionModel.js'
import {
    ACHIEVEMENT_DEFINITIONS,
    TITLE_DEFINITIONS,
    BADGE_DEFINITIONS,
    AVATAR_UNLOCK_DEFINITIONS,
} from '../config/identityCatalogSeed.js'

config()

const upsertCatalog = async (Model, keyField, records) => {
    let upserted = 0

    for (const record of records) {
        await Model.findOneAndUpdate(
            { [keyField]: record[keyField] },
            { $set: record },
            { upsert: true, returnDocument: 'after', runValidators: true }
        )
        upserted += 1
    }

    return upserted
}

const seedIdentityCatalog = async () => {
    await connectDB()

    const achievementCount = await upsertCatalog(
        AchievementDefinitionModel,
        'achievementId',
        ACHIEVEMENT_DEFINITIONS
    )
    const titleCount = await upsertCatalog(
        TitleDefinitionModel,
        'titleId',
        TITLE_DEFINITIONS
    )
    const badgeCount = await upsertCatalog(
        BadgeDefinitionModel,
        'badgeId',
        BADGE_DEFINITIONS
    )
    const avatarCount = await upsertCatalog(
        AvatarUnlockDefinitionModel,
        'avatarId',
        AVATAR_UNLOCK_DEFINITIONS
    )

    console.log('Identity catalog seeded successfully')
    console.log(`  achievements: ${achievementCount}`)
    console.log(`  titles: ${titleCount}`)
    console.log(`  badges: ${badgeCount}`)
    console.log(`  avatar unlock rules: ${avatarCount}`)

    process.exit(0)
}

seedIdentityCatalog().catch((err) => {
    console.error('Identity catalog seed failed:', err)
    process.exit(1)
})
