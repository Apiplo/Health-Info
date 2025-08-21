import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaBars, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import './Header.css';

// Styles moved to Header.css

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleSearch = () => setShowSearch(!showSearch);

  return (
    <header className="header-container">
      <div className="header-content">
        <Link to="/" className="logo">HealthInfo</Link>

        <div className="nav-section">
          <Link className="nav-button" to="/disease">Disease</Link>
          <Link className="nav-button" to="/trendings">Trendings</Link>
          <Link className="nav-button" to="/style">Style</Link>
        </div>

        <div className="right-section">
          <div className="search-section">
            {showSearch && (
              <input
                className="search-input"
                type="text"
                placeholder="Search..."
                autoFocus
              />
            )}
            <FaSearch className="search-icon" onClick={toggleSearch} />
          </div>

          <div className="auth-section">
            {isAuthenticated ? (
              <>
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
          <Link className="nav-button" to="/disease">Disease</Link>
          <Link className="nav-button" to="/trendings">Trendings</Link>
          <Link className="nav-button" to="/style">Style</Link>
          <Link className="auth-button" to="/login">Login</Link>
          <Link className="auth-button sign-up-button" to="/register">Sign Up</Link>
        </div>
      )}
    </header>
  );
};

export default Header;



