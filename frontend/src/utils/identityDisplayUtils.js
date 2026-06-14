/**
 * Display helpers for profile identity data from the backend.
 * Uses API fields only — no hardcoded catalog entries.
 */

export const getUnlockConditionLabel = (unlockCondition) => {
  if (!unlockCondition) return null
  return unlockCondition.description || null
}

export const getIdentityIconFamily = (iconKey = '') => {
  const [family] = String(iconKey).split(':')
  return family || 'default'
}

export const getRarityClassName = (rarity) => {
  if (!rarity) return 'identity-rarity--common'
  return `identity-rarity--${String(rarity).toLowerCase()}`
}

export const formatEarnedDate = (earnedAt, formatDate) => {
  if (!earnedAt || typeof formatDate !== 'function') return null
  return formatDate(earnedAt, { month: 'short', day: 'numeric', year: 'numeric' })
}
