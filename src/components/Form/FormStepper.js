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
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
      {/* Stepper */}
      <div className="flex justify-between mb-8">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            <div
              className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${
                index <= currentStep ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'
              }`}
            >
              {index + 1}
            </div>
            <span className={`ml-1 sm:ml-2 text-xs sm:text-sm ${index <= currentStep ? 'text-blue-500' : 'text-gray-600'}`}>
              {step.name}
            </span>
            {index < steps.length - 1 && (
              <div
                className={`w-8 sm:w-16 h-1 mx-2 sm:mx-4 ${
                  index < currentStep ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              />
            )}
          </div>
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
      <div className="flex justify-between mt-8">
        <button
          onClick={handlePrev}
          disabled={currentStep === 0}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md disabled:opacity-50"
        >
          Previous
        </button>
        {currentStep < steps.length - 1 ? (
          <button
            onClick={handleNext}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        )}
      </div>
    </div>
  );
};

export default FormStepper;