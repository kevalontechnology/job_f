import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../contexts/AuthContext";

// Components
import CandidateTable from "../components/Dashboard/CandidateTable";
import EvaluationModal from "../components/Dashboard/EvaluationModal";
import CandidateDetailsModal from "../components/Dashboard/CandidateDetailsModal";
import Sidebar from "../components/Sidebar";

// Icons
import { FaExclamationTriangle, FaSync, FaSearch, FaPlus, FaFilter, FaDownload } from "react-icons/fa";

const Candidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [error, setError] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isUploadingProof, setIsUploadingProof] = useState(false);

  const { token, logout } = useAuth();
  const navigate = useNavigate();

  // Memoized API instance
  const api = useMemo(() => axios.create({
    baseURL: "https://job-ael6.onrender.com/api",
    headers: { "x-auth-token": token }
  }), [token]);

  useEffect(() => {
    document.title = "Candidates Management | Admin";
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    setIsRefreshing(true);
    try {
      const { data } = await api.get("/candidates");
      setCandidates(data);
    } catch (err) {
      handleApiError(err, "Failed to load candidates");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleApiError = (err, defaultMsg) => {
    if (err.response?.status === 401) {
      logout();
      navigate("/login");
    } else {
      setError(defaultMsg);
      setTimeout(() => setError(""), 5000);
    }
  };

  const filteredCandidates = useMemo(() => {
    return candidates.filter(candidate => {
      const fullName = `${candidate.personalInfo?.firstName || ''} ${candidate.personalInfo?.lastName || ''}`.toLowerCase();
      const email = candidate.personalInfo?.email?.toLowerCase() || '';
      const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || candidate.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [candidates, searchTerm, filterStatus]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await api.delete(`/candidates/${id}`);
      setCandidates(prev => prev.filter(c => c._id !== id));
    } catch (err) { handleApiError(err, "Failed to delete"); }
  };

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

      setCandidates(prev => prev.map(c => c._id === id ? data : c));
      setSelectedCandidate(data);
    } catch (err) {
      handleApiError(err, 'Failed to upload payment proof');
      throw err;
    } finally {
      setIsUploadingProof(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      const { data } = await api.put(`/candidates/${id}`, { status });
      setCandidates(prev => prev.map(c => c._id === id ? data : c));
      setSelectedCandidate(prev => prev && prev._id === id ? data : prev);
    } catch (err) { handleApiError(err, "Update failed"); }
  };

  const handlePaymentStatusUpdate = async (id, paymentStatus) => {
    try {
      const { data } = await api.put(`/candidates/${id}`, { paymentInfo: { paymentStatus } });
      setCandidates(prev => prev.map(c => c._id === id ? data : c));
      setSelectedCandidate(prev => prev && prev._id === id ? data : prev);
    } catch (err) { handleApiError(err, "Update failed"); }
  };

  const handleSaveCandidate = async (id, { status, paymentStatus }) => {
    const updateBody = {};
    if (status !== selectedCandidate?.status) updateBody.status = status;
    if (paymentStatus !== selectedCandidate?.paymentInfo?.paymentStatus) {
      updateBody.paymentInfo = { paymentStatus };
    }
    if (Object.keys(updateBody).length === 0) return;

    try {
      const { data } = await api.put(`/candidates/${id}`, updateBody);
      setCandidates(prev => prev.map(c => c._id === id ? data : c));
      setSelectedCandidate(prev => prev && prev._id === id ? data : prev);
    } catch (err) {
      handleApiError(err, "Update failed");
      throw err;
    }
  };

  // Export Logic
  const exportData = () => {
    if (filteredCandidates.length === 0) return;
    const headers = ["Name", "Email", "Position", "Status", "Date"];
    const rows = filteredCandidates.map(c => [
      `${c.personalInfo.firstName} ${c.personalInfo.lastName}`,
      c.personalInfo.email,
      c.jobInfo.position,
      c.status,
      new Date(c.submittedAt).toLocaleDateString()
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "candidates_export.csv";
    link.click();
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
        <meta name="description" content="Admin interface for managing and evaluating candidate applications at Kevalon Technology." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row overflow-x-hidden">
      <Sidebar onLogout={() => { logout(); navigate("/login"); }} />

      {/* Main Content Area */}
      {/* ml-0 for mobile, ml-64 for desktop to make room for Sidebar */}
      <main className="flex-1 md:ml-64 w-full max-w-full transition-all duration-300 overflow-x-hidden">
        
        {/* Header Section */}
        <div className="p-3 sm:p-4 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-5 sm:mb-6 md:mb-8">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 break-words">Talent Pipeline</h1>
              <p className="text-[11px] sm:text-xs md:text-sm text-gray-500 break-words">Manage and evaluate your incoming candidates</p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <button
                onClick={fetchCandidates}
                className="min-w-[44px] min-h-[44px] p-3 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center"
                aria-label="Refresh candidates"
              >
                <FaSync className={isRefreshing ? "animate-spin" : ""} />
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-3 sm:px-4 py-3 min-h-[44px] bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md font-medium text-xs sm:text-sm whitespace-nowrap"
              >
                <FaPlus size={12} /> <span className="hidden sm:inline">Add New</span><span className="sm:hidden">Add</span>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 flex items-center gap-2 sm:gap-3 bg-red-50 border border-red-100 text-red-700 px-3 sm:px-4 py-3 rounded-xl animate-bounce">
              <FaExclamationTriangle className="flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium break-words">{error}</span>
            </div>
          )}

          {/* Stats Summary (Optional but looks great) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
             <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-100 shadow-sm min-w-0">
                <p className="text-xs text-gray-500 uppercase font-bold truncate">Total</p>
                <p className="text-xl sm:text-2xl font-black text-gray-800 truncate">{candidates.length}</p>
             </div>
             <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-100 shadow-sm min-w-0">
                <p className="text-xs text-emerald-500 uppercase font-bold truncate">Approved</p>
                <p className="text-xl sm:text-2xl font-black text-gray-800 truncate">{candidates.filter(c => c.status === 'approved').length}</p>
             </div>
             <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-100 shadow-sm min-w-0">
                <p className="text-xs text-amber-500 uppercase font-bold truncate">Pending</p>
                <p className="text-xl sm:text-2xl font-black text-gray-800 truncate">{candidates.filter(c => c.status === 'pending').length}</p>
             </div>
             <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-100 shadow-sm min-w-0">
                <p className="text-xs text-gray-400 uppercase font-bold truncate">Filtered</p>
                <p className="text-xl sm:text-2xl font-black text-blue-600 truncate">{filteredCandidates.length}</p>
             </div>
          </div>

          {/* Table / Grid Component */}
          <CandidateTable
            candidates={candidates}
            onDelete={handleDelete}
            onStatusUpdate={handleStatusUpdate}
            onEvaluate={(c) => { setSelectedCandidate(c); setShowEvaluationModal(true); }}
            onView={(c) => { setSelectedCandidate(c); setShowDetailsModal(true); }}
            onExport={exportData}
          />
        </div>

        {/* Evaluation Modal */}
        {showEvaluationModal && (
          <EvaluationModal
            candidate={selectedCandidate}
            onClose={() => setShowEvaluationModal(false)}
            onSave={async (id, evalData) => {
              try {
                await api.put(`/candidates/${id}`, { evaluation: evalData, status: 'approved' });
                setCandidates(prev => prev.map(c => c._id === id ? { ...c, evaluation: evalData, status: 'approved' } : c));
                setShowEvaluationModal(false);
              } catch (err) { handleApiError(err, "Save failed"); }
            }}
          />
        )}

        {showDetailsModal && (
          <CandidateDetailsModal
            candidate={selectedCandidate}
            onClose={() => setShowDetailsModal(false)}
            onUploadProof={handleUploadPaymentProof}
            uploadingProof={isUploadingProof}
            onSave={handleSaveCandidate}
            canEditStatus={true}
          />
        )}
      </main>
    </div>
    </>
  );
};

export default Candidates;