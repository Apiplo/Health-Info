// Import React and footer styles
import React from 'react';
import './Footer.css';

// Footer component - displays site footer with social links, company info, and contact details
const Footer = () => {
  // Get current year for copyright notice
  const year = new Date().getFullYear();
  return (
    <footer className="app-footer">
      {/* Top section: Social media links bar */}
      <div className="footer-social">
        <div className="footer-container">
          <span className="social-text">Get connected with us on social networks!</span>
          <div className="social-icons" aria-label="social links">
            <a href="#" aria-label="Facebook" title="Facebook" rel="noreferrer">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 12.07C22 6.48 17.52 2 11.93 2S2 6.48 2 12.07C2 17.1 5.66 21.2 10.44 22v-7.01H7.9v-2.92h2.54v-2.23c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.89h2.78l-.44 2.92h-2.34V22C18.34 21.2 22 17.1 22 12.07z"></path></svg>
            </a>
            <a href="#" aria-label="Twitter" title="Twitter" rel="noreferrer">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22.46 6c-.77.35-1.6.58-2.46.69a4.26 4.26 0 001.87-2.35 8.53 8.53 0 01-2.7 1.03 4.24 4.24 0 00-7.23 3.86 12.05 12.05 0 01-8.75-4.43 4.23 4.23 0 001.31 5.66 4.2 4.2 0 01-1.92-.53v.05c0 2.06 1.46 3.78 3.39 4.17-.36.1-.75.15-1.14.15-.28 0-.56-.03-.83-.08.56 1.76 2.2 3.04 4.13 3.08A8.51 8.51 0 012 19.54a12.01 12.01 0 006.52 1.91c7.82 0 12.1-6.48 12.1-12.1 0-.18 0-.36-.01-.53A8.56 8.56 0 0024 5.3a8.4 8.4 0 01-2.54.7z"/></svg>
            </a>
            <a href="#" aria-label="LinkedIn" title="LinkedIn" rel="noreferrer">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.94 6.5A2.44 2.44 0 114.5 4.06 2.44 2.44 0 016.94 6.5zM4.75 8.49h4.36v10.77H4.75zM13.16 8.49h4.18v1.47h.06a4.59 4.59 0 014.13-2.27c4.42 0 5.24 2.91 5.24 6.69v4.88h-4.36v-4.33c0-1.03 0-2.35-1.43-2.35s-1.64 1.12-1.64 2.27v4.41h-4.18z"/></svg>
            </a>
            <a href="#" aria-label="Instagram" title="Instagram" rel="noreferrer">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 2C4.24 2 2 4.24 2 7v10c0 2.76 2.24 5 5 5h10c2.76 0 5-2.24 5-5V7c0-2.76-2.24-5-5-5H7zm10 2c1.66 0 3 1.34 3 3v10c0 1.66-1.34 3-3 3H7c-1.66 0-3-1.34-3-3V7c0-1.66 1.34-3 3-3h10zm-5 3.5A5.5 5.5 0 1017.5 13 5.51 5.51 0 0012 7.5zm0 2A3.5 3.5 0 1115.5 13 3.5 3.5 0 0112 9.5zM18 6.2a1 1 0 11-1 1 1 1 0 011-1z"/></svg>
            </a>
          </div>
        </div>
      </div>

      {/* Middle section: Main footer content with 4 columns */}
      <div className="footer-main">
        <div className="footer-container footer-grid">
          {/* Column 1: Company information */}
          <div className="footer-col">
            <h4>Company</h4>
            <p>
              Here you can use rows and columns to organize your footer content. Learn more about our mission
              and how we promote accessible health information.
            </p>
          </div>
          {/* Column 2: Products and services */}
          <div className="footer-col">
            <h4>Products</h4>
            <ul>
              <li><a href="#">BlogInfo</a></li>
              <li><a href="#">AI Summaries</a></li>
              <li><a href="#">Language Support</a></li>
              <li><a href="#">For Clinics</a></li>
            </ul>
          </div>
          {/* Column 3: Useful links for users */}
          <div className="footer-col">
            <h4>Useful Links</h4>
            <ul>
              <li><a href="#">Your Account</a></li>
              <li><a href="#">Become an Affiliate</a></li>
              <li><a href="#">Shipping Rates</a></li>
              <li><a href="#">Help</a></li>
            </ul>
          </div>
          {/* Column 4: Contact information */}
          <div className="footer-col">
            <h4>Contact</h4>
            <ul className="contact-list">
              <li>New York, NY 10012, US</li>
              <li>info@bloginfo.example</li>
              <li>+ 01 234 567 88</li>
              <li>+ 01 234 567 89</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom section: Copyright notice */}
      <div className="footer-bottom">
        <div className="footer-container">
          <span>© {year} BlogInfo. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
