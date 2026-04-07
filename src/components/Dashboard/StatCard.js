import React from 'react';

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-2.5 sm:p-3 md:p-4 lg:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow min-w-0">
    <div className="min-w-0 flex-1 mr-1.5 sm:mr-2">
      <p className="text-[9px] sm:text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wide sm:tracking-wider truncate">{title}</p>
      <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mt-0.5 sm:mt-1 truncate">{value}</p>
    </div>
    <div className={`${color} text-white p-1.5 sm:p-2 md:p-2.5 lg:p-4 rounded-lg sm:rounded-xl text-sm sm:text-base md:text-xl lg:text-2xl shadow-lg shrink-0`}>
      {icon}
    </div>
  </div>
);

export default StatCard;