import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import './LanguageToggle.css';

const LanguageToggle = () => {
  const { currentLanguage, toggleLanguage, isTranslating } = useLanguage();

  return (
    <div className="language-toggle-container">
      <button 
        className={`language-toggle-btn ${isTranslating ? 'translating' : ''}`}
        onClick={toggleLanguage}
        disabled={isTranslating}
        title={currentLanguage === 'en' ? 'Switch to Bangla' : 'Switch to English'}
      >
        <span className="language-text">
          {currentLanguage === 'en' ? 'বাংলা' : 'English'}
        </span>
        {isTranslating && <span className="loading-spinner">⟳</span>}
      </button>
    </div>
  );
};

export default LanguageToggle;
