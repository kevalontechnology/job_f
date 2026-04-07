import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { formatDate, formatDateTime } from "../utils/helpers";
import {
  FaPrint,
  FaUserPlus,
  FaCheckCircle,
  FaExclamationCircle,
  FaIdBadge,
} from "react-icons/fa";

const Confirmation = () => {
  const location = useLocation();
  const { candidate } = location.state || {};
  const [showDetails, setShowDetails] = useState(false);

  if (!candidate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
        <div className="bg-white shadow-xl rounded-2xl p-10 text-center max-w-md">
          <FaExclamationCircle className="text-red-500 text-5xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Data Not Found</h2>
          <p className="text-gray-500 mb-6">
            No registration data found. Please submit the form again.
          </p>
          <Link
            to="/"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            Go to Registration
          </Link>
        </div>
      </div>
    );
  }

  const handlePrint = () => window.print();

  const fullName =
    candidate.fullName ||
    `${candidate.personalInfo?.firstName || ""} ${
      candidate.personalInfo?.lastName || ""
    }`.trim();

  const interviewToken = candidate.interviewId || candidate._id || "N/A";

  const personalInfo = candidate.personalInfo || {};
  const educationInfo = candidate.educationInfo || [];
  const jobInfo = candidate.jobInfo || {};

  const formattedDob = personalInfo.dateOfBirth
    ? formatDate(personalInfo.dateOfBirth)
    : "N/A";

  const salaryValue = jobInfo.expectedSalary || 0;
  const formattedSalary = salaryValue
    ? `₹${salaryValue.toLocaleString()}`
    : "N/A";

  const details = [
    {
      label: "Candidate Name",
      value: fullName,
    },
    {
      label: "Email Address",
      value: candidate.personalInfo?.email || candidate.email,
    },
    {
      label: "Applied Position",
      value: candidate.jobInfo?.position || candidate.preferredRole,
    },
    {
      label: "Submission Time",
      value: formatDateTime(candidate.submittedAt || new Date()),
    },
  ];

  return (
    <>
      <Helmet>
        <title>Registration Confirmation - Kevalon Technology</title>
        <meta name="description" content="Your application has been submitted successfully. View your interview ID and application summary at Kevalon Technology." />
        <meta name="keywords" content="application confirmation, interview ID, Kevalon Technology, job application" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4 py-10">
      <div className="max-w-5xl w-full bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-100">

        {/* Top Bar */}
        <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

        <div className="grid md:grid-cols-2">

          {/* LEFT SIDE */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-10 flex flex-col justify-center items-center text-center relative">

            <FaCheckCircle className="text-5xl text-emerald-400 mb-5 animate-pulse" />

            <h1 className="text-3xl font-bold mb-3">
              Registration Successful
            </h1>

            <p className="text-gray-300 text-sm mb-8 max-w-xs">
              Thank you for applying at
              <span className="text-white font-semibold"> Kevalon Technology</span>.
              Your application has been received.
            </p>

            {/* Interview Token */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-5 w-full max-w-xs">
              <p className="text-xs uppercase tracking-widest text-blue-300 mb-1">
                Interview ID
              </p>

              <p className="text-2xl font-mono font-bold tracking-wider break-all">
                {interviewToken}
              </p>
            </div>

            <p className="text-xs text-gray-400 mt-4">
              Keep this ID for future reference
            </p>
          </div>

          {/* RIGHT SIDE */}
          <div className="p-10">

            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Application Summary
                </h2>
                <p className="text-gray-500 text-sm">
                  Review your submitted information
                </p>
              </div>

              <img
                src="https://www.kevalontechnology.in/assets/logo/Kevalon2.png"
                alt="logo"
                className="h-10 opacity-70"
              />
            </div>

            {/* Details */}
            <div className="space-y-5">
              {details.map((item, i) => (
                <div
                  key={i}
                  className="flex justify-between border-b pb-3"
                >
                  <span className="text-gray-500 text-sm font-semibold uppercase">
                    {item.label}
                  </span>

                  <span className="text-gray-800 font-medium text-sm">
                    {item.value || "---"}
                  </span>
                </div>
              ))}
            </div>

            {/* Next Steps */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mt-8 flex gap-3">
              <FaIdBadge className="text-blue-600 text-xl mt-1" />

              <p className="text-sm text-blue-900">
                <span className="font-semibold block mb-1">Next Step</span>
                Our HR team will review your application. If shortlisted,
                you will receive an email regarding the interview schedule.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8 print:hidden">

              <button
                onClick={handlePrint}
                className="flex-1 bg-slate-800 text-white py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-black"
              >
                <FaPrint /> Print Receipt
              </button>

              <Link
                to="/"
                className="flex-1 border border-gray-300 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50"
              >
                <FaUserPlus /> New Entry
              </Link>

            </div>
          </div>

        </div>
      </div>
    </div>
    </>
  );
};

export default Confirmation;