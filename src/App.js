import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { MenuProvider } from './contexts/MenuContext';
import ProtectedRoute from './components/ProtectedRoute';
import Registration from './pages/Registration';
import Confirmation from './pages/Confirmation';
import AdminDashboard from './pages/AdminDashboard';
import Candidates from './pages/Candidates';
import Login from './pages/Login';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import RoleMaster from './pages/Setup/RoleMaster';
import MenuMaster from './pages/Setup/MenuMaster';
import RolePermissions from './pages/Setup/RolePermissions';
import UserManagement from './pages/Setup/UserManagement';

function App() {
  return (
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
            <Routes>
              <Route path="/" element={<Registration />} />
              <Route path="/confirmation" element={<Confirmation />} />
              <Route path="/login" element={<Login />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/candidates"
                element={
                  <ProtectedRoute>
                    <Candidates />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/analytics"
                element={
                  <ProtectedRoute>
                    <Analytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/roles"
                element={
                  <ProtectedRoute>
                    <RoleMaster />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/menus"
                element={
                  <ProtectedRoute>
                    <MenuMaster />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/role-permissions"
                element={
                  <ProtectedRoute>
                    <RolePermissions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute>
                    <UserManagement />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Router>
        </MenuProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
