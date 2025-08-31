// Import necessary libraries and components
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { fetchFeaturedArticles } from '../../services/api';
import { mockHealthNews, mockLivingStyle } from '../../data/mockData';
import './HealthPage.css';

// Styled component for the main container of the home page
const HomeContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
    gap: 2rem;

  // Responsive styles for tablets
  @media (max-width: 1024px) {
    gap: 1.5rem;
        padding: 1.5rem;
  }

  // Responsive styles for mobile devices
  @media (max-width: 768px) {
    flex-direction: column;
    padding: 1rem;
    gap: 1rem;
  }
`;

// Styled component for the main content area
const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2rem;
    min-width: 0; // Prevents content from overflowing
`;

// Styled component for the advertisement column
const AdColumn = styled.div`
      flex: 0 0 320px; // Fixed width for the ad column

  // Responsive styles for tablets
  @media (max-width: 1024px) {
        flex-basis: 280px;
  }

  // Responsive styles for mobile devices
  @media (max-width: 768px) {
    display: none;
  }
`;

// Filter health-related articles
const healthArticles = [...mockHealthNews, ...mockLivingStyle]
  .filter(article => 
    article.category === 'Mental Health' || 
    article.category === 'Nutrition' ||
    article.category === 'Fitness' ||
    article.category === 'Wellness' ||
    article.category === 'Sleep'
  )
  .slice(0, 7); // Take first 7 articles

// Home component definition
const Home = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  return (
    <HomeContainer>
      <MainContent>
        {/* Most Popular Section */}
        <div className="news-section">
          <h2 className="section-title">Health & Wellness</h2>
          <div className="vertical-article-list">
            {healthArticles.map((article, index) => (
              <div key={article.id} className="vertical-article-item">
                <span className="article-number">{String(index + 1).padStart(2, '0')}</span>
                <Link 
                  to={`/article/${article.id}`} 
                  state={article}
                  className="vertical-article-link"
                >
                  <div className="article-thumbnail">
                    <img src={article.image} alt={article.title} />
                  </div>
                  <div className="vertical-article-content">
                    <h3 className="vertical-article-title">{article.title}</h3>
                    <p className="vertical-article-description">
                      {article.description?.substring(0, 120)}{article.description?.length > 120 ? '...' : ''}
                    </p>
                    <p className="vertical-article-category">{article.category}</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </MainContent>
    </HomeContainer>
  );
};

// Export the Home component for use in other parts of the application
export default Home;


