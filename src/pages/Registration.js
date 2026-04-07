  import React, { useState } from 'react';
  import { useNavigate } from 'react-router-dom';
  import axios from 'axios';
  import { Helmet } from 'react-helmet-async';
  import FormStepper from '../components/Form/FormStepper';
  import emailjs from '@emailjs/browser';

  const Registration = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Initialize EmailJS
    emailjs.init("lx2E8jBstuoaM1Xuw");

    const validateFormData = (data) => {
      const errors = [];

      // Personal Info Validation
      if (!data.fullName || data.fullName.trim().length < 2) {
        errors.push('Full name must be at least 2 characters long.');
      }

      if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.push('Please enter a valid email address.');
      }

      if (!data.contactNumber || !/^[6-9]\d{9}$/.test(data.contactNumber)) {
        errors.push('Please enter a valid 10-digit mobile number starting with 6-9.');
      }

      if (!data.dob) {
        errors.push('Date of birth is required.');
      } else {
        const birthDate = new Date(data.dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        // Adjust age if birthday hasn't occurred this year
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        
        if (age < 18 || age > 65) {
          errors.push('Age must be between 18 and 65 years.');
        }
      }

      if (!data.address || data.address.trim().length < 10) {
        errors.push('Address must be at least 10 characters long.');
      }

      if (!data.city || data.city.trim().length < 2) {
        errors.push('City is required.');
      }

      // Education Info Validation
      if (!data.highestQualification) {
        errors.push('Highest qualification is required.');
      }

      if (!data.collegeName || data.collegeName.trim().length < 2) {
        errors.push('College/University name is required.');
      }

      if (!data.passingYear || isNaN(data.passingYear) || data.passingYear < 1950 || data.passingYear > new Date().getFullYear()) {
        errors.push('Please enter a valid passing year.');
      }

      if (!data.grade || data.grade.trim().length < 1) {
        errors.push('Grade is required.');
      }

    

      // Job Info Validation
      if (!data.applicationType) {
        errors.push('Application type is required.');
      }

      if (!data.preferredRole) {
        errors.push('Preferred role is required.');
      }

      if (data.applicationType === 'Internship') {
        if (!data.paymentOption) {
          errors.push('Please select free or paid internship.');
        }
      }

      if (data.applicationType === 'Job') {
        if (!data.fresherOrExperienced) {
          errors.push('Please select fresher or experienced.');
        }
        if (data.fresherOrExperienced === 'Experienced' && (!data.yearsOfExperience || isNaN(data.yearsOfExperience) || data.yearsOfExperience < 0 || data.yearsOfExperience > 50)) {
          errors.push('Years of experience must be between 0 and 50.');
        }
        if (data.expectedSalary && (isNaN(data.expectedSalary) || data.expectedSalary < 0 || data.expectedSalary > 10000000)) {
          errors.push('Expected salary must be a valid amount.');
        }
      }

      return errors;
    };

    const handleSubmit = async (formData) => {
      setLoading(true);
      setError('');

      // Frontend validation
      const validationErrors = validateFormData(formData);
      if (validationErrors.length > 0) {
        setError(validationErrors.join(' '));
        setLoading(false);
        return;
      }

      try {
        const nameParts = formData.fullName.split(' ');

        const candidateData = {
          personalInfo: {
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
            email: formData.email,
            phone: formData.contactNumber,
            address: `${formData.address}, ${formData.city}`,
            dateOfBirth: formData.dob,
          },
          educationInfo: [
            {
              degree: formData.highestQualification,
              institution: formData.collegeName,
              yearOfCompletion: parseInt(formData.passingYear),
              grade: formData.grade,
            },
          ],
          jobInfo: {
            position: formData.preferredRole,
            experience: formData.applicationType === 'Internship' ? 0 : (parseInt(formData.yearsOfExperience) || 0),
            expectedSalary:
              formData.applicationType === 'Internship'
                ? formData.paymentOption === 'Paid'
                  ? 4999
                  : 0
                : (parseInt(formData.expectedSalary) || 0),
            applicationType: formData.applicationType,
            paymentOption: formData.applicationType === 'Internship' ? formData.paymentOption : undefined,
          },
          paymentInfo: {
            internshipType: formData.applicationType === 'Internship' ? formData.paymentOption : undefined,
            amount:
              formData.applicationType === 'Internship'
                ? formData.paymentOption === 'Paid'
                  ? 4999
                  : 0
                : 0,
            paymentStatus: 'pending',
            paymentProofUrl: '',
            approvalNotes: '',
            approvedBy: null,
          },
        };

        const url = 'https://job-ael6.onrender.com/api/candidates';
        const response = await axios.post(url, candidateData);

        const candidate = response.data;

        const interviewId = candidate.interviewId || candidate._id || `JR-${Math.floor(Math.random() * 900000) + 100000}`;
        const submittedAt = candidate.submittedAt
          ? new Date(candidate.submittedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
          : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

        const emailParams = {
          interviewId,
          firstName: candidate.personalInfo?.firstName || nameParts[0] || '',
          lastName: candidate.personalInfo?.lastName || nameParts.slice(1).join(' ') || '',
          email: candidate.personalInfo?.email || formData.email,
          phone: candidate.personalInfo?.phone || formData.contactNumber,
          position: candidate.jobInfo?.position || formData.preferredRole,
          experience: candidate.jobInfo?.experience ?? (formData.applicationType === 'Internship' ? 0 : parseInt(formData.yearsOfExperience) || 0),
          expectedSalary: candidate.jobInfo?.expectedSalary ?? (parseInt(formData.expectedSalary) || 0),
          degree: candidate.educationInfo?.[0]?.degree || formData.highestQualification || '',
          institution: candidate.educationInfo?.[0]?.institution || formData.collegeName || '',
          yearOfCompletion: candidate.educationInfo?.[0]?.yearOfCompletion || parseInt(formData.passingYear) || '',
          grade: candidate.educationInfo?.[0]?.grade || formData.grade || '',
          paymentStatus: candidate.paymentInfo?.paymentStatus || 'pending',
          amount: candidate.paymentInfo?.amount ?? (formData.applicationType === 'Internship' ? (formData.paymentOption === 'Paid' ? 4999 : 0) : 0),
          submittedAt,
          to_name: `${candidate.personalInfo?.firstName || nameParts[0] || ''} ${candidate.personalInfo?.lastName || nameParts.slice(1).join(' ') || ''}`.trim(),
          to_email: candidate.personalInfo?.email || formData.email,
        };

        emailjs.send("service_hxpqut7", "template_hkqiwos", emailParams).then(
          (result) => {
            console.log('Email sent successfully:', result.text);
          },
          (error) => {
            console.error('Failed to send email:', error.text);
          }
        );

        navigate('/confirmation', { state: { candidate } });
      } catch (err) {
        console.error('Error submitting form:', err);
        setError('Failed to submit application. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    return (
      <>
        <Helmet>
          <title>IT Jobs & Internship Registration - Kevalon Technology Ahmedabad</title>
          <meta name="description" content="Apply for latest IT jobs and internships at Kevalon Technology in Ahmedabad. Register online for software developer, web developer, digital marketing, SEO executive, and MERN stack positions. Freshers and experienced welcome." />
          <meta name="keywords" content="IT Jobs in Ahmedabad, Job Registration Ahmedabad, IT Job Registration Online, Apply IT Jobs Online, IT Company Jobs in Ahmedabad, Fresher IT Jobs Ahmedabad, Software Developer Jobs Ahmedabad, Web Developer Jobs Ahmedabad, Digital Marketing Jobs Ahmedabad, SEO Executive Jobs Ahmedabad, Apply IT Jobs Online in Ahmedabad, IT Job Registration for Freshers, Best IT Company Jobs in Ahmedabad, MERN Stack Developer Jobs Ahmedabad, Digital Marketing Fresher Jobs Ahmedabad, SEO Executive Jobs for Freshers, Web Development Jobs in Ahmedabad, IT Internship in Ahmedabad, IT Placement Registration Ahmedabad, Online Job Apply IT Company, Kevalon Technology Jobs, Kevalon Technology Careers, Kevalon Technology Job Registration, Kevalon Technology Ahmedabad Jobs, Apply Job Kevalon Technology, Latest IT Jobs in Ahmedabad, IT Jobs for Freshers in Ahmedabad, Software Company Jobs Ahmedabad, Internship in IT Company Ahmedabad, Entry Level IT Jobs Ahmedabad" />
          <meta name="robots" content="index, follow" />
          <link rel="canonical" href="https://job.kevalontechnology.in/" />
          <meta property="og:title" content="IT Jobs & Internship Registration - Kevalon Technology Ahmedabad" />
          <meta property="og:description" content="Apply for latest IT jobs and internships at Kevalon Technology. Software developer, web developer, digital marketing, and SEO executive positions available for freshers and experienced candidates." />
          <meta property="og:image" content="https://www.kevalontechnology.in/assets/logo/kevalon1.png" />
          <meta property="twitter:title" content="IT Jobs & Internship Registration - Kevalon Technology Ahmedabad" />
          <meta property="twitter:description" content="Apply for latest IT jobs and internships at Kevalon Technology. Software developer, web developer, digital marketing, and SEO executive positions available for freshers and experienced candidates." />
          <meta property="twitter:image" content="https://www.kevalontechnology.in/assets/logo/kevalon1.png" />
        </Helmet>
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200 py-10 px-4">
        <div className="w-full max-w-5xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-[#0F4C81] via-[#125E9C] to-[#0B2F4A] px-6 md:px-10 py-10 text-center text-white">
              <img
                src="https://www.kevalontechnology.in/assets/logo/kevalon1.png"
                alt="Kevalon Technology"
                className="h-20 md:h-20 mx-auto mb-5 object-contain bg-white rounded-xl px-4 py-2 shadow-md"
              />

              <h1 className="text-3xl md:text-4xl font-bold mb-3">
                IT Job Registration - Kevalon Technology Ahmedabad
              </h1>

              <p className="text-blue-100 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
                Complete your online job registration form to apply for the latest IT jobs and internships at
                Kevalon Technology in Ahmedabad. We offer opportunities for freshers and experienced candidates in software development, web development, digital marketing, and SEO executive roles.
              </p>
            </div>

            {/* Body */}
            <div className="p-6 md:p-10 bg-white">
              {error && (
                <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 flex gap-3 items-start">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                    <svg
                      className="w-5 h-5 text-red-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z"
                      />
                    </svg>
                  </div>

                  <div>
                    <h3 className="text-red-700 font-semibold mb-1">
                      Submission Error
                    </h3>
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                </div>
              )}

              <div className="mb-6 rounded-2xl bg-[#0F4C81]/5 border border-[#0F4C81]/10 px-5 py-4">
                <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                  Please fill in all required details carefully. Once submitted,
                your IT job application will be processed and your interview token will be generated automatically. We provide placement registration for freshers and experienced professionals in Ahmedabad's best IT company.
                </p>
              </div>

              <FormStepper onSubmit={handleSubmit} loading={loading} />
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 bg-slate-50 px-6 md:px-10 py-4 text-center">
              <p className="text-sm text-gray-500">
                © {new Date().getFullYear()} Kevalon Technology. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
      </>
    );
  };

  export default Registration;