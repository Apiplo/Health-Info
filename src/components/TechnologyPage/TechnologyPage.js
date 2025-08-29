// Import necessary libraries and components
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { fetchFeaturedArticles } from '../../services/api';
import { mockHealthNews, mockLivingStyle } from '../../data/mockData';
import './TechnologyPage.css';

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

// Mock technology articles
const mockTechNews = [
  {
    id: 'tech1',
    title: "The Future of AI: What's Next in 2024",
    description: "Exploring the latest advancements in artificial intelligence and how they're shaping our future.",
    image: "https://images.unsplash.com/photo-1677442135136-760c813d8a43?w=800&auto=format&fit=crop&q=80",
    category: "Artificial Intelligence"
  },
  {
    id: 'tech2',
    title: "Quantum Computing Breakthroughs",
    description: "How quantum computing is solving problems that were previously thought to be unsolvable.",
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80",
    category: "Quantum Computing"
  },
  {
    id: 'tech3',
    title: "The Rise of Web3 and Decentralization",
    description: "Understanding the shift towards decentralized internet and its implications for the future of the web.",
    image: "https://images.unsplash.com/photo-1639762681057-408e52192e55?w=800&auto=format&fit=crop&q=80",
    category: "Web3"
  },
  {
    id: 'tech4',
    title: "Sustainable Tech: Building a Greener Future",
    description: "How technology is being used to combat climate change and promote sustainability.",
    image: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=800&auto=format&fit=crop&q=80",
    category: "Green Technology"
  }
];

const techArticles = [...mockTechNews].slice(0, 7);

// Home component definition
const Home = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  return (
    <HomeContainer>
      <MainContent>
        {/* Most Popular Section */}
        <div className="news-section">
          <h2 className="section-title">Technology & Innovation</h2>
          <div className="vertical-article-list">
            {techArticles.map((article, index) => (
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


