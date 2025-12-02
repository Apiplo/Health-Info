import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import './ForgotPassword.css';

// Styles moved to ForgotPassword.css

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const forgotPasswordRef = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      console.log('Sending password reset link to:', email);
      await new Promise(res => setTimeout(res, 1000));
      setMessage('If an account with that email exists, we\'ve sent a password reset link to your inbox. Please check your email and follow the instructions.');
    } catch (err) {
      setMessage('Unable to send password reset email. Please check your email address and try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fp-container" ref={forgotPasswordRef}>
      <div className="fp-card">
        <h2 className="fp-title">Forgot Your Password?</h2>
        <p className="fp-subtitle">Enter your email address and we'll send you a link to reset it.</p>
        <form className="fp-form" onSubmit={handleSubmit}>
          <input
            className="fp-input"
            type="email"
            name="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button className="fp-button" type="submit" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        {message && <p className="fp-message">{message}</p>}
        <p className="fp-back">
          Remember your password? <Link to="/login">Back to Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;



