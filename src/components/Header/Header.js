import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaBars, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import LanguageToggle from '../LanguageToggle/LanguageToggle';
import { useTranslation } from '../../hooks/useTranslation';
import { useSearchSuggestions } from '../../hooks/useSearchSuggestions';
import './Header.css';

// Styles moved to Header.css

function renderHighlighted(textWithC) {
  if (!textWithC) return null;
  const parts = String(textWithC).split(/(<c>|<\/c>|<c>|<\/c>|<\/c>)/);
  let inHighlight = false;

  return parts.map((part, idx) => {
    if (part === '<c>' || part === '<c>' || part === '<c>' || part === '<c>') {
      inHighlight = true;
      return null;
    }
    if (part === '</c>' || part === '</c>' || part === '</c>' || part === '</c>') {
      inHighlight = false;
      return null;
    }
    if (!part) return null;

    return inHighlight ? (
      <mark key={idx} className="search-highlight">{part}</mark>
    ) : (
      <span key={idx}>{part}</span>
    );
  });
}

function SuggestionLabel({ suggestion }) {
  const s = suggestion;
  if (!s) return null;

  if (s.type === 'articles') {
    const titleText =
      (s.highlight && (s.highlight.title || s.highlight.name)) || s.title || s.name;
    const slugText =
      (s.highlight && (s.highlight.slug || s.highlight.code)) ||
      s.slug ||
      s.code ||
      '';

    return (
      <>
        <div className="search-item-title">{renderHighlighted(titleText)}</div>
        {slugText && (
          <div className="search-item-meta">{renderHighlighted(slugText)}</div>
        )}
      </>
    );
  }

  const nameText = (s.highlight && s.highlight.name) || s.name || '';
  const codeText = (s.highlight && s.highlight.code) || s.code || '';

  return (
    <>
      <div className="search-item-title">{renderHighlighted(nameText)}</div>
      {codeText && (
        <div className="search-item-meta">{renderHighlighted(codeText)}</div>
      )}
    </>
  );
}

function suggestionToUrl(s) {
  if (!s || !s.type) return '/';
  switch (s.type) {
    case 'articles':
      // Our router uses /article/:id
      return `/article/${encodeURIComponent(s.id)}`;
    default:
      return '/';
  }
}

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const { suggestions, loading } = useSearchSuggestions(searchQuery);
  const headerRef = useTranslation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleSearch = () => {
    const next = !showSearch;
    setShowSearch(next);
    if (!next) {
      setSearchQuery('');
      setIsDropdownOpen(false);
      setActiveIndex(-1);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value.trim().length >= 2) {
      setIsDropdownOpen(true);
    } else {
      setIsDropdownOpen(false);
    }
    setActiveIndex(-1);
  };

  const handleSearchFocus = () => {
    setShowSearch(true);
    if (searchQuery.trim().length >= 2 && suggestions.length > 0) {
      setIsDropdownOpen(true);
    }
  };

  const handleSearchBlur = () => {
    // Delay closing so click on a suggestion can register
    setTimeout(() => {
      setIsDropdownOpen(false);
      setActiveIndex(-1);
    }, 150);
  };

  const handleSuggestionClick = (s) => {
    const url = suggestionToUrl(s);
    navigate(url);
    setIsDropdownOpen(false);
    setSearchQuery('');
    setShowSearch(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setIsDropdownOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (!isDropdownOpen || !suggestions || suggestions.length === 0) {
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => {
        const next = prev + 1;
        return next >= suggestions.length ? 0 : next;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => {
        const next = prev - 1;
        return next < 0 ? suggestions.length - 1 : next;
      });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target =
        activeIndex >= 0 && activeIndex < suggestions.length
          ? suggestions[activeIndex]
          : suggestions[0];
      if (target) {
        handleSuggestionClick(target);
      }
    }
  };

  return (
    <header className="header-container" ref={headerRef}>
      <div className="header-content">
        <Link to="/" className="logo">BlogInfo</Link>

        <div className="nav-section">
          <Link className="nav-button" to="/health">Health</Link>
          <Link className="nav-button" to="/technology">Technology</Link>
          <Link className="nav-button" to="/sport">Sport</Link>
        </div>

        <div className="right-section">
          <div className="search-section">
            {showSearch && (
              <div
                className="search-combobox"
                role="combobox"
                aria-expanded={isDropdownOpen}
                aria-haspopup="listbox"
              >
                <input
                  className="search-input"
                  type="search"
                  placeholder="Search..."
                  autoFocus
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
                  onKeyDown={handleKeyDown}
                  autoComplete="off"
                />
                {isDropdownOpen && (loading || (suggestions && suggestions.length > 0)) && (
                  <ul className="search-dropdown" role="listbox">
                    {loading && (!suggestions || suggestions.length === 0) && (
                      <li className="search-item search-item-loading">Searching…</li>
                    )}
                    {!loading &&
                      suggestions &&
                      suggestions.length === 0 &&
                      searchQuery.trim().length >= 2 && (
                        <li className="search-item search-item-empty">No suggestions</li>
                      )}
                    {!loading &&
                      suggestions &&
                      suggestions.map((s, index) => (
                        <li
                          key={`${s.type}-${s.id}`}
                          role="option"
                          className={
                            'search-item' + (index === activeIndex ? ' search-item-active' : '')
                          }
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleSuggestionClick(s)}
                        >
                          <SuggestionLabel suggestion={s} />
                          {s.type && <span className="search-item-type">{s.type}</span>}
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            )}
            <FaSearch className="search-icon" onClick={toggleSearch} />
          </div>

          <LanguageToggle />

          <div className="auth-section">
            {isAuthenticated ? (
              <>
                {user?.role === 'admin' && (
                  <Link className="auth-button" to="/admin">Admin Panel</Link>
                )}
                <button className="auth-button" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <Link className="auth-button" to="/login">Login</Link>
                <Link className="auth-button sign-up-button" to="/register">Sign Up</Link>
              </>
            )}
          </div>

          <button className="mobile-menu-button" onClick={toggleMobileMenu}>
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="mobile-menu">
          <Link className="nav-button" to="/health">Disease</Link>
          <Link className="nav-button" to="/technology">Trendings</Link>
          <Link className="nav-button" to="/sport">Style</Link>
          {isAuthenticated ? (
            <>
              {user?.role === 'admin' && (
                <Link className="auth-button" to="/admin">Admin Panel</Link>
              )}
              <button className="auth-button" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link className="auth-button" to="/login">Login</Link>
              <Link className="auth-button sign-up-button" to="/register">Sign Up</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;



