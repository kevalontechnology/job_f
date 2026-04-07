import React, { useState } from 'react';
import PersonalInfo from './PersonalInfo';
import EducationInfo from './EducationInfo';
import JobInfo from './JobInfo';

const FormStepper = ({ onSubmit, loading = false }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    fullName: '',
    contactNumber: '',
    email: '',
    gender: '',
    dob: '',
    address: '',
    city: '',
    highestQualification: '',
    collegeName: '',
    passingYear: '',
    grade: '',
    applicationType: '',
    paymentOption: '',
    skills: '',
    preferredRole: '',
    fresherOrExperienced: '',
    yearsOfExperience: '',
    lastCompanyName: '',
    expectedSalary: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});

  const steps = [
    { name: 'Personal', component: PersonalInfo },
    { name: 'Education', component: EducationInfo },
    { name: 'Job', component: JobInfo },
  ];

  const validateCurrentStep = () => {
    const validators = [window.validatePersonal, window.validateEducation, window.validateJob];
    return validators[currentStep] ? validators[currentStep]() : true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (validateCurrentStep()) {
      onSubmit(formData);
    }
  };

  const CurrentComponent = steps[currentStep].component;

  return (
    <div className="w-full max-w-2xl mx-auto bg-white p-2 sm:p-4 md:p-6 rounded-lg shadow-md">
      {/* Stepper */}
      <div className="flex items-center justify-between mb-5 sm:mb-6 md:mb-8 px-1">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center gap-1 sm:gap-2">
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all ${
                  index < currentStep
                    ? 'bg-blue-500 text-white shadow-md'
                    : index === currentStep
                    ? 'bg-blue-500 text-white ring-4 ring-blue-100 shadow-md'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {index < currentStep ? (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span className={`text-[11px] sm:text-xs md:text-sm font-semibold whitespace-nowrap ${
                index <= currentStep ? 'text-blue-600' : 'text-gray-400'
              }`}>
                {step.name}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="flex-1 mx-1.5 sm:mx-3 md:mx-4">
                <div className={`h-0.5 sm:h-1 rounded-full transition-all ${
                  index < currentStep ? 'bg-blue-500' : 'bg-gray-200'
                }`} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Form Content */}
      <CurrentComponent
        formData={formData}
        setFormData={setFormData}
        errors={errors}
        setErrors={setErrors}
      />

      {/* Navigation */}
      <div className="flex justify-between mt-6 sm:mt-8">
        <button
          onClick={handlePrev}
          disabled={currentStep === 0}
          className="px-4 sm:px-6 py-2.5 sm:py-2 bg-gray-300 text-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-medium min-h-[44px] transition-colors hover:bg-gray-400"
        >
          Previous
        </button>
        {currentStep < steps.length - 1 ? (
          <button
            onClick={handleNext}
            className="px-4 sm:px-6 py-2.5 sm:py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm sm:text-base font-medium min-h-[44px] transition-colors"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 sm:px-6 py-2.5 sm:py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-medium min-h-[44px] transition-colors"
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        )}
      </div>
    </div>
  );
};

export default FormStepper;