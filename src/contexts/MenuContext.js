import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import api from '../utils/api';

const MenuContext = createContext();

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
};

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

const DEFAULT_PERMISSIONS = {
  read: false,
  write: false,
  edit: false,
  delete: false,
  print: false,
  mail: false
};

const ADMIN_PERMISSIONS = {
  read: true,
  write: true,
  edit: true,
  delete: true,
  print: true,
  mail: true
};

export const MenuProvider = ({ children }) => {
  const { user } = useAuth();
  const [menuData, setMenuData] = useState([]);
  const [currentPagePermissions, setCurrentPagePermissions] = useState(DEFAULT_PERMISSIONS);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);

  const cacheRef = useRef({ timestamp: null, data: null, permissions: null });

  // Helper to check if cache is valid
  const isCacheValid = useCallback(() => {
    if (!cacheRef.current.timestamp || !cacheRef.current.data) {
      return false;
    }
    const now = Date.now();
    return (now - cacheRef.current.timestamp) < CACHE_DURATION;
  }, []);

  // Helper to find menu by URL — searches menuGroups (direct links) and menus (with children)
  const findMenuByUrl = useCallback((url, menus = menuData) => {
    for (const group of menus) {
      // Check if group itself is a direct link
      if (group.menuGroup?.isLink && group.menuGroup?.menuUrl === url) {
        return group;
      }

      if (group.menus && Array.isArray(group.menus)) {
        for (const menu of group.menus) {
          // Check exact match on menuUrl
          if (menu.menuUrl === url) {
            return menu;
          }

          // Check nested children
          if (menu.children && Array.isArray(menu.children)) {
            const found = menu.children.find(child => child.menuUrl === url);
            if (found) {
              return found;
            }
          }
        }
      }
    }
    return null;
  }, [menuData]);

  // Fetch menus with role permissions
  const fetchMenus = useCallback(async () => {
    if (!user) {
      setMenuData([]);
      setIsAdmin(false);
      return;
    }

    // Check cache first
    if (isCacheValid()) {
      return;
    }

    setLoading(true);

    try {
      // Determine if user is admin
      const adminStatus = user.role === 'admin' && !user.roleId;
      setIsAdmin(adminStatus);

      // Fetch menu structure
      const menusResponse = await api.get('/menus/by-groups');
      const allMenus = menusResponse.data?.data || menusResponse.data || [];

      let filteredMenus = allMenus;
      let rolePermissions = {};

      // If not admin, fetch role permissions and filter menus
      if (!adminStatus && user.roleId) {
        try {
          const permResponse = await api.get(`/role-permissions/${user.roleId}`);
          const permData = permResponse.data?.data || permResponse.data || {};
          const permissions = permData.permissions || [];

          // Convert permissions array to map for quick lookup
          rolePermissions = permissions.reduce((acc, perm) => {
            const key = perm.menuId?._id || perm.menuId;
            if (!key) return acc;
            acc[key] = {
              read: perm.read || false,
              write: perm.write || false,
              edit: perm.edit || false,
              delete: perm.delete || false,
              print: perm.print || false,
              mail: perm.mail || false
            };
            return acc;
          }, {});

          // Filter menus based on read permission
          filteredMenus = allMenus.map(group => {
            if (!group.menus || !Array.isArray(group.menus)) {
              return group;
            }

            const filteredGroupMenus = group.menus
              .map(menu => {
                const menuPerms = rolePermissions[menu._id] || DEFAULT_PERMISSIONS;

                // Filter children
                let filteredChildren = menu.children || [];
                if (filteredChildren.length > 0) {
                  filteredChildren = filteredChildren.filter(child => {
                    const childPerms = rolePermissions[child._id] || DEFAULT_PERMISSIONS;
                    return childPerms.read;
                  });
                }

                // Include menu if it has read permission or has accessible children
                const hasReadPermission = menuPerms.read;
                const hasAccessibleChildren = filteredChildren.length > 0;

                if (hasReadPermission || hasAccessibleChildren) {
                  return {
                    ...menu,
                    permissions: menuPerms,
                    children: filteredChildren
                  };
                }

                return null;
              })
              .filter(Boolean);

            return {
              ...group,
              menus: filteredGroupMenus
            };
          }).filter(group => group.menus && group.menus.length > 0);
        } catch (permError) {
          console.error('Error fetching role permissions:', permError);
          // If permission fetch fails, show no menus for non-admin
          filteredMenus = [];
        }
      } else if (adminStatus) {
        // Admin gets all menus with full permissions
        filteredMenus = allMenus.map(group => ({
          ...group,
          menus: (group.menus || []).map(menu => ({
            ...menu,
            permissions: ADMIN_PERMISSIONS,
            children: (menu.children || []).map(child => ({
              ...child,
              permissions: ADMIN_PERMISSIONS
            }))
          }))
        }));
      }

      // Update cache
      cacheRef.current = {
        timestamp: Date.now(),
        data: filteredMenus,
        permissions: rolePermissions
      };

      setMenuData(filteredMenus);
    } catch (error) {
      console.error('Error fetching menus:', error);
      setMenuData([]);
    } finally {
      setLoading(false);
    }
  }, [user, isCacheValid]);

  // Update current page permissions based on URL
  const updateCurrentPagePermissions = useCallback((url) => {
    if (!url) {
      setCurrentPagePermissions(DEFAULT_PERMISSIONS);
      return;
    }

    // Admin gets all permissions
    if (isAdmin) {
      setCurrentPagePermissions(ADMIN_PERMISSIONS);
      return;
    }

    // Find menu by URL
    const menu = findMenuByUrl(url);

    if (menu && menu.permissions) {
      setCurrentPagePermissions(menu.permissions);
    } else {
      setCurrentPagePermissions(DEFAULT_PERMISSIONS);
    }
  }, [isAdmin, findMenuByUrl]);

  // Fetch menus when user changes
  useEffect(() => {
    if (user) {
      fetchMenus();
    } else {
      setMenuData([]);
      setIsAdmin(false);
      setCurrentPagePermissions(DEFAULT_PERMISSIONS);
      cacheRef.current = { timestamp: null, data: null, permissions: null };
    }
  }, [user, fetchMenus]);

  const hasPermission = useCallback((permType) => {
    if (isAdmin) return true;
    return currentPagePermissions[permType] || false;
  }, [isAdmin, currentPagePermissions]);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    menuData,
    currentPagePermissions,
    isAdmin,
    loading,
    fetchMenus,
    updateCurrentPagePermissions,
    hasPermission
  }), [menuData, currentPagePermissions, isAdmin, loading, fetchMenus, updateCurrentPagePermissions, hasPermission]);

  return (
    <MenuContext.Provider value={value}>
      {children}
    </MenuContext.Provider>
  );
};
