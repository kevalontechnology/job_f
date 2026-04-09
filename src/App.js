import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { MenuProvider } from './contexts/MenuContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

// Public pages — loaded eagerly (critical path)
import Registration from './pages/Registration';
import Confirmation from './pages/Confirmation';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

// Admin pages — lazy loaded (code-split, loaded on demand)
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Candidates = lazy(() => import('./pages/Candidates'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Settings = lazy(() => import('./pages/Settings'));
const RoleMaster = lazy(() => import('./pages/Setup/RoleMaster'));
const MenuMaster = lazy(() => import('./pages/Setup/MenuMaster'));
const RolePermissions = lazy(() => import('./pages/Setup/RolePermissions'));
const UserManagement = lazy(() => import('./pages/Setup/UserManagement'));

// Loading fallback for lazy-loaded pages
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#f3f3f9]">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-[#405189] border-t-transparent rounded-full animate-spin" />
      <span className="text-sm text-gray-500">Loading...</span>
    </div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <AuthProvider>
          <MenuProvider>
            <Router>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: '#fff',
                    color: '#363636',
                    padding: '16px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
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
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Registration />} />
                  <Route path="/confirmation" element={<Confirmation />} />
                  <Route path="/login" element={<Login />} />

                  {/* Protected admin routes (lazy-loaded) */}
                  <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                  <Route path="/admin/candidates" element={<ProtectedRoute><Candidates /></ProtectedRoute>} />
                  <Route path="/admin/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                  <Route path="/admin/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                  <Route path="/admin/roles" element={<ProtectedRoute><RoleMaster /></ProtectedRoute>} />
                  <Route path="/admin/menus" element={<ProtectedRoute><MenuMaster /></ProtectedRoute>} />
                  <Route path="/admin/role-permissions" element={<ProtectedRoute><RolePermissions /></ProtectedRoute>} />
                  <Route path="/admin/users" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />

                  {/* 404 catch-all */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </Router>
          </MenuProvider>
        </AuthProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
