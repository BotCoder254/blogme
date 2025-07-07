import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import { Toaster } from 'react-hot-toast';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';

// Pages (we'll create these later)
import Home from './pages/Home';
import Blogs from './pages/Blogs';
import BlogDetail from './pages/BlogDetail';
import SinglePost from './pages/SinglePost';
import Dashboard from './pages/Dashboard';
import NewPost from './pages/NewPost';
import EditPost from './pages/EditPost';
import About from './pages/About';
import NotFound from './pages/NotFound';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Settings from './pages/Settings';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#fff',
                color: '#333',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          <Routes>
            {/* Public Routes */}
            <Route
              path="/"
              element={
                <Layout>
                  <Home />
                </Layout>
              }
            />
            <Route
              path="/blogs"
              element={
                <Layout>
                  <Blogs />
                </Layout>
              }
            />
            <Route
              path="/blogs/:id"
              element={
                <Layout>
                  <BlogDetail />
                </Layout>
              }
            />
            <Route
              path="/blog/:id"
              element={
                <Layout>
                  <SinglePost />
                </Layout>
              }
            />
            <Route
              path="/about"
              element={
                <Layout>
                  <About />
                </Layout>
              }
            />
            
            <Route
              path="/privacy"
              element={
                <Layout>
                  <PrivacyPolicy />
                </Layout>
              }
            />
            <Route
              path="/terms"
              element={
                <Layout>
                  <TermsOfService />
                </Layout>
              }
            />
            

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/new-post"
              element={
                <ProtectedRoute>
                  <Layout>
                    <NewPost />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-post/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <EditPost />
                  </Layout>
                </ProtectedRoute>
              }
            />
           

            {/* 404 Route */}
            <Route
              path="*"
              element={
                <Layout>
                  <NotFound />
                </Layout>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
