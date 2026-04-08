import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import Layout from '../components/Layout';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { FaChartLine, FaFilter } from 'react-icons/fa';

const Analytics = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/candidates');
      setCandidates(response.data);
    } catch (error) {
      toast.error('Failed to fetch analytics data');
      console.error('Error fetching candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCandidates = useMemo(() => {
    if (dateRange === 'all') return candidates;

    const now = new Date();
    const ranges = {
      '7d': 7,
      '30d': 30,
      '90d': 90
    };

    const daysAgo = ranges[dateRange];
    if (!daysAgo) return candidates;

    const cutoffDate = new Date(now);
    cutoffDate.setDate(cutoffDate.getDate() - daysAgo);

    return candidates.filter(candidate => {
      const submittedDate = new Date(candidate.submittedAt || candidate.createdAt);
      return submittedDate >= cutoffDate;
    });
  }, [candidates, dateRange]);

  const applicationTrendData = useMemo(() => {
    const dataMap = new Map();

    filteredCandidates.forEach(candidate => {
      const date = new Date(candidate.submittedAt || candidate.createdAt);
      const dateKey = date.toISOString().split('T')[0];

      if (!dataMap.has(dateKey)) {
        dataMap.set(dateKey, { date: dateKey, count: 0 });
      }
      dataMap.get(dateKey).count += 1;
    });

    const sortedData = Array.from(dataMap.values()).sort((a, b) =>
      new Date(a.date) - new Date(b.date)
    );

    return sortedData.map(item => ({
      ...item,
      displayDate: new Date(item.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    }));
  }, [filteredCandidates]);

  const statusFunnel = useMemo(() => {
    const total = filteredCandidates.length;
    const pending = filteredCandidates.filter(c => c.status === 'pending').length;
    const approved = filteredCandidates.filter(c => c.status === 'approved').length;
    const rejected = filteredCandidates.filter(c => c.status === 'rejected').length;

    return {
      total,
      pending,
      approved,
      rejected,
      pendingPercent: total > 0 ? ((pending / total) * 100).toFixed(1) : 0,
      approvedPercent: total > 0 ? ((approved / total) * 100).toFixed(1) : 0,
      rejectedPercent: total > 0 ? ((rejected / total) * 100).toFixed(1) : 0
    };
  }, [filteredCandidates]);

  const roleBreakdown = useMemo(() => {
    const roleMap = new Map();

    filteredCandidates.forEach(candidate => {
      const position = candidate.internshipDetails?.position || 'Not Specified';

      if (!roleMap.has(position)) {
        roleMap.set(position, { total: 0, approved: 0 });
      }

      const stats = roleMap.get(position);
      stats.total += 1;
      if (candidate.status === 'approved') {
        stats.approved += 1;
      }
    });

    return Array.from(roleMap.entries())
      .map(([position, stats]) => ({
        position,
        total: stats.total,
        approved: stats.approved,
        approvalRate: stats.total > 0 ? ((stats.approved / stats.total) * 100).toFixed(1) : 0
      }))
      .sort((a, b) => b.total - a.total);
  }, [filteredCandidates]);

  const paymentSummary = useMemo(() => {
    const internshipCandidates = filteredCandidates.filter(c =>
      c.internshipDetails?.duration && c.internshipDetails?.position
    );

    const paid = internshipCandidates.filter(c =>
      c.internshipDetails?.isPaid === true || c.internshipDetails?.isPaid === 'yes'
    ).length;

    const free = internshipCandidates.length - paid;

    const paymentStatus = {
      pending: 0,
      partial: 0,
      complete: 0
    };

    internshipCandidates.forEach(candidate => {
      const status = candidate.internshipDetails?.paymentStatus;
      if (status === 'pending' || !status) {
        paymentStatus.pending += 1;
      } else if (status === '50%' || status === 'partial') {
        paymentStatus.partial += 1;
      } else if (status === '100%' || status === 'complete') {
        paymentStatus.complete += 1;
      }
    });

    return {
      total: internshipCandidates.length,
      paid,
      free,
      paidPercent: internshipCandidates.length > 0 ? ((paid / internshipCandidates.length) * 100).toFixed(1) : 0,
      paymentStatus
    };
  }, [filteredCandidates]);

  const dateRangeButtons = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: 'all', label: 'All Time' }
  ];

  if (loading) {
    return (
      <Layout title="Analytics" subtitle="View detailed insights and reports">
        <Helmet>
          <title>Analytics - Kevalon Admin</title>
        </Helmet>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Analytics" subtitle="View detailed insights and reports">
      <Helmet>
        <title>Analytics - Kevalon Admin</title>
      </Helmet>

      <div className="space-y-6">
        {/* Date Range Filter */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-500" />
              <span className="font-medium text-gray-700">Date Range:</span>
            </div>
            <div className="flex gap-2">
              {dateRangeButtons.map(button => (
                <button
                  key={button.value}
                  onClick={() => setDateRange(button.value)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    dateRange === button.value
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {button.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Application Trend Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <FaChartLine className="text-primary text-xl" />
            <h2 className="text-xl font-semibold text-gray-800">Application Trend</h2>
          </div>
          {applicationTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={applicationTrendData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#405189" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#405189" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="displayDate"
                  stroke="#666"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  stroke="#666"
                  style={{ fontSize: '12px' }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#405189"
                  fillOpacity={1}
                  fill="url(#colorCount)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No application data for selected period
            </div>
          )}
        </div>

        {/* Status Funnel */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Application Funnel</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-primary">{statusFunnel.total}</div>
              <div className="text-sm text-gray-600 mt-1">Total Applications</div>
              <div className="text-xs text-gray-500 mt-1">100%</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-3xl font-bold text-warning">{statusFunnel.pending}</div>
              <div className="text-sm text-gray-600 mt-1">Pending Review</div>
              <div className="text-xs text-gray-500 mt-1">{statusFunnel.pendingPercent}%</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-success">{statusFunnel.approved}</div>
              <div className="text-sm text-gray-600 mt-1">Approved</div>
              <div className="text-xs text-gray-500 mt-1">{statusFunnel.approvedPercent}%</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-3xl font-bold text-danger">{statusFunnel.rejected}</div>
              <div className="text-sm text-gray-600 mt-1">Rejected</div>
              <div className="text-xs text-gray-500 mt-1">{statusFunnel.rejectedPercent}%</div>
            </div>
          </div>
        </div>

        {/* Role Breakdown Table */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Role Breakdown</h2>
          {roleBreakdown.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Position</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Total</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Approved</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Approval Rate</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Distribution</th>
                  </tr>
                </thead>
                <tbody>
                  {roleBreakdown.map((role, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-800">{role.position}</td>
                      <td className="text-center py-3 px-4 text-sm font-medium text-gray-800">{role.total}</td>
                      <td className="text-center py-3 px-4 text-sm font-medium text-success">{role.approved}</td>
                      <td className="text-center py-3 px-4 text-sm font-medium text-gray-800">{role.approvalRate}%</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-success h-full rounded-full transition-all"
                              style={{ width: `${role.approvalRate}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No role data available
            </div>
          )}
        </div>

        {/* Payment Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Payment Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <div className="text-2xl font-bold text-primary">{paymentSummary.total}</div>
              <div className="text-sm text-gray-700 mt-1">Total Internships</div>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
              <div className="text-2xl font-bold text-success">{paymentSummary.paid}</div>
              <div className="text-sm text-gray-700 mt-1">Paid Internships</div>
              <div className="text-xs text-gray-600 mt-1">{paymentSummary.paidPercent}%</div>
            </div>
            <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
              <div className="text-2xl font-bold text-gray-700">{paymentSummary.free}</div>
              <div className="text-sm text-gray-700 mt-1">Free Internships</div>
              <div className="text-xs text-gray-600 mt-1">{(100 - parseFloat(paymentSummary.paidPercent)).toFixed(1)}%</div>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
              <div className="text-2xl font-bold text-purple-700">{paymentSummary.paymentStatus.complete}</div>
              <div className="text-sm text-gray-700 mt-1">Fully Paid</div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Payment Status Breakdown</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Pending Payment</span>
                <span className="text-lg font-bold text-gray-700">{paymentSummary.paymentStatus.pending}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <span className="text-sm text-gray-600">Partial (50%)</span>
                <span className="text-lg font-bold text-warning">{paymentSummary.paymentStatus.partial}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm text-gray-600">Complete (100%)</span>
                <span className="text-lg font-bold text-success">{paymentSummary.paymentStatus.complete}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Analytics;
