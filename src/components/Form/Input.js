import React from 'react';

const Input = ({ label, type = 'text', value, onChange, error, required, ...props }) => {
  return (
    <div className="mb-3 sm:mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        {...(type !== 'file' ? { value } : {})}
        onChange={onChange}
        className={`w-full px-3 py-2.5 sm:py-2 border rounded-md text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        {...props}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default Input;