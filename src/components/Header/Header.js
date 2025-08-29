import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaSearch, FaBars, FaTimes, FaUserCircle, FaBell } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import styled, { keyframes } from 'styled-components';

// Keyframe animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
`;

// Styled components
const HeaderContainer = styled.header`
  background: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
  padding: 0 2rem;
  
  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`;

const HeaderContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 70px;
`;

const Logo = styled(Link)`
  font-size: 1.75rem;
  font-weight: 800;
  color: #2c3e50;
  text-decoration: none;
  background: linear-gradient(135deg, #3498db, #2ecc71);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.5px;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const NavSection = styled.nav`
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-left: 3rem;
  
  @media (max-width: 1024px) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  color: #2c3e50;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  padding: 0.5rem 0;
  position: relative;
  transition: color 0.3s ease;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 2px;
    background: #3498db;
    transition: width 0.3s ease;
  }
  
  &:hover {
    color: #3498db;
    
    &::after {
      width: 100%;
    }
  }
  
  &.active {
    color: #3498db;
    
    &::after {
      width: 100%;
    }
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const SearchButton = styled.button`
  background: none;
  border: none;
  color: #2c3e50;
  font-size: 1.1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

const AuthButton = styled(Link)`
  background: ${props => props.primary ? '#3498db' : 'transparent'};
  color: ${props => props.primary ? '#fff' : '#2c3e50'};
  border: ${props => !props.primary && '1px solid #3498db'};
  padding: 0.5rem 1.25rem;
  border-radius: 25px;
  font-weight: 600;
  font-size: 0.9rem;
  text-decoration: none;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.primary ? '#2980b9' : 'rgba(52, 152, 219, 0.1)'};
    transform: translateY(-1px);
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: #2c3e50;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  
  @media (max-width: 1024px) {
    display: block;
  }
`;

const MobileMenu = styled.div`
  position: fixed;
  top: 70px;
  left: 0;
  right: 0;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  z-index: 999;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  animation: ${fadeIn} 0.3s ease-out;
  
  @media (min-width: 1025px) {
    display: none;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  animation: ${fadeIn} 0.3s ease-out;
  
  input {
    width: 250px;
    padding: 0.6rem 1rem;
    padding-right: 2.5rem;
    border: 1px solid #e0e0e0;
    border-radius: 25px;
    font-size: 0.9rem;
    outline: none;
    transition: all 0.3s ease;
    
    &:focus {
      border-color: #3498db;
      box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
    }
    
    @media (max-width: 768px) {
      width: 100%;
    }
  }
  
  svg {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #7f8c8d;
  }
`;

const UserMenu = styled.div`
  position: relative;
  cursor: pointer;
  
  &:hover .user-dropdown {
    display: block;
  }
`;

const UserDropdown = styled.div`
  display: none;
  position: absolute;
  top: 100%;
  right: 0;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  padding: 0.5rem 0;
  animation: ${fadeIn} 0.2s ease-out;
  z-index: 1000;
  
  button {
    width: 100%;
    text-align: left;
    padding: 0.75rem 1.25rem;
    background: none;
    border: none;
    color: #2c3e50;
    font-size: 0.95rem;
    cursor: pointer;
    transition: background-color 0.2s ease;
    
    &:hover {
      background-color: #f8f9fa;
      color: #3498db;
    }
  }
`;

const NotificationBadge = styled.span`
  position: absolute;
  top: -5px;
  right: -5px;
  background: #e74c3c;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6rem;
  font-weight: bold;
`;

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasNotifications, setHasNotifications] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleSearch = () => setShowSearch(!showSearch);
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <HeaderContainer>
      <HeaderContent>
        <Logo to="/">HealthInfo</Logo>

        <NavSection>
          <NavLink 
            to="/disease" 
            className={location.pathname === '/disease' ? 'active' : ''}
          >
            Disease
          </NavLink>
          <NavLink 
            to="/trendings"
            className={location.pathname === '/trendings' ? 'active' : ''}
          >
            Trendings
          </NavLink>
          <NavLink 
            to="/style"
            className={location.pathname === '/style' ? 'active' : ''}
          >
            Style
          </NavLink>
        </NavSection>

        <RightSection>
          {showSearch ? (
            <SearchContainer>
              <input
                type="text"
                placeholder="Search articles, topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <FaSearch />
            </SearchContainer>
          ) : (
            <SearchButton onClick={toggleSearch} aria-label="Search">
              <FaSearch />
            </SearchButton>
          )}

          {isAuthenticated ? (
            <>
              <SearchButton aria-label="Notifications">
                <FaBell />
                {hasNotifications && <NotificationBadge>3</NotificationBadge>}
              </SearchButton>
              
              <UserMenu>
                <SearchButton aria-label="User menu">
                  <FaUserCircle size={24} />
                </SearchButton>
                <UserDropdown className="user-dropdown">
                  <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid #f0f0f0' }}>
                    <div style={{ fontWeight: '600' }}>{user?.name || 'User'}</div>
                    <div style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>{user?.email || ''}</div>
                  </div>
                  <button onClick={() => navigate('/profile')}>My Profile</button>
                  <button onClick={() => navigate('/settings')}>Settings</button>
                  <button onClick={handleLogout}>Logout</button>
                </UserDropdown>
              </UserMenu>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <AuthButton to="/login">Log in</AuthButton>
              <AuthButton primary to="/register">Sign up</AuthButton>
            </div>
          )}

          <MobileMenuButton onClick={toggleMobileMenu} aria-label="Menu">
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </MobileMenuButton>
        </RightSection>
      </HeaderContent>

      {isMobileMenuOpen && (
        <MobileMenu>
          <SearchContainer style={{ width: '100%', marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="Search articles, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FaSearch />
          </SearchContainer>
          
          <NavLink to="/disease" style={{ padding: '0.75rem 0' }}>
            Disease
          </NavLink>
          <NavLink to="/trendings" style={{ padding: '0.75rem 0' }}>
            Trendings
          </NavLink>
          <NavLink to="/style" style={{ padding: '0.75rem 0' }}>
            Style
          </NavLink>
          
          {isAuthenticated ? (
            <>
              <NavLink to="/profile" style={{ padding: '0.75rem 0' }}>
                My Profile
              </NavLink>
              <button 
                onClick={handleLogout}
                style={{
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  padding: '0.75rem 0',
                  color: '#e74c3c',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  width: '100%'
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
              <AuthButton to="/login" style={{ textAlign: 'center' }}>Log in</AuthButton>
              <AuthButton primary to="/register" style={{ textAlign: 'center' }}>Sign up</AuthButton>
            </div>
          )}
        </MobileMenu>
      )}
    </HeaderContainer>
  );
};

export default Header;



