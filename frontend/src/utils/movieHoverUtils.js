/**
 * Extract recommendation copy from a movie or recommendation payload.
 * Returns null when no real evidence exists — never invent copy.
 */
export const getRecommendationReason = (item, fallbackReason = null) => {
  if (fallbackReason) return fallbackReason
  if (!item) return null
  if (item.reason) return item.reason
  if (item.explanation) return item.explanation
  const reasons = item.recommendationReasons
  if (Array.isArray(reasons) && reasons.length > 0) return reasons[0]
  return null
}

/**
 * Secondary insight line — only when additional evidence exists in payload.
 */
export const getAuraInsight = (item) => {
  if (!item) return null

  const reasons = item.recommendationReasons
  if (Array.isArray(reasons) && reasons.length > 1) {
    const secondary = reasons.find((r) => r && r !== item.reason)
    if (secondary) return secondary
  }

  if (item.explanation && item.explanation !== item.reason) {
    return item.explanation
  }

  return null
}

export const getHoverStats = (item, reactionCounts = null) => {
  const stats = []
  const reactionTotal = reactionCounts
    ? Object.values(reactionCounts).reduce((sum, n) => sum + (Number(n) || 0), 0)
    : 0

  if (reactionTotal > 0) {
    stats.push({ emoji: '❤️', label: `${reactionTotal} reactions` })
  }

  const reviewCount = item?.totalReviews
  if (reviewCount > 0) {
    stats.push({ emoji: '📝', label: `${reviewCount} reviews` })
  }

  const rating = item?.rating || item?.voteAverage
  if (rating > 0) {
    stats.push({ emoji: '⭐', label: `${Number(rating).toFixed(1)} TMDB` })
  }

  return stats
}

export const isTouchDevice = () =>
  typeof window !== 'undefined'
  && window.matchMedia('(hover: none) and (pointer: coarse)').matches
