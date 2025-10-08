// Translation service using Google Translate API
class TranslationService {
  constructor() {
    this.cache = new Map();
  }

  // Note: We intentionally do NOT load the Google Translate Element script
  // to avoid any automatic, page-wide translation side effects. All
  // translation is handled via fetch to the unofficial translate endpoint
  // and applied only to targeted nodes.

  // Fallback translation using fetch API to Google Translate
  async translateText(text, targetLang = 'bn') {
    if (!text || text.trim() === '') return text;

    // Check cache first
    const cacheKey = `${text}_${targetLang}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      // Using a simple translation API approach
      const sourceLang = targetLang === 'bn' ? 'en' : 'bn';
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
      
      const response = await fetch(url);
      const result = await response.json();
      
      if (result && result[0] && result[0][0]) {
        const translatedText = result[0][0][0];
        this.cache.set(cacheKey, translatedText);
        return translatedText;
      }
    } catch (error) {
      console.warn('Translation failed, using fallback:', error);
      return this.getFallbackTranslation(text, targetLang);
    }

    return text;
  }

  // Fallback translations for common UI elements
  getFallbackTranslation(text, targetLang) {
    const translations = {
      'en_to_bn': {
        'HealthInfo': 'স্বাস্থ্য তথ্য',
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
        'স্বাস্থ্য তথ্য': 'HealthInfo',
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

  // Translate all text nodes in a DOM element
  async translateElement(element, targetLang) {
    if (!element) return;

    const textNodes = this.getTextNodes(element);
    const promises = textNodes.map(async (node) => {
      const originalText = node.textContent.trim();
      if (originalText && originalText.length > 0) {
        const translatedText = await this.translateText(originalText, targetLang);
        if (translatedText !== originalText) {
          node.textContent = translatedText;
        }
      }
    });

    await Promise.all(promises);
  }

  // Get all text nodes from an element
  getTextNodes(element) {
    const textNodes = [];
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          // Skip script, style, and other non-visible elements
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          
          const tagName = parent.tagName.toLowerCase();
          if (['script', 'style', 'noscript'].includes(tagName)) {
            return NodeFilter.FILTER_REJECT;
          }

          // Skip empty or whitespace-only text nodes
          if (!node.textContent.trim()) {
            return NodeFilter.FILTER_REJECT;
          }

          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    let node;
    while (node = walker.nextNode()) {
      textNodes.push(node);
    }

    return textNodes;
  }

  // Clear translation cache
  clearCache() {
    this.cache.clear();
  }
}

// Export singleton instance
export const translationService = new TranslationService();
