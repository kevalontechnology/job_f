import React, { useState, useMemo } from 'react';
import { formatDateTime } from '../../utils/helpers';
import {
  FaSearch, FaDownload, FaTrashAlt, FaClipboardCheck,
  FaFilter, FaUser, FaBriefcase, FaCalendarAlt, FaIdBadge,
  FaSortUp, FaSortDown, FaSort
} from "react-icons/fa";

const CandidateTable = ({
  candidates,
  onDelete,
  onStatusUpdate,
  onEvaluate,
  onView,
  onExport,
  selectedIds = [],
  onSelectionChange,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  permissions = { edit: true, delete: true, evaluate: true }
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortBy, setSortBy] = useState('submittedAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const filteredAndSortedCandidates = useMemo(() => {
    let filtered = candidates.filter(candidate => {
      const fullName = `${candidate.personalInfo.firstName} ${candidate.personalInfo.lastName}`;
      const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           candidate.personalInfo.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = !filterRole || candidate.jobInfo.position === filterRole;
      const matchesStatus = !filterStatus || candidate.status === filterStatus;
      return matchesSearch && matchesRole && matchesStatus;
    });

    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'submittedAt') {
        comparison = new Date(b.submittedAt) - new Date(a.submittedAt);
      } else if (sortBy === 'fullName') {
        const nameA = `${a.personalInfo.firstName} ${a.personalInfo.lastName}`;
        const nameB = `${b.personalInfo.firstName} ${b.personalInfo.lastName}`;
        comparison = nameA.localeCompare(nameB);
      } else if (sortBy === 'status') {
        comparison = a.status.localeCompare(b.status);
      } else if (sortBy === 'position') {
        comparison = a.jobInfo.position.localeCompare(b.jobInfo.position);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    return filtered;
  }, [candidates, searchTerm, filterRole, filterStatus, sortBy, sortOrder]);

  const roles = [...new Set(candidates.map(c => c.jobInfo.position))];

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (column) => {
    if (sortBy !== column) return <FaSort className="text-gray-400" size={12} />;
    return sortOrder === 'asc' ? <FaSortUp className="text-blue-600" size={12} /> : <FaSortDown className="text-blue-600" size={12} />;
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      onSelectionChange?.(filteredAndSortedCandidates.map(c => c._id));
    } else {
      onSelectionChange?.([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      onSelectionChange?.(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      onSelectionChange?.([...selectedIds, id]);
    }
  };

  const isAllSelected = filteredAndSortedCandidates.length > 0 &&
    filteredAndSortedCandidates.every(c => selectedIds.includes(c._id));

  const getStatusDisplay = (status) => {
    const statusConfig = {
      pending: { color: 'bg-amber-500', text: 'Pending', textColor: 'text-amber-700' },
      approved: { color: 'bg-emerald-500', text: 'Approved', textColor: 'text-emerald-700' },
      rejected: { color: 'bg-rose-500', text: 'Rejected', textColor: 'text-rose-700' }
    };
    return statusConfig[status] || statusConfig.pending;
  };

  const getStatusStyles = (status) => {
    const base = "text-xs font-bold px-3 py-2.5 rounded-full border-0 cursor-pointer outline-none focus:ring-2 focus:ring-offset-1 transition-all min-h-[44px] ";
    if (status === 'approved') return base + "bg-emerald-100 text-emerald-700 focus:ring-emerald-500";
    if (status === 'rejected') return base + "bg-rose-100 text-rose-700 focus:ring-rose-500";
    return base + "bg-amber-100 text-amber-700 focus:ring-amber-500";
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 bg-white p-2.5 sm:p-3 md:p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative flex-1 min-w-0">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Search candidates..."
            className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none text-base min-h-[44px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-1 min-w-[140px] items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2.5 rounded-lg border border-gray-200 min-h-[44px]">
            <FaFilter className="text-gray-400 flex-shrink-0" />
            <select
              className="bg-transparent outline-none cursor-pointer w-full min-w-0"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="">All Roles</option>
              {roles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div className="flex flex-1 min-w-[140px] items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2.5 rounded-lg border border-gray-200 min-h-[44px]">
            <FaFilter className="text-gray-400 flex-shrink-0" />
            <select
              className="bg-transparent outline-none cursor-pointer w-full min-w-0"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <button
            onClick={onExport}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium text-sm shadow-sm min-h-[44px]"
          >
            <FaDownload size={14} /> <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="block lg:hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {filteredAndSortedCandidates.map((candidate) => {
            const statusDisplay = getStatusDisplay(candidate.status);
            return (
              <div key={candidate._id} className="bg-white p-3 sm:p-4 md:p-5 rounded-xl border border-gray-100 shadow-sm space-y-3 sm:space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {onSelectionChange && (
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(candidate._id)}
                        onChange={() => handleSelectOne(candidate._id)}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      />
                    )}
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {candidate.personalInfo.firstName[0]}{candidate.personalInfo.lastName[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-gray-900 leading-tight truncate">
                        {candidate.personalInfo.firstName} {candidate.personalInfo.lastName}
                      </h3>
                      <p className="text-xs text-gray-500 truncate">{candidate.personalInfo.email}</p>
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
                    <span className="truncate">{formatDateTime(candidate.submittedAt).split(',')[0]}</span>
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-2 h-2 rounded-full ${statusDisplay.color} flex-shrink-0`} />
                    {permissions.edit ? (
                      <select
                        value={candidate.status}
                        onChange={(e) => onStatusUpdate(candidate._id, e.target.value)}
                        className={getStatusStyles(candidate.status)}
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    ) : (
                      <span className={`text-xs font-bold ${statusDisplay.textColor}`}>{statusDisplay.text}</span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => onView(candidate)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-800 rounded-lg font-semibold text-sm hover:bg-slate-200 transition-colors min-h-[44px]"
                  >
                    <FaUser /> View
                  </button>
                  {permissions.evaluate && (
                    <button
                      onClick={() => onEvaluate(candidate)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-50 text-blue-600 rounded-lg font-semibold text-sm hover:bg-blue-100 transition-colors min-h-[44px]"
                    >
                      <FaClipboardCheck /> Evaluate
                    </button>
                  )}
                  {permissions.delete && (
                    <button
                      onClick={() => onDelete(candidate._id)}
                      className="px-4 py-3 text-rose-500 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors min-h-[44px] min-w-[44px]"
                    >
                      <FaTrashAlt />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                {onSelectionChange && (
                  <th className="px-6 py-4 w-12">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    />
                  </th>
                )}
                <th
                  className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('fullName')}
                >
                  <div className="flex items-center gap-2">
                    <span>Candidate</span>
                    {getSortIcon('fullName')}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('position')}
                >
                  <div className="flex items-center gap-2">
                    <span>Role & Exp</span>
                    {getSortIcon('position')}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-2">
                    <span>Status</span>
                    {getSortIcon('status')}
                  </div>
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Interview ID</th>
                <th
                  className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('submittedAt')}
                >
                  <div className="flex items-center gap-2">
                    <span>Date</span>
                    {getSortIcon('submittedAt')}
                  </div>
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredAndSortedCandidates.map((candidate) => {
                const statusDisplay = getStatusDisplay(candidate.status);
                return (
                  <tr key={candidate._id} className="hover:bg-blue-50/30 transition-colors group">
                    {onSelectionChange && (
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(candidate._id)}
                          onChange={() => handleSelectOne(candidate._id)}
                          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                          {candidate.personalInfo.firstName[0]}{candidate.personalInfo.lastName[0]}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 leading-tight">{candidate.personalInfo.firstName} {candidate.personalInfo.lastName}</div>
                          <div className="text-xs text-gray-500">{candidate.personalInfo.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-800">{candidate.jobInfo.position}</div>
                      <div className="text-xs text-gray-500">{candidate.jobInfo.experience} yrs</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${statusDisplay.color}`} />
                        {permissions.edit ? (
                          <select
                            value={candidate.status}
                            onChange={(e) => onStatusUpdate(candidate._id, e.target.value)}
                            className={getStatusStyles(candidate.status)}
                          >
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        ) : (
                          <span className={`text-xs font-bold ${statusDisplay.textColor}`}>{statusDisplay.text}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-600">{candidate.interviewId || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDateTime(candidate.submittedAt).split(',')[0]}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onView(candidate)}
                          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors min-h-[44px] min-w-[44px]"
                          title="View"
                        >
                          <FaUser size={18} />
                        </button>
                        {permissions.evaluate && (
                          <button
                            onClick={() => onEvaluate(candidate)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors min-h-[44px] min-w-[44px]"
                            title="Evaluate"
                          >
                            <FaClipboardCheck size={18} />
                          </button>
                        )}
                        {permissions.delete && (
                          <button
                            onClick={() => onDelete(candidate._id)}
                            className="p-2 text-rose-500 hover:bg-rose-100 rounded-lg transition-colors min-h-[44px] min-w-[44px]"
                            title="Delete"
                          >
                            <FaTrashAlt size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px] font-medium"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px] font-medium"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredAndSortedCandidates.length === 0 && (
        <div className="py-10 sm:py-20 text-center bg-white rounded-xl border border-dashed border-gray-300">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 text-gray-400 mb-4">
            <FaSearch size={24} />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No candidates found</h3>
          <p className="text-gray-500">Try adjusting your filters or search terms.</p>
        </div>
      )}
    </div>
  );
};

export default CandidateTable;
