import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function AdminNav() {
  const location = useLocation();

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: '📊' },
    { path: '/admin/health', label: 'Health', icon: '❤️' },
    { path: '/admin/articles', label: 'Articles', icon: '📝' },
    { path: '/admin/users', label: 'Users', icon: '👥' }
  ];

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav style={{
      width: 240,
      minHeight: '100vh',
      background: '#111827',
      color: '#fff',
      padding: '24px 0',
      position: 'sticky',
      top: 0,
      left: 0,
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ padding: '0 20px', marginBottom: 32 }}>
        <h2 style={{ 
          fontSize: 20, 
          fontWeight: 700, 
          margin: 0,
          color: '#fff'
        }}>
          Admin Panel
        </h2>
        <p style={{ 
          fontSize: 12, 
          color: '#9ca3af', 
          margin: '4px 0 0 0' 
        }}>
          BlogInfo CMS
        </p>
      </div>

      <div style={{ flex: 1 }}>
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 20px',
              textDecoration: 'none',
              color: isActive(item.path) ? '#fff' : '#9ca3af',
              background: isActive(item.path) ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
              borderLeft: isActive(item.path) ? '3px solid #3b82f6' : '3px solid transparent',
              fontWeight: isActive(item.path) ? 600 : 400,
              transition: 'all 0.2s',
              fontSize: 14
            }}
            onMouseEnter={(e) => {
              if (!isActive(item.path)) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.color = '#fff';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive(item.path)) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#9ca3af';
              }
            }}
          >
            <span style={{ fontSize: 18 }}>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>

      <div style={{ padding: '0 20px', marginTop: 'auto' }}>
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 12px',
            textDecoration: 'none',
            color: '#9ca3af',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 500,
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.color = '#9ca3af';
          }}
        >
          <span>←</span>
          <span>Back to Site</span>
        </Link>
      </div>
    </nav>
  );
}
