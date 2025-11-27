import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';

const apiBase = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';

function StatCard({ title, value, to }) {
  return (
    <div style={{
      border: '1px solid #eee',
      borderRadius: 12,
      padding: 16,
      background: '#fff',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
    }}>
      <div style={{ fontSize: 14, color: '#667085' }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 700 }}>{value}</div>
      {to && (
        <Link to={to} style={{ color: '#2563eb', fontWeight: 600, fontSize: 14 }}>Manage →</Link>
      )}
    </div>
  );
}

export default function AdminHome() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${apiBase}/articles`);
        if (!res.ok) throw new Error(`Failed to load articles (${res.status})`);
        const data = await res.json();
        if (!ignore) setArticles(Array.isArray(data) ? data : (data.items || []));
      } catch (e) {
        if (!ignore) setError(e.message || 'Failed to load');
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => { ignore = true; };
  }, []);

  const counts = useMemo(() => {
    const total = articles.length;
    const byCategory = articles.reduce((acc, a) => {
      // Normalize tags to array of lowercase strings
      const tags = Array.isArray(a?.tags)
        ? a.tags.map(t => String(t).toLowerCase())
        : String(a?.tags || '')
            .split(',')
            .map(t => t.trim().toLowerCase())
            .filter(Boolean);

      // Prefer explicit category; otherwise infer from tags
      let c = String(a?.category || '').toLowerCase();
      if (!c) {
        if (tags.includes('health')) c = 'health';
        else if (tags.includes('technology') || tags.includes('tech')) c = 'technology';
        else if (tags.includes('sport') || tags.includes('sports')) c = 'sport';
        else c = 'uncategorized';
      }

      acc[c] = (acc[c] || 0) + 1;
      return acc;
    }, {});
    return { total, byCategory };
  }, [articles]);

  return (
    <AdminLayout>
      <div style={{ maxWidth: 1100, margin: '24px auto', padding: '0 16px' }}>
        <h1 style={{ fontSize: 28, marginBottom: 8 }}>Admin Overview</h1>
        <p style={{ color: '#667085', marginBottom: 24 }}>Quick overview of content and shortcuts.</p>

        {loading && <div>Loading overview…</div>}
        {error && (
          <div style={{ marginBottom: 16, color: '#b91c1c' }}>
            {error} — showing whatever is available.
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          <StatCard title="Total Articles" value={counts.total} to="/admin/articles" />
          <StatCard title="Health" value={counts.byCategory.health || 0} to="/admin/articles?category=health" />
          <StatCard title="Technology" value={counts.byCategory.technology || 0} to="/admin/articles?category=technology" />
          <StatCard title="Sport" value={counts.byCategory.sport || 0} to="/admin/articles?category=sport" />
        </div>

        <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16 }}>
          <Link to="/admin/articles" style={{ textDecoration: 'none' }}>
            <div style={{
              background: '#111827',
              color: '#fff',
              padding: 24,
              borderRadius: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              height: '100%',
              boxSizing: 'border-box'
            }}>
              <div style={{ fontSize: 18, fontWeight: 600 }}>Article Manager</div>
              <div style={{ fontSize: 14, opacity: 0.8 }}>Create, edit, and translate articles.</div>
              <div style={{ marginTop: 'auto', fontWeight: 500 }}>Manage Articles →</div>
            </div>
          </Link>

        <Link to="/admin/users" style={{ textDecoration: 'none' }}>
          <div style={{
            background: '#2563eb',
            color: '#fff',
            padding: 24,
            borderRadius: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            height: '100%',
            boxSizing: 'border-box'
          }}>
            <div style={{ fontSize: 18, fontWeight: 600 }}>User Manager</div>
            <div style={{ fontSize: 14, opacity: 0.8 }}>Manage users, roles, and permissions.</div>
            <div style={{ marginTop: 'auto', fontWeight: 500 }}>Manage Users →</div>
          </div>
        </Link>

        <Link to="/admin/tags" style={{ textDecoration: 'none' }}>
          <div style={{
            background: '#059669',
            color: '#fff',
            padding: 24,
            borderRadius: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            height: '100%',
            boxSizing: 'border-box'
          }}>
            <div style={{ fontSize: 18, fontWeight: 600 }}>Tag Manager</div>
            <div style={{ fontSize: 14, opacity: 0.8 }}>Add and rename the tags used across articles.</div>
            <div style={{ marginTop: 'auto', fontWeight: 500 }}>Manage Tags →</div>
          </div>
        </Link>

        <Link to="/admin/categories" style={{ textDecoration: 'none' }}>
          <div style={{
            background: '#7c3aed',
            color: '#fff',
            padding: 24,
            borderRadius: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            height: '100%',
            boxSizing: 'border-box'
          }}>
            <div style={{ fontSize: 18, fontWeight: 600 }}>Category Manager</div>
            <div style={{ fontSize: 14, opacity: 0.8 }}>Define the high-level categories used to group articles.</div>
            <div style={{ marginTop: 'auto', fontWeight: 500 }}>Manage Categories →</div>
          </div>
        </Link>
      </div>
    </AdminLayout>
  );
}
