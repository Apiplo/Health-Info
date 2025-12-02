const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleJsonResponse(res) {
  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (!res.ok) {
    const errorPayload = body && typeof body === 'object' ? body : {};
    const message =
      errorPayload.error ||
      errorPayload.message ||
      `Server request failed. Please try again later. (Error ${res.status})`;
    const error = new Error(message);
    error.status = res.status;
    error.details = errorPayload;
    throw error;
  }

  return body === null ? {} : body;
}

/**
 * GET /api/health
 * Public liveness / readiness endpoint.
 *
 * @param {string|null} [token]
 * @returns {Promise<any>}
 */
export async function fetchHealth(token) {
  const res = await fetch(`${API_BASE}/health`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(token),
    },
  });
  return handleJsonResponse(res);
}

/**
 * GET /api/admin/stats
 * High-level content, user and orphaned-content statistics.
 *
 * @param {string} token
 * @returns {Promise<any>}
 */
export async function fetchAdminStats(token) {
  const res = await fetch(`${API_BASE}/admin/stats`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(token),
    },
  });
  return handleJsonResponse(res);
}

/**
 * GET /api/admin/users/inactive
 *
 * @param {string} token
 * @returns {Promise<any>}
 */
export async function fetchInactiveUsers(token) {
  const res = await fetch(`${API_BASE}/admin/users/inactive`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(token),
    },
  });
  return handleJsonResponse(res);
}

/**
 * GET /api/admin/content/orphaned
 *
 * @param {string} token
 * @returns {Promise<any>}
 */
export async function fetchOrphanedContent(token) {
  const res = await fetch(`${API_BASE}/admin/content/orphaned`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(token),
    },
  });
  return handleJsonResponse(res);
}

/**
 * POST /api/admin/cleanup
 *
 * @param {string} token
 * @returns {Promise<any>}
 */
export async function runCleanup(token) {
  const res = await fetch(`${API_BASE}/admin/cleanup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(token),
    },
  });
  return handleJsonResponse(res);
}

/**
 * GET /api/users/stats
 *
 * @param {string} token
 * @returns {Promise<any>}
 */
export async function fetchUserStats(token) {
  const res = await fetch(`${API_BASE}/users/stats`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(token),
    },
  });
  return handleJsonResponse(res);
}

/**
 * GET /api/translations/status
 *
 * @param {string|null} [token]
 * @returns {Promise<any>}
 */
export async function fetchTranslationStatus(token) {
  const res = await fetch(`${API_BASE}/translations/status`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(token),
    },
  });
  return handleJsonResponse(res);
}

/**
 * GET /api/translations/missing
 *
 * @param {string|null} [token]
 * @returns {Promise<any>}
 */
export async function fetchMissingTranslations(token) {
  const res = await fetch(`${API_BASE}/translations/missing`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(token),
    },
  });
  return handleJsonResponse(res);
}