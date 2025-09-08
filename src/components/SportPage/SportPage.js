// Import necessary libraries and components
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { fetchFeaturedArticles } from '../../services/api';
import { mockHealthNews, mockLivingStyle } from '../../data/mockData';
import './SportPage.css';
import '../Home/Home.css';

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

// Mock sports articles since we don't have them in the original data
const mockSportsNews = [
  {
    id: 'sport1',
    title: "2024 Olympics: New Records and Rising Stars",
    description: "A look at the most impressive performances and emerging talents from this year's Olympic Games.",
    image: "https://images.unsplash.com/photo-1530137073521-1e009ca9ce1f?w=800&auto=format&fit=crop&q=80",
    category: "Olympics"
  },
  {
    id: 'sport2',
    title: "The Science of Athletic Performance",
    description: "How modern training techniques and sports science are helping athletes break performance barriers.",
    image: "https://images.unsplash.com/photo-1579952363872-3f11122591b2?w=800&auto=format&fit=crop&q=80",
    category: "Training"
  },
  {
    id: 'sport3',
    title: "Football Transfers: Summer 2024 Roundup",
    description: "All the biggest moves and transfers in the football world this transfer window.",
    image: "https://images.unsplash.com/photo-1579952363872-3f11122591b2?w=800&auto=format&fit=crop&q=80",
    category: "Football"
  }
];

const sportArticles = [...mockSportsNews, ...mockHealthNews.filter(a => a.category === 'Fitness')].slice(0, 7);

// Home component definition
const Home = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  return (
    <HomeContainer>
      <MainContent>
        {/* Most Popular Section */}
        <div className="news-section">
          <h2 className="section-title">Sports & Athletics</h2>
      <div className="vertical-article-list">
            {sportArticles.map((article, index) => (
        <div key={article.id} className="vertical-article-item card">
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


