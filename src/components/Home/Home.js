// Import necessary libraries and components
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { fetchFeaturedArticles, fetchHealthNewsTop3, fetchLivingStyleTop3, fetchAdVideos, fetchLivingStyleVideos } from '../../services/api';
import './Home.css';

// Styled component for the main container of the home page
const HomeContainer = styled.div`
  max-width: 1200px;
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

// Home component definition
const Home = () => {
    // State variables to store data fetched from the API
  const [featured, setFeatured] = useState([]);
  const [healthNews, setHealthNews] = useState([]);
  const [livingStyle, setLivingStyle] = useState([]);
  const [adVideos, setAdVideos] = useState([]);
  const [livingStyleVideos, setLivingStyleVideos] = useState([]);
  const [randomAd, setRandomAd] = useState(null);
    // State variables for loading and error handling
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

    // useEffect hook to fetch data when the component mounts
  useEffect(() => {
    let mounted = true;
        const load = async () => { // Async function to fetch all necessary data
      try {
                // Fetch all data in parallel for better performance
        const [fa, hn, ls, ads, lsVideos] = await Promise.all([
          fetchFeaturedArticles(),
          fetchHealthNewsTop3(),
          fetchLivingStyleTop3(),
          fetchAdVideos(),
          fetchLivingStyleVideos(),
        ]);
                // Update state with the fetched data
        setFeatured(fa);
        setHealthNews(hn);
        setLivingStyle(ls);
        setAdVideos(ads);
                // Select a random ad to display
        if (ads && ads.length > 0) {
          const idx = Math.floor(Math.random() * ads.length);
          setRandomAd(ads[idx]);
        }
        setLivingStyleVideos(lsVideos);
                        setError(''); // Clear any previous errors
      } catch (e) {
                setError('Failed to load data'); // Set error message on failure
      } finally {
                setLoading(false); // Set loading to false after data is fetched or an error occurs
      }
    };
    load();
        // Cleanup function to prevent state updates on an unmounted component
    return () => {
      mounted = false;
    };
  }, []);

    // Get the first item from the featured articles array to display as the main article
  const featuredItem = featured[0];

  return (
        // Render the home page layout
    <HomeContainer>
      <MainContent>
                {/* Featured Article Section */}
        <div className="article-section">
                    {/* Display loading or error message, or the featured article */}
          {loading && !featuredItem ? (
            <h1 className="article-title">Loading...</h1>
          ) : error ? (
            <h1 className="article-title">{error}</h1>
          ) : (
            <>
              <h1 className="article-title">{featuredItem?.title}</h1>
              {featuredItem?.youtubeId ? (
                <div className="youtube-wrapper">
                  <iframe
                    src={`https://www.youtube.com/embed/${featuredItem.youtubeId}`}
                    title={featuredItem?.title || 'YouTube video'}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="media-placeholder">{featuredItem?.image || 'Image/Video'}</div>
              )}
              <div className="article-meta">
                <div className="author">
                  <div className="author-avatar">{(featuredItem?.author || 'D')[0]}</div>
                  <span>{featuredItem?.author || 'Daniel'}</span>
                </div>
                <div className="audio-player">
                  <button className="play-button">▶</button>
                  <span>Play Audio {featuredItem?.audioDuration || '4:01'}</span>
                  <span>🎤</span>
                  <span>▼</span>
                </div>
              </div>
              <div className="article-text">
                <p>{featuredItem?.content?.slice(0, 400)}...</p>
              </div>
            </>
          )}
        </div>

        {/* Health News Section */}
        <div className="news-section">
          <h2 className="section-title">Health News Top 3</h2>
          <div className="article-grid">
                        {/* Map through ad videos or health news to display article cards */}
            {(adVideos.length > 0 ? adVideos : healthNews).map((article) => (
              <Link key={article.id} to={`/article/${article.id}`} state={{ youtubeId: article.youtubeId, title: article.title, description: article.description }} className="article-card">
                <div className="article-image">
                  {article.youtubeId ? (
                    <img src={`https://img.youtube.com/vi/${article.youtubeId}/mqdefault.jpg`} alt={article.title} />
                  ) : (
                    article.image
                  )}
                </div>
                <div className="article-content">
                  <h3 className="article-title-small">{article.title}</h3>
                  <p className="article-description">{article.description}</p>
                  <p className="article-excerpt">Explore science-backed tips, simple lifestyle tweaks, and habits that can make a meaningful difference to your long-term well-being.</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Lifestyle News Section */}
        <div className="news-section">
          <h2 className="section-title">Lifestyle Top 3</h2>
          <div className="article-grid">
                        {/* Map through lifestyle videos or articles to display article cards */}
            {(livingStyleVideos.length > 0 ? livingStyleVideos : livingStyle).map((article) => (
              <Link key={article.id} to={`/article/${article.id}`} state={{ youtubeId: article.youtubeId, title: article.title, description: article.description }} className="article-card">
                <div className="article-image">
                  {article.youtubeId ? (
                    <img src={`https://img.youtube.com/vi/${article.youtubeId}/mqdefault.jpg`} alt={article.title} />
                  ) : (
                    article.image
                  )}
                </div>
                <div className="article-content">
                  <h3 className="article-title-small">{article.title}</h3>
                  <p className="article-description">{article.description}</p>
                  <p className="article-excerpt">Actionable insights to help you sleep better, feel better, and live better—without overhauling your entire routine.</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </MainContent>

            {/* Advertisement Column */}
      <AdColumn>
        <div className="phone-mockup">
          <div className="phone-screen">
            <div className="promo-ad">
              <div className="promo-ad-image">
                <img
                  src="https://images.unsplash.com/photo-1511174511562-5f7f18b874f8?w=800&q=80&auto=format&fit=crop"
                  alt="Comprehensive Cardiac Checkup"
                />
              </div>
              <div className="promo-ad-body">
                <div className="promo-ad-title">Comprehensive Cardiac Checkup</div>
                <div className="promo-ad-desc">Save 30% this month. Schedule a preventive heart screening and take control of your health.</div>
                <a className="promo-ad-cta" href="/register">Sign up now</a>
              </div>
            </div>
          </div>
        </div>
      </AdColumn>
    </HomeContainer>
  );
};

// Export the Home component for use in other parts of the application
export default Home;


