import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Login.css';

// Styles moved to Login.css

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
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
      await login(formData.username, formData.password);
      navigate('/');
    } catch (err) {
      setError(err?.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="brand-section">
        <h1 className="brand-title">Healthy</h1>
        <div className="brand-motto">
          <p>Your health, your choice.</p>
          <p>Start living better today.</p>
        </div>
      </div>

      <div className="form-section">
        <div className="login-card">
          <form className="form" onSubmit={handleSubmit}>
            <div className="input-field">
              <input
                className="input"
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
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



