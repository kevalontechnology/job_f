import React, { useState, useEffect, useCallback } from 'react';


import Layout from '../../components/Layout';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrashAlt, FaFolder, FaFile, FaSave, FaTimes, FaCheck } from 'react-icons/fa';

const MenuMaster = () => {

  // Tab state
  const [activeTab, setActiveTab] = useState('groups');

  // Menu Groups State
  const [menuGroups, setMenuGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [groupModal, setGroupModal] = useState({ isOpen: false, mode: 'add', data: null });
  const [groupForm, setGroupForm] = useState({
    menuGroupName: '',
    sequence: '',
    isLink: false,
    menuUrl: '',
    icon: '',
    isActive: true
  });

  // Menu Items State
  const [menuItems, setMenuItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [itemModal, setItemModal] = useState({ isOpen: false, mode: 'add', data: null });
  const [itemForm, setItemForm] = useState({
    menuName: '',
    menuGroup: '',
    menuUrl: '',
    sequence: '',
    isParent: false,
    parentMenu: '',
    icon: '',
    isActive: true
  });

  // Confirm Modal State
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, onConfirm: null, title: '', message: '' });

  // Fetch Menu Groups
  const fetchMenuGroups = useCallback(async () => {
    setGroupsLoading(true);
    try {
      const response = await api.get('/menus/groups');
      setMenuGroups(response.data.data || response.data || []);
    } catch (error) {
      toast.error('Failed to load menu groups');
    } finally {
      setGroupsLoading(false);
    }
  }, []);

  // Fetch Menu Items
  const fetchMenuItems = useCallback(async () => {
    setItemsLoading(true);
    try {
      const response = await api.get('/menus');
      setMenuItems(response.data.data || response.data || []);
    } catch (error) {
      toast.error('Failed to load menu items');
    } finally {
      setItemsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'groups') {
      fetchMenuGroups();
    } else {
      fetchMenuItems();
      fetchMenuGroups(); // Also fetch groups for dropdown
    }
  }, [activeTab, fetchMenuGroups, fetchMenuItems]);

  // Group Handlers
  const handleGroupSubmit = async (e) => {
    e.preventDefault();
    try {
      if (groupModal.mode === 'add') {
        await api.post('/menus/groups', groupForm);
        toast.success('Menu group added successfully');
      } else {
        await api.put(`/menus/groups/${groupModal.data._id}`, groupForm);
        toast.success('Menu group updated successfully');
      }
      setGroupModal({ isOpen: false, mode: 'add', data: null });
      setGroupForm({ menuGroupName: '', sequence: '', isLink: false, menuUrl: '', icon: '', isActive: true });
      fetchMenuGroups();
    } catch (error) {
      toast.error(`Failed to ${groupModal.mode} menu group`);
    }
  };

  const handleGroupEdit = (group) => {
    setGroupForm({
      menuGroupName: group.menuGroupName,
      sequence: group.sequence,
      isLink: group.isLink || false,
      menuUrl: group.menuUrl || '',
      icon: group.icon || '',
      isActive: group.isActive
    });
    setGroupModal({ isOpen: true, mode: 'edit', data: group });
  };

  const handleGroupDelete = async (id) => {
    try {
      await api.delete(`/menus/groups/${id}`);
      toast.success('Menu group deleted successfully');
      fetchMenuGroups();
    } catch (error) {
      toast.error('Failed to delete menu group');
    }
  };

  // Item Handlers
  const handleItemSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...itemForm,
        menuGroup: itemForm.menuGroup || undefined,
        parentMenu: itemForm.parentMenu || null
      };

      if (itemModal.mode === 'add') {
        await api.post('/menus', payload);
        toast.success('Menu item added successfully');
      } else {
        await api.put(`/menus/${itemModal.data._id}`, payload);
        toast.success('Menu item updated successfully');
      }
      setItemModal({ isOpen: false, mode: 'add', data: null });
      setItemForm({ menuName: '', menuGroup: '', menuUrl: '', sequence: '', isParent: false, parentMenu: '', icon: '', isActive: true });
      fetchMenuItems();
    } catch (error) {
      toast.error(`Failed to ${itemModal.mode} menu item`);
    }
  };

  const handleItemEdit = (item) => {
    setItemForm({
      menuName: item.menuName,
      menuGroup: item.menuGroup?._id || item.menuGroup || '',
      menuUrl: item.menuUrl || '',
      sequence: item.sequence,
      isParent: item.isParent || false,
      parentMenu: item.parentMenu?._id || item.parentMenu || '',
      icon: item.icon || '',
      isActive: item.isActive
    });
    setItemModal({ isOpen: true, mode: 'edit', data: item });
  };

  const handleItemDelete = async (id) => {
    try {
      await api.delete(`/menus/${id}`);
      toast.success('Menu item deleted successfully');
      fetchMenuItems();
    } catch (error) {
      toast.error('Failed to delete menu item');
    }
  };

  // Get parent menus for selected group
  const getParentMenus = () => {
    if (!itemForm.menuGroup) return [];
    return menuItems.filter(item =>
      (item.menuGroup?._id === itemForm.menuGroup || item.menuGroup === itemForm.menuGroup) &&
      item.isParent &&
      item._id !== itemModal.data?._id
    );
  };

  return (
    <>
      <Layout title="Menu Master" subtitle="Manage menu groups and menu items">
          <div className="max-w-7xl mx-auto">
            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="border-b border-gray-200">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab('groups')}
                    className={`flex-1 px-6 py-4 text-sm font-bold transition-colors ${
                      activeTab === 'groups'
                        ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <FaFolder className="inline mr-2" />
                    Menu Groups
                  </button>
                  <button
                    onClick={() => setActiveTab('items')}
                    className={`flex-1 px-6 py-4 text-sm font-bold transition-colors ${
                      activeTab === 'items'
                        ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <FaFile className="inline mr-2" />
                    Menu Items
                  </button>
                </div>
              </div>

              {/* Menu Groups Tab */}
              {activeTab === 'groups' && (
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-gray-800">Menu Groups</h2>
                    <button
                      onClick={() => {
                        setGroupForm({ menuGroupName: '', sequence: '', isLink: false, menuUrl: '', icon: '', isActive: true });
                        setGroupModal({ isOpen: true, mode: 'add', data: null });
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      <FaPlus /> Add Group
                    </button>
                  </div>

                  {groupsLoading ? (
                    <div className="text-center py-12">
                      <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : menuGroups.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <FaFolder className="mx-auto text-4xl mb-4 text-gray-300" />
                      <p>No menu groups found</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">Group Name</th>
                            <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">Sequence</th>
                            <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">Is Link</th>
                            <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">Icon</th>
                            <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">Status</th>
                            <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {menuGroups.map((group) => (
                            <tr key={group._id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 font-medium text-gray-900">{group.menuGroupName}</td>
                              <td className="px-4 py-3 text-gray-600">{group.sequence}</td>
                              <td className="px-4 py-3">
                                {group.isLink ? (
                                  <span className="text-green-600 font-medium">Yes</span>
                                ) : (
                                  <span className="text-gray-400">No</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-gray-600">{group.icon || '-'}</td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                  group.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {group.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  onClick={() => handleGroupEdit(group)}
                                  className="text-blue-600 hover:text-blue-700 mr-3"
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  onClick={() => setConfirmModal({
                                    isOpen: true,
                                    title: 'Delete Menu Group',
                                    message: `Are you sure you want to delete "${group.menuGroupName}"?`,
                                    onConfirm: () => handleGroupDelete(group._id)
                                  })}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <FaTrashAlt />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Menu Items Tab */}
              {activeTab === 'items' && (
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-gray-800">Menu Items</h2>
                    <button
                      onClick={() => {
                        setItemForm({ menuName: '', menuGroup: '', menuUrl: '', sequence: '', isParent: false, parentMenu: '', icon: '', isActive: true });
                        setItemModal({ isOpen: true, mode: 'add', data: null });
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      <FaPlus /> Add Menu Item
                    </button>
                  </div>

                  {itemsLoading ? (
                    <div className="text-center py-12">
                      <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : menuItems.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <FaFile className="mx-auto text-4xl mb-4 text-gray-300" />
                      <p>No menu items found</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">Menu Name</th>
                            <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">Group</th>
                            <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">URL</th>
                            <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">Sequence</th>
                            <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">Parent</th>
                            <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">Status</th>
                            <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {menuItems.map((item) => (
                            <tr key={item._id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 font-medium text-gray-900">{item.menuName}</td>
                              <td className="px-4 py-3 text-gray-600">{item.menuGroup?.menuGroupName || '-'}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{item.menuUrl || '-'}</td>
                              <td className="px-4 py-3 text-gray-600">{item.sequence}</td>
                              <td className="px-4 py-3">
                                {item.isParent ? (
                                  <span className="text-purple-600 font-medium">Is Parent</span>
                                ) : item.parentMenu ? (
                                  <span className="text-gray-600">{item.parentMenu?.menuName || 'Has Parent'}</span>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                  item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {item.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  onClick={() => handleItemEdit(item)}
                                  className="text-blue-600 hover:text-blue-700 mr-3"
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  onClick={() => setConfirmModal({
                                    isOpen: true,
                                    title: 'Delete Menu Item',
                                    message: `Are you sure you want to delete "${item.menuName}"?`,
                                    onConfirm: () => handleItemDelete(item._id)
                                  })}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <FaTrashAlt />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
      </Layout>

      {/* Group Modal */}
      {groupModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                {groupModal.mode === 'add' ? 'Add Menu Group' : 'Edit Menu Group'}
              </h3>
            </div>
            <form onSubmit={handleGroupSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Group Name *</label>
                <input
                  type="text"
                  required
                  value={groupForm.menuGroupName}
                  onChange={(e) => setGroupForm({ ...groupForm, menuGroupName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sequence *</label>
                <input
                  type="number"
                  required
                  value={groupForm.sequence}
                  onChange={(e) => setGroupForm({ ...groupForm, sequence: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="groupIsLink"
                  checked={groupForm.isLink}
                  onChange={(e) => setGroupForm({ ...groupForm, isLink: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="groupIsLink" className="ml-2 text-sm text-gray-700">Is Direct Link</label>
              </div>
              {groupForm.isLink && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Menu URL</label>
                  <input
                    type="text"
                    value={groupForm.menuUrl}
                    onChange={(e) => setGroupForm({ ...groupForm, menuUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                <input
                  type="text"
                  value={groupForm.icon}
                  onChange={(e) => setGroupForm({ ...groupForm, icon: e.target.value })}
                  placeholder="e.g., FaHome"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="groupIsActive"
                  checked={groupForm.isActive}
                  onChange={(e) => setGroupForm({ ...groupForm, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="groupIsActive" className="ml-2 text-sm text-gray-700">Is Active</label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <FaSave /> {groupModal.mode === 'add' ? 'Add' : 'Update'}
                </button>
                <button
                  type="button"
                  onClick={() => setGroupModal({ isOpen: false, mode: 'add', data: null })}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  <FaTimes /> Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Item Modal */}
      {itemModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                {itemModal.mode === 'add' ? 'Add Menu Item' : 'Edit Menu Item'}
              </h3>
            </div>
            <form onSubmit={handleItemSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Menu Group *</label>
                <select
                  required
                  value={itemForm.menuGroup}
                  onChange={(e) => setItemForm({ ...itemForm, menuGroup: e.target.value, parentMenu: '' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Select Group</option>
                  {menuGroups.map((group) => (
                    <option key={group._id} value={group._id}>{group.menuGroupName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Menu Name *</label>
                <input
                  type="text"
                  required
                  value={itemForm.menuName}
                  onChange={(e) => setItemForm({ ...itemForm, menuName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Menu URL</label>
                <input
                  type="text"
                  value={itemForm.menuUrl}
                  onChange={(e) => setItemForm({ ...itemForm, menuUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sequence *</label>
                <input
                  type="number"
                  required
                  value={itemForm.sequence}
                  onChange={(e) => setItemForm({ ...itemForm, sequence: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="itemIsParent"
                  checked={itemForm.isParent}
                  onChange={(e) => setItemForm({ ...itemForm, isParent: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="itemIsParent" className="ml-2 text-sm text-gray-700">Is Parent Menu</label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Parent Menu</label>
                <select
                  value={itemForm.parentMenu}
                  onChange={(e) => setItemForm({ ...itemForm, parentMenu: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  disabled={!itemForm.menuGroup}
                >
                  <option value="">None (Top Level)</option>
                  {getParentMenus().map((menu) => (
                    <option key={menu._id} value={menu._id}>{menu.menuName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                <input
                  type="text"
                  value={itemForm.icon}
                  onChange={(e) => setItemForm({ ...itemForm, icon: e.target.value })}
                  placeholder="e.g., FaUser"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="itemIsActive"
                  checked={itemForm.isActive}
                  onChange={(e) => setItemForm({ ...itemForm, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="itemIsActive" className="ml-2 text-sm text-gray-700">Is Active</label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <FaSave /> {itemModal.mode === 'add' ? 'Add' : 'Update'}
                </button>
                <button
                  type="button"
                  onClick={() => setItemModal({ isOpen: false, mode: 'add', data: null })}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  <FaTimes /> Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">{confirmModal.title}</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-600">{confirmModal.message}</p>
            </div>
            <div className="p-6 pt-0 flex gap-3">
              <button
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal({ isOpen: false, onConfirm: null, title: '', message: '' });
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                <FaCheck /> Confirm
              </button>
              <button
                onClick={() => setConfirmModal({ isOpen: false, onConfirm: null, title: '', message: '' })}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                <FaTimes /> Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MenuMaster;
