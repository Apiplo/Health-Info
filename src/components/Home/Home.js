import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { 
  FaPlay, 
  FaVolumeUp, 
  FaClock, 
  FaUser, 
  FaArrowRight, 
  FaHeart, 
  FaShare, 
  FaBookmark,
  FaSearch
} from 'react-icons/fa';
import { 
  fetchFeaturedArticles, 
  fetchHealthNewsTop3, 
  fetchLivingStyleTop3, 
  fetchAdVideos, 
  fetchLivingStyleVideos 
} from '../../services/api';

// Theme variables
const theme = {
  primary: '#3498db',
  secondary: '#2ecc71',
  dark: '#2c3e50',
  light: '#ecf0f1',
  gray: '#95a5a6',
  danger: '#e74c3c',
  white: '#ffffff',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  borderRadius: '12px',
  maxWidth: '1200px'
};

// Keyframe animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const scaleIn = keyframes`
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
`;

// Styled components
const HomeContainer = styled.div`
  max-width: ${theme.maxWidth};
  margin: 0 auto;
  padding: 2rem 1.5rem;
  display: flex;
  gap: 2.5rem;
  background: ${theme.white};
  min-height: calc(100vh - 80px);
  position: relative;
  z-index: 1;

  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 300px;
    background: linear-gradient(135deg, ${theme.primary}, ${theme.secondary});
    z-index: -1;
    clip-path: polygon(0 0, 100% 0, 100% 70%, 0% 100%);
  }

  @media (max-width: 1024px) {
    gap: 2rem;
    padding: 1.5rem 1rem;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    padding: 1rem 0.75rem;
    gap: 1.5rem;
  }
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3rem;
  min-width: 0;
  animation: ${fadeIn} 0.6s ease-out;
  background: ${theme.white};
  border-radius: ${theme.borderRadius};
  box-shadow: ${theme.boxShadow};
  padding: 2rem;
  margin-top: 2rem;
  position: relative;
  z-index: 1;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 5px;
    background: linear-gradient(90deg, ${theme.primary}, ${theme.secondary});
  }

  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
    margin-top: 1.5rem;
  }
`;

const FeaturedSection = styled.section`
  position: relative;
  margin-bottom: 3rem;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -1.5rem;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, ${theme.gray}20, transparent);
  }
`;

const ArticleSection = styled.section`
  background: ${theme.white};
  border-radius: ${theme.borderRadius};
  overflow: hidden;
  transition: ${theme.transition};
  position: relative;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    
    .article-image img {
      transform: scale(1.05);
    }
    
    .read-more {
      color: ${theme.primary};
      transform: translateX(5px);
    }
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.75rem;
  color: ${theme.dark};
  margin: 0 0 1.5rem;
  padding-bottom: 0.75rem;
  position: relative;
  display: inline-block;
  font-weight: 700;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 60px;
    height: 4px;
    background: linear-gradient(90deg, ${theme.primary}, ${theme.secondary});
    border-radius: 2px;
  }
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const ArticleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
  
  @media (max-width: 1024px) {
    gap: 1.5rem;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  @media (max-width: 480px) {
    gap: 1.25rem;
  }
`;

const ArticleCard = styled(Link)`
  display: flex;
  flex-direction: column;
  background: ${theme.white};
  border-radius: ${theme.borderRadius};
  overflow: hidden;
  text-decoration: none;
  color: ${theme.dark};
  transition: ${theme.transition};
  animation: ${fadeIn} 0.6s ease-out;
  height: 100%;
  border: 1px solid ${theme.light};
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
    border-color: transparent;
    
    .article-image img {
      transform: scale(1.05);
    }
    
    .article-title-small {
      color: #3498db;
    }
  }
`;

const Author = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const AuthorAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #3498db;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  text-transform: uppercase;
`;

const AudioPlayer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f5f7fa;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  
  button {
    background: none;
    border: none;
    color: #3498db;
    cursor: pointer;
    font-size: 1rem;
    display: flex;
    align-items: center;
    padding: 0.25rem;
    
    &:hover {
      color: #2980b9;
    }
  }
`;

const ArticleImage = styled.div`
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  border-radius: ${theme.borderRadius} ${theme.borderRadius} 0 0;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }
  
  .play-icon, .audio-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(255, 255, 255, 0.9);
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${theme.primary};
    font-size: 1.25rem;
    opacity: 0;
    transition: all 0.3s ease;
    cursor: pointer;
    z-index: 2;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.1);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover {
    .play-icon, .audio-icon {
      opacity: 1;
    }
    
    &::after {
      opacity: 1;
    }
  }
`;

// Article Content
const ArticleContent = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const ArticleMeta = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
  font-size: 0.85rem;
  color: ${theme.gray};
  
  span {
    display: flex;
    align-items: center;
    margin-right: 1rem;
    
    svg {
      margin-right: 0.35rem;
      font-size: 0.9em;
    }
  }
`;

