/**
 * Video fallback configuration
 * 
 * Defines default YouTube videos to show when article videos are unavailable.
 * Each category has its own fallback video.
 * You can use full YouTube URLs or just the 11-character video ID.
 */
export const videoFallback = {
  default: 'pxwm3sqAytE',    // Default video when category doesn't match
  health: 'ZToicYcHIOU',      // Fallback for health articles
  technology: 'pxwm3sqAytE',  // Fallback for technology articles
  sport: 'ysz5S6PUM-U'        // Fallback for sport articles
};

/**
 * Extract YouTube video ID from various URL formats
 * 
 * Accepts:
 * - Full YouTube URL: https://www.youtube.com/watch?v=VIDEO_ID
 * - Short URL: https://youtu.be/VIDEO_ID
 * - Just the video ID: VIDEO_ID (11 characters)
 * 
 * @param {string} urlOrId - YouTube URL or video ID
 * @returns {string} - Extracted 11-character video ID, or empty string if invalid
 */
export function extractYouTubeId(urlOrId) {
  if (!urlOrId) return '';
  
  // If it's already a valid 11-character ID, return it
  if (/^[\w-]{11}$/.test(urlOrId)) return urlOrId;
  
  try {
    const url = new URL(urlOrId);
    
    // Extract from standard YouTube URL: youtube.com/watch?v=VIDEO_ID
    const idFromQuery = url.searchParams.get('v');
    if (idFromQuery && /^[\w-]{11}$/.test(idFromQuery)) return idFromQuery;
    
    // Extract from short YouTube URL: youtu.be/VIDEO_ID
    const pathPart = url.pathname.split('/').filter(Boolean).pop();
    if (pathPart && /^[\w-]{11}$/.test(pathPart)) return pathPart;
  } catch {}
  
  // Return empty string if no valid ID found
  return '';
}
