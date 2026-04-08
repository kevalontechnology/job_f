import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  confirmColor = 'red',
  loading = false,
}) => {
  if (!isOpen) return null;

  const getConfirmButtonStyles = () => {
    const baseStyles = 'flex-1 px-4 py-3 min-h-[44px] rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

    if (confirmColor === 'red') {
      return `${baseStyles} bg-red-600 text-white hover:bg-red-700`;
    }
    if (confirmColor === 'blue') {
      return `${baseStyles} bg-blue-600 text-white hover:bg-blue-700`;
    }
    if (confirmColor === 'green') {
      return `${baseStyles} bg-green-600 text-white hover:bg-green-700`;
    }
    return `${baseStyles} bg-gray-600 text-white hover:bg-gray-700`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8 animate-scaleIn">
        {/* Warning Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
            <FaExclamationTriangle className="text-amber-600 text-2xl" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
          {title}
        </h3>

        {/* Message */}
        <p className="text-gray-600 text-center mb-6">
          {message}
        </p>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-3 min-h-[44px] bg-gray-100 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={getConfirmButtonStyles()}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
