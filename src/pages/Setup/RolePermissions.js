import React, { useState, useEffect, useCallback } from 'react';


import Layout from '../../components/Layout';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { FaSave, FaCheckCircle, FaFolder, FaFile, FaExclamationTriangle } from 'react-icons/fa';

const RolePermissions = () => {

  // State
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [menuData, setMenuData] = useState([]);
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Permission columns
  const permissionTypes = ['read', 'write', 'edit', 'delete', 'print', 'mail'];

  // Fetch Roles
  const fetchRoles = useCallback(async () => {
    try {
      const response = await api.get('/roles');
      setRoles(response.data.data || response.data || []);
    } catch (error) {
      toast.error('Failed to load roles');
    }
  }, []);

  // Fetch Menu Data (hierarchical)
  const fetchMenuData = useCallback(async () => {
    try {
      const response = await api.get('/menus/by-groups');
      setMenuData(response.data.data || response.data || []);
    } catch (error) {
      toast.error('Failed to load menu structure');
    }
  }, []);

  // Fetch Role Permissions
  const fetchRolePermissions = useCallback(async (roleId) => {
    if (!roleId) {
      setPermissions({});
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`/role-permissions/${roleId}`);
      const rolePerms = response.data.data || response.data || {};

      // Convert permissions array to object for easier lookup
      const permMap = {};
      if (rolePerms.roles && Array.isArray(rolePerms.roles)) {
        rolePerms.roles.forEach(perm => {
          const key = perm.menuGroupId || perm.menuId;
          if (key) {
            permMap[key] = {
              read: perm.read || false,
              write: perm.write || false,
              edit: perm.edit || false,
              delete: perm.delete || false,
              print: perm.print || false,
              mail: perm.mail || false,
              isGroup: !!perm.menuGroupId
            };
          }
        });
      }
      setPermissions(permMap);
      setHasChanges(false);
    } catch (error) {
      if (error.response?.status === 404) {
        setPermissions({});
        toast.info('No permissions set for this role yet');
      } else {
        toast.error('Failed to load role permissions');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
    fetchMenuData();
  }, [fetchRoles, fetchMenuData]);

  useEffect(() => {
    if (selectedRole) {
      fetchRolePermissions(selectedRole);
    }
  }, [selectedRole, fetchRolePermissions]);

  // Permission Handlers
  const handlePermissionChange = (id, isGroup, permType, value) => {
    setPermissions(prev => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        [permType]: value,
        isGroup
      }
    }));
    setHasChanges(true);
  };

  const handleAllPermissionsForItem = (id, isGroup, value) => {
    const newPerms = {};
    permissionTypes.forEach(type => {
      newPerms[type] = value;
    });
    setPermissions(prev => ({
      ...prev,
      [id]: { ...newPerms, isGroup }
    }));
    setHasChanges(true);
  };

  const handleColumnSelectAll = (permType, value) => {
    const newPermissions = { ...permissions };

    menuData.forEach(group => {
      if (group.isLink) {
        const id = group.groupId || group._id;
        if (!newPermissions[id]) newPermissions[id] = { isGroup: true };
        newPermissions[id][permType] = value;
        newPermissions[id].isGroup = true;
      } else if (group.menus) {
        const processMenus = (menus) => {
          menus.forEach(menu => {
            const id = menu.id || menu._id;
            if (!newPermissions[id]) newPermissions[id] = { isGroup: false };
            newPermissions[id][permType] = value;
            newPermissions[id].isGroup = false;
            if (menu.children && menu.children.length > 0) {
              processMenus(menu.children);
            }
          });
        };
        processMenus(group.menus);
      }
    });

    setPermissions(newPermissions);
    setHasChanges(true);
  };

  const handleGroupToggle = (groupId, value) => {
    const newPermissions = { ...permissions };
    const group = menuData.find(g => (g.groupId || g._id) === groupId);

    if (!group) return;

    if (group.isLink) {
      const id = group.groupId || group._id;
      const newPerms = {};
      permissionTypes.forEach(type => { newPerms[type] = value; });
      newPermissions[id] = { ...newPerms, isGroup: true };
    } else if (group.menus) {
      const processMenus = (menus) => {
        menus.forEach(menu => {
          const id = menu.id || menu._id;
          const newPerms = {};
          permissionTypes.forEach(type => { newPerms[type] = value; });
          newPermissions[id] = { ...newPerms, isGroup: false };
          if (menu.children && menu.children.length > 0) {
            processMenus(menu.children);
          }
        });
      };
      processMenus(group.menus);
    }

    setPermissions(newPermissions);
    setHasChanges(true);
  };

  // Check if permission is granted
  const hasPermission = (id, permType) => {
    return permissions[id]?.[permType] || false;
  };

  // Check if all permissions are granted for item
  const hasAllPermissions = (id) => {
    const perm = permissions[id];
    if (!perm) return false;
    return permissionTypes.every(type => perm[type]);
  };

  // Check if column has all permissions
  const hasColumnAll = (permType) => {
    let allItems = [];
    menuData.forEach(group => {
      if (group.isLink) {
        allItems.push(group.groupId || group._id);
      } else if (group.menus) {
        const collectIds = (menus) => {
          menus.forEach(menu => {
            allItems.push(menu.id || menu._id);
            if (menu.children && menu.children.length > 0) {
              collectIds(menu.children);
            }
          });
        };
        collectIds(group.menus);
      }
    });
    return allItems.length > 0 && allItems.every(id => hasPermission(id, permType));
  };

  // Check if group has all permissions
  const hasGroupAll = (groupId) => {
    const group = menuData.find(g => (g.groupId || g._id) === groupId);
    if (!group) return false;

    if (group.isLink) {
      return hasAllPermissions(group.groupId || group._id);
    } else if (group.menus) {
      const checkMenus = (menus) => {
        return menus.every(menu => {
          const hasAll = hasAllPermissions(menu.id || menu._id);
          if (menu.children && menu.children.length > 0) {
            return hasAll && checkMenus(menu.children);
          }
          return hasAll;
        });
      };
      return checkMenus(group.menus);
    }
    return false;
  };

  // Save Permissions
  const handleSave = async () => {
    if (!selectedRole) {
      toast.error('Please select a role');
      return;
    }

    setSaving(true);
    try {
      const roles = Object.entries(permissions).map(([id, perms]) => ({
        ...(perms.isGroup ? { menuGroupId: id } : { menuId: id }),
        read: perms.read || false,
        write: perms.write || false,
        edit: perms.edit || false,
        delete: perms.delete || false,
        print: perms.print || false,
        mail: perms.mail || false
      }));

      await api.post('/role-permissions', {
        roleId: selectedRole,
        roles
      });

      toast.success('Permissions saved successfully');
      setHasChanges(false);
    } catch (error) {
      toast.error('Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  // Render menu items recursively
  const renderMenuItems = (menus, depth = 0) => {
    if (!menus || menus.length === 0) return null;

    return menus.map(menu => {
      const id = menu.id || menu._id;
      const paddingLeft = depth * 2;

      return (
        <React.Fragment key={id}>
          <tr className={`hover:bg-blue-50/30 transition-colors ${hasAllPermissions(id) ? 'bg-green-50/20' : ''}`}>
            <td className={`px-4 py-3 font-medium text-gray-900`} style={{ paddingLeft: `${paddingLeft + 1}rem` }}>
              {depth > 0 && <span className="text-gray-400 mr-2">└─</span>}
              {menu.isParent ? (
                <FaFolder className="inline text-purple-500 mr-2" />
              ) : (
                <FaFile className="inline text-blue-500 mr-2" />
              )}
              {menu.name || menu.menuName}
              {hasAllPermissions(id) && (
                <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">
                  Full Access
                </span>
              )}
            </td>
            {permissionTypes.map(permType => (
              <td key={permType} className="px-4 py-3 text-center">
                <input
                  type="checkbox"
                  checked={hasPermission(id, permType)}
                  onChange={(e) => handlePermissionChange(id, false, permType, e.target.checked)}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                />
              </td>
            ))}
            <td className="px-4 py-3 text-center">
              <button
                onClick={() => handleAllPermissionsForItem(id, false, !hasAllPermissions(id))}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                  hasAllPermissions(id)
                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                    : 'bg-green-100 text-green-600 hover:bg-green-200'
                }`}
              >
                {hasAllPermissions(id) ? 'Revoke All' : 'Grant All'}
              </button>
            </td>
          </tr>
          {menu.children && menu.children.length > 0 && renderMenuItems(menu.children, depth + 1)}
        </React.Fragment>
      );
    });
  };

  return (
    <>
      <Layout title="Role Permissions" subtitle="Assign permissions to roles for menu access control">

          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
            {/* Role Selector */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1 max-w-md">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Select Role</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-base"
                  >
                    <option value="">-- Choose a Role --</option>
                    {roles.map(role => (
                      <option key={role._id} value={role._id}>
                        {role.roleName || role.name}
                      </option>
                    ))}
                  </select>
                </div>
                {selectedRole && (
                  <button
                    onClick={handleSave}
                    disabled={!hasChanges || saving}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-colors ${
                      hasChanges && !saving
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {saving ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaSave /> Save Permissions
                      </>
                    )}
                  </button>
                )}
              </div>

              {hasChanges && selectedRole && (
                <div className="mt-4 flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
                  <FaExclamationTriangle />
                  <span className="text-sm font-medium">You have unsaved changes. Click "Save Permissions" to apply them.</span>
                </div>
              )}
            </div>

            {/* Permission Matrix */}
            {selectedRole ? (
              loading ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                  <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-4 text-gray-600 font-medium">Loading permissions...</p>
                </div>
              ) : menuData.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                  <FaFolder className="mx-auto text-5xl text-gray-300 mb-4" />
                  <p className="text-gray-600">No menu data available</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                      <thead className="bg-gray-50 border-b-2 border-gray-200 sticky top-0 z-10">
                        <tr>
                          <th className="px-4 py-4 text-xs font-bold text-gray-600 uppercase w-2/5">Menu / Group</th>
                          {permissionTypes.map(type => (
                            <th key={type} className="px-4 py-4 text-center">
                              <div className="flex flex-col items-center gap-2">
                                <span className="text-xs font-bold text-gray-600 uppercase">{type}</span>
                                <input
                                  type="checkbox"
                                  checked={hasColumnAll(type)}
                                  onChange={(e) => handleColumnSelectAll(type, e.target.checked)}
                                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                  title={`Select all ${type}`}
                                />
                              </div>
                            </th>
                          ))}
                          <th className="px-4 py-4 text-xs font-bold text-gray-600 uppercase text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {menuData.map(group => {
                          const groupId = group.groupId || group._id;
                          const hasAll = hasGroupAll(groupId);

                          return (
                            <React.Fragment key={groupId}>
                              {/* Group Header */}
                              <tr className="bg-blue-50/50 font-bold">
                                <td colSpan={permissionTypes.length + 2} className="px-4 py-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <input
                                        type="checkbox"
                                        checked={hasAll}
                                        onChange={(e) => handleGroupToggle(groupId, e.target.checked)}
                                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                      />
                                      <FaFolder className="text-blue-600" />
                                      <span className="text-gray-900">{group.groupName || group.menuGroupName}</span>
                                    </div>
                                    {hasAll && (
                                      <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold flex items-center gap-1">
                                        <FaCheckCircle /> All Permissions Set
                                      </span>
                                    )}
                                  </div>
                                </td>
                              </tr>

                              {/* Direct Link Group */}
                              {group.isLink && (
                                <tr className={`hover:bg-blue-50/30 transition-colors ${hasAllPermissions(groupId) ? 'bg-green-50/20' : ''}`}>
                                  <td className="px-4 py-3 pl-12 font-medium text-gray-900">
                                    <FaFile className="inline text-green-500 mr-2" />
                                    {group.groupName || group.menuGroupName} (Direct Link)
                                    {hasAllPermissions(groupId) && (
                                      <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">
                                        Full Access
                                      </span>
                                    )}
                                  </td>
                                  {permissionTypes.map(permType => (
                                    <td key={permType} className="px-4 py-3 text-center">
                                      <input
                                        type="checkbox"
                                        checked={hasPermission(groupId, permType)}
                                        onChange={(e) => handlePermissionChange(groupId, true, permType, e.target.checked)}
                                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                      />
                                    </td>
                                  ))}
                                  <td className="px-4 py-3 text-center">
                                    <button
                                      onClick={() => handleAllPermissionsForItem(groupId, true, !hasAllPermissions(groupId))}
                                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                                        hasAllPermissions(groupId)
                                          ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                          : 'bg-green-100 text-green-600 hover:bg-green-200'
                                      }`}
                                    >
                                      {hasAllPermissions(groupId) ? 'Revoke All' : 'Grant All'}
                                    </button>
                                  </td>
                                </tr>
                              )}

                              {/* Menu Items */}
                              {!group.isLink && group.menus && group.menus.length > 0 && renderMenuItems(group.menus)}

                              {/* Empty Group */}
                              {!group.isLink && (!group.menus || group.menus.length === 0) && (
                                <tr>
                                  <td colSpan={permissionTypes.length + 2} className="px-4 py-8 text-center text-gray-400 italic">
                                    No menus in this group
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Tips */}
                  <div className="bg-blue-50 border-t border-blue-100 px-6 py-4">
                    <p className="text-sm text-blue-800">
                      <strong>Tip:</strong> Use column headers to select all items for a specific permission type. Use group checkboxes to toggle all menus in a group.
                    </p>
                  </div>
                </div>
              )
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-50 text-blue-600 mb-4">
                  <FaCheckCircle className="text-3xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Select a Role</h3>
                <p className="text-gray-600">Choose a role from the dropdown above to manage its permissions</p>
              </div>
            )}
          </div>
      </Layout>
    </>
  );
};

export default RolePermissions;
