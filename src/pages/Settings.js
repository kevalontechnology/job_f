import React from 'react';
import { Helmet } from 'react-helmet-async';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { FaUser, FaInfoCircle, FaDownload } from 'react-icons/fa';

const Settings = () => {
  const { user } = useAuth();

  const getInitials = (name) => {
    if (!name) return 'AD';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getUserInitials = () => {
    if (user?.username) {
      return getInitials(user.username);
    }
    return 'AD';
  };

  const getLastLoginTime = () => {
    const lastLogin = localStorage.getItem('lastLoginTime');
    if (lastLogin) {
      const date = new Date(lastLogin);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return 'Not available';
  };

  const getApiEndpoint = () => {
    return process.env.REACT_APP_API_URL || 'http://localhost:5000';
  };

  return (
    <Layout title="Settings" subtitle="Manage your profile and system preferences">
      <Helmet>
        <title>Settings - Kevalon Admin</title>
      </Helmet>

      <div className="space-y-6">
        {/* Admin Profile */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <FaUser className="text-primary text-xl" />
            <h2 className="text-xl font-semibold text-gray-800">Admin Profile</h2>
          </div>

          <div className="flex items-start gap-6 flex-wrap">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {getUserInitials()}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Username</label>
                  <div className="mt-1 text-base text-gray-800 font-medium">
                    {user?.username || 'Not available'}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <div className="mt-1 text-base text-gray-800 font-medium">
                    {user?.email || 'Not available'}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Role</label>
                  <div className="mt-1">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary text-white">
                      {user?.role || 'Administrator'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Account Status</label>
                  <div className="mt-1">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-success text-white">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Export Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <FaDownload className="text-primary text-xl" />
            <h2 className="text-xl font-semibold text-gray-800">Export Settings</h2>
          </div>

          <div className="space-y-4">
            <p className="text-gray-600">
              You can export candidate data in CSV format for further analysis or record-keeping.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <FaInfoCircle className="text-primary text-lg mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-gray-800 mb-1">How to Export Data</h3>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                    <li>Navigate to the Candidates page</li>
                    <li>Use filters to narrow down your selection if needed</li>
                    <li>Click the "Export CSV" button in the top right corner</li>
                    <li>Your browser will download a CSV file with all candidate information</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <a
                href="/candidates"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaDownload />
                Go to Candidates Page
              </a>
            </div>
          </div>
        </div>

        {/* System Info */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <FaInfoCircle className="text-primary text-xl" />
            <h2 className="text-xl font-semibold text-gray-800">System Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-600 mb-1">Application Version</div>
              <div className="text-lg font-semibold text-gray-800">1.0.0</div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-600 mb-1">API Endpoint</div>
              <div className="text-sm font-mono text-gray-800 break-all">{getApiEndpoint()}</div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-600 mb-1">Last Login</div>
              <div className="text-sm text-gray-800">{getLastLoginTime()}</div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-600 mb-1">Environment</div>
              <div className="text-sm text-gray-800">
                {process.env.NODE_ENV === 'production' ? 'Production' : 'Development'}
              </div>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">About Kevalon Technology</h2>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                K
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Kevalon Admin Portal</h3>
                <p className="text-gray-600 leading-relaxed">
                  The Kevalon Admin Portal is a comprehensive platform for managing internship applications
                  and candidate data. Built with modern web technologies, it provides a seamless experience
                  for reviewing, approving, and tracking candidate applications.
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Key Features</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>Candidate management and review</li>
                    <li>Advanced filtering and search</li>
                    <li>Analytics and reporting</li>
                    <li>CSV export functionality</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Technology Stack</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>React with Hooks</li>
                    <li>Tailwind CSS</li>
                    <li>Node.js Backend</li>
                    <li>MongoDB Database</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-gray-700 text-center">
                &copy; 2026 Kevalon Technology. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
