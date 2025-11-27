import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../services/categoryService';

function CategoryRow({ category, onEdit, onDelete, onViewArticles }) {
  const hasBangla = !!(category.name_bn && String(category.name_bn).trim());
  const hasCode = !!(category.code && String(category.code).trim());

  return (
    <tr>
      <td
        style={{
          padding: '10px 12px',
          borderBottom: '1px solid #eee',
          fontFamily: 'monospace',
          color: '#6b7280',
        }}
      >
        {category.id}
      </td>
      <td
        style={{
          padding: '10px 12px',
          borderBottom: '1px solid #eee',
        }}
      >
        {category.name_en || '—'}
      </td>
      <td
        style={{
          padding: '10px 12px',
          borderBottom: '1px solid #eee',
          color: hasBangla ? '#111827' : '#9ca3af',
        }}
      >
        {hasBangla ? category.name_bn : 'Not provided'}
      </td>
      <td
        style={{
          padding: '10px 12px',
          borderBottom: '1px solid #eee',
          fontFamily: 'monospace',
          color: hasCode ? '#4b5563' : '#9ca3af',
        }}
      >
        {hasCode ? category.code : 'auto-generated'}
      </td>
      <td
        style={{
          padding: '10px 12px',
          borderBottom: '1px solid #eee',
          whiteSpace: 'nowrap',
        }}
      >
        <button
          type="button"
          onClick={() => onViewArticles(category)}
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
          onClick={() => onEdit(category)}
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
          onClick={() => onDelete(category)}
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

function validateCategoryForm(values) {
  const errors = {};
  const rawNameEn = (values.name_en || '').trim();

  if (!rawNameEn) {
    errors.name_en = 'English name is required.';
  } else if (rawNameEn.length < 2) {
    errors.name_en = 'English name is too short.';
  } else if (rawNameEn.length > 100) {
    errors.name_en = 'English name is too long.';
  }

  return errors;
}

export default function AdminCategories() {
  const { token } = useAuth();
  const { currentLanguage } = useLanguage();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState('');

  const [search, setSearch] = useState('');

  const [dialog, setDialog] = useState(null);
  // dialog: null | { mode: 'create'|'edit', id?, name_en, name_bn }
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteBusyId, setDeleteBusyId] = useState(null);

  async function loadCategories() {
    setLoadingList(true);
    setListError('');
    try {
      const data = await fetchCategories({ lang: currentLanguage || 'en' });
      setCategories(Array.isArray(data) ? data : []);
    } catch (e) {
      setListError(e.message || 'Failed to load categories.');
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLanguage]);

  const filtered = useMemo(() => {
    const q = (search || '').trim().toLowerCase();
    if (!q) return categories;

    return categories.filter((c) => {
      const idText = String(c.id || '').toLowerCase();
      const en = (c.name_en || '').toLowerCase();
      const bn = (c.name_bn || '').toLowerCase();
      const code = (c.code || '').toLowerCase();
      return (
        idText.includes(q) ||
        en.includes(q) ||
        bn.includes(q) ||
        code.includes(q)
      );
    });
  }, [categories, search]);

  function startCreate() {
    setDialog({
      mode: 'create',
      id: null,
      name_en: '',
      name_bn: '',
    });
    setFieldErrors({});
  }

  function startEdit(category) {
    setDialog({
      mode: 'edit',
      id: category.id,
      name_en: category.name_en || '',
      name_bn: category.name_bn || '',
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

    const values = {
      name_en: dialog.name_en,
      name_bn: dialog.name_bn,
    };

    const errors = validateCategoryForm(values);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      setSaving(true);

      const payload = {
        token,
        name_en: values.name_en.trim(),
        name_bn: (values.name_bn || '').trim() || undefined,
      };

      if (dialog.mode === 'create') {
        await createCategory(payload);
        alert('Category created successfully.');
      } else {
        await updateCategory({ ...payload, id: dialog.id });
        alert('Category updated successfully.');
      }

      await loadCategories();
      setDialog(null);
    } catch (e) {
      const message =
        (e && e.message) ||
        (dialog.mode === 'create'
          ? 'Could not create category. Please try again.'
          : 'Could not update category. Please try again.');
      alert(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(category) {
    if (!category || !category.id) return;
    const friendlyName = category.name_en || category.name_bn || `#${category.id}`;

    const confirmed = window.confirm(
      `Delete category "${friendlyName}"?\n\nArticles will remain published but will no longer be linked to this category.`
    );
    if (!confirmed) return;

    try {
      setDeleteBusyId(category.id);
      await deleteCategory({ token, id: category.id });
      setCategories((prev) => prev.filter((c) => c.id !== category.id));
    } catch (e) {
      const message =
        (e && e.message) || 'Could not delete this category. Please try again.';
      alert(message);
    } finally {
      setDeleteBusyId(null);
    }
  }

  function handleViewArticles(category) {
    if (!category || !category.id) return;
    navigate(`/admin/categories/${category.id}/articles`);
  }

  return (
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
          <h1 style={{ fontSize: 26, margin: 0 }}>Category Management</h1>
          <p style={{ margin: '4px 0 0', color: '#6b7280', maxWidth: 520 }}>
            Create and organize high-level categories for your articles. Categories are
            used to group content such as Health, Technology, or Sport.
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
          New Category
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
          placeholder="Search categories by ID, name, or code…"
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
          onClick={loadCategories}
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
          Loading categories…
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
                  ID
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
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((category) => (
                <CategoryRow
                  key={category.id}
                  category={category}
                  onEdit={startEdit}
                  onDelete={handleDelete}
                  onViewArticles={handleViewArticles}
                />
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      padding: 24,
                      textAlign: 'center',
                      color: '#6b7280',
                    }}
                  >
                    No categories found. Try a different search or create a new
                    category.
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
              {dialog.mode === 'create' ? 'Create category' : 'Edit category'}
            </h2>
            <p
              style={{
                margin: '0 0 16px',
                color: '#6b7280',
                fontSize: 14,
              }}
            >
              Set clear names that editors will recognize. The system will
              generate a URL-friendly code from the English name.
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
                English name
              </label>
              <input
                type="text"
                value={dialog.name_en}
                onChange={(e) => handleFieldChange('name_en', e.target.value)}
                placeholder="e.g. Health, Technology, Sport"
                style={{
                  width: '100%',
                  padding: 8,
                  borderRadius: 6,
                  border:
                    '1px solid ' +
                    (fieldErrors.name_en ? '#dc2626' : '#d1d5db'),
                  fontSize: 14,
                }}
              />
              {fieldErrors.name_en && (
                <div
                  style={{
                    fontSize: 12,
                    color: '#dc2626',
                    marginTop: 4,
                  }}
                >
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
              <div
                style={{
                  fontSize: 12,
                  color: '#6b7280',
                  marginTop: 4,
                }}
              >
                Leave blank if you don't need a Bangla label for this category.
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 8,
              }}
            >
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
                  ? 'Create category'
                  : 'Save changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {deleteBusyId != null && (
        <div style={{ marginTop: 8, fontSize: 12, color: '#6b7280' }}>
          Deleting category #{deleteBusyId}…
        </div>
      )}
    </div>
  );
}