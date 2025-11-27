import React from 'react';
import AdminNav from './AdminNav';

export default function AdminLayout({ children }) {
  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh',
      background: '#f9fafb'
    }}>
      <AdminNav />
      <main style={{ 
        flex: 1,
        overflow: 'auto'
      }}>
        {children}
      </main>
    </div>
  );
}
