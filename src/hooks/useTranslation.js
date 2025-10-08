import { useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { translationService } from '../services/translationService';

// Custom hook for handling translation of components
// Optionally pass a dependency array to re-run translation when content changes
export const useTranslation = (deps = []) => {
  const { currentLanguage, setIsTranslating } = useLanguage();
  const elementRef = useRef(null);
  const originalContent = useRef(new Map());

  useEffect(() => {
    const translateContent = async () => {
      if (!elementRef.current) return;

      setIsTranslating(true);
      try {
        if (currentLanguage === 'en') {
          // When in English, restore any previous translation and refresh originals
          restoreOriginalContent(elementRef.current);
          storeOriginalContent(elementRef.current, { reset: true });
        } else {
          // Ensure originals are stored before translating if not already
          if (originalContent.current.size === 0) {
            storeOriginalContent(elementRef.current, { reset: true });
          }
          // Translate to Bangla
          await translationService.translateElement(elementRef.current, 'bn');
        }
      } catch (error) {
        console.error('Translation error:', error);
      } finally {
        setIsTranslating(false);
      }
    };

    // Add small delay to ensure DOM is ready
    const timeoutId = setTimeout(translateContent, 100);
    return () => clearTimeout(timeoutId);
  }, [currentLanguage, setIsTranslating, ...deps]);

  const storeOriginalContent = (element, { reset } = { reset: false }) => {
    if (reset) {
      originalContent.current.clear();
    }
    const textNodes = getTextNodes(element);
    textNodes.forEach((node, index) => {
      originalContent.current.set(index, node.textContent);
    });
  };

  const restoreOriginalContent = (element) => {
    const textNodes = getTextNodes(element);
    textNodes.forEach((node, index) => {
      const originalText = originalContent.current.get(index);
      if (originalText !== undefined) {
        node.textContent = originalText;
      }
    });
  };

  const getTextNodes = (element) => {
    const textNodes = [];
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          
          const tagName = parent.tagName.toLowerCase();
          if (['script', 'style', 'noscript'].includes(tagName)) {
            return NodeFilter.FILTER_REJECT;
          }

          // Skip nodes inside containers explicitly marked to avoid translation
          let el = parent;
          while (el) {
            if (el.hasAttribute && el.hasAttribute('data-no-translate')) {
              return NodeFilter.FILTER_REJECT;
            }
            el = el.parentElement;
          }

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
  };

  return elementRef;
};
