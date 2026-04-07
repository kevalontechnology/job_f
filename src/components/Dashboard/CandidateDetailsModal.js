import React, { useState, useEffect } from "react";
import {
  FaTimes, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBriefcase,
  FaSchool, FaCalendarAlt, FaCheckCircle, FaUser,
  FaGraduationCap, FaRupeeSign, FaFileInvoice, FaShieldAlt
} from "react-icons/fa";
import { formatDate } from "../../utils/helpers";

const PAYMENT_STATUS_OPTIONS = ["pending", "50%", "100%"];
const APPLICATION_STATUS_OPTIONS = ["pending", "approved", "rejected"];

const CandidateDetailsModal = ({
  candidate,
  onClose,
  onUploadProof,
  uploadingProof,
  onSave,
  canEditStatus,
}) => {
  const [selectedStatus, setSelectedStatus] = useState("pending");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("pending");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (candidate) {
      setSelectedStatus(candidate.status || "pending");
      setSelectedPaymentStatus(candidate?.paymentInfo?.paymentStatus || "pending");
    }
  }, [candidate]);

  if (!candidate) return null;

  const personal = candidate.personalInfo || {};
  const education = candidate?.educationInfo?.[0] || {};
  const job = candidate.jobInfo || {};

  const handleSave = async () => {
    setSaveMessage({ type: "", text: "" });
    setIsSaving(true);
    try {
      if (onSave) {
        await onSave(candidate._id, {
          status: selectedStatus,
          paymentStatus: selectedPaymentStatus,
        });
      }
      setSaveMessage({ type: "success", text: "Changes updated successfully!" });
    } catch (error) {
      setSaveMessage({ type: "error", text: error?.message || "Save failed." });
    } finally {
      setIsSaving(false);
    }
  };

  const StatusBadge = ({ label, current, target, onClick, colorClass }) => (
    <button
      onClick={() => onClick(label)}
      className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border-2 
      ${current === label
          ? `${colorClass} border-transparent shadow-sm`
          : 'border-slate-200 text-slate-400 hover:border-slate-300'}`}
    >
      {label}
    </button>
  );

  const InfoRow = ({ icon: Icon, label, value, fullWidth = false }) => (
    <div className={`flex gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100 ${fullWidth ? 'sm:col-span-2' : ''}`}>
      <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0">
        <Icon className="text-blue-500" size={16} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-sm font-bold text-slate-700 truncate">{value || "N/A"}</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-5xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* HEADER */}
        <div className="relative px-8 py-6 bg-white border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-100">
              <FaUser size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                {personal.firstName} {personal.lastName}
              </h2>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">
                ID: {candidate.interviewId || candidate._id || 'N/A'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* MAIN BODY */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="grid lg:grid-cols-3 gap-8">

            {/* LEFT: INFORMATION SECTIONS */}
            <div className="lg:col-span-2 space-y-10">
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-1 w-8 bg-blue-500 rounded-full" />
                  <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">Candidate Bio</h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <InfoRow icon={FaEnvelope} label="Email Address" value={personal.email} />
                  <InfoRow icon={FaPhone} label="Contact Number" value={personal.phone} />
                  <InfoRow icon={FaCalendarAlt} label="Date of Birth" value={personal.dateOfBirth ? formatDate(personal.dateOfBirth) : "N/A"} />
                  <InfoRow icon={FaMapMarkerAlt} label="Current Location" value={personal.address} fullWidth />
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-1 w-8 bg-indigo-500 rounded-full" />
                  <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">Education Details</h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <InfoRow icon={FaGraduationCap} label="Highest Degree" value={education.degree} />
                  <InfoRow icon={FaSchool} label="Institution" value={education.institution} />
                  <InfoRow icon={FaCalendarAlt} label="Year of Completion" value={education.yearOfCompletion} />
                  <InfoRow icon={FaCheckCircle} label="Grade / GPA" value={education.grade} />
                </div>
              </section>
            </div>

            {/* RIGHT: ACTIONS & STATUS */}
            <div className="space-y-6">
              {/* STATUS CARD */}
              <div className="bg-slate-900 rounded-[2rem] p-6 text-white shadow-xl shadow-slate-200">
                <h3 className="flex items-center gap-2 font-bold mb-6 text-slate-300">
                  <FaShieldAlt className="text-blue-400" /> Administrative
                </h3>

                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500 block mb-3">Application Status</label>
                    <div className="flex flex-wrap gap-2">
                      {APPLICATION_STATUS_OPTIONS.map(opt => (
                        <StatusBadge
                          key={opt} label={opt} current={selectedStatus}
                          onClick={setSelectedStatus} colorClass="bg-blue-500 text-white"
                        />
                      ))}
                    </div>
                  </div>



                  <div className="pt-4 border-t border-slate-800">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-slate-400 text-xs">Application Type</span>
                      <span className="text-blue-400 font-bold">{job.applicationType}</span>
                    </div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-slate-400 text-xs">Target Role</span>
                      <span className="text-blue-400 font-bold">{job.position || candidate.preferredRole}</span>
                    </div>

                    {job.expectedSalary > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-xs">Salary Expectation</span>
                        <span className="text-emerald-400 font-bold">
                          ₹{job.expectedSalary?.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* SAVE ACTION */}
              {canEditStatus && (
                <div className="space-y-3">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`w-full py-4 rounded-2xl font-bold text-sm transition-all shadow-lg 
                    ${isSaving
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 active:scale-[0.98]'}`}
                  >
                    {isSaving ? 'Updating Database...' : 'Commit Changes'}
                  </button>
                  {saveMessage.text && (
                    <p className={`text-center text-xs font-bold ${saveMessage.type === 'success' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {saveMessage.text}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetailsModal;