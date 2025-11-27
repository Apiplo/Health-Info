import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AdminLayout from './AdminLayout';

const apiBase = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';

// With the current backend, /users only returns active users and does not include an isActive flag.
// Treat users as active by default unless the API explicitly sends an inactive flag.
function getIsActive(user) {
  if ('isActive' in user || 'is_active' in user) {
    const raw = user.isActive ?? user.is_active;
    return raw === true || raw === 1;
  }
  // For /users and /users/:id, absence of a flag means the user is active by definition.
  return true;
}

function UserRow({ user, onEdit, onToggleActive, onDelete }) {
  const isActive = getIsActive(user);

  return (
    <tr>
      <td style={{ padding: '12px 16px', borderBottom: '1px solid #eee', fontFamily: 'monospace', color: '#6b7280' }}>{user.id}</td>
      <td style={{ padding: '12px 16px', borderBottom: '1px solid #eee' }}>
        <div style={{ fontWeight: 600, color: '#111827' }}>{user.displayName}</div>
        <div style={{ fontSize: 13, color: '#6b7280' }}>{user.email}</div>
      </td>
      <td style={{ padding: '12px 16px', borderBottom: '1px solid #eee' }}>
        <span style={{ 
          padding: '4px 8px', 
          borderRadius: 12, 
          background: user.role === 'admin' ? '#fee2e2' : user.role === 'editor' ? '#dbeafe' : '#f3f4f6',
          color: user.role === 'admin' ? '#991b1b' : user.role === 'editor' ? '#1e40af' : '#374151',
          fontSize: 12,
          fontWeight: 600,
          textTransform: 'capitalize'
        }}>
          {user.role}
        </span>
      </td>
      <td style={{ padding: '12px 16px', borderBottom: '1px solid #eee' }}>
        <span style={{ 
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          color: isActive ? '#059669' : '#dc2626', 
          fontWeight: 500,
          fontSize: 14
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: isActive ? '#059669' : '#dc2626' }}></span>
          {isActive ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td style={{ padding: '12px 16px', borderBottom: '1px solid #eee', whiteSpace: 'nowrap' }}>
        <button 
          onClick={() => onEdit(user)} 
          style={{ marginRight: 12, background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontWeight: 500 }}
        >
          Edit
        </button>
        <button 
          onClick={() => onToggleActive(user)} 
          style={{ marginRight: 12, background: 'none', border: 'none', color: isActive ? '#d97706' : '#059669', cursor: 'pointer', fontWeight: 500 }}
        >
          {isActive ? 'Deactivate' : 'Activate'}
        </button>
        <button 
          onClick={() => onDelete(user)} 
          style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontWeight: 500 }}
        >
          Delete
        </button>
      </td>
    </tr>
  );
}

