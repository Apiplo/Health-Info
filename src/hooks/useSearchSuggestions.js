import { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { fetchSuggestions as fetchSuggestionsApi } from '../services/searchService';

/**
 * Hook to fetch debounced search suggestions from the backend.
 *
 * - Only fires when query length >= 2 (after trimming).
 * - Debounces network calls by ~250ms.
 * - Automatically uses the current UI language for the backend `lang` param.
 *
 * @param {string} query
 * @returns {{ suggestions: any[], loading: boolean }}
 */
export const useSearchSuggestions = (query) => {
  const { currentLanguage } = useLanguage();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = (query || '').trim();

    // Short-circuit: do not hit backend for very short queries
    if (q.length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const handle = setTimeout(async () => {
      try {
        const result = await fetchSuggestionsApi({
          query: q,
          lang: currentLanguage || 'en',
        });

        if (!cancelled) {
          setSuggestions(Array.isArray(result) ? result : []);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to load search suggestions', err);
        if (!cancelled) {
          setSuggestions([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }, 250); // debounce 250ms

    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [query, currentLanguage]);

  return { suggestions, loading };
};