import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  fetchCategoryById,
  fetchCategoryArticles,
} from '../../services/categoryService';

export default function AdminCategoryArticles() {
  const { id } = useParams();
  const categoryId = Number(id);
  const { currentLanguage } = useLanguage();

  const [category, setCategory] = useState(null);
  const [articles, setArticles] = useState([]);
  const [lang, setLang] = useState(currentLanguage || 'en');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!categoryId || Number.isNaN(categoryId)) {
      setError('Invalid category ID');
      setLoading(false);
      return;
    }

    let ignore = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const [cat, arts] = await Promise.all([
          fetchCategoryById(categoryId),
          fetchCategoryArticles({ id: categoryId, lang }),
        ]);
        if (!ignore) {
          setCategory(cat);
          setArticles(Array.isArray(arts) ? arts : []);
        }
      } catch (e) {
        if (!ignore) {
          setError(e.message || 'Failed to load category articles.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, [categoryId, lang]);

  const languageLabel =
    lang === 'bn'
      ? 'Bangla'
      : 'English';

  return (
    <div style={{ maxWidth: 1100, margin: '24px auto', padding: '0 16px' }}>
      <div style={{ marginBottom: 12, fontSize: 13 }}>
        <Link
          to="/admin/categories"
          style={{ color: '#2563eb', textDecoration: 'none', marginRight: 4 }}
        >
          ← Back to categories
        </Link>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h1 style={{ fontSize: 24, margin: 0 }}>
            {category ? `Articles in ${category.name_en}` : 'Category articles'}
          </h1>
          {category && (
            <p style={{ margin: '4px 0 0', color: '#6b7280' }}>
              Category ID: {category.id}
              {category.name_bn && (
                <span style={{ marginLeft: 8, color: '#4b5563' }}>
                  • Bangla: {category.name_bn}
                </span>
              )}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label
            style={{
              fontSize: 13,
              color: '#6b7280',
            }}
          >
            Article language:
          </label>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: 6,
              border: '1px solid #e5e7eb',
              fontSize: 14,
              background: '#fff',
            }}
          >
            <option value="en">English</option>
            <option value="bn">Bangla</option>
          </select>
        </div>
      </div>

      {loading && (
        <div style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>
          Loading articles in this category…
        </div>
      )}

      {error && !loading && (
        <div style={{ marginBottom: 16, color: '#b91c1c' }}>
          {error}
        </div>
      )}

      {!loading && !error && (
        <div
          style={{
            background: '#fff',
            borderRadius: 8,
            border: '1px solid #e5e7eb',
            padding: 16,
          }}
        >
          {articles.length === 0 ? (
            <p style={{ margin: 0, color: '#6b7280' }}>
              No published articles in this category for {languageLabel}.
            </p>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {articles.map((a) => (
                <li
                  key={a.id}
                  style={{
                    padding: '12px 8px',
                    borderBottom: '1px solid #e5e7eb',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 12,
                      alignItems: 'flex-start',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: 600,
                          marginBottom: 4,
                        }}
                      >
                        {a.title}
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          color: '#6b7280',
                          marginBottom: 4,
                        }}
                      >
                        {a.tags_names && a.tags_names.length
                          ? `Tags: ${a.tags_names.join(', ')}`
                          : 'No tags'}
                      </div>
                      <div style={{ fontSize: 12, color: '#9ca3af' }}>
                        Created:{' '}
                        {a.created_at
                          ? new Date(a.created_at).toLocaleString()
                          : 'Unknown'}
                      </div>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        gap: 8,
                      }}
                    >
                      <Link
                        to={`/article/${encodeURIComponent(a.id)}`}
                        style={{
                          fontSize: 13,
                          color: '#2563eb',
                          textDecoration: 'none',
                          fontWeight: 500,
                        }}
                      >
                        View on site →
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}