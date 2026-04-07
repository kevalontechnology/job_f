import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaTachometerAlt, FaUsers, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';

const navItems = [
  { name: 'Dashboard', path: '/admin', icon: <FaTachometerAlt /> },
  { name: 'Candidates', path: '/admin/candidates', icon: <FaUsers /> },
];

const Sidebar = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* --- Mobile Top Bar (Only visible on small screens) --- */}
      <div className="md:hidden flex items-center justify-between bg-white border-b border-gray-200 px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 sticky top-0 z-50">
        <div className="text-xs sm:text-sm md:text-base font-bold text-gray-900 truncate mr-2">Interview Portal</div>
        <button
          onClick={toggleSidebar}
          className="p-2.5 sm:p-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-lg transition shrink-0"
        >
          {isOpen ? <FaTimes size={16} /> : <FaBars size={16} />}
        </button>
      </div>

      {/* --- Backdrop (Dark overlay when mobile menu is open) --- */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={toggleSidebar}
        />
      )}

      {/* --- Sidebar Container --- */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 shadow-xl md:shadow-sm 
        flex flex-col transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0
      `}>
        {/* Sidebar Header */}
        <div className="px-3 sm:px-4 md:px-6 py-4 sm:py-5 md:py-6 border-b border-gray-100 flex items-center justify-between">
          <div className="min-w-0 flex-1 mr-2">
            <div className="text-sm sm:text-base md:text-lg font-bold text-gray-900 truncate">Interview Portal</div>
            <div className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide sm:tracking-wider font-semibold">Admin Panel</div>
          </div>
          {/* Close button inside sidebar for mobile */}
          <button className="md:hidden text-gray-400 p-2 sm:p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0" onClick={toggleSidebar}>
            <FaTimes size={16} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 sm:px-4 py-4 sm:py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              onClick={() => setIsOpen(false)} // Close sidebar on link click (mobile)
              className={({ isActive }) =>
                `flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-3 sm:py-3.5 min-h-[44px] rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-bold shadow-sm ring-1 ring-blue-100'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <span className="text-base sm:text-lg shrink-0">{item.icon}</span>
              <span className="text-xs sm:text-sm">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer / Logout */}
        <div className="px-3 sm:px-4 py-3 sm:py-4 border-t border-gray-100">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-3 sm:py-3.5 min-h-[44px] bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl transition-colors font-semibold text-xs sm:text-sm"
          >
            <FaSignOutAlt className="shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar; 