import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import Layout from '../../components/Layout';
import { useMenu } from '../../contexts/MenuContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrashAlt, FaSearch } from 'react-icons/fa';
import ConfirmModal from '../../components/Dashboard/ConfirmModal';

const RoleMaster = () => {
  const { currentPagePermissions } = useMenu();
  const [roles, setRoles] = useState([]);
  const [filteredRoles, setFilteredRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [formData, setFormData] = useState({
    roleName: '',
    isActive: true,
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/roles');
      setRoles(response.data);
      setFilteredRoles(response.data);
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast.error('Failed to load roles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  useEffect(() => {
    const filtered = roles.filter((role) =>
      role.roleName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRoles(filtered);
  }, [searchTerm, roles]);

  const handleOpenModal = (role = null) => {
    if (role) {
      setSelectedRole(role);
      setFormData({
        roleName: role.roleName,
        isActive: role.isActive,
      });
    } else {
      setSelectedRole(null);
      setFormData({
        roleName: '',
        isActive: true,
      });
    }
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRole(null);
    setFormData({
      roleName: '',
      isActive: true,
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.roleName.trim()) {
      errors.roleName = 'Role name is required';
    } else if (formData.roleName.trim().length < 2) {
      errors.roleName = 'Role name must be at least 2 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        roleName: formData.roleName.trim(),
        isActive: formData.isActive,
      };

      if (selectedRole) {
        await api.put(`/api/roles/${selectedRole._id}`, payload);
        toast.success('Role updated successfully');
      } else {
        await api.post('/api/roles', payload);
        toast.success('Role created successfully');
      }

      handleCloseModal();
      fetchRoles();
    } catch (error) {
      console.error('Error saving role:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save role';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (role) => {
    setSelectedRole(role);
    setIsConfirmModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/api/roles/${selectedRole._id}`);
      toast.success('Role deleted successfully');
      setIsConfirmModalOpen(false);
      setSelectedRole(null);
      fetchRoles();
    } catch (error) {
      console.error('Error deleting role:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete role';
      toast.error(errorMessage);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Layout>
      <Helmet>
        <title>Role Master - Kevalon</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Role Master</h1>
            <p className="mt-2 text-sm text-gray-600">Manage system roles and permissions</p>
          </div>

          {/* Search and Add Button */}
          <div className="bg-white rounded-lg shadow mb-6 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search roles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
                />
              </div>
              {currentPagePermissions?.write && (
                <button
                  onClick={() => handleOpenModal()}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 min-h-[44px]"
                >
                  <FaPlus className="mr-2 h-4 w-4" />
                  Add Role
                </button>
              )}
            </div>
          </div>

          {/* Table/Cards */}
          {loading ? (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-8 text-center">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                </div>
              </div>
            </div>
          ) : filteredRoles.length === 0 ? (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-8 text-center">
                <p className="text-gray-500">
                  {searchTerm ? 'No roles found matching your search.' : 'No roles available. Click "Add Role" to create one.'}
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created At
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRoles.map((role) => (
                      <tr key={role._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{role.roleName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              role.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {role.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(role.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            {currentPagePermissions?.edit && (
                              <button
                                onClick={() => handleOpenModal(role)}
                                className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit role"
                              >
                                <FaEdit className="h-4 w-4" />
                              </button>
                            )}
                            {currentPagePermissions?.delete && (
                              <button
                                onClick={() => handleDeleteClick(role)}
                                className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete role"
                              >
                                <FaTrashAlt className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {filteredRoles.map((role) => (
                  <div key={role._id} className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{role.roleName}</h3>
                        <p className="text-sm text-gray-500 mt-1">Created: {formatDate(role.createdAt)}</p>
                      </div>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          role.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {role.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {currentPagePermissions?.edit && (
                        <button
                          onClick={() => handleOpenModal(role)}
                          className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 min-h-[44px]"
                        >
                          <FaEdit className="mr-2 h-4 w-4" />
                          Edit
                        </button>
                      )}
                      {currentPagePermissions?.delete && (
                        <button
                          onClick={() => handleDeleteClick(role)}
                          className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-red-300 rounded-lg shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 min-h-[44px]"
                        >
                          <FaTrashAlt className="mr-2 h-4 w-4" />
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={handleCloseModal}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4" id="modal-title">
                    {selectedRole ? 'Edit Role' : 'Add New Role'}
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="roleName" className="block text-sm font-medium text-gray-700 mb-1">
                        Role Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="roleName"
                        name="roleName"
                        value={formData.roleName}
                        onChange={handleInputChange}
                        className={`block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm ${
                          formErrors.roleName ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter role name"
                      />
                      {formErrors.roleName && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.roleName}</p>
                      )}
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isActive"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                        Active
                      </label>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                  >
                    {submitting ? 'Saving...' : selectedRole ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={submitting}
                    className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false);
          setSelectedRole(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Role"
        message={`Are you sure you want to delete the role "${selectedRole?.roleName}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmButtonClass="bg-red-600 hover:bg-red-700 focus:ring-red-500"
      />
    </Layout>
  );
};

export default RoleMaster;
