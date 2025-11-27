const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';

/**
 * @typedef {'articles'|'categories'|'tags'} SuggestionType
 */

/**
 * Fetch search suggestions from the backend.
 *
 * Mirrors the GET /api/search/suggestions contract.
 *
 * @param {Object} params
 * @param {string} params.query - User search text
 * @param {string} [params.lang='en'] - Language code
 * @param {number} [params.limit=10] - Overall max suggestions
 * @param {number} [params.perTypeLimit=5] - Per-type max
 * @param {SuggestionType[]} [params.types=['articles','categories','tags']] - Types to include
 * @returns {Promise<any[]>}
 */
export async function fetchSuggestions({
  query,
  lang = 'en',
  limit = 10,
  perTypeLimit = 5,
  types = ['articles', 'categories', 'tags'],
}) {
  const q = (query || '').trim();
  if (!q) return [];

  const params = new URLSearchParams();
  params.set('q', q);
  params.set('limit', String(limit));
  params.set('perTypeLimit', String(perTypeLimit));
  params.set('types', types.join(','));
  params.set('lang', lang);

  const url = `${API_BASE}/search/suggestions?${params.toString()}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      // eslint-disable-next-line no-console
      console.error('Search suggestions request failed', res.status);
      return [];
    }

    const data = await res.json();
    if (data && Array.isArray(data.suggestions)) {
      return data.suggestions;
    }

    return [];
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Search suggestions request error', err);
    return [];
  }
}