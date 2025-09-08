// Import necessary libraries and components
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { fetchArticleById } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import './ArticleDetail.css';
import { videoFallback, extractYouTubeId } from '../../data/config';

// Styles moved to ArticleDetail.css

// Component to display the details of a single article
const ArticleDetail = () => {
  // Resolve fallback by category; default when missing
  const getFallbackId = () => {
    const cat = String(article?.category || '').toLowerCase();
    if (cat.includes('health') || cat.includes('wellness') || cat.includes('nutrition')) return extractYouTubeId(videoFallback.health) || videoFallback.default;
    if (cat.includes('tech')) return extractYouTubeId(videoFallback.technology) || videoFallback.default;
    if (cat.includes('sport')) return extractYouTubeId(videoFallback.sport) || videoFallback.default;
    return extractYouTubeId(videoFallback.default) || 'pxwm3sqAytE';
  };
    // Get the article ID from the URL parameters
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
    // State to store the article data
  const [article, setArticle] = useState(null);
    // State for loading and error handling
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for comments
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

    // useEffect hook to fetch the article data when the component mounts or the ID changes
  useEffect(() => {
    // Use state immediately for fast first paint
    if (location.state && !article) {
      setArticle(location.state);
    }

    // Decide whether we need to fetch richer detail (e.g., youtubeId/content)
    const needsHydration = !location.state || !location.state.youtubeId || !location.state.content;

    const loadArticle = async () => {
      try {
        if (!id || !needsHydration) {
          setLoading(false);
          return;
        }
        const data = await fetchArticleById(id);
        setArticle(data);
      } catch (err) {
        setError('Failed to load article.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [id]);

  // Load comments for the article
  useEffect(() => {
    // Mock comments data - trong thực tế sẽ fetch từ API
    const mockComments = [
      {
        id: 1,
        author: "John Doe",
        content: "This article is very helpful! Thank you for sharing such valuable information.",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toLocaleString('en-US'),
        avatar: "JD"
      },
      {
        id: 2,
        author: "Jane Smith",
        content: "Great insights! The content is well-structured and easy to understand. I learned a lot from this.",
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toLocaleString('en-US'),
        avatar: "JS"
      }
    ];
    setComments(mockComments);
  }, [id]);

  // Handle comment submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    setCommentLoading(true);
    
    // Mock comment submission - trong thực tế sẽ gửi lên API
    const comment = {
      id: Date.now(),
      author: user?.username || user?.name || 'Anonymous User',
      content: newComment.trim(),
      timestamp: new Date().toLocaleString('en-US'),
      avatar: (user?.username || user?.name || 'A').substring(0, 2).toUpperCase()
    };
    
    // Add new comment to the beginning of the list
    setComments(prev => [comment, ...prev]);
    setNewComment('');
    setCommentLoading(false);
  };


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
                <div className="youtube-wrapper">
                  <iframe
                    src={`https://www.youtube.com/embed/${extractYouTubeId(article.youtubeId) || getFallbackId()}`}
                    title={article.title || 'YouTube video'}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
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

              {/* Comments section */}
              <div className="comments-section">
                <div className="comments-header">
                  <h3>Comments ({comments.length})</h3>
                </div>

                {/* Comment form - only show if user is authenticated */}
                {isAuthenticated ? (
                  <form onSubmit={handleCommentSubmit} className="comment-form">
                    <div className="comment-input-wrapper">
                      <div className="comment-avatar">
                        {(user?.username || user?.name || 'A').substring(0, 2).toUpperCase()}
                      </div>
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write your comment..."
                        className="comment-input"
                        rows="3"
                        maxLength="500"
                      />
                    </div>
                    <div className="comment-actions">
                      <span className="character-count">
                        {newComment.length}/500
                      </span>
                      <button 
                        type="submit" 
                        className="comment-submit-btn"
                        disabled={!newComment.trim() || commentLoading}
                      >
                        {commentLoading ? 'Posting...' : 'Post Comment'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="login-prompt">
                    <p>Please <button onClick={() => navigate('/login')} className="login-link">login</button> to comment</p>
                  </div>
                )}

                {/* Comments list */}
                <div className="comments-list">
                  {comments.length > 0 ? (
                    comments.map((comment) => (
                      <div key={comment.id} className="comment-item">
                        <div className="comment-avatar">
                          {comment.avatar}
                        </div>
                        <div className="comment-content">
                          <div className="comment-header">
                            <span className="comment-author">{comment.author}</span>
                            <span className="comment-time">{comment.timestamp}</span>
                          </div>
                          <p className="comment-text">{comment.content}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-comments">
                      <p>No comments yet. Be the first to comment!</p>
                    </div>
                  )}
                </div>
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