export default function AdminUsers() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'admin', 'editor', 'reader'
  const [searchQuery, setSearchQuery] = useState('');

  async function loadUsers() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${apiBase}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Failed to fetch users');
      setUsers(data.users || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, [token]);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesTab = activeTab === 'all' || user.role === activeTab;
      const matchesSearch = 
        (user.displayName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.email || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [users, activeTab, searchQuery]);

  async function handleToggleActive(user) {
    const isActive = getIsActive(user);
    if (!window.confirm(`Are you sure you want to ${isActive ? 'deactivate' : 'activate'} ${user.displayName}?`)) return;
    
    try {
      const res = await fetch(`${apiBase}/users/${user.id}/activate`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !isActive })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Failed to update status');
      
      loadUsers();
    } catch (e) {
      alert(e.message);
    }
  }

  async function handleDelete(user) {
    if (!window.confirm(`Are you sure you want to delete ${user.displayName}? This is a soft delete.`)) return;

    try {
      const res = await fetch(`${apiBase}/users/${user.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Failed to delete user');
      
      loadUsers();
    } catch (e) {
      alert(e.message);
    }
  }

  function startCreate() {
    // First clear the editing state completely
    setEditing(null);
    // Then set it to a fresh empty form in the next tick
    setTimeout(() => {
      setEditing({
        displayName: '',
        email: '',
        password: '',
        role: activeTab === 'all' ? 'reader' : activeTab // Default to current tab's role
      });
    }, 0);
  }

  function startEdit(user) {
    setEditing({
      id: user.id,
      displayName: user.displayName,
      email: user.email,
      role: user.role
    });
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing.id) {
        // Update
        const res = await fetch(`${apiBase}/users/${editing.id}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            displayName: editing.displayName,
            email: editing.email,
            role: editing.role
          })
        });
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data.error || 'Failed to update user');
      } else {
        // Create
        const res = await fetch(`${apiBase}/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            displayName: editing.displayName,
            email: editing.email,
            password: editing.password
          })
        });
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data.error || 'Failed to create user');
        
        // Update role if not reader
        if (editing.role !== 'reader' && data.user && data.user.id) {
             const updateRes = await fetch(`${apiBase}/users/${data.user.id}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    displayName: editing.displayName,
                    email: editing.email,
                    role: editing.role
                })
            });
            if (!updateRes.ok) console.warn('Failed to set role after creation');
        }
      }
      setEditing(null);
      loadUsers();
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  const tabs = [
    { id: 'all', label: 'All Users' },
    { id: 'admin', label: 'Admins' },
    { id: 'editor', label: 'Editors' },
    { id: 'reader', label: 'Readers' }
  ];

  return (
    <AdminLayout>
      <div style={{ maxWidth: 1200, margin: '32px auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111827', marginBottom: 8 }}>User Management</h1>
            <p style={{ color: '#6b7280', margin: 0 }}>Manage system access and user roles.</p>
          </div>
          <button 
            onClick={startCreate} 
            style={{ 
              background: '#111827', 
              color: '#fff', 
              padding: '10px 20px', 
              borderRadius: 8, 
              border: 'none',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            Create {activeTab !== 'all' ? activeTab.charAt(0).toUpperCase() + activeTab.slice(1) : 'User'}
          </button>
        </div>

        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          {/* Tabs & Search Header */}
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 6,
                    border: 'none',
                    background: activeTab === tab.id ? '#f3f4f6' : 'transparent',
                    color: activeTab === tab.id ? '#111827' : '#6b7280',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div style={{ marginLeft: 'auto', position: 'relative' }}>
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  padding: '8px 12px 8px 36px',
                  borderRadius: 6,
                  border: '1px solid #e5e7eb',
                  width: 240,
                  fontSize: 14
                }}
              />
              <span style={{ position: 'absolute', left: 10, top: 9, color: '#9ca3af' }}>🔍</span>
            </div>
          </div>

          {/* Table */}
          {loading && <div style={{ padding: 48, textAlign: 'center', color: '#6b7280' }}>Loading users...</div>}
          {error && <div style={{ padding: 24, color: '#b91c1c' }}>{error}</div>}

          {!loading && !editing && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb', textAlign: 'left' }}>
                    <th style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', color: '#4b5563', fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>ID</th>
                    <th style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', color: '#4b5563', fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>User</th>
                    <th style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', color: '#4b5563', fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Role</th>
                    <th style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', color: '#4b5563', fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', color: '#4b5563', fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <UserRow 
                      key={user.id} 
                      user={user} 
                      onEdit={startEdit} 
                      onToggleActive={handleToggleActive} 
                      onDelete={handleDelete} 
                    />
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: 48, textAlign: 'center', color: '#6b7280' }}>
                        No users found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Overlay */}
        {editing && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50
          }}>
            <form 
              onSubmit={handleSave} 
              style={{ 
                background: '#fff', 
                padding: 32, 
                borderRadius: 12, 
                width: '100%', 
                maxWidth: 480,
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
              }}
            >
              <h2 style={{ marginTop: 0, marginBottom: 24, fontSize: 20, fontWeight: 700 }}>
                {editing.id ? 'Edit User' : 'Create New User'}
              </h2>
              
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500, color: '#374151' }}>Display Name</label>
                <input
                  value={editing.displayName}
                  onChange={e => setEditing({ ...editing, displayName: e.target.value })}
                  required
                  style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14 }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500, color: '#374151' }}>Email</label>
                <input
                  type="email"
                  value={editing.email}
                  onChange={e => setEditing({ ...editing, email: e.target.value })}
                  required
                  style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14 }}
                />
              </div>

              {!editing.id && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500, color: '#374151' }}>Password</label>
                  <input
                    type="password"
                    value={editing.password}
                    onChange={e => setEditing({ ...editing, password: e.target.value })}
                    required
                    style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14 }}
                  />
                </div>
              )}

              <div style={{ marginBottom: 32 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500, color: '#374151' }}>Role</label>
                <select
                  value={editing.role}
                  onChange={e => setEditing({ ...editing, role: e.target.value })}
                  style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, background: '#fff' }}
                >
                  <option value="reader">Reader</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={() => setEditing(null)}
                  style={{ 
                    background: '#fff', 
                    color: '#374151', 
                    padding: '10px 20px', 
                    borderRadius: 6, 
                    border: '1px solid #d1d5db', 
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  style={{ 
                    background: '#111827', 
                    color: '#fff', 
                    padding: '10px 20px', 
                    borderRadius: 6, 
                    border: 'none', 
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                >
                  {saving ? 'Saving...' : 'Save User'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}