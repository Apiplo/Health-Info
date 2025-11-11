import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * Language Context - manages application language state (English/Bangla)
 * Provides language switching functionality and translation state
 */
const LanguageContext = createContext();

/**
 * Custom hook to access language context
 * Must be used within a LanguageProvider
 * @returns {Object} - Language context with currentLanguage, toggleLanguage, etc.
 */
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

/**
 * Language Provider Component
 * Wraps the app to provide language state to all components
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export const LanguageProvider = ({ children }) => {
  // Current language: 'en' for English, 'bn' for Bangla
  const [currentLanguage, setCurrentLanguage] = useState('en');
  // Flag to indicate if translation is in progress
  const [isTranslating, setIsTranslating] = useState(false);

  /**
   * Toggle between English and Bangla
   * Saves the preference to localStorage for persistence
   */
  const toggleLanguage = () => {
    const newLanguage = currentLanguage === 'en' ? 'bn' : 'en';
    setCurrentLanguage(newLanguage);
    // Save language preference so it persists across page reloads
    localStorage.setItem('selectedLanguage', newLanguage);
  };

  // Load saved language preference when component mounts
  useEffect(() => {
    const savedLanguage = localStorage.getItem('selectedLanguage');
    // Only set if it's a valid language code
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'bn')) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  // Context value provided to all child components
  const value = {
    currentLanguage,        // Current language code ('en' or 'bn')
    setCurrentLanguage,     // Function to set language directly
    toggleLanguage,         // Function to toggle between languages
    isTranslating,          // Boolean indicating if translation is in progress
    setIsTranslating,       // Function to update translation state
    isEnglish: currentLanguage === 'en',  // Helper boolean for English
    isBangla: currentLanguage === 'bn'    // Helper boolean for Bangla
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
