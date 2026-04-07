// localStorage utilities for candidate data

const CANDIDATES_KEY = 'interview_candidates';
const COUNTER_KEY = 'interview_counter';

// Get all candidates
export const getCandidates = () => {
  const data = localStorage.getItem(CANDIDATES_KEY);
  return data ? JSON.parse(data) : [];
};

// Save a new candidate
export const saveCandidate = (candidate) => {
  const candidates = getCandidates();
  candidates.push(candidate);
  localStorage.setItem(CANDIDATES_KEY, JSON.stringify(candidates));
};

// Delete a candidate by index
export const deleteCandidate = (index) => {
  const candidates = getCandidates();
  candidates.splice(index, 1);
  localStorage.setItem(CANDIDATES_KEY, JSON.stringify(candidates));
};

// Get the next interview ID
export const getNextInterviewId = () => {
  const counter = parseInt(localStorage.getItem(COUNTER_KEY)) || 0;
  const nextCounter = counter + 1;
  localStorage.setItem(COUNTER_KEY, nextCounter.toString());
  return `YT-2026-${nextCounter.toString().padStart(3, '0')}`;
};