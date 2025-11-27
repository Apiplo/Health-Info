import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import Header from './components/Header/Header';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import ForgotPassword from './components/ForgotPassword/ForgotPassword';
import Home from './components/Home/Home';
import ArticleDetail from './components/ArticleDetail/ArticleDetail';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import HealthPage from './components/HealthPage/HealthPage';
import TechnologyPage from './components/TechnologyPage/TechnologyPage';
import SportPage from './components/SportPage/SportPage';
import AdminHome from './components/Admin/AdminHome';
import AdminArticles from './components/Admin/AdminArticles';
import AdminUsers from './components/Admin/AdminUsers';

const AppContainer = styled.div`
  min-height: 100vh;
  background: #ffffff;
`;

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (user?.role !== 'admin') {
    return <Navigate to="/" />;
  }
  
  return children;
};

function AppContent() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <AppContainer>
      {!isAdminRoute && <Header />}
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
        <Route path="/forgot-password" element={!isAuthenticated ? <ForgotPassword /> : <Navigate to="/" />} />
        <Route path="/" element={<Home />} />
        <Route path="/article/:id" element={<ArticleDetail />} />
        <Route path="/upload" element={
          <ProtectedRoute>
            <ArticleDetail />
          </ProtectedRoute>
        } />
        <Route path="/health" element={<HealthPage />} />
        <Route path="/technology" element={<TechnologyPage />} />
        <Route path="/sport" element={<SportPage />} /> 
        <Route path="/admin" element={
          <AdminRoute>
            <AdminHome />
          </AdminRoute>
        } />
        <Route path="/admin/articles" element={
          <AdminRoute>
            <AdminArticles />
          </AdminRoute>
        } />
        <Route path="/admin/users" element={
          <AdminRoute>
            <AdminUsers />
          </AdminRoute>
        } />
      </Routes>
    </AppContainer>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;


