// Import React and language context
import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import './LanguageToggle.css';

// Language toggle button component - switches between English and Bangla
const LanguageToggle = () => {
  // Get current language state and toggle function from context
  const { currentLanguage, toggleLanguage, isTranslating } = useLanguage();

  return (
    <div className="language-toggle-container">
      {/* Language toggle button */}
      <button 
        className={`language-toggle-btn ${isTranslating ? 'translating' : ''}`}
        onClick={toggleLanguage}
        disabled={isTranslating} // Disable button while translating
        title={currentLanguage === 'en' ? 'Switch to Bangla' : 'Switch to English'}
      >
        {/* Show opposite language name (if English, show বাংলা) */}
        <span className="language-text">
          {currentLanguage === 'en' ? 'বাংলা' : 'English'}
        </span>
        {/* Show loading spinner during translation */}
        {isTranslating && <span className="loading-spinner">⟳</span>}
      </button>
    </div>
  );
};

export default LanguageToggle;
