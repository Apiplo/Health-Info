import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const apiBase = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';

function ArticleRow({ item, onEdit, onDelete }) {
  return (
    <tr>
      <td style={{ padding: '8px 12px', borderBottom: '1px solid #eee', fontFamily: 'monospace' }}>{item.id || item._id || '—'}</td>
      <td style={{ padding: '8px 12px', borderBottom: '1px solid #eee' }}>{item.title}</td>
      <td style={{ padding: '8px 12px', borderBottom: '1px solid #eee' }}>{Array.isArray(item.tags) ? (item.tags.join(', ') || '—') : (item.tags || '—')}</td>
      <td style={{ padding: '8px 12px', borderBottom: '1px solid #eee' }}>{(item.language === 'bn' ? 'Bengali' : 'English')}</td>
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
  const [editing, setEditing] = useState(null); // null | article
  const [translation, setTranslation] = useState({ lang: 'bn', title: '', content: '', excerpt: '' });
  const [existingTranslation, setExistingTranslation] = useState(null);
  const [existingLoading, setExistingLoading] = useState(false);
  const [existingError, setExistingError] = useState('');

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

  // initial load
  useEffect(() => { load(); }, []);

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
      const attempts = [
        // Working endpoint returns the article localized via query param
        `${apiBase}/articles/${id}?lang=${lang}`,
      ];

      let lastStatus = 0;
      for (const url of attempts) {
        try {
          // console.debug('Trying translation fetch', { url });
          const res = await fetch(url, { headers });
          lastStatus = res.status;
          if (res.status === 404) {
            // try next endpoint shape
            continue;
          }
          if (!res.ok) {
            // try next, but log
            // console.debug('Translation fetch non-OK', { url, status: res.status });
            continue;
          }
          const data = await res.json();
          // console.debug('Loaded translation payload', { url, id, lang, data });
          // Normalize shapes
          let t = data?.translation || data?.result || data?.data || data;
          // If server returns full article with translations map, try to pick by lang
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
          return; // success
        } catch (inner) {
          console.debug('Translation attempt failed', { url, error: inner?.message });
          continue;
        }
      }
      // If all attempts failed
      if (lastStatus === 404) {
        setTranslation(prev => ({ ...prev, lang, title: '', content: '', excerpt: '' }));
        setExistingTranslation(null);
        return;
      }
      throw new Error(`No translation endpoint succeeded (last status ${lastStatus || 'n/a'})`);
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
      // Optionally refresh list
      await load();
    } catch (e) {
      alert(e.message || 'Failed to save translation');
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(a =>
      String(a.id || a._id || '').toLowerCase().includes(q) ||
      (a.title || '').toLowerCase().includes(q) ||
      ((Array.isArray(a.tags) ? a.tags.join(',') : (a.tags || '')).toLowerCase().includes(q)) ||
      (a.language || '').toLowerCase().includes(q)
    );
  }, [items, query]);

  async function handleDelete(item) {
    if (!item?.id && !item?._id) return;
    const id = item.id || item._id;
    // optimistic UI
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
    setEditing({ title: '', content: '', tags: '', image_url: '', language: 'en' });
  }

  function startEdit(item) {
    const tagsString = Array.isArray(item.tags) ? item.tags.join(',') : (item.tags || '');
    const normalizedImageUrl = item.image_url || item.imageUrl || item.image || item.thumbnail || '';
    setEditing({ ...item, image_url: normalizedImageUrl, tags: tagsString, language: item.language || 'en' });
  }
  async function saveEdit(e) {
    e.preventDefault();
    const tagsArray = (editing.tags || '')
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);
    const payload = { title: editing.title, content: editing.content, image_url: editing.image_url, tags: tagsArray, language: editing.language };
    try {
      let res;
      if (editing.id || editing._id) {
        const id = editing.id || editing._id;
        res = await fetch(`${apiBase}/articles/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`${apiBase}/articles`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify(payload)
        });
      }
      if (!res.ok) throw new Error('Save failed');
      await load();
      setEditing(null);
    } catch (e) {
      alert(e.message || 'Save failed');
    }
  }

  return (
    <div style={{ maxWidth: 1100, margin: '24px auto', padding: '0 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ fontSize: 24 }}>Article Manager</h1>
        <div>
          <button onClick={startCreate} style={{ background: '#111827', color: '#fff', padding: '8px 12px', borderRadius: 6 }}>New Article</button>
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
        <form onSubmit={saveEdit} style={{ display: 'grid', gap: 12, maxWidth: 720 }}>
          <div>
            <label style={{ display: 'block', fontSize: 14, color: '#6b7280', marginBottom: 6 }}>Title</label>
            <input value={editing.title || ''} onChange={e => setEditing({ ...editing, title: e.target.value })} required style={{ width: '100%', padding: 8, border: '1px solid #e5e7eb', borderRadius: 6 }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 14, color: '#6b7280', marginBottom: 6 }}>Tags (comma-separated, e.g., tech,news)</label>
            <input value={editing.tags || ''} onChange={e => setEditing({ ...editing, tags: e.target.value })} placeholder="tech,news" style={{ width: '100%', padding: 8, border: '1px solid #e5e7eb', borderRadius: 6 }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 14, color: '#6b7280', marginBottom: 6 }}>Language</label>
            <select value={editing.language || 'en'} onChange={e => setEditing({ ...editing, language: e.target.value })} style={{ width: '100%', padding: 8, border: '1px solid #e5e7eb', borderRadius: 6 }}>
              <option value="en">English</option>
              <option value="bn">Bengali</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 14, color: '#6b7280', marginBottom: 6 }}>Image URL</label>
            <input value={editing.image_url || ''} onChange={e => setEditing({ ...editing, image_url: e.target.value })} style={{ width: '100%', padding: 8, border: '1px solid #e5e7eb', borderRadius: 6 }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 14, color: '#6b7280', marginBottom: 6 }}>Content</label>
            <textarea value={editing.content || ''} onChange={e => setEditing({ ...editing, content: e.target.value })} rows={10} style={{ width: '100%', padding: 8, border: '1px solid #e5e7eb', borderRadius: 6 }} />
          </div>

          {/* Translation section */}
          <div style={{ height: 1, background: '#e5e7eb', margin: '8px 0' }} />
          <h2 style={{ margin: 0, fontSize: 18 }}>Translation</h2>
          <p style={{ color: '#6b7280', marginTop: -4 }}>Update or add a translation for this article.</p>
          <div>
            <label style={{ display: 'block', fontSize: 14, color: '#6b7280', marginBottom: 6 }}>Target Language</label>
            <select value={translation.lang} onChange={e => setTranslation({ ...translation, lang: e.target.value })} style={{ width: '100%', padding: 8, border: '1px solid #e5e7eb', borderRadius: 6 }}>
              <option value="bn">Bengali</option>
              <option value="en">English</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 14, color: '#6b7280', marginBottom: 6 }}>New title (optional)</label>
            <input value={translation.title} onChange={e => setTranslation({ ...translation, title: e.target.value })} style={{ width: '100%', padding: 8, border: '1px solid #e5e7eb', borderRadius: 6 }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 14, color: '#6b7280', marginBottom: 6 }}>New content (optional)</label>
            <textarea value={translation.content} onChange={e => setTranslation({ ...translation, content: e.target.value })} rows={8} style={{ width: '100%', padding: 8, border: '1px solid #e5e7eb', borderRadius: 6 }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 14, color: '#6b7280', marginBottom: 6 }}>New excerpt (optional)</label>
            <textarea value={translation.excerpt} onChange={e => setTranslation({ ...translation, excerpt: e.target.value })} rows={3} style={{ width: '100%', padding: 8, border: '1px solid #e5e7eb', borderRadius: 6 }} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" style={{ background: '#111827', color: '#fff', padding: '8px 12px', borderRadius: 6 }}>Save</button>
            <button type="button" onClick={() => setEditing(null)}>Cancel</button>
            <button type="button" onClick={saveTranslation} style={{ marginLeft: 'auto', background: '#2563eb', color: '#fff', padding: '8px 12px', borderRadius: 6 }}>Save Translation</button>
          </div>
        </form>
      )}
    </div>
  );
}
