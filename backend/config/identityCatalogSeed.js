import { IDENTITY_MILESTONES } from './identityMilestones.js'

export const ACHIEVEMENT_DEFINITIONS = [
    {
        achievementId: 'first_review',
        title: 'First Review',
        description: 'Publish your first movie review on CineAura.',
        category: 'reviews',
        icon: 'achievement:first_review',
        sortOrder: 10,
    },
    {
        achievementId: 'reaction_master',
        title: 'Reaction Master',
        description: `Leave reactions on ${IDENTITY_MILESTONES.REACTIONS} different films.`,
        category: 'reactions',
        icon: 'achievement:reaction_master',
        sortOrder: 20,
    },
    {
        achievementId: 'movie_collector',
        title: 'Movie Collector',
        description: `Save ${IDENTITY_MILESTONES.MOVIE_COLLECTOR} films to your personal collection.`,
        category: 'collection',
        icon: 'achievement:movie_collector',
        sortOrder: 30,
    },
    {
        achievementId: 'watchlist_builder',
        title: 'Watchlist Builder',
        description: `Curate ${IDENTITY_MILESTONES.WATCHLIST_BUILDER} films on your watchlist.`,
        category: 'watchlist',
        icon: 'achievement:watchlist_builder',
        sortOrder: 40,
    },
    {
        achievementId: 'account_established',
        title: 'Account Established',
        description: 'Complete your CineAura account setup.',
        category: 'account',
        icon: 'achievement:account_established',
        sortOrder: 50,
    },
]

export const TITLE_DEFINITIONS = [
    {
        titleId: 'explorer',
        titleName: 'Explorer',
        description: 'A member discovering the CineAura universe.',
        icon: 'title:explorer',
        unlockCondition: {
            type: 'default',
            description: 'Your founding title — granted to every CineAura member.',
        },
        sortOrder: 10,
    },
    {
        titleId: 'reviewer',
        titleName: 'Reviewer',
        description: 'Voices opinions that help the community decide.',
        icon: 'title:reviewer',
        unlockCondition: {
            type: 'achievement',
            achievementId: 'first_review',
            description: 'Publish your first review to earn the voice of a true Reviewer.',
        },
        sortOrder: 20,
    },
    {
        titleId: 'collector',
        titleName: 'Collector',
        description: 'Builds a personal library of films to revisit.',
        icon: 'title:collector',
        unlockCondition: {
            type: 'achievement',
            achievementId: 'movie_collector',
            description: `Preserve ${IDENTITY_MILESTONES.MOVIE_COLLECTOR} saved films to claim the Collector title.`,
        },
        sortOrder: 30,
    },
    {
        titleId: 'curator',
        titleName: 'Curator',
        description: 'Shapes a watchlist with intention and care.',
        icon: 'title:curator',
        unlockCondition: {
            type: 'achievement',
            achievementId: 'watchlist_builder',
            description: `Shape a watchlist of ${IDENTITY_MILESTONES.WATCHLIST_BUILDER} films to earn the Curator title.`,
        },
        sortOrder: 40,
    },
    {
        titleId: 'pioneer',
        titleName: 'Pioneer',
        description: 'An early identity marker for dedicated members.',
        icon: 'title:pioneer',
        unlockCondition: {
            type: 'achievement',
            achievementId: 'account_established',
            description: 'Establish your CineAura account to join the pioneers.',
        },
        sortOrder: 50,
    },
]

