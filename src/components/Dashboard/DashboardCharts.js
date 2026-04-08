import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

// Utility function to format month/year
const formatMonth = (date) => {
  const d = new Date(date);
  return `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
};

// Utility function to group candidates by month
const groupByMonth = (candidates) => {
  const monthMap = {};

  candidates.forEach((candidate) => {
    const monthKey = formatMonth(candidate.submittedAt);
    monthMap[monthKey] = (monthMap[monthKey] || 0) + 1;
  });

  return Object.entries(monthMap)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => {
      const dateA = new Date(a.month);
      const dateB = new Date(b.month);
      return dateA - dateB;
    });
};

// Application Trend Chart Component
export const ApplicationTrendChart = ({ candidates }) => {
  const trendData = useMemo(() => {
    if (!candidates || candidates.length === 0) return [];
    return groupByMonth(candidates);
  }, [candidates]);

  if (trendData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Application Trend</h3>
        <div className="h-64 flex items-center justify-center">
          <p className="text-gray-400 text-sm">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Application Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="month"
            tick={{ fill: '#6B7280', fontSize: 12 }}
            stroke="#9CA3AF"
          />
          <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} stroke="#9CA3AF" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              padding: '8px 12px',
            }}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#3B82F6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorCount)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// Status Distribution Chart Component
export const StatusDistributionChart = ({ candidates }) => {
  const statusData = useMemo(() => {
    if (!candidates || candidates.length === 0) return [];

    const pending = candidates.filter((c) => c.status === 'pending').length;
    const approved = candidates.filter((c) => c.status === 'approved').length;
    const rejected = candidates.filter((c) => c.status === 'rejected').length;

    return [
      { name: 'Pending', value: pending, color: '#F59E0B' },
      { name: 'Approved', value: approved, color: '#10B981' },
      { name: 'Rejected', value: rejected, color: '#F43F5E' },
    ].filter((item) => item.value > 0);
  }, [candidates]);

  const total = useMemo(() => {
    return statusData.reduce((sum, item) => sum + item.value, 0);
  }, [statusData]);

  if (statusData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Status Distribution</h3>
        <div className="h-64 flex items-center justify-center">
          <p className="text-gray-400 text-sm">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Status Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={statusData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={5}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {statusData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              padding: '8px 12px',
            }}
          />
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="font-bold text-2xl"
            fill="#111827"
          >
            {total}
          </text>
          <text
            x="50%"
            y="55%"
            textAnchor="middle"
            dominantBaseline="hanging"
            className="text-xs"
            fill="#6B7280"
          >
            Total
          </text>
        </PieChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-4 mt-4">
        {statusData.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-gray-600">
              {item.name}: {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Top Roles Chart Component
export const TopRolesChart = ({ candidates }) => {
  const roleData = useMemo(() => {
    if (!candidates || candidates.length === 0) return [];

    const roleMap = {};

    candidates.forEach((candidate) => {
      const role = candidate.jobInfo?.position || 'Unknown';
      roleMap[role] = (roleMap[role] || 0) + 1;
    });

    return Object.entries(roleMap)
      .map(([role, count]) => ({ role, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [candidates]);

  if (roleData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Top 5 Roles</h3>
        <div className="h-64 flex items-center justify-center">
          <p className="text-gray-400 text-sm">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Top 5 Roles</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={roleData}
          layout="horizontal"
          margin={{ top: 10, right: 30, left: 100, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis type="number" tick={{ fill: '#6B7280', fontSize: 12 }} stroke="#9CA3AF" />
          <YAxis
            type="category"
            dataKey="role"
            tick={{ fill: '#6B7280', fontSize: 12 }}
            stroke="#9CA3AF"
            width={90}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              padding: '8px 12px',
            }}
          />
          <Bar dataKey="count" fill="#3B82F6" radius={[0, 8, 8, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
