// CineAura Formatters
// Utility functions for formatting display data

/**
 * Format a date string to a readable format
 * @param {string} dateString - ISO date string
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date
 */
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options,
    })
  } catch {
    return dateString
  }
}

/**
 * Format runtime minutes to hours and minutes
 * @param {number} minutes - Runtime in minutes
 * @returns {string} Formatted runtime (e.g., "2h 49m")
 */
export const formatRuntime = (minutes) => {
  if (!minutes || minutes <= 0) return ''
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins}m`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}

/**
 * Format rating to one decimal place
 * @param {number} rating - Rating value
 * @returns {string} Formatted rating (e.g., "8.4")
 */
export const formatRating = (rating) => {
  if (rating === null || rating === undefined) return '–'
  return Number(rating).toFixed(1)
}

/**
 * Format large numbers with K/M suffix
 * @param {number} num - Number to format
 * @returns {string} Formatted number (e.g., "36K")
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0'
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`
  return num.toString()
}

/**
 * Truncate text to a maximum length with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum character count
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 120) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '…'
}

/**
 * Build a TMDB image URL at the desired size
 * @param {string} path - TMDB image path (e.g., "/poster.jpg")
 * @param {string} size - TMDB image size (e.g., "w500", "original")
 * @returns {string} Full image URL
 */
export const getImageUrl = (path, size = 'original') => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `https://image.tmdb.org/t/p/${size}${path}`
}

/**
 * Get year from a date string or releaseYear
 * @param {string|number} dateOrYear - Date string or year number
 * @returns {string} Year string
 */
export const getYear = (dateOrYear) => {
  if (!dateOrYear) return ''
  if (typeof dateOrYear === 'number') return dateOrYear.toString()
  try {
    return new Date(dateOrYear).getFullYear().toString()
  } catch {
    return ''
  }
}

/**
 * Standardized person image formatter to gracefully resolve broken or multiple image path fields
 * @param {object} person - The actor/director object
 * @param {string} size - TMDB image size
 * @returns {string|null} Resolved image URL or null
 */
export const getPersonImage = (person, size = 'w500') => {
  if (!person) return null
  const path = person.profileImageUrl || person.profileImage || person.profilePath || person.profileOriginal || person.avatar || person.photo
  if (!path) return null
  return getImageUrl(path, size)
}

/**
 * Format language code to full name
 * @param {string} code - ISO language code
 * @returns {string} Full language name
 */
const LANGUAGE_NAMES = {
  hi: 'Hindi',
  en: 'English',
  ta: 'Tamil',
  te: 'Telugu',
  ml: 'Malayalam',
  kn: 'Kannada',
  ko: 'Korean',
  ja: 'Japanese',
  fr: 'French',
  es: 'Spanish',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  ru: 'Russian',
  zh: 'Chinese',
  ar: 'Arabic',
}

export const formatLanguage = (code) => {
  if (!code) return ''
  if (typeof code === 'string' && code.length > 3) return code
  return LANGUAGE_NAMES[code.toLowerCase()] || code.toUpperCase()
}

export const formatLanguageList = (languages = []) => {
  if (!Array.isArray(languages)) return []

  return [...new Set(
    languages
      .map((item) => formatLanguage(item))
      .filter(Boolean)
  )]
}
