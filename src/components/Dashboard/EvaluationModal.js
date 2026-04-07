import React, { useState, useEffect } from 'react';

const EvaluationModal = ({ candidate, onClose, onSave }) => {
  const [evaluation, setEvaluation] = useState({
    theory: { marks: '', notes: '' },
    practical: { marks: '', notes: '' }
  });

  useEffect(() => {
    if (candidate.evaluation) {
      setEvaluation(candidate.evaluation);
    }
  }, [candidate]);

  const handleChange = (round, field, value) => {
    setEvaluation(prev => ({
      ...prev,
      [round]: {
        ...prev[round],
        [field]: value
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(candidate._id, evaluation);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-2 sm:mx-0 flex flex-col">
        <div className="flex justify-between items-start mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-2xl font-bold break-words flex-1">
            Evaluate Candidate: {candidate.personalInfo.firstName} {candidate.personalInfo.lastName}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="ml-2 p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Close modal"
          >
            <span className="text-xl font-bold">×</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          {/* Theory Round */}
          <div className="mb-4 sm:mb-6">
            <h3 className="text-sm sm:text-lg font-semibold mb-3">Theory Round</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Marks (0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={evaluation.theory.marks}
                  onChange={(e) => handleChange('theory', 'marks', e.target.value)}
                  className="w-full px-3 sm:px-4 py-3 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm min-h-[44px]"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={evaluation.theory.notes}
                  onChange={(e) => handleChange('theory', 'notes', e.target.value)}
                  rows="3"
                  className="w-full px-3 sm:px-4 py-3 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm min-h-[44px]"
                  placeholder="Enter notes for theory round..."
                />
              </div>
            </div>
          </div>

          {/* Practical Round */}
          <div className="mb-4 sm:mb-6">
            <h3 className="text-sm sm:text-lg font-semibold mb-3">Practical Round</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Marks (0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={evaluation.practical.marks}
                  onChange={(e) => handleChange('practical', 'marks', e.target.value)}
                  className="w-full px-3 sm:px-4 py-3 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm min-h-[44px]"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={evaluation.practical.notes}
                  onChange={(e) => handleChange('practical', 'notes', e.target.value)}
                  rows="3"
                  className="w-full px-3 sm:px-4 py-3 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm min-h-[44px]"
                  placeholder="Enter notes for practical round..."
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-gray-100 mt-4 sm:mt-6 sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 sm:px-6 py-3 text-sm sm:text-base font-semibold bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 sm:px-6 py-3 text-sm sm:text-base font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors min-h-[44px] shadow-lg shadow-blue-100"
            >
              Save Evaluation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EvaluationModal;