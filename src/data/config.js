// Central place to control fallback YouTube videos per category
// You can paste full YouTube links (watch or youtu.be) or just the 11-char ID
export const videoFallback = {
  default: 'pxwm3sqAytE', // used when category not matched
  health: 'ZToicYcHIOU',
  technology: 'pxwm3sqAytE',
  sport: 'ysz5S6PUM-U'
};

// Helper: extract a YouTube video ID from URL or return the ID if already provided
export function extractYouTubeId(urlOrId) {
  if (!urlOrId) return '';
  // If it already looks like an ID
  if (/^[\w-]{11}$/.test(urlOrId)) return urlOrId;
  try {
    const url = new URL(urlOrId);
    // https://www.youtube.com/watch?v=VIDEOID
    const idFromQuery = url.searchParams.get('v');
    if (idFromQuery && /^[\w-]{11}$/.test(idFromQuery)) return idFromQuery;
    // https://youtu.be/VIDEOID
    const pathPart = url.pathname.split('/').filter(Boolean).pop();
    if (pathPart && /^[\w-]{11}$/.test(pathPart)) return pathPart;
  } catch {}
  return '';
}
