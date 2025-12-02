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
    throw new Error('Unable to load comments. The article ID is invalid or missing.');
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
    throw new Error(`Unable to load comments. The server returned an error (${res.status}). Please refresh the page and try again.`);
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
    throw new Error('Please enter a comment before posting.');
  }
  if (!token) {
    throw new Error('Please log in to post comments.');
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
      throw new Error('Please enter a comment before posting.');
    }
    if (res.status === 401) {
      throw new Error('Please log in to post comments.');
    }
    if (res.status === 404) {
      throw new Error('Cannot post comments on this article. It may have been removed or is not yet published.');
    }
    throw new Error(`Unable to post your comment. Please try again later. (Error ${res.status})`);
  }

  const raw = await res.json();
  return mapCommentFromApi(raw);
}

export async function deleteComment(commentId, token) {
  if (!commentId) {
    throw new Error('Unable to delete comment. The comment ID is missing.');
  }
  if (!token) {
    throw new Error('Please log in to delete comments.');
  }

  const res = await fetch(`${API_BASE}/articles/comments/${commentId}`, {
    method: 'DELETE',
    headers: {
      ...authHeaders(token),
    },
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('Please log in to delete comments.');
    }
    if (res.status === 403) {
      throw new Error('Only administrators can delete comments.');
    }
    if (res.status === 404) {
      throw new Error('This comment has already been deleted or does not exist.');
    }
    throw new Error(`Unable to delete comment. Please try again later. (Error ${res.status})`);
  }
}

export async function editComment(commentId, newText, token) {
  const body = (newText || '').trim();
  if (!commentId) {
    throw new Error('Unable to edit comment. The comment ID is missing.');
  }
  if (!body) {
    throw new Error('Please enter a comment before saving.');
  }
  if (!token) {
    throw new Error('Please log in to edit comments.');
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
      throw new Error('Please enter a comment before saving.');
    }
    if (res.status === 401) {
      throw new Error('Please log in to edit comments.');
    }
    if (res.status === 403) {
      throw new Error('Only administrators can edit comments.');
    }
    if (res.status === 404) {
      throw new Error('This comment cannot be edited because it has been deleted or does not exist.');
    }
    throw new Error(`Unable to save your changes. Please try again later. (Error ${res.status})`);
  }

  const raw = await res.json();
  return mapCommentFromApi(raw);
}