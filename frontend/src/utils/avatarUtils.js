/**
 * Resolve avatar image paths served from the Vite public folder.
 */
export const resolveAvatarUrl = (avatarImage) => {
  if (!avatarImage) return null
  if (avatarImage.startsWith('http://') || avatarImage.startsWith('https://')) {
    return avatarImage
  }
  
  // Extract just the filename in case the backend sends mismatched prefixes 
  // like 'avatar14.png', '/avatar14.png', or 'avatars/avatar14.png'
  const fileName = avatarImage.split('/').pop()
  
  // Force the exact absolute path that is proven to work on Vercel
  return `/avatars/${fileName}`
}
