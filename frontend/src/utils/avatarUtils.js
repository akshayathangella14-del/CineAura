/**
 * Resolve avatar image paths served from the Vite public folder.
 */
export const resolveAvatarUrl = (avatarImage) => {
  if (!avatarImage) return null
  if (avatarImage.startsWith('http://') || avatarImage.startsWith('https://')) {
    return avatarImage
  }
  return avatarImage
}