export const BADGE_DEFINITIONS = [
    {
        badgeId: 'member_badge',
        badgeName: 'CineAura Member',
        description: 'The foundational identity badge for every account.',
        icon: 'badge:member',
        rarity: 'common',
        unlockCondition: {
            type: 'default',
            description: 'Your first badge — earned the moment you join CineAura.',
        },
        sortOrder: 10,
    },
    {
        badgeId: 'first_review_badge',
        badgeName: 'First Review',
        description: 'Awarded for publishing your first review.',
        icon: 'badge:first_review',
        rarity: 'uncommon',
        unlockCondition: {
            type: 'achievement',
            achievementId: 'first_review',
            description: 'Share your first review and earn this mark of a critic.',
        },
        sortOrder: 20,
    },
    {
        badgeId: 'reaction_master_badge',
        badgeName: 'Reaction Master',
        description: 'Awarded for expressive engagement with films.',
        icon: 'badge:reaction_master',
        rarity: 'rare',
        unlockCondition: {
            type: 'achievement',
            achievementId: 'reaction_master',
            description: `React to ${IDENTITY_MILESTONES.REACTIONS} films and prove your emotional range.`,
        },
        sortOrder: 30,
    },
    {
        badgeId: 'collector_badge',
        badgeName: 'Collector',
        description: 'Awarded for building a strong saved-film collection.',
        icon: 'badge:collector',
        rarity: 'epic',
        unlockCondition: {
            type: 'achievement',
            achievementId: 'movie_collector',
            description: `Save ${IDENTITY_MILESTONES.MOVIE_COLLECTOR} films and earn the Collector badge.`,
        },
        sortOrder: 40,
    },
    {
        badgeId: 'curator_badge',
        badgeName: 'Curator',
        description: 'Awarded for intentional watchlist curation.',
        icon: 'badge:curator',
        rarity: 'legendary',
        unlockCondition: {
            type: 'achievement',
            achievementId: 'watchlist_builder',
            description: `Curate ${IDENTITY_MILESTONES.WATCHLIST_BUILDER} watchlist picks with purpose.`,
        },
        sortOrder: 50,
    },
]

const DEFAULT_AVATAR_IDS = ['avatar1', 'avatar2', 'avatar3', 'avatar4', 'avatar5']

const buildAvatarUnlockDefinitions = () => {
    const definitions = []

    for (let index = 1; index <= 30; index += 1) {
        const avatarId = `avatar${index}`
        const isDefault = DEFAULT_AVATAR_IDS.includes(avatarId)

        if (isDefault) {
            definitions.push({
                avatarId,
                unlockType: 'default',
                isDefault: true,
                unlockCondition: {
                    type: 'default',
                    description: 'Your founding identity — available to every CineAura member.',
                },
                sortOrder: index,
            })
            continue
        }

        if (index <= 10) {
            definitions.push({
                avatarId,
                unlockType: 'achievement',
                isDefault: false,
                unlockCondition: {
                    type: 'achievement',
                    achievementId: 'first_review',
                    description: 'Voice your first review and claim this cinematic identity.',
                },
                sortOrder: index,
            })
            continue
        }

        if (index <= 15) {
            definitions.push({
                avatarId,
                unlockType: 'title',
                isDefault: false,
                unlockCondition: {
                    type: 'title',
                    titleId: 'reviewer',
                    description: 'Earn the Reviewer title to recruit this identity.',
                },
                sortOrder: index,
            })
            continue
        }

        if (index <= 20) {
            definitions.push({
                avatarId,
                unlockType: 'badge',
                isDefault: false,
                unlockCondition: {
                    type: 'badge',
                    badgeId: 'collector_badge',
                    description: 'Collectors who preserve cinematic discoveries unlock this avatar.',
                },
                sortOrder: index,
            })
            continue
        }

        if (index <= 25) {
            definitions.push({
                avatarId,
                unlockType: 'seasonal',
                seasonKey: 'launch_season',
                isDefault: false,
                unlockCondition: {
                    type: 'seasonal',
                    seasonKey: 'launch_season',
                    description: 'A limited-season identity for members who answer the call of a special event.',
                },
                sortOrder: index,
            })
            continue
        }

        definitions.push({
            avatarId,
            unlockType: 'manual',
            isDefault: false,
            unlockCondition: {
                type: 'manual',
                description: 'A rare identity reserved for extraordinary members.',
            },
            sortOrder: index,
        })
    }

    return definitions
}

export const AVATAR_UNLOCK_DEFINITIONS = buildAvatarUnlockDefinitions()
