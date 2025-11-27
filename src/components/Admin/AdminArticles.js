import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { fetchTags as fetchAllTags } from '../../services/tagService';
import { fetchCategories as fetchAllCategories } from '../../services/categoryService';

const apiBase = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';

function ArticleRow({ item, onEdit, onDelete }) {
  const id = item.id || item._id || '—';
  const languageCode = item.language_code || item.language || 'en';
  const languageLabel = languageCode === 'bn' ? 'Bengali' : 'English';
  const tagsText = Array.isArray(item.tags) ? (item.tags.join(', ') || '—') : (item.tags || '—');

  return (
    <tr>
      <td style={{ padding: '8px 12px', borderBottom: '1px solid #eee', fontFamily: 'monospace' }}>{id}</td>
      <td style={{ padding: '8px 12px', borderBottom: '1px solid #eee' }}>{item.title}</td>
      <td style={{ padding: '8px 12px', borderBottom: '1px solid #eee' }}>{tagsText}</td>
      <td style={{ padding: '8px 12px', borderBottom: '1px solid #eee' }}>{languageLabel}</td>
      <td style={{ padding: '8px 12px', borderBottom: '1px solid #eee', whiteSpace: 'nowrap' }}>
        <button onClick={() => onEdit(item)} style={{ marginRight: 8 }}>Edit</button>
        <button onClick={() => onDelete(item)} style={{ color: '#b91c1c' }}>Delete</button>
      </td>
    </tr>
  );
}

