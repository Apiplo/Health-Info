  // Import necessary libraries and components
  import React, { useEffect, useState } from 'react';
  import { useParams, useNavigate, useLocation } from 'react-router-dom';
  // Direct API calls to backend server
  import { useAuth } from '../../contexts/AuthContext';
  import { useTranslation } from '../../hooks/useTranslation';
  import { useLanguage } from '../../contexts/LanguageContext';
  import './ArticleDetail.css';
  import { videoFallback, extractYouTubeId } from '../../data/config';
  import {
    fetchCommentsForArticle,
    createComment,
    editComment,
    deleteComment as deleteCommentApi,
  } from '../../services/commentsService';
 
// Styles moved to ArticleDetail.css

  // Component to display the details of a single article
  const ArticleDetail = () => {
    const apiBase = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';
    // Resolve fallback by category; default when missing
    const getFallbackId = () => {
      const cat = String(article?.category || '').toLowerCase();
      if (cat.includes('health') || cat.includes('wellness') || cat.includes('nutrition')) return extractYouTubeId(videoFallback.health) || videoFallback.default;
      if (cat.includes('tech')) return extractYouTubeId(videoFallback.technology) || videoFallback.default;
    if (cat.includes('sport')) return extractYouTubeId(videoFallback.sport) || videoFallback.default;
    return extractYouTubeId(videoFallback.default) || 'pxwm3sqAytE';
  };

  // Prefer article-provided video URLs (from API) before falling back
  const getArticleVideoId = (article) => {
    if (!article) return '';

    const candidates = [];

    // Explicit youtubeId field if present
    if (article.youtubeId) {
      candidates.push(article.youtubeId);
    }

    // API fields: arrays of URLs
    if (Array.isArray(article.video_urls)) {
      candidates.push(...article.video_urls);
    }
    if (Array.isArray(article.media_urls)) {
      candidates.push(...article.media_urls);
    }

    // Optional single URL field
    if (article.video_url) {
      candidates.push(article.video_url);
    }

    for (const candidate of candidates) {
      const id = extractYouTubeId(candidate);
      if (id) return id;
    }

    return '';
  };
  // Get the article ID from the URL parameters
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, token } = useAuth();
  const { currentLanguage } = useLanguage();
  
  // State to store the article data
  const [article, setArticle] = useState(null);
  // Use the same route id for comments as for article content
  const articleId = id;
  // State for loading and error handling
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // State for comments
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);
  const [commentError, setCommentError] = useState('');

  // Translation ref for comments section (depends on comments updates)
  const commentsRef = useTranslation([comments, commentLoading, loadingComments]);

  // State for text-to-speech
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [utterance, setUtterance] = useState(null);
  const [voice, setVoice] = useState(null);
  const [pitch, setPitch] = useState(1);
  const [rate, setRate] = useState(1);
  const [volume, setVolume] = useState(1);

    // useEffect hook to fetch the article data when the component mounts or the ID changes
  useEffect(() => {
    // Use state immediately for fast first paint
    if (location.state && !article) {
      setArticle(location.state);
    }

    const loadArticle = async () => {
      try {
        if (!id) {
          setLoading(false);
          return;
        }
        // Fetch the article for the selected language using path parameter form: /api/articles/:id/:lang
        const response = await fetch(`${apiBase}/articles/${id}/${currentLanguage}`);
        if (!response.ok) {
          let errorMessage = 'Unable to load this article.';
          if (response.status === 404) {
            errorMessage = 'This article cannot be found. It may have been removed or the link is incorrect.';
          } else if (response.status === 403) {
            errorMessage = 'You don\'t have permission to view this article.';
          } else if (response.status === 500) {
            errorMessage = 'Server error occurred while loading the article. Please try again later.';
          }
          throw new Error(errorMessage);
        }
        const data = await response.json();
        setArticle(data);
      } catch (err) {
        setError('Unable to load this article. Please refresh the page and try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [id, currentLanguage]);

  // Decide the language for speech based on article metadata or content
  const getSpeechLang = () => {
    // 1) Use article.language if provided (e.g., 'en', 'en-US', 'bn', 'bn-BD')
    const meta = (article && article.language) ? String(article.language).toLowerCase() : '';
    if (meta.startsWith('bn')) return 'bn-BD';
    if (meta.startsWith('en')) return 'en-US';

    // 2) Heuristic: detect Bangla characters in content
    const txt = String(article?.content || '');
    const hasBangla = /[\u0980-\u09FF]/.test(txt);
    if (hasBangla) return 'bn-BD';

    // 3) Fallback: default to English when uncertain
    return 'en-US';
  };

  // Initialize and select an appropriate speech synthesis voice for the current language
  useEffect(() => {
    const synth = window.speechSynthesis;

    const selectVoiceForLanguage = () => {
      const voices = synth.getVoices();
      const speechLang = getSpeechLang().toLowerCase();
      const langPrefix = speechLang.split('-')[0];
      const lower = (v) => (v && typeof v === 'string' ? v.toLowerCase() : '');

      // Prefer exact region match, then any matching language, fallback to first
      const exact = voices.find(v => lower(v.lang) === speechLang);
      const byLang = voices.find(v => lower(v.lang).startsWith(langPrefix));
      const chosen = exact || byLang || voices[0] || null;
      setVoice(chosen);
    };

    // Some browsers need an initial call; also listen for async population
    selectVoiceForLanguage();
    if (typeof synth.onvoiceschanged !== 'undefined') {
      synth.onvoiceschanged = selectVoiceForLanguage;
    }

    return () => {
      if (synth.speaking) {
        synth.cancel();
      }
      if (typeof synth.onvoiceschanged !== 'undefined') {
        synth.onvoiceschanged = null;
      }
    };
  }, [currentLanguage, article?.language, article?.content]);

  // Reset utterance when the speech language or content changes to avoid stale language settings
  useEffect(() => {
    const synth = window.speechSynthesis;
    if (synth.speaking) {
      synth.cancel();
    }
    setUtterance(null);
    setIsPlaying(false);
    setIsPaused(false);
  }, [article?.content, article?.language, currentLanguage]);
  
  // Handle speech actions
  const handlePlay = () => {
    const synth = window.speechSynthesis;
    
    if (isPaused) {
      synth.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }
    
    if (!utterance && article) {
      const newUtterance = new SpeechSynthesisUtterance(article.content);
      newUtterance.voice = voice || null;
      newUtterance.pitch = pitch;
      newUtterance.rate = rate;
      newUtterance.volume = volume;
      // Set language based on article metadata or content detection
      newUtterance.lang = getSpeechLang();
      
      newUtterance.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
      };
      
      newUtterance.onpause = () => {
        setIsPlaying(false);
        setIsPaused(true);
      };
      
      newUtterance.onresume = () => {
        setIsPlaying(true);
        setIsPaused(false);
      };
      
      setUtterance(newUtterance);
      synth.speak(newUtterance);
      setIsPlaying(true);
    } else if (utterance) {
      synth.speak(utterance);
      setIsPlaying(true);
      setIsPaused(false);
    }
  };
  
  const handlePause = () => {
    const synth = window.speechSynthesis;
    if (synth.speaking) {
      synth.pause();
      setIsPlaying(false);
      setIsPaused(true);
    }
  };
  
  const handleStop = () => {
    const synth = window.speechSynthesis;
    synth.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };
  
  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      const synth = window.speechSynthesis;
      if (synth.speaking) {
        synth.cancel();
      }
    };
  }, []);

  // Load comments for the article
  useEffect(() => {
    let cancelled = false;

    const loadComments = async () => {
      if (!articleId) {
        setComments([]);
        return;
      }

      setLoadingComments(true);
      setCommentError('');
      try {
        const list = await fetchCommentsForArticle(articleId);
        if (!cancelled) {
          setComments(list);
        }
      } catch (err) {
        console.error('Failed to load comments:', err);
        if (!cancelled) {
          setCommentError(err.message || 'Unable to load comments. Please refresh the page and try again.');
        }
      } finally {
        if (!cancelled) {
          setLoadingComments(false);
        }
      }
    };

    loadComments();

    return () => {
      cancelled = true;
    };
  }, [articleId]);

  // Handle comment submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    const trimmed = newComment.trim();
    if (!trimmed) return;

    setCommentLoading(true);
    setCommentError('');

    try {
      const created = await createComment(articleId, trimmed, token);
      setComments((prev) => [...prev, created]);
      setNewComment('');
    } catch (err) {
      console.error('Failed to submit comment:', err);
      setCommentError(err.message || 'Unable to post your comment. Please try again later.');
    } finally {
      setCommentLoading(false);
    }
  };

  // Admin-only: start editing a comment
  const startEdit = (comment) => {
    setEditingId(comment.id);
    setEditContent((comment.content || comment.body || ''));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  // Admin-only: save edited comment via PUT /api/articles/comments/:id
  const saveEdit = async (commentId) => {
    const trimmed = editContent.trim();
    if (!trimmed) return;
    try {
      setEditLoading(true);
      setCommentError('');
      const updated = await editComment(commentId, trimmed, token);
      setComments((prev) =>
        prev.map((c) => (String(c.id) === String(updated.id) ? { ...c, ...updated } : c))
      );
      setEditingId(null);
      setEditContent('');
    } catch (e) {
      console.error('Failed to update comment:', e);
      setCommentError(e.message || 'Unable to save your changes. Please try again later.');
    } finally {
      setEditLoading(false);
    }
  };

  // Admin-only: delete comment via DELETE /api/articles/comments/:id
  const handleDeleteComment = async (commentId) => {
    try {
      setDeleteLoadingId(commentId);
      setCommentError('');
      await deleteCommentApi(commentId, token);
      setComments((prev) => prev.filter((c) => String(c.id) !== String(commentId)));
    } catch (e) {
      console.error('Failed to delete comment:', e);
      setCommentError(e.message || 'Unable to delete this comment. Please try again later.');
    } finally {
      setDeleteLoadingId(null);
    }
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
              {/* Back to home button */}
              <button onClick={handleBack} className="back-to-home-btn">
                ← Back to Home
              </button>
              <div className="article-header" data-no-translate>
                <h1 className="article-title">{article?.title}</h1>
                <div className="audio-controls" style={{ margin: '1rem 0' }}>
                  <button 
                    onClick={isPlaying ? handlePause : handlePlay}
                    disabled={!article?.content}
                    style={{
                      padding: '0.5rem 1rem',
                      marginRight: '0.5rem',
                      backgroundColor: isPlaying ? '#ff6b6b' : '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    {isPlaying ? (
                      <>
                        <span>Pause</span>
                        <span>⏸️</span>
                      </>
                    ) : isPaused ? (
                      <>
                        <span>Resume</span>
                        <span>▶️</span>
                      </>
                    ) : (
                      <>
                        <span>Listen to Article</span>
                        <span>🔊</span>
                      </>
                    )}
                  </button>
                  {isPlaying && (
                    <button 
                      onClick={handleStop}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <span>Stop</span>
                      <span>⏹️</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Media section for displaying YouTube video or a placeholder */}
              <div className="media-section">
                <div className="youtube-wrapper">
                  <iframe
                    src={`https://www.youtube.com/embed/${getArticleVideoId(article) || getFallbackId()}`}
                    title={article.title || 'YouTube video'}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              </div>

                          {/* Article content section */}
              <div className="article-text" data-no-translate>
                {/* Convert the article content to a string and split it by newlines to create paragraphs */}
                {String(article.content || '')
                  .split(/\n+/) // Split the content by newlines to create paragraphs
                  .map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
              </div>

              {/* Comments section (auto-translated when Bangla is active) */}
              <div className="comments-section" ref={commentsRef}>
                <div className="comments-header">
                  <h3>Comments ({comments.length})</h3>
                  {commentError && (
                    <div className="comment-error" style={{ color: '#b91c1c', marginTop: 8 }}>
                      {commentError}
                    </div>
                  )}
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
                        placeholder={currentLanguage === 'bn' ? 'আপনার মন্তব্য লিখুন...' : 'Write your comment...'}
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
                  {loadingComments && (
                    <p>Loading comments...</p>
                  )}
                  {!loadingComments && comments.length === 0 && !commentError && (
                    <div className="no-comments">
                      <p>No comments yet. Be the first to comment.</p>
                    </div>
                  )}
                  {!loadingComments && comments.length > 0 && (
                    comments.map((comment) => (
                      <div key={comment.id} className="comment-item">
                        <div className="comment-avatar">
                          {comment.avatar}
                        </div>
                        <div className="comment-content">
                          <div className="comment-header">
                            <span className="comment-author" data-no-translate>
                              {comment.author ||
                                comment.author_display_name ||
                                comment.authorDisplayName ||
                                'User'}
                            </span>
                            <span className="comment-time" data-no-translate>
                              {comment.timestamp ||
                                ((comment.created_at || comment.createdAt)
                                  ? new Date(comment.created_at || comment.createdAt).toLocaleString()
                                  : '')}
                            </span>
                            {(comment.editedAt || comment.edited_at) && (
                              <span className="comment-edited-flag" data-no-translate>
                                {' '}
                                (edited)
                              </span>
                            )}
                            {(user?.role === 'admin' || user?.isAdmin) && (
                              <span
                                className="comment-admin-actions"
                                style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}
                              >
                                {editingId === comment.id ? (
                                  <>
                                    <button
                                      onClick={() => saveEdit(comment.id)}
                                      disabled={editLoading || !editContent.trim()}
                                      className="comment-save-btn"
                                    >
                                      {editLoading ? 'Saving…' : 'Save'}
                                    </button>
                                    <button onClick={cancelEdit} className="comment-cancel-btn">
                                      Cancel
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => startEdit(comment)}
                                      className="comment-edit-btn"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteComment(comment.id)}
                                      disabled={deleteLoadingId === comment.id}
                                      className="comment-delete-btn"
                                    >
                                      {deleteLoadingId === comment.id ? 'Deleting…' : 'Delete'}
                                    </button>
                                  </>
                                )}
                              </span>
                            )}
                          </div>
                          {editingId === comment.id ? (
                            <textarea
                              className="comment-input"
                              rows="3"
                              maxLength="500"
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                            />
                          ) : (
                            <p className="comment-text">
                              {comment.content || comment.body}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
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



