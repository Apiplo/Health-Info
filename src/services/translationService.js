/**
 * Translation Service - handles text translation between English and Bangla
 * Uses Google Translate API for translation with caching for better performance
 */
class TranslationService {
  constructor() {
    // Cache to store translated text and avoid repeated API calls
    this.cache = new Map();
  }

  /**
   * Note: This service uses direct API calls to Google Translate
   * We do NOT use the Google Translate Element widget to avoid automatic
   * page-wide translation. Instead, we manually translate specific elements.
   */

  /**
   * Translate text from one language to another
   * @param {string} text - Text to translate
   * @param {string} targetLang - Target language code ('bn' for Bangla, 'en' for English)
   * @returns {string} - Translated text
   */
  async translateText(text, targetLang = 'bn') {
    if (!text || text.trim() === '') return text;

    // Check if translation is already cached
    const cacheKey = `${text}_${targetLang}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      // Determine source language (opposite of target)
      const sourceLang = targetLang === 'bn' ? 'en' : 'bn';
      
      // Call Google Translate API (unofficial endpoint)
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
      
      const response = await fetch(url);
      const result = await response.json();
      
      // Extract translated text from response
      if (result && result[0] && result[0][0]) {
        const translatedText = result[0][0][0];
        // Save to cache for future use
        this.cache.set(cacheKey, translatedText);
        return translatedText;
      }
    } catch (error) {
      // If API fails, use hardcoded fallback translations
      console.warn('Translation failed, using fallback:', error);
      return this.getFallbackTranslation(text, targetLang);
    }

    return text;
  }

  /**
   * Fallback translations for common UI elements
   * Used when API translation fails
   * @param {string} text - Text to translate
   * @param {string} targetLang - Target language
   * @returns {string} - Translated text or original if no match found
   */
  getFallbackTranslation(text, targetLang) {
    const translations = {
      'en_to_bn': {
        'BlogInfo': 'ব্লগ তথ্য',
        'Health': 'স্বাস্থ্য',
        'Technology': 'প্রযুক্তি',
        'Sport': 'খেলাধুলা',
        'Login': 'লগইন',
        'Sign Up': 'সাইন আপ',
        'Logout': 'লগআউট',
        'Search...': 'অনুসন্ধান...',
        'Loading...': 'লোড হচ্ছে...',
        'Comments': 'মন্তব্য',
        'Post Comment': 'মন্তব্য পোস্ট করুন',
        'Write your comment...': 'আপনার মন্তব্য লিখুন...',
        'Please login to comment': 'মন্তব্য করতে লগইন করুন',
        'No comments yet. Be the first to comment!': 'এখনও কোন মন্তব্য নেই। প্রথম মন্তব্য করুন!',
        'Posting...': 'পোস্ট করা হচ্ছে...',
        'Comprehensive Cardiac Checkup': 'সম্পূর্ণ হৃদরোগ পরীক্ষা',
        'Save 30% this month. Schedule a preventive heart screening and take control of your health.': 'এই মাসে ৩০% সাশ্রয় করুন। প্রতিরোধমূলক হার্ট স্ক্রিনিং এর সময় নির্ধারণ করুন এবং আপনার স্বাস্থ্যের নিয়ন্ত্রণ নিন।'
      },
      'bn_to_en': {
        'ব্লগ তথ্য': 'BlogInfo',
        'স্বাস্থ্য': 'Health',
        'প্রযুক্তি': 'Technology',
        'খেলাধুলা': 'Sport',
        'লগইন': 'Login',
        'সাইন আপ': 'Sign Up',
        'লগআউট': 'Logout',
        'অনুসন্ধান...': 'Search...',
        'লোড হচ্ছে...': 'Loading...',
        'মন্তব্য': 'Comments',
        'মন্তব্য পোস্ট করুন': 'Post Comment',
        'আপনার মন্তব্য লিখুন...': 'Write your comment...',
        'মন্তব্য করতে লগইন করুন': 'Please login to comment',
        'এখনও কোন মন্তব্য নেই। প্রথম মন্তব্য করুন!': 'No comments yet. Be the first to comment!',
        'পোস্ট করা হচ্ছে...': 'Posting...',
        'সম্পূর্ণ হৃদরোগ পরীক্ষা': 'Comprehensive Cardiac Checkup'
      }
    };

    const translationKey = targetLang === 'bn' ? 'en_to_bn' : 'bn_to_en';
    return translations[translationKey][text] || text;
  }

  /**
   * Translate all text content within a DOM element
   * @param {HTMLElement} element - DOM element to translate
   * @param {string} targetLang - Target language code
   */
  async translateElement(element, targetLang) {
    if (!element) return;

    // Get all text nodes that should be translated
    const textNodes = this.getTextNodes(element);
    
    // Translate each text node in parallel
    const promises = textNodes.map(async (node) => {
      const originalText = node.textContent.trim();
      if (originalText && originalText.length > 0) {
        const translatedText = await this.translateText(originalText, targetLang);
        // Only update if translation is different
        if (translatedText !== originalText) {
          node.textContent = translatedText;
        }
      }
    });

    // Wait for all translations to complete
    await Promise.all(promises);
  }

  /**
   * Get all text nodes from a DOM element
   * Filters out script tags, style tags, and empty text
   * @param {HTMLElement} element - DOM element to search
   * @returns {Array} - Array of text nodes
   */
  getTextNodes(element) {
    const textNodes = [];
    
    // TreeWalker efficiently finds all text nodes in the DOM
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          
          // Skip script, style, and noscript tags
          const tagName = parent.tagName.toLowerCase();
          if (['script', 'style', 'noscript'].includes(tagName)) {
            return NodeFilter.FILTER_REJECT;
          }

          // Skip empty or whitespace-only text
          if (!node.textContent.trim()) {
            return NodeFilter.FILTER_REJECT;
          }

          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    // Collect all valid text nodes
    let node;
    while (node = walker.nextNode()) {
      textNodes.push(node);
    }

    return textNodes;
  }

  /**
   * Clear the translation cache
   * Useful when you want to force fresh translations
   */
  clearCache() {
    // Clear the cache to force fresh translations
    this.cache.clear();
  }
}

// Create and export a single instance of the translation service
export const translationService = new TranslationService();