export default function AdminArticles() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null); // null | article being edited/created
  const [translation, setTranslation] = useState({ lang: 'bn', title: '', content: '', excerpt: '' });
  const [existingTranslation, setExistingTranslation] = useState(null);
  const [existingLoading, setExistingLoading] = useState(false);
  const [existingError, setExistingError] = useState('');
  const [saving, setSaving] = useState(false);
  const [allTags, setAllTags] = useState([]);
  const [tagsLoading, setTagsLoading] = useState(false);
  const [tagsError, setTagsError] = useState('');
  const [allCategories, setAllCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState('');
  const tagFilter = (searchParams.get('tag') || '').trim().toLowerCase();

  // Load all articles
  async function load() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${apiBase}/articles`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      });
      if (!res.ok) throw new Error(`Failed to fetch (${res.status})`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.items || []);
      setItems(list);
    } catch (e) {
      setError(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []); // initial load

  // Load tag list for friendly tag selection
  useEffect(() => {
    let ignore = false;

    async function loadAllTags() {
      setTagsLoading(true);
      setTagsError('');
      try {
        const data = await fetchAllTags({ lang: 'en' });
        if (!ignore) {
          setAllTags(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        if (!ignore) {
          setTagsError(e.message || 'Failed to load tags');
        }
      } finally {
        if (!ignore) {
          setTagsLoading(false);
        }
      }
    }

    loadAllTags();
    return () => {
      ignore = true;
    };
  }, []);
 
  // Load category list for category picker
  useEffect(() => {
    let ignore = false;

    async function loadAllCategories() {
      setCategoriesLoading(true);
      setCategoriesError('');
      try {
        const data = await fetchAllCategories({ lang: 'en' });
        if (!ignore) {
          setAllCategories(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        if (!ignore) {
          setCategoriesError(e.message || 'Failed to load categories');
        }
      } finally {
        if (!ignore) {
          setCategoriesLoading(false);
        }
      }
    }

    loadAllCategories();
    return () => {
      ignore = true;
    };
  }, []);

  // When selecting an article + target language, load existing translation text (for editing existing)
  useEffect(() => {
    if (editing && (editing.id || editing._id)) {
      loadExistingTranslation(editing.id || editing._id, translation.lang);
    }
  }, [editing, translation.lang]);

  async function loadExistingTranslation(id, lang) {
    setExistingLoading(true);
    setExistingError('');
    setExistingTranslation(null);
    try {
      const headers = {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };
      const url = `${apiBase}/articles/${id}?lang=${lang}`;

      const res = await fetch(url, { headers });
      if (res.status === 404) {
        setTranslation(prev => ({ ...prev, lang, title: '', content: '', excerpt: '' }));
        setExistingTranslation(null);
        return;
      }
      if (!res.ok) {
        throw new Error(`Failed to load translation (${res.status})`);
      }
      const data = await res.json();
      let t = data?.translation || data?.result || data?.data || data;
      if (!t?.title && (data?.translations || data?.article?.translations)) {
        const map = data?.translations || data?.article?.translations || {};
        t = map[lang] || t;
      }
      const mapped = {
        title: t?.title || t?.name || '',
        content: t?.content || t?.body || t?.contentText || t?.contentHtml || '',
        excerpt: t?.excerpt || t?.summary || t?.preview || ''
      };
      setExistingTranslation(t || null);
      setTranslation(prev => ({ ...prev, lang, ...mapped }));
    } catch (e) {
      setExistingError(e.message || 'Failed to load translation');
    } finally {
      setExistingLoading(false);
    }
  }

  async function saveTranslation(e) {
    e.preventDefault();
    try {
      const id = editing?.id || editing?._id;
      if (!id) {
        alert('Please select an article first.');
        return;
      }
      const body = {};
      if (translation.title) body.title = translation.title;
      if (translation.content) body.content = translation.content;
      if (translation.excerpt) body.excerpt = translation.excerpt;
      const res = await fetch(`${apiBase}/articles/${id}/translations/${translation.lang}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error(`Translation save failed (${res.status})`);
      alert('Translation saved');
      await load();
    } catch (e) {
      alert(e.message || 'Failed to save translation');
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(a => {
      const idText = String(a.id || a._id || '').toLowerCase();
      const titleText = (a.title || '').toLowerCase();
      const tagsText = (Array.isArray(a.tags) ? a.tags.join(',') : (a.tags || '')).toLowerCase();
      const langText = (a.language_code || a.language || '').toLowerCase();
      return (
        idText.includes(q) ||
        titleText.includes(q) ||
        tagsText.includes(q) ||
        langText.includes(q)
      );
    });
  }, [items, query]);

  async function handleDelete(item) {
    if (!item?.id && !item?._id) return;
    const id = item.id || item._id;
    const prev = items;
    setItems(prev.filter(x => (x.id || x._id) !== id));
    try {
      const res = await fetch(`${apiBase}/articles/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      });
      if (!res.ok) throw new Error('Delete failed');
    } catch (e) {
      alert(e.message || 'Delete failed');
    }
  }

  function startCreate() {
    setEditing({
      title: '',
      content: '',
      tags: '',
      image_url: '',
      media_urls_raw: '',
      category_id: null,
      category_code: '',
      language: 'en'
    });
    setTranslation({ lang: 'bn', title: '', content: '', excerpt: '' });
    setExistingError('');
    setExistingTranslation(null);
  }

  function startEdit(item) {
    const tagsString = Array.isArray(item.tags) ? item.tags.join(',') : (item.tags || '');
    const normalizedImageUrl = item.image_url || item.imageUrl || item.image || item.thumbnail || '';
    const mediaArray = item.media_urls || item.mediaUrls || [];
    const mediaRaw = Array.isArray(mediaArray) ? mediaArray.join('\n') : '';
    const language = item.language_code || item.language || 'en';
    const categoryCode = item.category_code || item.category || '';
    const categoryId = item.category_id || item.categoryId || null;
 
    setEditing({
      ...item,
      image_url: normalizedImageUrl,
      tags: tagsString,
      media_urls_raw: mediaRaw,
      category_id: categoryId,
      category_code: categoryCode,
      language
    });
    setTranslation(prev => ({ ...prev, lang: 'bn' }));
  }

  function parseTags(raw) {
    return (raw || '')
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);
  }

  /**
   * Build a normalized media payload from raw textarea input + main image URL.
   *
   * - Splits raw media on newlines/commas.
   * - Trims and removes empty entries.
   * - De-duplicates URLs.
   * - If imageUrl is present and also appears in the list, it is removed
   *   from mediaUrls so the backend only sees that URL once (via image_url),
   *   preventing duplicate (article_id, media_asset_id) inserts.
   */
  function buildMediaPayload(rawMedia, imageUrl) {
    const urls = (rawMedia || '')
      .split(/[\n,]+/)
      .map(u => u.trim())
      .filter(Boolean);

    // de-duplicate media URLs
    let mediaUrls = urls.filter((url, index, arr) => arr.indexOf(url) === index);

    const image = (imageUrl || '').trim();

    if (image) {
      // If the main image URL is already in the media list, drop it from mediaUrls
      // so the backend doesn't try to attach the same asset twice (once from
      // media_urls and once from image_url).
      mediaUrls = mediaUrls.filter(url => url !== image);
    }

    return { mediaUrls, imageUrl: image };
  }

  async function createBilingualArticle(e) {
    e.preventDefault();
    if (!editing) return;

    if (!editing.title || !editing.content) {
      alert('English title and content are required.');
      return;
    }
    if (!translation.title || !translation.content) {
      alert('Bangla title and content are required to publish a bilingual article.');
      return;
    }

    const tagsArray = parseTags(editing.tags);
    const { mediaUrls, imageUrl } = buildMediaPayload(editing.media_urls_raw, editing.image_url);
 
    const baseBody = {
      title: editing.title,
      content: editing.content,
      language_code: 'en',
      tags: tagsArray.length ? tagsArray : undefined,
      media_urls: mediaUrls.length ? mediaUrls : undefined,
      image_url: imageUrl || undefined
    };

    if (editing.category_id) {
      baseBody.category_id = editing.category_id;
    } else if (editing.category_code) {
      baseBody.category_code = editing.category_code;
    }

    try {
      setSaving(true);

      const res1 = await fetch(`${apiBase}/articles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(baseBody)
      });

      if (!res1.ok) {
        let message = `Failed to create article (${res1.status})`;
        try {
          const err = await res1.json();
          if (err?.error) message = err.error;
        } catch {
          // ignore JSON parse error
        }
        alert(message);
        return;
      }

      const created = await res1.json();
      const articleId = created.id || created._id;
      if (!articleId) {
        alert('Article created but no ID returned from server.');
        return;
      }

      const bnBody = {
        title: translation.title,
        content: translation.content,
        language_code: 'bn',
        tags: tagsArray.length ? tagsArray : undefined,
        media_urls: mediaUrls.length ? mediaUrls : undefined,
        image_url: imageUrl || undefined
      };

      if (editing.category_id) {
        bnBody.category_id = editing.category_id;
      } else if (editing.category_code) {
        bnBody.category_code = editing.category_code;
      }

      const res2 = await fetch(`${apiBase}/articles/${articleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(bnBody)
      });

      if (!res2.ok) {
        let message = `Article created in English, but Bangla translation failed (${res2.status}).`;
        try {
          const err = await res2.json();
          if (err?.error) message = `Article created in English, but Bangla translation failed: ${err.error}`;
        } catch {
          // ignore
        }
        alert(message);
      } else {
        alert('Bilingual article published (English + Bangla).');
      }

      await load();
      setEditing(null);
      setTranslation({ lang: 'bn', title: '', content: '', excerpt: '' });
    } catch (e) {
      alert(e.message || 'Failed to create article');
    } finally {
      setSaving(false);
    }
  }

  async function saveEdit(e) {
    e.preventDefault();
    if (!editing?.id && !editing?._id) {
      return;
    }
    const id = editing.id || editing._id;
    const tagsArray = parseTags(editing.tags);
    const { mediaUrls, imageUrl } = buildMediaPayload(editing.media_urls_raw, editing.image_url);

    const payload = {
      title: editing.title,
      content: editing.content,
      language_code: editing.language || 'en',
      tags: tagsArray.length ? tagsArray : undefined,
      media_urls: mediaUrls.length ? mediaUrls : undefined,
      image_url: imageUrl || undefined
    };

    if (editing.category_id) {
      payload.category_id = editing.category_id;
    } else if (editing.category_code) {
      payload.category_code = editing.category_code;
    }

    try {
      setSaving(true);
      const res = await fetch(`${apiBase}/articles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Save failed');
      await load();
      setEditing(null);
    } catch (e) {
      alert(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  function handleFormSubmit(e) {
    if (editing?.id || editing?._id) {
      return saveEdit(e);
    }
    return createBilingualArticle(e);
  }

  const isEditingExisting = !!(editing && (editing.id || editing._id));

  return (
    <AdminLayout>
      <div style={{ maxWidth: 1100, margin: '24px auto', padding: '0 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ fontSize: 24 }}>Article Manager</h1>
        <div>
          <button onClick={startCreate} style={{ background: '#111827', color: '#fff', padding: '8px 12px', borderRadius: 6 }}>
            New Article
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by title/tags/language"
          style={{ flex: 1, padding: 8, border: '1px solid #e5e7eb', borderRadius: 6 }}
        />
        <button onClick={load}>Refresh</button>
      </div>

      {loading && <div>Loading…</div>}
      {error && <div style={{ color: '#b91c1c', marginBottom: 12 }}>{error}</div>}

      {!loading && !editing && (
        <div style={{ overflowX: 'auto', background: '#fff', border: '1px solid #eee', borderRadius: 8 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', textAlign: 'left' }}>
                <th style={{ padding: '10px 12px', borderBottom: '1px solid #eee' }}>ID</th>
                <th style={{ padding: '10px 12px', borderBottom: '1px solid #eee' }}>Title</th>
                <th style={{ padding: '10px 12px', borderBottom: '1px solid #eee' }}>Tags</th>
                <th style={{ padding: '10px 12px', borderBottom: '1px solid #eee' }}>Language</th>
                <th style={{ padding: '10px 12px', borderBottom: '1px solid #eee' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <ArticleRow key={item.id || item._id} item={item} onEdit={startEdit} onDelete={handleDelete} />
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: 16, textAlign: 'center', color: '#6b7280' }}>No articles found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <form onSubmit={handleFormSubmit} style={{ display: 'grid', gap: 12, maxWidth: 720 }}>
          <div>
            <label style={{ display: 'block', fontSize: 14, color: '#6b7280', marginBottom: 6 }}>Category (optional)</label>
            {categoriesError && (
              <div style={{ fontSize: 12, color: '#b91c1c', marginBottom: 4 }}>
                {categoriesError} — you can still publish without a category.
              </div>
            )}
            <select
              value={editing.category_id || ''}
              onChange={e => {
                const value = e.target.value;
                if (!value) {
                  setEditing({ ...editing, category_id: null });
                } else {
                  const idNum = Number(value);
                  const selected = allCategories.find(c => c.id === idNum);
                  setEditing({
                    ...editing,
                    category_id: idNum,
                    // Preserve existing code as a fallback if available
                    category_code: selected && selected.code
                      ? selected.code
                      : (editing.category_code || '')
                  });
                }
              }}
              disabled={categoriesLoading}
              style={{ width: '100%', padding: 8, border: '1px solid #e5e7eb', borderRadius: 6, background: '#fff' }}
            >
              <option value="">No category</option>
              {allCategories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name_en}
                </option>
              ))}
            </select>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
              Choose a high-level category like Health, Technology, or Sport. This helps group articles in the admin and on the site.
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 14, color: '#6b7280', marginBottom: 6 }}>Tags (comma-separated, e.g., environment,bangladesh)</label>
            <input
              value={editing.tags || ''}
              onChange={e => setEditing({ ...editing, tags: e.target.value })}
              placeholder="environment,bangladesh"
              style={{ width: '100%', padding: 8, border: '1px solid #e5e7eb', borderRadius: 6 }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 14, color: '#6b7280', marginBottom: 6 }}>Main image URL (optional)</label>
            <input
              value={editing.image_url || ''}
              onChange={e => setEditing({ ...editing, image_url: e.target.value })}
              placeholder="https://example.com/images/coastline.jpg"
              style={{ width: '100%', padding: 8, border: '1px solid #e5e7eb', borderRadius: 6 }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 14, color: '#6b7280', marginBottom: 6 }}>Media URLs (optional, one per line or comma-separated)</label>
            <textarea
              value={editing.media_urls_raw || ''}
              onChange={e => setEditing({ ...editing, media_urls_raw: e.target.value })}
              rows={3}
              placeholder={`https://example.com/images/coastline.jpg
https://youtu.be/abcd1234`}
              style={{ width: '100%', padding: 8, border: '1px solid #e5e7eb', borderRadius: 6 }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 14, color: '#6b7280', marginBottom: 6 }}>Editing language (for this version)</label>
            <select
              value={editing.language || 'en'}
              onChange={e => setEditing({ ...editing, language: e.target.value })}
              disabled={!isEditingExisting}
              style={{ width: '100%', padding: 8, border: '1px solid #e5e7eb', borderRadius: 6 }}
            >
              <option value="en">English</option>
              <option value="bn">Bengali</option>
            </select>
            {!isEditingExisting && (
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                New articles are created with English as the primary language. Bangla is added below.
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 14, color: '#6b7280', marginBottom: 6 }}>English title</label>
            <input
              value={editing.title || ''}
              onChange={e => setEditing({ ...editing, title: e.target.value })}
              required
              style={{ width: '100%', padding: 8, border: '1px solid #e5e7eb', borderRadius: 6 }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 14, color: '#6b7280', marginBottom: 6 }}>English content</label>
            <textarea
              value={editing.content || ''}
              onChange={e => setEditing({ ...editing, content: e.target.value })}
              rows={10}
              required
              style={{ width: '100%', padding: 8, border: '1px solid #e5e7eb', borderRadius: 6 }}
            />
          </div>

          <div style={{ height: 1, background: '#e5e7eb', margin: '8px 0' }} />

          {isEditingExisting ? (
            <>
              <h2 style={{ margin: 0, fontSize: 18 }}>Translation</h2>
              <p style={{ color: '#6b7280', marginTop: -4 }}>
                Update or add a translation for this article. This only changes the selected language’s text.
              </p>
              <div>
                <label style={{ display: 'block', fontSize: 14, color: '#6b7280', marginBottom: 6 }}>Target language</label>
                <select
                  value={translation.lang}
                  onChange={e => setTranslation({ ...translation, lang: e.target.value })}
                  style={{ width: '100%', padding: 8, border: '1px solid #e5e7eb', borderRadius: 6 }}
                >
                  <option value="bn">Bengali</option>
                  <option value="en">English</option>
                </select>
              </div>
              {existingLoading && <div>Loading translation…</div>}
              {existingError && <div style={{ color: '#b91c1c' }}>{existingError}</div>}
              <div>
                <label style={{ display: 'block', fontSize: 14, color: '#6b7280', marginBottom: 6 }}>New title (optional)</label>
                <input
                  value={translation.title}
                  onChange={e => setTranslation({ ...translation, title: e.target.value })}
                  style={{ width: '100%', padding: 8, border: '1px solid #e5e7eb', borderRadius: 6 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 14, color: '#6b7280', marginBottom: 6 }}>New content (optional)</label>
                <textarea
                  value={translation.content}
                  onChange={e => setTranslation({ ...translation, content: e.target.value })}
                  rows={8}
                  style={{ width: '100%', padding: 8, border: '1px solid #e5e7eb', borderRadius: 6 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 14, color: '#6b7280', marginBottom: 6 }}>New excerpt (optional)</label>
                <textarea
                  value={translation.excerpt}
                  onChange={e => setTranslation({ ...translation, excerpt: e.target.value })}
                  rows={3}
                  style={{ width: '100%', padding: 8, border: '1px solid #e5e7eb', borderRadius: 6 }}
                />
              </div>
            </>
          ) : (
            <>
              <h2 style={{ margin: 0, fontSize: 18 }}>Bangla version</h2>
              <p style={{ color: '#6b7280', marginTop: -4 }}>
                Provide the Bangla title and content. The system will create the English article first, then fill this Bangla translation.
              </p>
              <div>
                <label style={{ display: 'block', fontSize: 14, color: '#6b7280', marginBottom: 6 }}>Bangla title</label>
                <input
                  value={translation.title}
                  onChange={e => setTranslation({ ...translation, title: e.target.value })}
                  style={{ width: '100%', padding: 8, border: '1px solid #e5e7eb', borderRadius: 6 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 14, color: '#6b7280', marginBottom: 6 }}>Bangla content</label>
                <textarea
                  value={translation.content}
                  onChange={e => setTranslation({ ...translation, content: e.target.value })}
                  rows={8}
                  style={{ width: '100%', padding: 8, border: '1px solid #e5e7eb', borderRadius: 6 }}
                />
              </div>
            </>
          )}

          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button
              type="submit"
              disabled={saving}
              style={{ background: '#111827', color: '#fff', padding: '8px 12px', borderRadius: 6 }}
            >
              {isEditingExisting ? (saving ? 'Saving…' : 'Save') : (saving ? 'Publishing…' : 'Publish EN + BN')}
            </button>
            <button type="button" onClick={() => setEditing(null)}>Cancel</button>
            {isEditingExisting && (
              <button
                type="button"
                onClick={saveTranslation}
                style={{ marginLeft: 'auto', background: '#2563eb', color: '#fff', padding: '8px 12px', borderRadius: 6 }}
              >
                Save translation only
              </button>
            )}
          </div>
        </form>
      )}
      </div>
    </AdminLayout>
  );
}
