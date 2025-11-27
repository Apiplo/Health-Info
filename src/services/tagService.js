const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';

function authHeaders(token) {
  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
}

/**
 * Fetch all tags.
 *
 * Mirrors GET /api/tags?lang=en
 *
 * @param {Object} [options]
 * @param {string} [options.lang='en'] - Language code used for sorting on the backend.
 * @returns {Promise<Array<{code: string, name_en: string, name_bn?: string}>>}
 */
export async function fetchTags({ lang = 'en' } = {}) {
  const res = await fetch(`${API_BASE}/tags?lang=${encodeURIComponent(lang)}`);

  if (!res.ok) {
    // Try to surface server error JSON if available
    let errBody = null;
    try {
      errBody = await res.json();
    } catch {
      // ignore
    }
    const message =
      (errBody && (errBody.error || errBody.message)) ||
      `Failed to fetch tags (${res.status})`;
    throw new Error(message);
  }

  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

/**
 * Create a new tag.
 *
 * Requires admin/editor JWT token.
 *
 * @param {Object} params
 * @param {string} params.token - Auth token
 * @param {string} params.code - Tag code (lowercase, no spaces)
 * @param {string} params.name_en - English name (required)
 * @param {string} [params.name_bn] - Bengali name (optional)
 * @returns {Promise<any>}
 */
export async function createTag({ token, code, name_en, name_bn }) {
  const res = await fetch(`${API_BASE}/tags`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(token),
    },
    body: JSON.stringify({ code, name_en, name_bn }),
  });

  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (!res.ok) {
    const errorPayload = body && typeof body === 'object' ? body : {};
    const status = res.status;
    const message =
      errorPayload.error ||
      errorPayload.message ||
      (status === 400
        ? 'Invalid tag data. Please check required fields.'
        : status === 401
        ? 'You are not logged in or your session has expired.'
        : status === 403
        ? 'You do not have permission to manage tags.'
        : status === 409
        ? 'A tag with this code already exists.'
        : `Failed to create tag (${status})`);

    const error = new Error(message);
    error.status = status;
    error.details = errorPayload;
    throw error;
  }

  return body;
}

/**
 * Update an existing tag by code.
 *
 * Code itself cannot be changed via this endpoint; only names.
 *
 * @param {Object} params
 * @param {string} params.token - Auth token
 * @param {string} params.code - Tag code to update
 * @param {string} params.name_en - New English name
 * @param {string} [params.name_bn] - New Bengali name
 * @returns {Promise<any>}
 */
export async function updateTag({ token, code, name_en, name_bn }) {
  const res = await fetch(`${API_BASE}/tags/${encodeURIComponent(code)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(token),
    },
    body: JSON.stringify({ name_en, name_bn }),
  });

  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (!res.ok) {
    const errorPayload = body && typeof body === 'object' ? body : {};
    const status = res.status;
    const message =
      errorPayload.error ||
      errorPayload.message ||
      (status === 400
        ? 'Invalid tag update. English name is required.'
        : status === 401
        ? 'You are not logged in or your session has expired.'
        : status === 403
        ? 'You do not have permission to manage tags.'
        : status === 404
        ? 'This tag no longer exists.'
        : `Failed to update tag (${status})`);

    const error = new Error(message);
    error.status = status;
    error.details = errorPayload;
    throw error;
  }

  return body;
}

/**
 * Delete a tag by code.
 *
 * @param {Object} params
 * @param {string} params.token - Auth token
 * @param {string} params.code - Tag code to delete
 * @returns {Promise<void>}
 */
export async function deleteTag({ token, code }) {
  const res = await fetch(`${API_BASE}/tags/${encodeURIComponent(code)}`, {
    method: 'DELETE',
    headers: {
      ...authHeaders(token),
    },
  });

  if (!res.ok) {
    let body = null;
    try {
      body = await res.json();
    } catch {
      body = null;
    }

    const errorPayload = body && typeof body === 'object' ? body : {};
    const status = res.status;
    const message =
      errorPayload.error ||
      errorPayload.message ||
      (status === 400
        ? 'Invalid tag code.'
        : status === 401
        ? 'You are not logged in or your session has expired.'
        : status === 403
        ? 'You do not have permission to manage tags.'
        : status === 404
        ? 'Tag not found. It may have already been deleted.'
        : `Failed to delete tag (${status})`);

    const error = new Error(message);
    error.status = status;
    error.details = errorPayload;
    throw error;
  }
}