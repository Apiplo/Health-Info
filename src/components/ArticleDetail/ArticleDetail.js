// Import necessary libraries and components
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { fetchArticleById } from '../../services/api';
import './ArticleDetail.css';

// Styles moved to ArticleDetail.css

// Component to display the details of a single article
const ArticleDetail = () => {
    // Get the article ID from the URL parameters
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
    // State to store the article data
  const [article, setArticle] = useState(null);
    // State for loading and error handling
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

    // useEffect hook to fetch the article data when the component mounts or the ID changes
  useEffect(() => {
        // Async function to fetch the article from the API
    const loadArticle = async () => {
      try {
        const data = await fetchArticleById(id);
        setArticle(data);
      } catch (err) {
                setError('Failed to load article.'); // Set an error message if the fetch fails
        console.error(err);
      } finally {
                setLoading(false); // Set loading to false once the data is fetched or an error occurs
      }
    };

    loadArticle();
  }, [id]);


    // Function to navigate back to the home page
  const handleBack = () => {
    navigate('/');
  };

    // Render the article detail view
  return (
    <div className="article-detail-container">
      <div className="article-detail-main-content">
        <div className="article-detail-card">
                  {/* Display a loading message, an error, or the article content */}
          {loading ? (
            <h1 className="article-title">Loading...</h1>
          ) : error ? (
            <h1 className="article-title">{error}</h1>
          ) : (
            <>
              <h1 className="article-title">{article?.title}</h1>

                          {/* Media section for displaying YouTube video or a placeholder */}
              <div className="media-section">
                {article.youtubeId ? (
                  <div className="youtube-wrapper">
                    <iframe
                      src={`https://www.youtube.com/embed/${article.youtubeId}`}
                      title={article.title || 'YouTube video'}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="media-placeholder">{article.image || 'Image/Video'}</div>
                )}
              </div>

                          {/* Article content section */}
              <div className="article-text">
                {/* Convert the article content to a string and split it by newlines to create paragraphs */}
                {String(article.content || '')
                  .split(/\n+/) // Split the content by newlines to create paragraphs
                  .map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Ad Column section - Right sidebar */}
      <div className="ad-column-sidebar">
        <div className="phone-mockup">
          <div className="phone-screen">
            <div className="promo-ad">
              <div className="promo-ad-image">
                <img
                  src="https://images.unsplash.com/photo-1511174511562-5f7f18b874f8?w=400&q=80&auto=format&fit=crop"
                  alt="Comprehensive Cardiac Checkup"
                />
              </div>
              <div className="promo-ad-body">
                <div className="promo-ad-title">Comprehensive Cardiac Checkup</div>
                <div className="promo-ad-desc">Save 30% this month. Schedule a preventive heart screening and take control of your health.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Export the component for use in other parts of the application
export default ArticleDetail;



