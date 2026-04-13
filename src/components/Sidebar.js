import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useMenu } from '../contexts/MenuContext';
import {
  FaTachometerAlt,
  FaUsers,
  FaChartBar,
  FaCog,
  FaSlidersH,
  FaUserTag,
  FaBars,
  FaShieldAlt,
  FaUsersCog,
  FaSignOutAlt,
  FaTimes,
  FaChevronDown,
  FaChevronRight,
  FaBriefcase,
  FaClipboardList,
  FaFileAlt,
  FaBuilding,
  FaTasks,
  FaBell,
  FaCalendar,
  FaEnvelope,
  FaFolder
} from 'react-icons/fa';

const iconMap = {
  FaTachometerAlt,
  FaUsers,
  FaChartBar,
  FaCog,
  FaSlidersH,
  FaUserTag,
  FaBars,
  FaShieldAlt,
  FaUsersCog,
  FaSignOutAlt,
  FaBriefcase,
  FaClipboardList,
  FaFileAlt,
  FaBuilding,
  FaTasks,
  FaBell,
  FaCalendar,
  FaEnvelope,
  FaFolder
};

const staticNavItems = [
  { name: 'Dashboard', path: '/admin', icon: 'FaTachometerAlt', group: 'Main' },
  { name: 'Candidates', path: '/admin/candidates', icon: 'FaUsers', group: 'Main', badge: true },
];

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { menuData, loading } = useMenu();
  const [expandedGroups, setExpandedGroups] = useState({});
  const [expandedMenus, setExpandedMenus] = useState({});

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const toggleMenu = (menuId) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    onClose();
  };

  const getIconComponent = (iconName) => {
    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent /> : <FaFolder />;
  };

  const renderMenuItem = (menu, level = 0) => {
    const hasChildren = menu.children && menu.children.length > 0;
    const isExpanded = expandedMenus[menu._id];
    const isActive = location.pathname === menu.menuUrl;

    if (hasChildren && menu.isParent) {
      return (
        <li key={menu._id} className="mb-0.5">
          <button
            onClick={() => toggleMenu(menu._id)}
            className={`w-full flex items-center justify-between px-3 py-2.5 min-h-[44px] text-left text-white/80 hover:bg-white/10 rounded transition-all ${
              isActive ? 'bg-white/10 text-white font-medium border-l-4 border-white' : ''
            }`}
            style={{ paddingLeft: `${12 + level * 16}px` }}
          >
            <div className="flex items-center gap-3">
              <span className="text-base shrink-0">{getIconComponent(menu.icon)}</span>
              <span className="text-sm">{menu.menuName}</span>
            </div>
            {isExpanded ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
          </button>
          {isExpanded && (
            <ul className="mt-0.5 space-y-0.5">
              {menu.children.map((child) => renderMenuItem(child, level + 1))}
            </ul>
          )}
        </li>
      );
    }

    return (
      <li key={menu._id} className="mb-0.5">
        <NavLink
          to={menu.menuUrl}
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 min-h-[44px] text-sm text-white/80 hover:bg-white/10 rounded transition-all ${
              isActive ? 'bg-white/10 text-white font-medium border-l-4 border-white' : ''
            }`
          }
          style={{ paddingLeft: `${12 + level * 16}px` }}
        >
          <span className="text-base shrink-0">{getIconComponent(menu.icon)}</span>
          <span>{menu.menuName}</span>
        </NavLink>
      </li>
    );
  };

  const renderMenuGroup = (group) => {
    if (group.menuGroup.isLink) {
      return (
        <li key={group.menuGroup._id} className="mb-0.5">
          <NavLink
            to={group.menuGroup.menuUrl}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 min-h-[44px] text-sm text-white/80 hover:bg-white/10 rounded transition-all ${
                isActive ? 'bg-white/10 text-white font-medium border-l-4 border-white' : ''
              }`
            }
          >
            <span className="text-base shrink-0">{getIconComponent(group.menuGroup.icon)}</span>
            <span>{group.menuGroup.menuGroupName}</span>
          </NavLink>
        </li>
      );
    }

    const isExpanded = expandedGroups[group.menuGroup._id];
    const hasMenus = group.menus && group.menus.length > 0;

    return (
      <li key={group.menuGroup._id} className="mb-1">
        <button
          onClick={() => toggleGroup(group.menuGroup._id)}
          className="w-full flex items-center justify-between px-3 py-2.5 min-h-[44px] text-left text-white/80 hover:bg-white/10 rounded transition-all"
        >
          <div className="flex items-center gap-3">
            <span className="text-base shrink-0">{getIconComponent(group.menuGroup.icon)}</span>
            <span className="text-sm font-medium">{group.menuGroup.menuGroupName}</span>
          </div>
          {hasMenus && (isExpanded ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />)}
        </button>
        {isExpanded && hasMenus && (
          <ul className="mt-0.5 space-y-0.5">
            {group.menus.map((menu) => renderMenuItem(menu, 0))}
          </ul>
        )}
      </li>
    );
  };

  const renderStaticNav = () => {
    let currentGroup = null;

    return staticNavItems.map((item, index) => {
      const showGroupTitle = item.group && item.group !== currentGroup;
      if (showGroupTitle) {
        currentGroup = item.group;
      }

      return (
        <React.Fragment key={item.path}>
          {showGroupTitle && (
            <li className="px-3 pt-4 pb-2 text-[10px] text-white/50 uppercase tracking-widest font-semibold">
              {item.group}
            </li>
          )}
          <li className="mb-0.5">
            <NavLink
              to={item.path}
              end={item.path === '/admin'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 min-h-[44px] text-sm text-white/80 hover:bg-white/10 rounded transition-all ${
                  isActive ? 'bg-white/10 text-white font-medium border-l-4 border-white' : ''
                }`
              }
            >
              <div className="flex items-center gap-3">
                <span className="text-base shrink-0">{getIconComponent(item.icon)}</span>
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="px-2 py-0.5 bg-rose-500 text-white text-[10px] rounded-full font-semibold">
                  0
                </span>
              )}
            </NavLink>
          </li>
        </React.Fragment>
      );
    });
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#224c99] flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        {/* Logo Box */}
        <div className="bg-white border-b-2 border-[#224c99] flex items-center justify-between px-4 py-5 h-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#224c99] flex items-center justify-center text-white font-bold text-lg">
              K
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">Kevalon</div>
              <div className="text-[9px] text-gray-500 uppercase tracking-wider">Admin Panel</div>
            </div>
          </div>
          <button
            className="md:hidden text-gray-400 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
            onClick={onClose}
          >
            <FaTimes size={16} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 overflow-y-auto">
          <ul className="space-y-0.5">
            {loading ? (
              <li className="px-3 py-2 text-white/60 text-sm">Loading menus...</li>
            ) : menuData && menuData.length > 0 ? (
              menuData.map((group) => renderMenuGroup(group))
            ) : (
              renderStaticNav()
            )}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-3 min-h-[44px] bg-white/10 text-white hover:bg-rose-600/80 rounded-lg transition-colors font-semibold text-sm"
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar; 