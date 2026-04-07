import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../contexts/AuthContext";

// Components
import Sidebar from "../components/Sidebar";
import StatCard from "../components/Dashboard/StatCard";

// Icons
import { 
  FaUsers, FaUserClock, FaCheckCircle, 
  FaExclamationTriangle, FaPlus, FaSync, FaArrowRight 
} from "react-icons/fa";

const AdminDashboard = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const api = useMemo(() => axios.create({
    baseURL: "https://job-ael6.onrender.com/api",
    headers: { "x-auth-token": token }
  }), [token]);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    setIsRefreshing(true);
    try {
      const { data } = await api.get("/candidates");
      setCandidates(data);
    } catch (err) {
      handleApiError(err, "Failed to load dashboard data");
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

  const stats = useMemo(() => ({
    total: candidates.length,
    pending: candidates.filter(c => c.status === 'pending').length,
    approved: candidates.filter(c => c.status === 'approved').length
  }), [candidates]);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="mt-4 text-gray-500 font-semibold animate-pulse">Initializing Dashboard...</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - Kevalon Technology</title>
        <meta name="description" content="Admin dashboard for managing candidate applications and interview processes at Kevalon Technology." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="min-h-screen bg-gray-50/50 flex flex-col md:flex-row">
      {/* 1. Responsive Sidebar */}
      <Sidebar onLogout={() => { logout(); navigate("/login"); }} />

      {/* 2. Main Content */}
      <main className="flex-1 md:ml-64 transition-all duration-300 w-full">
        
        {/* Header - Desktop & Tablet */}
        <header className="hidden md:block bg-white border-b border-gray-200 sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-8 py-5 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Executive Overview</h1>
              <p className="text-sm text-gray-500">Real-time candidate pipeline metrics</p>
            </div>
            <div className="flex items-center gap-3">
               <button 
                 onClick={fetchCandidates}
                 className={`p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all ${isRefreshing ? 'animate-spin text-blue-600' : 'text-gray-400'}`}
               >
                 <FaSync size={14}/>
               </button>
               <span className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-bold ring-1 ring-emerald-200">
                 <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                 System Online
               </span>
            </div>
          </div>
        </header>

        {/* Mobile Header */}
        <div className="md:hidden px-2 sm:px-4 pt-3 sm:pt-4 pb-2">
          <h1 className="text-base sm:text-lg md:text-xl font-black text-gray-900 tracking-tight">Executive Overview</h1>
          <p className="text-[11px] sm:text-xs text-gray-500">Real-time candidate pipeline metrics</p>
        </div>

        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-8 py-3 sm:py-6 md:py-8">
          {error && (
            <div className="mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 bg-red-50 border border-red-100 text-red-700 p-3 sm:p-4 rounded-xl shadow-sm">
              <FaExclamationTriangle className="shrink-0" />
              <p className="text-xs sm:text-sm font-semibold break-words">{error}</p>
            </div>
          )}

          {/* Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
            <StatCard 
              title="Total Candidates" 
              value={stats.total} 
              icon={<FaUsers />} 
              color="bg-blue-600" 
            />
            <StatCard 
              title="Awaiting Review" 
              value={stats.pending} 
              icon={<FaUserClock />} 
              color="bg-amber-500" 
            />
            <StatCard 
              title="Shortlisted" 
              value={stats.approved} 
              icon={<FaCheckCircle />} 
              color="bg-emerald-500" 
            />
          </div>

          {/* Main Dashboard Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            
            {/* Left: Recent Activity List (takes 2 cols on desktop) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-3 sm:p-4 md:p-6 border-b border-gray-50 flex items-center justify-between">
                  <h2 className="text-sm sm:text-base md:text-lg font-bold text-gray-800">Recent Applications</h2>
                  <button 
                    onClick={() => navigate('/admin/candidates')}
                    className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    View All <FaArrowRight size={10} />
                  </button>
                </div>
                
                <div className="divide-y divide-gray-50">
                  {candidates.slice(0, 5).map((candidate) => (
                    <div key={candidate._id} className="p-3 sm:p-4 md:p-6 hover:bg-gray-50/50 transition-colors group">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0 flex-1">
                          <div className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-lg sm:rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xs sm:text-sm md:text-base font-bold group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
                            {candidate.personalInfo.firstName[0]}{candidate.personalInfo.lastName[0]}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-gray-900 text-xs sm:text-sm md:text-base leading-tight truncate">
                              {candidate.personalInfo.firstName} {candidate.personalInfo.lastName}
                            </div>
                            <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5 truncate">{candidate.jobInfo.position}</div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`text-[9px] sm:text-[10px] uppercase tracking-wide sm:tracking-widest font-black px-1.5 sm:px-2 py-1 rounded-md whitespace-nowrap
                            ${candidate.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                              candidate.status === 'rejected' ? 'bg-rose-100 text-rose-700' :
                              'bg-amber-100 text-amber-700'}`}>
                            {candidate.status}
                          </span>
                          <div className="text-[9px] sm:text-[10px] text-gray-400 mt-1 font-medium whitespace-nowrap">
                            {new Date(candidate.submittedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {candidates.length === 0 && (
                    <div className="p-10 sm:p-20 text-center">
                      <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaUsers className="text-gray-400 text-xl" />
                      </div>
                      <p className="text-gray-500 font-medium">No activity recorded yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Quick Actions & Productivity */}
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-4 md:p-6">
                <h2 className="text-sm sm:text-base md:text-lg font-bold text-gray-800 mb-3 sm:mb-4 md:mb-5">Quick Launch</h2>
                <div className="space-y-2 sm:space-y-3">
                  <button
                    onClick={() => navigate('/')}
                    className="w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 hover:bg-blue-600 hover:text-white group rounded-xl transition-all text-left"
                  >
                    <div className="p-2 sm:p-3 bg-white group-hover:bg-blue-500 rounded-lg shadow-sm shrink-0">
                      <FaPlus className="text-blue-600 group-hover:text-white text-sm sm:text-base" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs sm:text-sm">New Entry</div>
                      <div className="text-[10px] sm:text-[11px] opacity-70 truncate">Register a candidate</div>
                    </div>
                  </button>

                  <button
                    onClick={() => navigate('/admin/candidates')}
                    className="w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 hover:bg-emerald-600 hover:text-white group rounded-xl transition-all text-left"
                  >
                    <div className="p-2 sm:p-3 bg-white group-hover:bg-emerald-500 rounded-lg shadow-sm shrink-0">
                      <FaUsers className="text-emerald-600 group-hover:text-white text-sm sm:text-base" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs sm:text-sm">Pipeline</div>
                      <div className="text-[10px] sm:text-[11px] opacity-70 truncate">Review applications</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Tips/Notice Card */}
              <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl shadow-lg p-3 sm:p-4 md:p-6 text-white">
                <h3 className="font-bold mb-2 text-xs sm:text-sm md:text-base">Pro Tip</h3>
                <p className="text-[10px] sm:text-xs leading-relaxed opacity-90">
                  You can export candidate data to CSV from the "Candidates" management page for external reporting.
                </p>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
    </>
  );
};

export default AdminDashboard;