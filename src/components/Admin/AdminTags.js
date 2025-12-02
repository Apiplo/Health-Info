import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import AdminLayout from './AdminLayout';
import { fetchTags, createTag, updateTag, deleteTag } from '../../services/tagService';

function TagRow({ tag, onEdit, onDelete, onViewArticles }) {
  const hasBangla = !!(tag.name_bn && String(tag.name_bn).trim());

  return (
    <tr>
      <td style={{ padding: '10px 12px', borderBottom: '1px solid #eee', fontFamily: 'monospace', color: '#6b7280' }}>
        {tag.code}
      </td>
      <td style={{ padding: '10px 12px', borderBottom: '1px solid #eee' }}>
        {tag.name_en || '—'}
      </td>
      <td style={{ padding: '10px 12px', borderBottom: '1px solid #eee', color: hasBangla ? '#111827' : '#9ca3af' }}>
        {hasBangla ? tag.name_bn : 'Not provided'}
      </td>
      <td style={{ padding: '10px 12px', borderBottom: '1px solid #eee', whiteSpace: 'nowrap' }}>
        <button
          type="button"
          onClick={() => onViewArticles(tag)}
          style={{
            marginRight: 8,
            background: 'none',
            border: 'none',
            color: '#2563eb',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          View articles
        </button>
        <button
          type="button"
          onClick={() => onEdit(tag)}
          style={{
            marginRight: 8,
            background: 'none',
            border: 'none',
            color: '#111827',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(tag)}
          style={{
            background: 'none',
            border: 'none',
            color: '#dc2626',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          Delete
        </button>
      </td>
    </tr>
  );
}

function validateTagForm(values, mode) {
  const errors = {};
  const rawCode = (values.code || '').trim();
  const rawNameEn = (values.name_en || '').trim();

  if (mode === 'create') {
    if (!rawCode) {
      errors.code = 'Please provide a tag code (identifier).';
    } else if (!/^[a-z0-9-]+$/.test(rawCode)) {
      errors.code = 'Tag code can only contain lowercase letters, numbers, and dashes. No spaces allowed.';
    }
  }

  if (!rawNameEn) {
    errors.name_en = 'Please provide an English name for this tag.';
  }

  return errors;
}

export default function AdminTags() {
  const { token } = useAuth();
  const { currentLanguage } = useLanguage();
  const navigate = useNavigate();

  const [tags, setTags] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState('');

  const [search, setSearch] = useState('');

  const [dialog, setDialog] = useState(null);
  // dialog: null | { mode: 'create'|'edit', code, name_en, name_bn }
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteBusyCode, setDeleteBusyCode] = useState('');

  async function loadTags() {
    setLoadingList(true);
    setListError('');
    try {
      const data = await fetchTags({ lang: currentLanguage || 'en' });
      setTags(Array.isArray(data) ? data : []);
    } catch (e) {
      setListError(e.message || 'Unable to load tags. Please refresh the page and try again.');
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    loadTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLanguage]);

  const filtered = useMemo(() => {
    const q = (search || '').trim().toLowerCase();
    if (!q) return tags;

    return tags.filter((t) => {
      const code = (t.code || '').toLowerCase();
      const en = (t.name_en || '').toLowerCase();
      const bn = (t.name_bn || '').toLowerCase();
      return code.includes(q) || en.includes(q) || bn.includes(q);
    });
  }, [tags, search]);

  function startCreate() {
    setDialog({
      mode: 'create',
      code: '',
      name_en: '',
      name_bn: '',
    });
    setFieldErrors({});
  }

  function startEdit(tag) {
    setDialog({
      mode: 'edit',
      code: tag.code,
      name_en: tag.name_en || '',
      name_bn: tag.name_bn || '',
    });
    setFieldErrors({});
  }

  function closeDialog() {
    if (saving) return;
    setDialog(null);
    setFieldErrors({});
  }

  function handleFieldChange(field, value) {
    setDialog((prev) => ({
      ...prev,
      [field]: value,
    }));
    setFieldErrors((prev) => ({
      ...prev,
      [field]: '',
    }));
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!dialog) return;

    const mode = dialog.mode;
    const values = {
      code: dialog.code,
      name_en: dialog.name_en,
      name_bn: dialog.name_bn,
    };

    const errors = validateTagForm(values, mode);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      setSaving(true);

      const payload = {
        token,
        code: values.code.trim(),
        name_en: values.name_en.trim(),
        name_bn: (values.name_bn || '').trim() || undefined,
      };

      if (mode === 'create') {
        await createTag(payload);
        alert('Tag created successfully.');
      } else {
        await updateTag(payload);
        alert('Tag updated successfully.');
      }

      await loadTags();
      setDialog(null);
    } catch (e) {
      // For non-technical users, show a friendly message.
      const message = e && e.message
        ? e.message
        : mode === 'create'
        ? 'Unable to create tag. Please check your information and try again.'
        : 'Unable to update tag. Please check your information and try again.';
      alert(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(tag) {
    if (!tag || !tag.code) return;
    const friendlyName = tag.name_en || tag.name_bn || tag.code;

    const confirmed = window.confirm(
      `Delete tag "${friendlyName}"?\n\nThis will remove the label from any articles using it, but the articles will stay published.`
    );
    if (!confirmed) return;

    try {
      setDeleteBusyCode(tag.code);
      await deleteTag({ token, code: tag.code });
      setTags((prev) => prev.filter((t) => t.code !== tag.code));
    } catch (e) {
      const message =
        (e && e.message) || 'Unable to delete this tag. Please try again later.';
      alert(message);
    } finally {
      setDeleteBusyCode('');
    }
  }

  function handleViewArticles(tag) {
    if (!tag || !tag.code) return;
    const lang = currentLanguage || 'en';
    navigate(`/admin/articles?tag=${encodeURIComponent(tag.code)}&lang=${encodeURIComponent(lang)}`);
  }

  return (
    <AdminLayout>
      <div style={{ maxWidth: 1100, margin: '24px auto', padding: '0 16px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h1 style={{ fontSize: 26, margin: 0 }}>Tag Management</h1>
            <p style={{ margin: '4px 0 0', color: '#6b7280', maxWidth: 520 }}>
              Create and organize the topic labels used across your articles. These tags help
              readers find related content.
            </p>
          </div>
          <button
            type="button"
            onClick={startCreate}
            style={{
              background: '#111827',
              color: '#fff',
              padding: '8px 14px',
              borderRadius: 8,
              border: 'none',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              whiteSpace: 'nowrap',
            }}
          >
            New Tag
          </button>
        </div>

        <div
          style={{
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tags by code or name…"
            style={{
              flex: 1,
              minWidth: 200,
              padding: 8,
              borderRadius: 6,
              border: '1px solid #e5e7eb',
              fontSize: 14,
            }}
          />
          <button
            type="button"
            onClick={loadTags}
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid #e5e7eb',
              background: '#f9fafb',
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            Refresh
          </button>
        </div>

        {listError && (
          <div style={{ marginBottom: 12, color: '#b91c1c', fontSize: 14 }}>
            {listError}
          </div>
        )}

        {loadingList ? (
          <div style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>
            Loading tags…
          </div>
        ) : (
          <div
            style={{
              background: '#fff',
              borderRadius: 8,
              border: '1px solid #e5e7eb',
              overflowX: 'auto',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb', textAlign: 'left' }}>
                  <th
                    style={{
                      padding: '10px 12px',
                      borderBottom: '1px solid #e5e7eb',
                      fontSize: 12,
                      textTransform: 'uppercase',
                      color: '#4b5563',
                      letterSpacing: '0.03em',
                    }}
                  >
                    Code
                  </th>
                  <th
                    style={{
                      padding: '10px 12px',
                      borderBottom: '1px solid #e5e7eb',
                      fontSize: 12,
                      textTransform: 'uppercase',
                      color: '#4b5563',
                      letterSpacing: '0.03em',
                    }}
                  >
                    English name
                  </th>
                  <th
                    style={{
                      padding: '10px 12px',
                      borderBottom: '1px solid #e5e7eb',
                      fontSize: 12,
                      textTransform: 'uppercase',
                      color: '#4b5563',
                      letterSpacing: '0.03em',
                    }}
                  >
                    Bangla name
                  </th>
                  <th
                    style={{
                      padding: '10px 12px',
                      borderBottom: '1px solid #e5e7eb',
                      fontSize: 12,
                      textTransform: 'uppercase',
                      color: '#4b5563',
                      letterSpacing: '0.03em',
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((tag) => (
                  <TagRow
                    key={tag.code}
                    tag={tag}
                    onEdit={startEdit}
                    onDelete={handleDelete}
                    onViewArticles={handleViewArticles}
                  />
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      style={{
                        padding: 24,
                        textAlign: 'center',
                        color: '#6b7280',
                      }}
                    >
                      No tags found. Try a different search or create a new tag.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {dialog && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 50,
            }}
          >
            <form
              onSubmit={handleSave}
              style={{
                background: '#fff',
                padding: 24,
                borderRadius: 12,
                width: '100%',
                maxWidth: 480,
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
              }}
            >
              <h2 style={{ margin: '0 0 8px', fontSize: 20 }}>
                {dialog.mode === 'create' ? 'Create new tag' : 'Edit tag'}
              </h2>
              <p style={{ margin: '0 0 16px', color: '#6b7280', fontSize: 14 }}>
                Choose a clear name that content authors will recognize. The code is used
                behind the scenes in the system.
              </p>

              <div style={{ marginBottom: 14 }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: 4,
                    fontSize: 13,
                    fontWeight: 500,
                    color: '#374151',
                  }}
                >
                  Tag code
                </label>
                <input
                  type="text"
                  value={dialog.code}
                  onChange={(e) => handleFieldChange('code', e.target.value.toLowerCase())}
                  disabled={dialog.mode === 'edit'}
                  placeholder="Example: health-tips"
                  style={{
                    width: '100%',
                    padding: 8,
                    borderRadius: 6,
                    border: '1px solid ' + (fieldErrors.code ? '#dc2626' : '#d1d5db'),
                    fontSize: 14,
                    background: dialog.mode === 'edit' ? '#f9fafb' : '#fff',
                  }}
                />
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                  Small letters, numbers, and dashes only. No spaces. This cannot be changed later.
                </div>
                {fieldErrors.code && (
                  <div style={{ fontSize: 12, color: '#dc2626', marginTop: 4 }}>
                    {fieldErrors.code}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: 14 }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: 4,
                    fontSize: 13,
                    fontWeight: 500,
                    color: '#374151',
                  }}
                >
                  English name
                </label>
                <input
                  type="text"
                  value={dialog.name_en}
                  onChange={(e) => handleFieldChange('name_en', e.target.value)}
                  placeholder="What editors will see in English"
                  style={{
                    width: '100%',
                    padding: 8,
                    borderRadius: 6,
                    border: '1px solid ' + (fieldErrors.name_en ? '#dc2626' : '#d1d5db'),
                    fontSize: 14,
                  }}
                />
                {fieldErrors.name_en && (
                  <div style={{ fontSize: 12, color: '#dc2626', marginTop: 4 }}>
                    {fieldErrors.name_en}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: 20 }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: 4,
                    fontSize: 13,
                    fontWeight: 500,
                    color: '#374151',
                  }}
                >
                  Bangla name (optional)
                </label>
                <input
                  type="text"
                  value={dialog.name_bn}
                  onChange={(e) => handleFieldChange('name_bn', e.target.value)}
                  placeholder="বাংলা নাম (optional)"
                  style={{
                    width: '100%',
                    padding: 8,
                    borderRadius: 6,
                    border: '1px solid #d1d5db',
                    fontSize: 14,
                  }}
                />
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                  Leave blank if you don't need a Bangla label for this tag.
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button
                  type="button"
                  onClick={closeDialog}
                  disabled={saving}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 6,
                    border: '1px solid #d1d5db',
                    background: '#fff',
                    color: '#374151',
                    cursor: 'pointer',
                    fontSize: 14,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 6,
                    border: 'none',
                    background: '#111827',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  {saving
                    ? dialog.mode === 'create'
                      ? 'Creating…'
                      : 'Saving…'
                    : dialog.mode === 'create'
                    ? 'Create tag'
                    : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        )}

        {!!deleteBusyCode && (
          <div style={{ marginTop: 8, fontSize: 12, color: '#6b7280' }}>
            Deleting tag "{deleteBusyCode}"…
          </div>
        )}
      </div>
    </AdminLayout>
  );
}