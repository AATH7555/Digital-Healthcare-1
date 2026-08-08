import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import './LanguageSwitcher.css';

function LanguageSwitcher() {
  const { language, toggleLanguage, t } = useLanguage();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="language-switcher">
      <button 
        className="language-btn"
        onClick={() => setShowMenu(!showMenu)}
        title={t('language')}
      >
        <span className="lang-flag">
          {language === 'english' ? '🇬🇧' : '🇮🇳'}
        </span>
        <span className="lang-label">
          {language === 'english' ? 'EN' : 'TA'}
        </span>
      </button>
      
      {showMenu && (
        <div className="language-menu">
          <button 
            className={`lang-option ${language === 'english' ? 'active' : ''}`}
            onClick={() => {
              if (language !== 'english') toggleLanguage();
              setShowMenu(false);
            }}
          >
            <span className="flag">🇬🇧</span>
            <span className="lang-name">{t('english')}</span>
          </button>
          <button 
            className={`lang-option ${language === 'tamil' ? 'active' : ''}`}
            onClick={() => {
              if (language !== 'tamil') toggleLanguage();
              setShowMenu(false);
            }}
          >
            <span className="flag">🇮🇳</span>
            <span className="lang-name">{t('tamil')}</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default LanguageSwitcher;
