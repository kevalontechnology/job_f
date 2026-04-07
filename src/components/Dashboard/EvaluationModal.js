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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">
          Evaluate Candidate: {candidate.personalInfo.firstName} {candidate.personalInfo.lastName}
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Theory Round */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Theory Round</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marks (0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={evaluation.theory.marks}
                  onChange={(e) => handleChange('theory', 'marks', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={evaluation.theory.notes}
                  onChange={(e) => handleChange('theory', 'notes', e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter notes for theory round..."
                />
              </div>
            </div>
          </div>

          {/* Practical Round */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Practical Round</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marks (0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={evaluation.practical.marks}
                  onChange={(e) => handleChange('practical', 'marks', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={evaluation.practical.notes}
                  onChange={(e) => handleChange('practical', 'notes', e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter notes for practical round..."
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
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