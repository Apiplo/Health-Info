import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../hooks/useTranslation';
import './Login.css';

// Styles moved to Login.css

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const loginRef = useTranslation();
  const handleSignUpClick = () => navigate('/register');
  const handleForgotPasswordClick = () => navigate('/forgot-password');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await login(formData.email, formData.password);
      
      // Redirect based on user role
      if (result?.user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err?.message || 'Login failed. Please check your internet connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container" ref={loginRef}>
      <div className="brand-section">
        <h1 className="brand-title">BlogInfo</h1>
        <div className="brand-motto">
          <p>For your knowledge</p>
        </div>
      </div>

      <div className="form-section">
        <div className="login-card">
          <form className="form" onSubmit={handleSubmit}>
            <div className="input-field">
              <input
                className="input"
                type="text"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-field">
              <input
                className="input"
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button className="login-button" type="submit" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </button>

            <a className="forgot-password" onClick={handleForgotPasswordClick}>Forgot password?</a>

            <button className="sign-up-button" type="button" onClick={handleSignUpClick}>
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;