const ArticleTitle = styled.h3`
  font-size: 1.35rem;
  margin: 0 0 1rem;
  line-height: 1.4;
  color: ${theme.dark};
  font-weight: 700;
  transition: color 0.3s ease;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const ArticleTitleSmall = styled(ArticleTitle)`
  font-size: 1.15rem;
  margin-bottom: 0.75rem;
`;

const ArticleExcerpt = styled.p`
  color: ${theme.gray};
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0 0 1.25rem;
  flex-grow: 1;
`;

const ArticleFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  margin-top: auto;
  border-top: 1px solid ${theme.light};
`;

const AuthorInfo = styled.div`
  display: flex;
  align-items: center;
  
  img {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    margin-right: 0.75rem;
    object-fit: cover;
  }
  
  .author-name {
    font-size: 0.9rem;
    font-weight: 600;
    color: ${theme.dark};
    margin: 0;
  }
  
  .publish-date {
    font-size: 0.75rem;
    color: ${theme.gray};
    margin: 0;
  }
`;

const ArticleActions = styled.div`
  display: flex;
  gap: 1rem;
  
  button {
    background: none;
    border: none;
    color: ${theme.gray};
    font-size: 1rem;
    cursor: pointer;
    transition: color 0.3s ease;
    display: flex;
    align-items: center;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    
    &:hover {
      color: ${theme.primary};
      background: ${theme.light};
    }
    
    svg {
      margin-right: 0.35rem;
    }
  }
`;

const ReadMore = styled.span`
  display: inline-flex;
  align-items: center;
  color: ${theme.primary};
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    color: ${theme.secondary};
    
    svg {
      transform: translateX(3px);
    }
  }
  
  svg {
    margin-left: 0.5rem;
    font-size: 0.8em;
    transition: transform 0.3s ease;
  }
  margin-top: auto;
  padding-top: 1rem;
  
  svg {
    margin-left: 0.5rem;
    transition: transform 0.3s ease;
  }
  
  &:hover svg {
    transform: translateX(4px);
  }
`;

const LoadingText = styled.div`
  text-align: center;
  padding: 2rem;
  color: #7f8c8d;
  font-size: 1.1rem;
`;

const ErrorText = styled.div`
  text-align: center;
  padding: 2rem;
  color: #e74c3c;
  font-size: 1.1rem;
`;

// Helper function to format date
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

// Helper component for loading skeleton
const SkeletonLoader = () => (
  <div style={{ 
    background: theme.white, 
    borderRadius: theme.borderRadius, 
    padding: '1.5rem',
    boxShadow: theme.boxShadow 
  }}>
    <div style={{ 
      height: '24px', 
      width: '60%', 
      background: theme.light, 
      marginBottom: '1rem',
      borderRadius: '4px' 
    }} />
    <div style={{ 
      height: '16px', 
      width: '100%', 
      background: theme.light, 
      marginBottom: '0.5rem',
      borderRadius: '4px' 
    }} />
    <div style={{ 
      height: '16px', 
      width: '80%', 
      background: theme.light, 
      marginBottom: '1.5rem',
      borderRadius: '4px' 
    }} />
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between',
      alignItems: 'center' 
    }}>
      <div style={{ 
        height: '32px', 
        width: '32px', 
        borderRadius: '50%', 
        background: theme.light 
      }} />
      <div style={{ 
        height: '16px', 
        width: '100px', 
        background: theme.light,
        borderRadius: '4px'
      }} />
    </div>
  </div>
);

