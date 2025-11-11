// Import necessary libraries and components
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Footer from '../Footer/Footer';
// Direct API calls to backend server
// mockData import removed - will fetch from backend
import { useTranslation } from '../../hooks/useTranslation';
import { useLanguage } from '../../contexts/LanguageContext';
import './Home.css';

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

// Local ad placeholder box
const AdBox = styled.aside`
  position: sticky;
  top: 1rem;
  width: 100%;
  min-height: 250px;
  border: 1px dashed #d1d5db;
  border-radius: 8px;
  background: linear-gradient(180deg, #f9fafb 0%, #ffffff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  color: #6b7280;
  font-size: 14px;
  text-align: center;
`;

// Remove local styled footer; using shared Footer component

// Home component definition
const Home = () => {
  const [mostPopularArticles, setMostPopularArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const homeRef = useTranslation();
  const { currentLanguage } = useLanguage();

  // Resolve absolute and relative image URLs against backend origin
  const apiBase = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';
  const resolveImageUrl = (src) => {
    if (!src) return '';
    if (/^https?:\/\//i.test(src)) return src;
    try {
      const origin = new URL(apiBase).origin;
      if (src.startsWith('/')) return `${origin}${src}`;
      return `${origin}/${src}`;
    } catch (e) {
      return src;
    }
  };

  const pickArticleImageField = (a) => {
    if (!a) return '';
    return (
      a.image ||
      a.imageUrl || a.imageURL || a.image_url ||
      a.imagePath || a.image_path ||
      a.thumbnail || a.thumbnailUrl || a.thumbnail_url ||
      a.cover || a.coverUrl || a.cover_url ||
      a.photo || a.picture || ''
    );
  };

  const placeholderImg = 'https://via.placeholder.com/400x225?text=No+Image';

  // Fetch articles on component mount
  useEffect(() => {
    const loadArticles = async () => {
      try {
        setLoading(true);
        setError('');
        // Fetch articles for the selected language using path parameter form: /api/articles/:lang
        const response = await fetch(`http://localhost:3000/api/articles/${currentLanguage}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const articles = await response.json();
        setMostPopularArticles(articles);
      } catch (err) {
        setError('Failed to load articles. Please check your backend connection.');
        console.error('Error loading articles:', err);
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, [currentLanguage]);

  return (
    <>
      <HomeContainer ref={homeRef}>
        <MainContent>
          {/* Most Popular Section */}
          <div className="news-section">
          <h2 className="section-title">Most Popular</h2>
          <div className="vertical-article-list">
            {loading ? (
              <div className="loading-message">Loading articles...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : mostPopularArticles.length > 0 ? (
              mostPopularArticles.map((article, index) => (
                <div key={article.id} className="vertical-article-item card">
                  <span className="article-number">{String(index + 1).padStart(2, '0')}</span>
                  <Link 
                    to={`/article/${article.id}`} 
                    state={article}
                    className="vertical-article-link"
                  >
                    <div className="article-thumbnail">
                      {(() => {
                        const raw = pickArticleImageField(article);
                        const imgSrc = resolveImageUrl(raw);
                        return imgSrc ? (
                          <img
                            src={imgSrc}
                            alt={article.title}
                            onError={(e) => {
                              if (e.currentTarget.src !== placeholderImg) {
                                e.currentTarget.src = placeholderImg;
                              }
                            }}
                          />
                        ) : (
                          <img src={placeholderImg} alt="No image" />
                        );
                      })()}
                    </div>
                    <div className="vertical-article-content" data-no-translate>
                      <h3 className="vertical-article-title">{article.title}</h3>
                      <p className="vertical-article-description">
                        {article.content?.substring(0, 120)}{article.content?.length > 120 ? '...' : ''}
                      </p>
                      <p className="vertical-article-category">{article.category}</p>
                    </div>
                  </Link>
                </div>
              ))
            ) : (
              <div className="no-articles-message">
                <p>No articles available. Please connect to backend to load content.</p>
              </div>
            )}
          </div>
        </div>
        </MainContent>
        <AdColumn>
          <AdBox style={{ minHeight: 600 }}>
            <div>
              <div style={{ fontWeight: 600 }}>Advertisement</div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 8 }}>Your ad could be here</div>
            </div>
          </AdBox>
        </AdColumn>
      </HomeContainer>
      <Footer />
    </>
  );
};

// Export the Home component for use in other parts of the application
export default Home;


