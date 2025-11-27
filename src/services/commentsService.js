const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function mapCommentFromApi(raw) {
  if (!raw) return null;

  return {
    id: String(raw.id),
    articleId: String(raw.article_id),
    userId: String(raw.user_id),
    authorDisplayName: raw.author_display_name,
    body: raw.body,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    editedAt: raw.edited_at,
    editedByUserId: raw.edited_by_user_id ? String(raw.edited_by_user_id) : null,
    deletedAt: raw.deleted_at,
    deletedByUserId: raw.deleted_by_user_id ? String(raw.deleted_by_user_id) : null,
  };
}

function normalizeArticleId(articleId) {
  const raw = String(articleId ?? '').trim();

  if (!raw || !/^\d+$/.test(raw)) {
    throw new Error('Invalid article ID for comments.');
  }

  return raw;
}

export async function fetchCommentsForArticle(articleId) {
  const id = normalizeArticleId(articleId);

  const res = await fetch(`${API_BASE}/articles/${id}/comments`, {
    method: 'GET',
  });

  if (!res.ok) {
    if (res.status === 404) {
      // Article not found or not published
      return [];
    }
    throw new Error(`Failed to load comments (status ${res.status})`);
  }

  const data = await res.json();
  if (!Array.isArray(data)) {
    return [];
  }

  return data.map(mapCommentFromApi).filter(Boolean);
}

export async function createComment(articleId, text, token) {
  const body = (text || '').trim();
  const id = normalizeArticleId(articleId);

  if (!body) {
    throw new Error('Comment text is required.');
  }
  if (!token) {
    throw new Error('You must be logged in to comment.');
  }

  const res = await fetch(`${API_BASE}/articles/${id}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(token),
    },
    body: JSON.stringify({ body }),
  });

  if (!res.ok) {
    if (res.status === 400) {
      throw new Error('Comment text is required.');
    }
    if (res.status === 401) {
      throw new Error('You must be logged in to comment.');
    }
    if (res.status === 404) {
      throw new Error('Article not found or not published.');
    }
    throw new Error(`Failed to create comment (status ${res.status})`);
  }

  const raw = await res.json();
  return mapCommentFromApi(raw);
}

export async function deleteComment(commentId, token) {
  if (!commentId) {
    throw new Error('commentId is required.');
  }
  if (!token) {
    throw new Error('Authentication required.');
  }

  const res = await fetch(`${API_BASE}/articles/comments/${commentId}`, {
    method: 'DELETE',
    headers: {
      ...authHeaders(token),
    },
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('Authentication required.');
    }
    if (res.status === 403) {
      throw new Error('Only admins can delete comments.');
    }
    if (res.status === 404) {
      throw new Error('Comment not found or already deleted.');
    }
    throw new Error(`Failed to delete comment (status ${res.status})`);
  }
}

export async function editComment(commentId, newText, token) {
  const body = (newText || '').trim();
  if (!commentId) {
    throw new Error('commentId is required.');
  }
  if (!body) {
    throw new Error('Comment text is required.');
  }
  if (!token) {
    throw new Error('Authentication required.');
  }

  const res = await fetch(`${API_BASE}/articles/comments/${commentId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(token),
    },
    body: JSON.stringify({ body }),
  });

  if (!res.ok) {
    if (res.status === 400) {
      throw new Error('Comment text is required.');
    }
    if (res.status === 401) {
      throw new Error('Authentication required.');
    }
    if (res.status === 403) {
      throw new Error('Only admins can edit comments.');
    }
    if (res.status === 404) {
      throw new Error('Comment not found or deleted.');
    }
    throw new Error(`Failed to edit comment (status ${res.status})`);
  }

  const raw = await res.json();
  return mapCommentFromApi(raw);
}