// Home component definition
const Home = () => {
  // State for storing articles and videos
  const [featuredArticles, setFeaturedArticles] = useState([]);
  const [healthNews, setHealthNews] = useState([]);
  const [livingStyle, setLivingStyle] = useState([]);
  const [adVideos, setAdVideos] = useState([]);
  const [livingStyleVideos, setLivingStyleVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [
          featuredData, 
          healthNewsData, 
          livingStyleData, 
          adVideosData, 
          livingStyleVideosData
        ] = await Promise.all([
          fetchFeaturedArticles(),
          fetchHealthNewsTop3(),
          fetchLivingStyleTop3(),
          fetchAdVideos(),
          fetchLivingStyleVideos()
        ]);

        setFeaturedArticles(featuredData);
        setHealthNews(healthNewsData);
        setLivingStyle(livingStyleData);
        setAdVideos(adVideosData);
        setLivingStyleVideos(livingStyleVideosData);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch articles. Please refresh the page or try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter articles based on search query
  const filterArticles = (articles) => {
    if (!searchQuery.trim()) return articles;
    
    const query = searchQuery.toLowerCase();
    return articles.filter(article => 
      article.title.toLowerCase().includes(query) || 
      (article.excerpt && article.excerpt.toLowerCase().includes(query)) ||
      (article.content && article.content.toLowerCase().includes(query))
    );
  };

  // Render loading state
  if (loading) {
    return (
      <HomeContainer>
        <MainContent>
          <div style={{ display: 'grid', gap: '2rem' }}>
            <SkeletonLoader />
            <SkeletonLoader />
            <SkeletonLoader />
          </div>
        </MainContent>
      </HomeContainer>
    );
  }

  // Render error state
  if (error) {
    return (
      <HomeContainer>
        <MainContent>
          <div style={{ 
            background: '#fff5f5', 
            borderLeft: `4px solid ${theme.danger}`,
            padding: '1.5rem',
            borderRadius: '4px',
            color: theme.dark
          }}>
            <h3 style={{ marginTop: 0, color: theme.danger }}>Error Loading Content</h3>
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()}
              style={{
                background: theme.primary,
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: 'pointer',
                marginTop: '1rem',
                transition: 'background 0.3s ease'
              }}
              onMouseOver={(e) => e.target.style.background = theme.secondary}
              onMouseOut={(e) => e.target.style.background = theme.primary}
            >
              Retry
            </button>
          </div>
        </MainContent>
      </HomeContainer>
    );
  }

  return (
    <HomeContainer>
      <MainContent>
        {/* Search Bar */}
        <div style={{ 
          position: 'relative',
          marginBottom: '2rem',
          maxWidth: '600px',
          margin: '0 auto 2rem',
          width: '100%'
        }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.85rem 1.25rem 0.85rem 3rem',
                borderRadius: '50px',
                border: `1px solid ${theme.light}`,
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = theme.primary;
                e.target.style.boxShadow = `0 0 0 3px ${theme.primary}20`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = theme.light;
                e.target.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
              }}
            />
            <FaSearch style={{
              position: 'absolute',
              left: '1.25rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: theme.gray,
              fontSize: '1.1rem'
            }} />
          </div>
        </div>

        {/* Featured Articles */}
        <FeaturedSection>
          <SectionTitle>Featured Articles</SectionTitle>
          <ArticleGrid>
            {filterArticles(featuredArticles).length > 0 ? (
              filterArticles(featuredArticles).map((article) => (
                <ArticleCard key={article.id} to={`/article/${article.id}`}>
                  <ArticleImage className="article-image">
                    <img src={article.image || 'https://via.placeholder.com/400x200?text=No+Image'} alt={article.title} />
                    {article.type === 'video' && <FaPlay className="play-icon" />}
                    {article.type === 'audio' && <FaVolumeUp className="audio-icon" />}
                  </ArticleImage>
                  <ArticleContent>
                    <ArticleMeta>
                      <span><FaClock /> {article.readTime || '5'} min read</span>
                      <span><FaUser /> {article.author || 'Admin'}</span>
                    </ArticleMeta>
                    <ArticleTitle>{article.title}</ArticleTitle>
                    <ArticleExcerpt>
                      {article.excerpt || 'No excerpt available. Click to read more about this article.'}
                    </ArticleExcerpt>
                    <ArticleFooter>
                      <AuthorInfo>
                        <img 
                          src={article.authorImage || 'https://via.placeholder.com/40?text=U'} 
                          alt={article.author || 'Author'} 
                        />
                        <div>
                          <p className="author-name">{article.author || 'Admin'}</p>
                          <p className="publish-date">{formatDate(article.date || new Date().toISOString())}</p>
                        </div>
                      </AuthorInfo>
                      <ArticleActions>
                        <button aria-label="Save for later">
                          <FaBookmark />
                        </button>
                        <button aria-label="Share article">
                          <FaShare />
                        </button>
                      </ArticleActions>
                    </ArticleFooter>
                  </ArticleContent>
                </ArticleCard>
              ))
            ) : (
              <div style={{ 
                gridColumn: '1 / -1', 
                textAlign: 'center', 
                padding: '3rem 0',
                color: theme.gray
              }}>
                <p>No featured articles found{searchQuery ? ` matching "${searchQuery}"` : ''}.</p>
              </div>
            )}
          </ArticleGrid>
        </FeaturedSection>

        {/* Health News */}
        <ArticleSection>
          <SectionTitle>Health News</SectionTitle>
          <ArticleGrid>
            {filterArticles(healthNews).length > 0 ? (
              filterArticles(healthNews).map((article) => (
                <ArticleCard key={article.id} to={`/article/${article.id}`}>
                  <ArticleImage className="article-image">
                    <img src={article.image || 'https://via.placeholder.com/400x200?text=No+Image'} alt={article.title} />
                  </ArticleImage>
                  <ArticleContent>
                    <ArticleTitleSmall>{article.title}</ArticleTitleSmall>
                    <ArticleExcerpt>
                      {article.excerpt?.substring(0, 100) || 'No excerpt available. Click to read more...'}
                    </ArticleExcerpt>
                    <ArticleFooter>
                      <ReadMore className="read-more">
                        Read more <FaArrowRight />
                      </ReadMore>
                    </ArticleFooter>
                  </ArticleContent>
                </ArticleCard>
              ))
            ) : (
              <div style={{ 
                gridColumn: '1 / -1', 
                textAlign: 'center', 
                padding: '2rem 0',
                color: theme.gray
              }}>
                <p>No health news articles found{searchQuery ? ` matching "${searchQuery}"` : ''}.</p>
              </div>
            )}
          </ArticleGrid>
        </ArticleSection>

        {/* Living Style */}
        <ArticleSection>
          <SectionTitle>Living Style</SectionTitle>
          <ArticleGrid>
            {filterArticles(livingStyle).length > 0 ? (
              filterArticles(livingStyle).map((article) => (
                <ArticleCard key={article.id} to={`/article/${article.id}`}>
                  <ArticleImage className="article-image">
                    <img src={article.image || 'https://via.placeholder.com/400x200?text=No+Image'} alt={article.title} />
                  </ArticleImage>
                  <ArticleContent>
                    <ArticleTitleSmall>{article.title}</ArticleTitleSmall>
                    <ArticleExcerpt>
                      {article.excerpt?.substring(0, 100) || 'No excerpt available. Click to read more...'}
                    </ArticleExcerpt>
                    <ArticleFooter>
                      <ReadMore className="read-more">
                        Read more <FaArrowRight />
                      </ReadMore>
                    </ArticleFooter>
                  </ArticleContent>
                </ArticleCard>
              ))
            ) : (
              <div style={{ 
                gridColumn: '1 / -1', 
                textAlign: 'center', 
                padding: '2rem 0',
                color: theme.gray
              }}>
                <p>No living style articles found{searchQuery ? ` matching "${searchQuery}"` : ''}.</p>
              </div>
            )}
          </ArticleGrid>
        </ArticleSection>

        {/* Ad Videos Section */}
        {adVideos.length > 0 && (
          <ArticleSection>
            <SectionTitle>Featured Videos</SectionTitle>
            <ArticleGrid>
              {adVideos.map((video) => (
                <ArticleCard key={video.id} to={`/video/${video.id}`}>
                  <ArticleImage className="article-image">
                    <img src={video.thumbnail || 'https://via.placeholder.com/400x225?text=Video'} alt={video.title} />
                    <FaPlay className="play-icon" />
                  </ArticleImage>
                  <ArticleContent>
                    <ArticleTitleSmall>{video.title}</ArticleTitleSmall>
                    <ArticleExcerpt>
                      {video.description?.substring(0, 100) || 'Watch this featured video...'}
                    </ArticleExcerpt>
                    <ArticleFooter>
                      <ReadMore className="read-more">
                        Watch Now <FaArrowRight />
                      </ReadMore>
                    </ArticleFooter>
                  </ArticleContent>
                </ArticleCard>
              ))}
            </ArticleGrid>
          </ArticleSection>
        )}

        {/* Newsletter Signup */}
        <ArticleSection style={{ 
          background: `linear-gradient(135deg, ${theme.primary}20, ${theme.secondary}20)`,
          border: 'none',
          padding: '2.5rem',
          textAlign: 'center'
        }}>
          <h2 style={{ 
            fontSize: '1.75rem', 
            color: theme.dark, 
            marginBottom: '1rem' 
          }}>
            Stay Updated with Our Newsletter
          </h2>
          <p style={{ 
            color: theme.gray, 
            maxWidth: '600px', 
            margin: '0 auto 1.5rem',
            lineHeight: '1.6'
          }}>
            Subscribe to our newsletter to receive the latest health tips, articles, and updates right in your inbox.
          </p>
          <div style={{
            display: 'flex',
            maxWidth: '500px',
            margin: '0 auto',
            boxShadow: theme.boxShadow,
            borderRadius: '50px',
            overflow: 'hidden'
          }}>
            <input 
              type="email" 
              placeholder="Enter your email address" 
              style={{
                flex: 1,
                padding: '0.85rem 1.25rem',
                border: 'none',
                outline: 'none',
                fontSize: '1rem',
                borderRadius: '50px 0 0 50px'
              }}
            />
            <button 
              style={{
                background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                color: 'white',
                border: 'none',
                padding: '0 2rem',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'opacity 0.3s ease',
                whiteSpace: 'nowrap'
              }}
              onMouseOver={(e) => e.target.style.opacity = '0.9'}
              onMouseOut={(e) => e.target.style.opacity = '1'}
            >
              Subscribe
            </button>
          </div>
        </ArticleSection>
      </MainContent>
    </HomeContainer>
  );
};

// Export the Home component for use in other parts of the application
export default Home;


