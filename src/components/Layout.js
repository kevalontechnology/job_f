import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { FaBars, FaSignOutAlt } from 'react-icons/fa';

const Header = ({ title, onToggleSidebar }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const username = user?.username || 'Admin';
  const initials = username.substring(0, 2).toUpperCase();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 transition-all">
      <div className="flex items-center justify-between px-3 sm:px-4 md:px-6 py-3 sm:py-3.5 md:py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            <FaBars size={18} />
          </button>
          {title && (
            <h1 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 truncate">
              {title}
            </h1>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 min-h-[44px] hover:bg-gray-50 rounded-lg transition"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#224c99] flex items-center justify-center text-white text-xs sm:text-sm font-semibold">
              {initials}
            </div>
            <span className="hidden sm:block text-sm font-medium text-gray-700">
              {username}
            </span>
          </button>

          {showDropdown && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 min-h-[44px] text-sm text-rose-700 hover:bg-rose-50 transition"
                >
                  <FaSignOutAlt />
                  <span>Logout</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

const Layout = ({ children, title, subtitle }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-[#f3f3f9] flex">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col md:ml-64 transition-all">
        <Header title={title} onToggleSidebar={toggleSidebar} />

        <main className="flex-1 p-3 sm:p-4 md:p-8 w-full max-w-full overflow-x-hidden">
          {subtitle && (
            <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
              {subtitle}
            </p>
          )}
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
