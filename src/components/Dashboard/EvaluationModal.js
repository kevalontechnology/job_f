import React, { useState, useEffect } from 'react';
import { FaStar, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

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

  const handlePreset = (theoryMarks, practicalMarks) => {
    setEvaluation({
      theory: { marks: theoryMarks.toString(), notes: evaluation.theory.notes },
      practical: { marks: practicalMarks.toString(), notes: evaluation.practical.notes }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(candidate._id, evaluation);
    onClose();
  };

  const theoryMarks = parseFloat(evaluation.theory.marks) || 0;
  const practicalMarks = parseFloat(evaluation.practical.marks) || 0;
  const totalScore = (theoryMarks + practicalMarks) / 2;
  const isPassed = totalScore >= 40;

  const getScoreColor = (marks) => {
    if (marks >= 75) return 'bg-emerald-500';
    if (marks >= 50) return 'bg-blue-500';
    if (marks >= 40) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const getScoreLabel = (marks) => {
    if (marks >= 75) return 'Excellent';
    if (marks >= 50) return 'Good';
    if (marks >= 40) return 'Average';
    return 'Poor';
  };

  const ProgressBar = ({ label, marks, maxMarks = 100 }) => {
    const percentage = (marks / maxMarks) * 100;
    const colorClass = getScoreColor(marks);

    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="font-medium text-gray-700">{label}</span>
          <span className="font-bold text-gray-900">{marks}/{maxMarks}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full ${colorClass} transition-all duration-500 ease-out rounded-full`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  const PresetButton = ({ label, theoryScore, practicalScore, icon }) => (
    <button
      type="button"
      onClick={() => handlePreset(theoryScore, practicalScore)}
      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 rounded-lg transition-all font-semibold text-sm border border-blue-200 min-h-[44px]"
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto mx-2 sm:mx-0 flex flex-col shadow-2xl">
        <div className="flex justify-between items-start mb-4 sm:mb-6">
          <div className="flex-1">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 break-words">
              Evaluate Candidate
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {candidate.personalInfo.firstName} {candidate.personalInfo.lastName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-2 p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Close modal"
          >
            <span className="text-xl font-bold">×</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-6">
          {/* Quick Evaluate Presets */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
            <h3 className="text-sm font-bold text-gray-700 mb-3">Quick Evaluate</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              <PresetButton label="Excellent" theoryScore={90} practicalScore={90} icon={<FaStar className="text-amber-500" />} />
              <PresetButton label="Good" theoryScore={70} practicalScore={70} icon={<FaCheckCircle className="text-emerald-500" />} />
              <PresetButton label="Average" theoryScore={50} practicalScore={50} icon={<span className="text-blue-500">●</span>} />
              <PresetButton label="Poor" theoryScore={25} practicalScore={25} icon={<FaTimesCircle className="text-rose-500" />} />
            </div>
          </div>

          {/* Total Score Card */}
          {(evaluation.theory.marks || evaluation.practical.marks) && (
            <div className={`p-6 rounded-xl border-2 ${isPassed ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-600">Total Score</h3>
                  <p className={`text-4xl font-bold ${isPassed ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {totalScore.toFixed(2)}%
                  </p>
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${isPassed ? 'bg-emerald-200 text-emerald-800' : 'bg-rose-200 text-rose-800'}`}>
                  {isPassed ? <FaCheckCircle size={20} /> : <FaTimesCircle size={20} />}
                  <span className="font-bold text-sm">{isPassed ? 'PASSED' : 'FAILED'}</span>
                </div>
              </div>
              <div className="space-y-3">
                <ProgressBar label="Theory Round" marks={theoryMarks} />
                <ProgressBar label="Practical Round" marks={practicalMarks} />
              </div>
              <div className="mt-4 pt-4 border-t border-gray-300">
                <p className="text-xs text-gray-600">
                  Performance: <span className={`font-bold ${isPassed ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {getScoreLabel(totalScore)}
                  </span>
                  {' | '}
                  Pass mark: 40%
                </p>
              </div>
            </div>
          )}

          {/* Theory Round */}
          <div className="bg-gray-50 p-4 sm:p-5 rounded-xl border border-gray-200">
            <h3 className="text-sm sm:text-lg font-semibold mb-3 flex items-center gap-2">
              <div className="w-1 h-6 bg-blue-500 rounded-full" />
              Theory Round
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Marks (0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={evaluation.theory.marks}
                  onChange={(e) => handleChange('theory', 'marks', e.target.value)}
                  className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm min-h-[44px] bg-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={evaluation.theory.notes}
                  onChange={(e) => handleChange('theory', 'notes', e.target.value)}
                  rows="3"
                  className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm min-h-[44px] bg-white resize-none"
                  placeholder="Enter notes for theory round..."
                />
              </div>
            </div>
          </div>

          {/* Practical Round */}
          <div className="bg-gray-50 p-4 sm:p-5 rounded-xl border border-gray-200">
            <h3 className="text-sm sm:text-lg font-semibold mb-3 flex items-center gap-2">
              <div className="w-1 h-6 bg-indigo-500 rounded-full" />
              Practical Round
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Marks (0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={evaluation.practical.marks}
                  onChange={(e) => handleChange('practical', 'marks', e.target.value)}
                  className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm min-h-[44px] bg-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={evaluation.practical.notes}
                  onChange={(e) => handleChange('practical', 'notes', e.target.value)}
                  rows="3"
                  className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm min-h-[44px] bg-white resize-none"
                  placeholder="Enter notes for practical round..."
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-gray-200 sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 sm:px-6 py-3 text-sm sm:text-base font-semibold bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 sm:px-6 py-3 text-sm sm:text-base font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors min-h-[44px] shadow-lg shadow-blue-200"
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
