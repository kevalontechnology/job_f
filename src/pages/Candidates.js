import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';

// Context
import { useAuth } from '../contexts/AuthContext';
import { useMenu } from '../contexts/MenuContext';

// Components
import Layout from '../components/Layout';
import ConfirmModal from '../components/Dashboard/ConfirmModal';
import EvaluationModal from '../components/Dashboard/EvaluationModal';
import CandidateDetailsModal from '../components/Dashboard/CandidateDetailsModal';

// Utils
import api from '../utils/api';
import { formatDateTime } from '../utils/helpers';

// Icons
import {
  FaSync,
  FaPlus,
  FaDownload,
  FaTrashAlt,
  FaClipboardCheck,
  FaUser,
  FaBriefcase,
  FaCalendarAlt,
  FaIdBadge,
  FaCheckSquare,
  FaSquare,
} from 'react-icons/fa';

const STATUS_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

const ITEMS_PER_PAGE = 20;

const Candidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isUploadingProof, setIsUploadingProof] = useState(false);

  // Bulk actions
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null, isBulk: false });

  const { logout } = useAuth();
  const { hasPermission } = useMenu();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    setIsRefreshing(true);
    try {
      const { data } = await api.get('/candidates');
      setCandidates(data);
      toast.success('Candidates loaded successfully');
    } catch (err) {
      handleApiError(err, 'Failed to load candidates');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleApiError = (err, defaultMsg) => {
    if (err.response?.status === 401) {
      logout();
      navigate('/login');
      toast.error('Session expired. Please login again.');
    } else {
      const errorMsg = err.response?.data?.message || defaultMsg;
      toast.error(errorMsg);
    }
  };

  // Stats calculations
  const stats = useMemo(() => {
    return {
      total: candidates.length,
      approved: candidates.filter((c) => c.status === 'approved').length,
      pending: candidates.filter((c) => c.status === 'pending').length,
      rejected: candidates.filter((c) => c.status === 'rejected').length,
    };
  }, [candidates]);

  // Filtered candidates
  const filteredCandidates = useMemo(() => {
    if (filterStatus === 'all') return candidates;
    return candidates.filter((c) => c.status === filterStatus);
  }, [candidates, filterStatus]);

  // Paginated candidates
  const paginatedCandidates = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredCandidates.slice(startIndex, endIndex);
  }, [filteredCandidates, currentPage]);

  const totalPages = Math.ceil(filteredCandidates.length / ITEMS_PER_PAGE);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds([]);
  }, [filterStatus]);

  // Bulk selection
  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedCandidates.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedCandidates.map((c) => c._id));
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const isSelected = (id) => selectedIds.includes(id);
  const isAllSelected = paginatedCandidates.length > 0 && selectedIds.length === paginatedCandidates.length;

  // Delete handlers
  const handleDeleteClick = (id) => {
    setDeleteConfirm({ isOpen: true, id, isBulk: false });
  };

  const handleBulkDeleteClick = () => {
    setDeleteConfirm({ isOpen: true, id: null, isBulk: true });
  };

  const handleDeleteConfirm = async () => {
    try {
      if (deleteConfirm.isBulk) {
        await Promise.all(selectedIds.map((id) => api.delete(`/candidates/${id}`)));
        setCandidates((prev) => prev.filter((c) => !selectedIds.includes(c._id)));
        toast.success(`${selectedIds.length} candidate(s) deleted successfully`);
        setSelectedIds([]);
      } else {
        await api.delete(`/candidates/${deleteConfirm.id}`);
        setCandidates((prev) => prev.filter((c) => c._id !== deleteConfirm.id));
        toast.success('Candidate deleted successfully');
      }
    } catch (err) {
      handleApiError(err, 'Failed to delete candidate(s)');
    } finally {
      setDeleteConfirm({ isOpen: false, id: null, isBulk: false });
    }
  };

  // Status update handlers
  const handleStatusUpdate = async (id, status) => {
    try {
      const { data } = await api.put(`/candidates/${id}`, { status });
      setCandidates((prev) => prev.map((c) => (c._id === id ? data : c)));
      setSelectedCandidate((prev) => (prev && prev._id === id ? data : prev));
      toast.success(`Status updated to ${status}`);
    } catch (err) {
      handleApiError(err, 'Failed to update status');
    }
  };

  const handleBulkStatusUpdate = async (status) => {
    if (selectedIds.length === 0) return;

    setBulkActionLoading(true);
    try {
      await Promise.all(
        selectedIds.map((id) => api.put(`/candidates/${id}`, { status }))
      );
      setCandidates((prev) =>
        prev.map((c) => (selectedIds.includes(c._id) ? { ...c, status } : c))
      );
      toast.success(`${selectedIds.length} candidate(s) updated to ${status}`);
      setSelectedIds([]);
    } catch (err) {
      handleApiError(err, 'Failed to bulk update status');
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Upload payment proof
  const handleUploadPaymentProof = async (id, file) => {
    if (!file) return;
    setIsUploadingProof(true);

    try {
      const formData = new FormData();
      formData.append('paymentProof', file);
      formData.append('paymentInfo', JSON.stringify({ paymentStatus: 'pending' }));

      const { data } = await api.put(`/candidates/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setCandidates((prev) => prev.map((c) => (c._id === id ? data : c)));
      setSelectedCandidate(data);
      toast.success('Payment proof uploaded successfully');
    } catch (err) {
      handleApiError(err, 'Failed to upload payment proof');
      throw err;
    } finally {
      setIsUploadingProof(false);
    }
  };

  // Save candidate (from details modal)
  const handleSaveCandidate = async (id, { status, paymentStatus }) => {
    const updateBody = {};
    if (status !== selectedCandidate?.status) updateBody.status = status;
    if (paymentStatus !== selectedCandidate?.paymentInfo?.paymentStatus) {
      updateBody.paymentInfo = { paymentStatus };
    }
    if (Object.keys(updateBody).length === 0) return;

    try {
      const { data } = await api.put(`/candidates/${id}`, updateBody);
      setCandidates((prev) => prev.map((c) => (c._id === id ? data : c)));
      setSelectedCandidate((prev) => (prev && prev._id === id ? data : prev));
      toast.success('Candidate updated successfully');
    } catch (err) {
      handleApiError(err, 'Failed to update candidate');
      throw err;
    }
  };

  // Evaluation handler
  const handleSaveEvaluation = async (id, evalData) => {
    try {
      await api.put(`/candidates/${id}`, { evaluation: evalData, status: 'approved' });
      setCandidates((prev) =>
        prev.map((c) =>
          c._id === id ? { ...c, evaluation: evalData, status: 'approved' } : c
        )
      );
      setShowEvaluationModal(false);
      toast.success('Evaluation saved successfully');
    } catch (err) {
      handleApiError(err, 'Failed to save evaluation');
    }
  };

  // Export data
  const exportData = () => {
    if (filteredCandidates.length === 0) {
      toast.error('No candidates to export');
      return;
    }

    const headers = ['Name', 'Email', 'Position', 'Status', 'Date'];
    const rows = filteredCandidates.map((c) => [
      `${c.personalInfo.firstName} ${c.personalInfo.lastName}`,
      c.personalInfo.email,
      c.jobInfo.position,
      c.status,
      new Date(c.submittedAt).toLocaleDateString(),
    ]);

    const csvContent = [headers, ...rows].map((e) => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `candidates_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('Candidates exported successfully');
  };

  // Status badge styles
  const getStatusStyles = (status) => {
    const base =
      'text-xs font-bold px-3 py-2.5 rounded-full border-0 cursor-pointer outline-none focus:ring-2 focus:ring-offset-1 transition-all min-h-[44px] ';
    if (status === 'approved')
      return base + 'bg-emerald-100 text-emerald-700 focus:ring-emerald-500';
    if (status === 'rejected')
      return base + 'bg-rose-100 text-rose-700 focus:ring-rose-500';
    return base + 'bg-amber-100 text-amber-700 focus:ring-amber-500';
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50">
        <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 font-medium">Loading records...</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Candidates Management - Kevalon Technology</title>
        <meta
          name="description"
          content="Admin interface for managing and evaluating candidate applications at Kevalon Technology."
        />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <Layout title="Talent Pipeline" subtitle="Manage and evaluate your incoming candidates">
        {/* Header Actions */}
        <div className="flex items-center justify-end gap-2 sm:gap-3 mb-5 sm:mb-6">
          <button
            onClick={fetchCandidates}
            className="min-w-[44px] min-h-[44px] p-3 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center"
            aria-label="Refresh candidates"
          >
            <FaSync className={isRefreshing ? 'animate-spin' : ''} />
          </button>
          {hasPermission('print') && (
            <button
              onClick={exportData}
              className="flex items-center gap-2 px-3 sm:px-4 py-3 min-h-[44px] bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all shadow-md font-medium text-xs sm:text-sm whitespace-nowrap"
            >
              <FaDownload size={12} /> Export
            </button>
          )}
          {hasPermission('write') && (
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-3 sm:px-4 py-3 min-h-[44px] bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md font-medium text-xs sm:text-sm whitespace-nowrap"
            >
              <FaPlus size={12} /> <span className="hidden sm:inline">Add New</span>
              <span className="sm:hidden">Add</span>
            </button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-100 shadow-sm min-w-0">
            <p className="text-xs text-gray-500 uppercase font-bold truncate">Total</p>
            <p className="text-xl sm:text-2xl font-black text-gray-800 truncate">
              {stats.total}
            </p>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-100 shadow-sm min-w-0">
            <p className="text-xs text-emerald-500 uppercase font-bold truncate">Approved</p>
            <p className="text-xl sm:text-2xl font-black text-gray-800 truncate">
              {stats.approved}
            </p>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-100 shadow-sm min-w-0">
            <p className="text-xs text-amber-500 uppercase font-bold truncate">Pending</p>
            <p className="text-xl sm:text-2xl font-black text-gray-800 truncate">
              {stats.pending}
            </p>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-100 shadow-sm min-w-0">
            <p className="text-xs text-gray-400 uppercase font-bold truncate">Filtered</p>
            <p className="text-xl sm:text-2xl font-black text-blue-600 truncate">
              {filteredCandidates.length}
            </p>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setFilterStatus(filter.key)}
              className={`px-4 py-2.5 min-h-[44px] rounded-full font-semibold text-sm whitespace-nowrap transition-all ${
                filterStatus === filter.key
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {filter.label}
              {filter.key === 'all' && ` (${stats.total})`}
              {filter.key === 'pending' && ` (${stats.pending})`}
              {filter.key === 'approved' && ` (${stats.approved})`}
              {filter.key === 'rejected' && ` (${stats.rejected})`}
            </button>
          ))}
        </div>

        {/* Bulk Actions Bar */}
        {selectedIds.length > 0 && (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p className="text-sm font-semibold text-blue-900">
              {selectedIds.length} candidate(s) selected
            </p>
            <div className="flex flex-wrap gap-2">
              {hasPermission('edit') && (
                <>
                  <button
                    onClick={() => handleBulkStatusUpdate('approved')}
                    disabled={bulkActionLoading}
                    className="px-4 py-2.5 min-h-[44px] bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm disabled:opacity-50"
                  >
                    Approve All
                  </button>
                  <button
                    onClick={() => handleBulkStatusUpdate('rejected')}
                    disabled={bulkActionLoading}
                    className="px-4 py-2.5 min-h-[44px] bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors font-medium text-sm disabled:opacity-50"
                  >
                    Reject All
                  </button>
                </>
              )}
              {hasPermission('delete') && (
                <button
                  onClick={handleBulkDeleteClick}
                  disabled={bulkActionLoading}
                  className="px-4 py-2.5 min-h-[44px] bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm disabled:opacity-50"
                >
                  Delete All
                </button>
              )}
              <button
                onClick={() => setSelectedIds([])}
                className="px-4 py-2.5 min-h-[44px] bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Mobile Card View */}
        <div className="block lg:hidden space-y-4">
          {paginatedCandidates.map((candidate) => (
            <div
              key={candidate._id}
              className={`bg-white p-4 rounded-xl border shadow-sm space-y-3 transition-all ${
                isSelected(candidate._id) ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-100'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <button
                    onClick={() => toggleSelectOne(candidate._id)}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center text-blue-600"
                  >
                    {isSelected(candidate._id) ? (
                      <FaCheckSquare size={20} />
                    ) : (
                      <FaSquare size={20} className="text-gray-300" />
                    )}
                  </button>
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {candidate.personalInfo.firstName[0]}
                    {candidate.personalInfo.lastName[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-gray-900 leading-tight truncate">
                      {candidate.personalInfo.firstName} {candidate.personalInfo.lastName}
                    </h3>
                    <p className="text-xs text-gray-500 truncate">
                      {candidate.personalInfo.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 py-3 border-y border-gray-50 text-sm">
                <div className="flex items-center gap-2 text-gray-600 min-w-0">
                  <FaBriefcase className="text-gray-400 flex-shrink-0" />
                  <span className="truncate">{candidate.jobInfo.position}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 min-w-0">
                  <FaIdBadge className="text-gray-400 flex-shrink-0" />
                  <span className="font-mono truncate">{candidate.interviewId || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 min-w-0">
                  <FaCalendarAlt className="text-gray-400 flex-shrink-0" />
                  <span className="truncate">
                    {formatDateTime(candidate.submittedAt).split(',')[0]}
                  </span>
                </div>
                {hasPermission('edit') ? (
                  <select
                    value={candidate.status}
                    onChange={(e) => handleStatusUpdate(candidate._id, e.target.value)}
                    className={getStatusStyles(candidate.status)}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                ) : (
                  <span className={getStatusStyles(candidate.status)}>{candidate.status}</span>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    setSelectedCandidate(candidate);
                    setShowDetailsModal(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-800 rounded-lg font-semibold text-sm hover:bg-slate-200 transition-colors min-h-[44px]"
                >
                  <FaUser /> View
                </button>
                <button
                  onClick={() => {
                    setSelectedCandidate(candidate);
                    setShowEvaluationModal(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-50 text-blue-600 rounded-lg font-semibold text-sm hover:bg-blue-100 transition-colors min-h-[44px]"
                >
                  <FaClipboardCheck /> Evaluate
                </button>
                {hasPermission('delete') && (
                  <button
                    onClick={() => handleDeleteClick(candidate._id)}
                    className="px-4 py-3 text-rose-500 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors min-h-[44px] min-w-[44px]"
                  >
                    <FaTrashAlt />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 w-12">
                    <button
                      onClick={toggleSelectAll}
                      className="min-w-[44px] min-h-[44px] flex items-center justify-center text-blue-600"
                    >
                      {isAllSelected ? (
                        <FaCheckSquare size={20} />
                      ) : (
                        <FaSquare size={20} className="text-gray-300" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Candidate
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Role & Exp
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Interview ID
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginatedCandidates.map((candidate) => (
                  <tr
                    key={candidate._id}
                    className={`hover:bg-blue-50/30 transition-colors group ${
                      isSelected(candidate._id) ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleSelectOne(candidate._id)}
                        className="min-w-[44px] min-h-[44px] flex items-center justify-center text-blue-600"
                      >
                        {isSelected(candidate._id) ? (
                          <FaCheckSquare size={20} />
                        ) : (
                          <FaSquare size={20} className="text-gray-300" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                          {candidate.personalInfo.firstName[0]}
                          {candidate.personalInfo.lastName[0]}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 leading-tight">
                            {candidate.personalInfo.firstName} {candidate.personalInfo.lastName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {candidate.personalInfo.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-800">
                        {candidate.jobInfo.position}
                      </div>
                      <div className="text-xs text-gray-500">
                        {candidate.jobInfo.experience} yrs
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {hasPermission('edit') ? (
                        <select
                          value={candidate.status}
                          onChange={(e) => handleStatusUpdate(candidate._id, e.target.value)}
                          className={getStatusStyles(candidate.status)}
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      ) : (
                        <span className={getStatusStyles(candidate.status)}>
                          {candidate.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-600">
                      {candidate.interviewId || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDateTime(candidate.submittedAt).split(',')[0]}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setSelectedCandidate(candidate);
                            setShowDetailsModal(true);
                          }}
                          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors min-h-[44px] min-w-[44px]"
                          title="View"
                        >
                          <FaUser size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCandidate(candidate);
                            setShowEvaluationModal(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors min-h-[44px] min-w-[44px]"
                          title="Evaluate"
                        >
                          <FaClipboardCheck size={18} />
                        </button>
                        {hasPermission('delete') && (
                          <button
                            onClick={() => handleDeleteClick(candidate._id)}
                            className="p-2 text-rose-500 hover:bg-rose-100 rounded-lg transition-colors min-h-[44px] min-w-[44px]"
                            title="Delete"
                          >
                            <FaTrashAlt size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {filteredCandidates.length === 0 && (
          <div className="py-20 text-center bg-white rounded-xl border border-dashed border-gray-300">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 text-gray-400 mb-4">
              <FaUser size={24} />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No candidates found</h3>
            <p className="text-gray-500">
              {filterStatus === 'all'
                ? 'No candidates available yet.'
                : `No ${filterStatus} candidates found.`}
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredCandidates.length)} of{' '}
              {filteredCandidates.length} results
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2.5 min-h-[44px] bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2.5 min-h-[44px] bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Modals */}
        {showEvaluationModal && (
          <EvaluationModal
            candidate={selectedCandidate}
            onClose={() => setShowEvaluationModal(false)}
            onSave={handleSaveEvaluation}
          />
        )}

        {showDetailsModal && (
          <CandidateDetailsModal
            candidate={selectedCandidate}
            onClose={() => setShowDetailsModal(false)}
            onUploadProof={handleUploadPaymentProof}
            uploadingProof={isUploadingProof}
            onSave={handleSaveCandidate}
            canEditStatus={hasPermission('edit')}
          />
        )}

        <ConfirmModal
          isOpen={deleteConfirm.isOpen}
          onClose={() => setDeleteConfirm({ isOpen: false, id: null, isBulk: false })}
          onConfirm={handleDeleteConfirm}
          title={deleteConfirm.isBulk ? 'Delete Multiple Candidates' : 'Delete Candidate'}
          message={
            deleteConfirm.isBulk
              ? `Are you sure you want to delete ${selectedIds.length} candidate(s)? This action cannot be undone.`
              : 'Are you sure you want to delete this candidate? This action cannot be undone.'
          }
          confirmText="Delete"
          confirmColor="red"
        />
      </Layout>
    </>
  );
};

export default Candidates;
