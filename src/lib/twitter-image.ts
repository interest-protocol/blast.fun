/**
 * Utility to get high-quality Twitter profile images
 * Uses fxtwitter API for reliable image URLs
 */

/**
 * Get high-quality Twitter avatar URL
 * Handles various Twitter image URL formats and upgrades them to 400x400
 */
export function getHighQualityTwitterAvatar(imageUrl: string | null): string | null {
  if (!imageUrl) return null
  
  // Already high quality
  if (imageUrl.includes('_400x400')) return imageUrl
  
  // Replace all size variants with highest quality
  return imageUrl
    .replace(/_normal\.(jpg|jpeg|png|gif|webp)/i, '_400x400.$1')
    .replace(/_bigger\.(jpg|jpeg|png|gif|webp)/i, '_400x400.$1') 
    .replace(/_mini\.(jpg|jpeg|png|gif|webp)/i, '_400x400.$1')
    .replace(/_200x200\.(jpg|jpeg|png|gif|webp)/i, '_400x400.$1')
    .replace(/_reasonably_small\.(jpg|jpeg|png|gif|webp)/i, '_400x400.$1')
    // Handle URLs without size suffix
    .replace(/(\d+)\.(jpg|jpeg|png|gif|webp)$/i, '$1_400x400.$2')
}

/**
 * Extract Twitter user ID from profile image URL
 * Twitter image URLs contain the user ID in the path
 */
export function extractTwitterIdFromImageUrl(imageUrl: string): string | null {
  const match = imageUrl.match(/profile_images\/(\d+)\//)
  return match ? match[1] : null
}