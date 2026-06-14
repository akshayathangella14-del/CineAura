import { REACTION_CONFIG } from './movieReactions'

export const buildReactionStats = (reactionCounts = {}) => {
  const entries = REACTION_CONFIG.map((item) => ({
    ...item,
    count: reactionCounts[item.value] || 0,
  }))

  const total = entries.reduce((sum, item) => sum + item.count, 0)

  const entriesWithPercent = entries.map((item) => ({
    ...item,
    percent: total > 0 ? Math.round((item.count / total) * 100) : 0,
  }))

  const sorted = [...entriesWithPercent].sort((a, b) => b.count - a.count)
  const dominant = total > 0 && sorted[0]?.count > 0 ? sorted[0] : null

  return {
    entries: entriesWithPercent,
    total,
    dominant,
    dominantLabel: dominant
      ? `Most viewers felt ${dominant.label}`
      : null,
  }
}
