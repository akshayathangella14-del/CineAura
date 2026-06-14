import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const IMAGE_EXT = /\.(png|jpe?g|webp|svg)$/i

const AVATAR_METADATA = {
    avatar1: { avatarName: 'Moon Wanderer', category: 'Founding' },
    avatar2: { avatarName: 'Storm Rider', category: 'Founding' },
    avatar3: { avatarName: 'Crimson Sentinel', category: 'Founding' },
    avatar4: { avatarName: 'Forest Guardian', category: 'Founding' },
    avatar5: { avatarName: 'Silent Avenger', category: 'Founding' },
    avatar6: { avatarName: 'The Rebel King', category: 'Voice' },
    avatar7: { avatarName: 'Shadow Hunter', category: 'Voice' },
    avatar8: { avatarName: 'Iron Protector', category: 'Voice' },
    avatar9: { avatarName: 'Phoenix Seeker', category: 'Voice' },
    avatar10: { avatarName: 'Desert Phantom', category: 'Voice' },
    avatar11: { avatarName: 'Night Archivist', category: 'Reviewer' },
    avatar12: { avatarName: 'Velvet Critic', category: 'Reviewer' },
    avatar13: { avatarName: 'Silver Orator', category: 'Reviewer' },
    avatar14: { avatarName: 'Frame Witness', category: 'Reviewer' },
    avatar15: { avatarName: 'Premiere Scholar', category: 'Reviewer' },
    avatar16: { avatarName: 'Vault Keeper', category: 'Collector' },
    avatar17: { avatarName: 'Archive Sovereign', category: 'Collector' },
    avatar18: { avatarName: 'Reel Curator', category: 'Collector' },
    avatar19: { avatarName: 'Cinema Archivist', category: 'Collector' },
    avatar20: { avatarName: 'Heritage Keeper', category: 'Collector' },
    avatar21: { avatarName: 'Launch Voyager', category: 'Seasonal' },
    avatar22: { avatarName: 'Eclipse Patron', category: 'Seasonal' },
    avatar23: { avatarName: 'Starfall Envoy', category: 'Seasonal' },
    avatar24: { avatarName: 'Dawn Celebrant', category: 'Seasonal' },
    avatar25: { avatarName: 'Horizon Elite', category: 'Seasonal' },
    avatar26: { avatarName: 'Legend Bearer', category: 'Elite' },
    avatar27: { avatarName: 'Mythic Warden', category: 'Elite' },
    avatar28: { avatarName: 'Eternal Luminary', category: 'Elite' },
    avatar29: { avatarName: 'Vanguard Specter', category: 'Elite' },
    avatar30: { avatarName: 'Apex Chronicler', category: 'Elite' },
}

const AVATAR_DIRECTORIES = [
    path.resolve(__dirname, '../../frontend/public/avatars'),
    path.resolve(__dirname, '../../frontend/src/assets/avatars'),
]

const formatAvatarName = (avatarId) =>
    avatarId
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase())

const buildAvatarRecord = (avatarId, fileName, publicPath = '/avatars') => {
    const meta = AVATAR_METADATA[avatarId] || {}

    return {
        avatarId,
        avatarName: meta.avatarName || formatAvatarName(avatarId),
        avatarImage: `${publicPath}/${fileName}`,
        category: meta.category || 'CineAura',
    }
}

const discoverAvatarsFromDisk = () => {
    const discovered = new Map()

    for (const directory of AVATAR_DIRECTORIES) {
        if (!fs.existsSync(directory)) continue

        for (const fileName of fs.readdirSync(directory)) {
            if (!IMAGE_EXT.test(fileName)) continue

            const avatarId = path.parse(fileName).name
            if (discovered.has(avatarId)) continue

            const publicPath = directory.includes(`${path.sep}public${path.sep}avatars`)
                ? '/avatars'
                : '/src/assets/avatars'

            discovered.set(avatarId, buildAvatarRecord(avatarId, fileName, publicPath))
        }
    }

    return Array.from(discovered.values()).sort((a, b) => a.avatarId.localeCompare(b.avatarId))
}

export const getAvatarsList = () => {
    const discovered = discoverAvatarsFromDisk()
    if (discovered.length > 0) return discovered

    return Object.entries(AVATAR_METADATA).map(([avatarId, meta]) => ({
        avatarId,
        avatarName: meta.avatarName,
        avatarImage: `/avatars/${avatarId}.png`,
        category: meta.category,
    }))
}

export const findAvatar = (avatarId) => {
    const avatarsList = getAvatarsList()

    for (const avatar of avatarsList) {
        if (avatar.avatarId === avatarId) {
            return avatar
        }
    }

    return null
}
