const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';

function authHeaders(token) {
  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
}

/**
 * @typedef {Object} Category
 * @property {number} id
 * @property {string} name_en
 * @property {string} [name_bn]
 * @property {string} [code]
 */

/**
 * Fetch all categories.
 *
 * Mirrors GET /api/categories?lang=en
 *
 * @param {Object} [options]
 * @param {'en'|'bn'} [options.lang='en']
 * @returns {Promise<Category[]>}
 */
export async function fetchCategories({ lang = 'en' } = {}) {
  const res = await fetch(`${API_BASE}/categories?lang=${encodeURIComponent(lang)}`);

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
      (status === 500
        ? 'Failed to retrieve categories.'
        : `Failed to fetch categories (${status})`);

    const error = new Error(message);
    error.status = status;
    error.details = errorPayload;
    throw error;
  }

  return Array.isArray(body) ? body : [];
}

/**
 * Fetch a single category by ID.
 *
 * Mirrors GET /api/categories/:id
 *
 * @param {number} id
 * @returns {Promise<Category>}
 */
export async function fetchCategoryById(id) {
  const res = await fetch(`${API_BASE}/categories/${encodeURIComponent(id)}`);

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
        ? 'Invalid category ID.'
        : status === 404
        ? 'Category not found.'
        : 'Failed to retrieve category.');

    const error = new Error(message);
    error.status = status;
    error.details = errorPayload;
    throw error;
  }

  return body;
}

/**
 * @typedef {Object} CategoryArticle
 * @property {string} id
 * @property {string} title
 * @property {string} content
 * @property {string|null} image_url
 * @property {string} created_at
 * @property {string} updated_at
 * @property {string[]} tags
 * @property {string[]} tags_names
 */

/**
 * Fetch published articles for a category.
 *
 * Mirrors GET /api/categories/:id/articles?lang=en
 *
 * @param {Object} params
 * @param {number} params.id
 * @param {'en'|'bn'} [params.lang='en']
 * @returns {Promise<CategoryArticle[]>}
 */
export async function fetchCategoryArticles({ id, lang = 'en' }) {
  const res = await fetch(
    `${API_BASE}/categories/${encodeURIComponent(id)}/articles?lang=${encodeURIComponent(lang)}`
  );

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
        ? 'Invalid category ID.'
        : status === 404
        ? 'Category not found.'
        : 'Failed to retrieve articles for this category.');

    const error = new Error(message);
    error.status = status;
    error.details = errorPayload;
    throw error;
  }

  return Array.isArray(body) ? body : [];
}

/**
 * Create a new category.
 *
 * Mirrors POST /api/categories
 *
 * @param {Object} params
 * @param {string} params.token - JWT of admin/editor.
 * @param {string} params.name_en
 * @param {string} [params.name_bn]
 * @returns {Promise<Category>}
 */
export async function createCategory({ token, name_en, name_bn }) {
  const res = await fetch(`${API_BASE}/categories`, {
    method: 'POST',
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
        ? 'English name is required.'
        : status === 401
        ? 'You are not logged in or your session has expired.'
        : status === 403
        ? 'You do not have permission to manage categories.'
        : status === 409
        ? 'A category with this English name already exists.'
        : 'Failed to create category.');

    const error = new Error(message);
    error.status = status;
    error.details = errorPayload;
    throw error;
  }

  return body;
}

/**
 * Update an existing category.
 *
 * Mirrors PUT /api/categories/:id
 *
 * @param {Object} params
 * @param {string} params.token
 * @param {number} params.id
 * @param {string} params.name_en
 * @param {string} [params.name_bn]
 * @returns {Promise<Category>}
 */
export async function updateCategory({ token, id, name_en, name_bn }) {
  const res = await fetch(`${API_BASE}/categories/${encodeURIComponent(id)}`, {
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
        ? 'Invalid category ID or missing English name.'
        : status === 401
        ? 'You are not logged in or your session has expired.'
        : status === 403
        ? 'You do not have permission to manage categories.'
        : status === 404
        ? 'Category not found.'
        : status === 409
        ? 'A category with this English name already exists.'
        : 'Failed to update category.');

    const error = new Error(message);
    error.status = status;
    error.details = errorPayload;
    throw error;
  }

  return body;
}

/**
 * Delete a category by ID.
 *
 * Mirrors DELETE /api/categories/:id
 *
 * @param {Object} params
 * @param {string} params.token
 * @param {number} params.id
 * @returns {Promise<void>}
 */
export async function deleteCategory({ token, id }) {
  const res = await fetch(`${API_BASE}/categories/${encodeURIComponent(id)}`, {
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
        ? 'Invalid category ID.'
        : status === 401
        ? 'You are not logged in or your session has expired.'
        : status === 403
        ? 'You do not have permission to manage categories.'
        : status === 404
        ? 'Category not found. It may have already been deleted.'
        : 'Failed to delete category.');

    const error = new Error(message);
    error.status = status;
    error.details = errorPayload;
    throw error;
  }
}