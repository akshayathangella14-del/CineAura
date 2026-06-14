export const REACTION_CONFIG = [
  { value: 'Loved It', emoji: '❤️', label: 'Loved It' },
  { value: 'Intense', emoji: '⚡', label: 'Intense' },
  { value: 'Mind Blown', emoji: '🧠', label: 'Mind Blown' },
  { value: 'Emotional', emoji: '🎭', label: 'Emotional' },
  { value: 'Favorite', emoji: '⭐', label: 'Favorite' },
]

export const getReactionEmoji = (reaction) =>
  REACTION_CONFIG.find((item) => item.value === reaction)?.emoji || '✨'
