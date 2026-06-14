// CineAura Local Storage Helpers
// Type-safe localStorage wrapper with JSON support

/**
 * Get an item from localStorage with JSON parsing
 * @param {string} key - Storage key
 * @param {*} fallback - Fallback value if key doesn't exist or parse fails
 * @returns {*} Parsed value or fallback
 */
export const getItem = (key, fallback = null) => {
  try {
    const item = localStorage.getItem(key)
    if (item === null) return fallback
    return JSON.parse(item)
  } catch {
    return fallback
  }
}

/**
 * Set an item in localStorage with JSON stringification
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 */
export const setItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`CineAura Storage: Failed to set "${key}"`, error)
  }
}

/**
 * Remove an item from localStorage
 * @param {string} key - Storage key
 */
export const removeItem = (key) => {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error(`CineAura Storage: Failed to remove "${key}"`, error)
  }
}

/**
 * Clear all CineAura-related items from localStorage
 */
export const clearAll = () => {
  try {
    const keys = Object.keys(localStorage)
    keys.forEach((key) => {
      if (key.startsWith('cineaura_')) {
        localStorage.removeItem(key)
      }
    })
  } catch (error) {
    console.error('CineAura Storage: Failed to clear storage', error)
  }
}
