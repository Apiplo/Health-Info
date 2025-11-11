import { useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { translationService } from '../services/translationService';

/**
 * Custom hook for translating component content between English and Bangla
 * 
 * Usage: Attach the returned ref to the element you want to translate
 * Example: const ref = useTranslation(); return <div ref={ref}>Content</div>
 * 
 * @param {Array} deps - Optional dependency array to re-run translation when content changes
 * @returns {React.RefObject} - Ref to attach to the element to be translated
 */
export const useTranslation = (deps = []) => {
  const { currentLanguage, setIsTranslating } = useLanguage();
  const elementRef = useRef(null); // Reference to the DOM element to translate
  const originalContent = useRef(new Map()); // Store original English text for restoration

  // Effect runs whenever language changes or dependencies update
  useEffect(() => {
    const translateContent = async () => {
      if (!elementRef.current) return;

      setIsTranslating(true);
      try {
        if (currentLanguage === 'en') {
          // Switching to English: restore original content
          restoreOriginalContent(elementRef.current);
          storeOriginalContent(elementRef.current, { reset: true });
        } else {
          // Switching to Bangla: save original English first if not saved
          if (originalContent.current.size === 0) {
            storeOriginalContent(elementRef.current, { reset: true });
          }
          // Translate all text to Bangla
          await translationService.translateElement(elementRef.current, 'bn');
        }
      } catch (error) {
        console.error('Translation error:', error);
      } finally {
        setIsTranslating(false);
      }
    };

    // Small delay to ensure DOM is fully rendered before translating
    const timeoutId = setTimeout(translateContent, 100);
    return () => clearTimeout(timeoutId);
  }, [currentLanguage, setIsTranslating, ...deps]);

  // Store original English text before translation
  const storeOriginalContent = (element, { reset } = { reset: false }) => {
    if (reset) {
      originalContent.current.clear();
    }
    const textNodes = getTextNodes(element);
    // Save each text node's content with its index as key
    textNodes.forEach((node, index) => {
      originalContent.current.set(index, node.textContent);
    });
  };

  // Restore original English text from stored values
  const restoreOriginalContent = (element) => {
    const textNodes = getTextNodes(element);
    // Replace each text node with its saved original content
    textNodes.forEach((node, index) => {
      const originalText = originalContent.current.get(index);
      if (originalText !== undefined) {
        node.textContent = originalText;
      }
    });
  };

  /**
   * Get all text nodes from an element that should be translated
   * Filters out script tags, style tags, and elements marked with data-no-translate
   */
  const getTextNodes = (element) => {
    const textNodes = [];
    // TreeWalker efficiently traverses DOM to find text nodes
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

          // Skip elements with data-no-translate attribute (e.g., article titles, IDs)
          let el = parent;
          while (el) {
            if (el.hasAttribute && el.hasAttribute('data-no-translate')) {
              return NodeFilter.FILTER_REJECT;
            }
            el = el.parentElement;
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
  };

  return elementRef;
};
