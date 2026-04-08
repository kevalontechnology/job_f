import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import { useMenu } from '../contexts/MenuContext';
import api from '../utils/api';
import StatCard from '../components/Dashboard/StatCard';
import {
  ApplicationTrendChart,
  StatusDistributionChart,
  TopRolesChart,
} from '../components/Dashboard/DashboardCharts';

// Icons
import {
  FaUsers,
  FaUserClock,
  FaCheckCircle,
  FaTimesCircle,
  FaPlus,
  FaArrowRight,
} from 'react-icons/fa';

const AdminDashboard = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const navigate = useNavigate();
  const { currentPagePermissions } = useMenu();

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    setIsRefreshing(true);
    try {
      const { data } = await api.get('/candidates');
      setCandidates(data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to load dashboard data';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const total = candidates.length;
    const pending = candidates.filter((c) => c.status === 'pending').length;
    const approved = candidates.filter((c) => c.status === 'approved').length;
    const rejected = candidates.filter((c) => c.status === 'rejected').length;

    return { total, pending, approved, rejected };
  }, [candidates]);

  // Get recent applications (last 8)
  const recentApplications = useMemo(() => {
    return [...candidates]
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
      .slice(0, 8);
  }, [candidates]);

  // Format relative time
  const getRelativeTime = (date) => {
    const now = new Date();
    const submitted = new Date(date);
    const diffMs = now - submitted;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return submitted.toLocaleDateString();
  };

  // Loading state
  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-blue-100 rounded-full" />
          <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin" />
        </div>
        <p className="mt-4 text-gray-500 font-semibold animate-pulse">
          Initializing Dashboard...
        </p>
      </div>
    );
  }

  return (
    <Layout
      title="Executive Overview"
      subtitle="Real-time candidate pipeline metrics"
      onRefresh={fetchCandidates}
      isRefreshing={isRefreshing}
      showRefresh
    >
      {/* Stat Cards - 4 in a row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        <StatCard
          title="Total Candidates"
          value={stats.total}
          icon={<FaUsers />}
          color="bg-blue-600"
        />
        <StatCard
          title="Pending Review"
          value={stats.pending}
          icon={<FaUserClock />}
          color="bg-amber-500"
        />
        <StatCard
          title="Approved"
          value={stats.approved}
          icon={<FaCheckCircle />}
          color="bg-emerald-500"
        />
        <StatCard
          title="Rejected"
          value={stats.rejected}
          icon={<FaTimesCircle />}
          color="bg-rose-500"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 md:mb-8">
        {/* Application Trend Chart - 2/3 width */}
        <div className="lg:col-span-2">
          <ApplicationTrendChart candidates={candidates} />
        </div>

        {/* Status Distribution Chart - 1/3 width */}
        <div className="lg:col-span-1">
          <StatusDistributionChart candidates={candidates} />
        </div>
      </div>

      {/* Top Roles Chart - Full width */}
      <div className="mb-6 md:mb-8">
        <TopRolesChart candidates={candidates} />
      </div>

      {/* Recent Applications + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Applications - 2 cols on desktop */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 md:p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base md:text-lg font-bold text-gray-800">
                Recent Applications
              </h2>
              <button
                onClick={() => navigate('/admin/candidates')}
                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
              >
                View All <FaArrowRight size={10} />
              </button>
            </div>

            <div className="divide-y divide-gray-50">
              {recentApplications.length === 0 ? (
                <div className="p-20 text-center">
                  <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaUsers className="text-gray-400 text-xl" />
                  </div>
                  <p className="text-gray-500 font-medium">No applications yet.</p>
                </div>
              ) : (
                recentApplications.map((candidate) => (
                  <div
                    key={candidate._id}
                    onClick={() => navigate('/admin/candidates')}
                    className="p-4 md:p-6 hover:bg-gray-50/50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-sm md:text-base font-bold group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
                          {candidate.personalInfo.firstName[0]}
                          {candidate.personalInfo.lastName[0]}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-gray-900 text-sm md:text-base leading-tight truncate">
                            {candidate.personalInfo.firstName}{' '}
                            {candidate.personalInfo.lastName}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5 truncate">
                            {candidate.jobInfo?.position || 'N/A'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span
                          className={`text-[10px] uppercase tracking-widest font-black px-2 py-1 rounded-md whitespace-nowrap ${
                            candidate.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-700'
                              : candidate.status === 'rejected'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {candidate.status}
                        </span>
                        <div className="text-[10px] text-gray-400 mt-1 font-medium whitespace-nowrap">
                          {getRelativeTime(candidate.submittedAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions - 1 col on desktop */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base md:text-lg font-bold text-gray-800 mb-5">
              Quick Actions
            </h2>
            <div className="space-y-3">
              {currentPagePermissions.write && (
                <button
                  onClick={() => navigate('/')}
                  className="w-full flex items-center gap-4 p-4 bg-gray-50 hover:bg-blue-600 hover:text-white group rounded-xl transition-all text-left"
                >
                  <div className="p-3 bg-white group-hover:bg-blue-500 rounded-lg shadow-sm shrink-0">
                    <FaPlus className="text-blue-600 group-hover:text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-sm">Add Candidate</div>
                    <div className="text-[11px] opacity-70 truncate">
                      Register a new applicant
                    </div>
                  </div>
                </button>
              )}

              <button
                onClick={() => navigate('/admin/candidates')}
                className="w-full flex items-center gap-4 p-4 bg-gray-50 hover:bg-emerald-600 hover:text-white group rounded-xl transition-all text-left"
              >
                <div className="p-3 bg-white group-hover:bg-emerald-500 rounded-lg shadow-sm shrink-0">
                  <FaUsers className="text-emerald-600 group-hover:text-white" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-sm">View Pipeline</div>
                  <div className="text-[11px] opacity-70 truncate">
                    Manage all applications
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Pro Tip Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-xl shadow-lg p-6 text-white">
            <h3 className="font-bold mb-2 text-sm md:text-base">Pro Tip</h3>
            <p className="text-xs leading-relaxed opacity-90">
              You can export candidate data to CSV from the Candidates management
              page for external reporting.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
