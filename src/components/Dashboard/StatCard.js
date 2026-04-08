import React from 'react';

const StatCard = ({ title, value, icon, color = 'bg-blue-500', subtitle }) => {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 group min-w-0">
      <div className="flex items-center h-full">
        {/* Left accent bar */}
        <div className={`w-1.5 sm:w-2 h-full ${color} group-hover:w-2 sm:group-hover:w-3 transition-all duration-300`} />

        {/* Content */}
        <div className="flex-1 flex items-center justify-between p-3 sm:p-4 md:p-5 lg:p-6 gap-3 sm:gap-4 min-w-0">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 truncate">
              {title}
            </p>
            <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 truncate leading-tight">
              {value}
            </p>
            {subtitle && (
              <p className="text-xs sm:text-sm text-gray-500 mt-1 truncate">
                {subtitle}
              </p>
            )}
          </div>

          {/* Icon in colored circle */}
          <div className={`${color} text-white p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300 shrink-0`}>
            <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl flex items-center justify-center">
              {icon}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
