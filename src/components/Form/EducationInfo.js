import React from 'react';
import Input from './Input';
import Select from './Select';

const EducationInfo = ({ formData, setFormData, errors, setErrors }) => {
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.highestQualification.trim()) newErrors.highestQualification = 'Highest qualification is required';
    if (!formData.collegeName.trim()) newErrors.collegeName = 'College name is required';
    if (!formData.grade.trim()) newErrors.grade = 'Grade is required';
    if (!formData.passingYear) newErrors.passingYear = 'Passing year is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  React.useEffect(() => {
    if (window.validateEducation) window.validateEducation = validate;
  }, [formData, errors]);

  const qualificationOptions = [
    { value: 'High School', label: 'High School' },
    { value: 'Diploma', label: 'Diploma' },
    { value: 'Bachelor\'s', label: 'Bachelor\'s' },
    { value: 'Master\'s', label: 'Master\'s' },
    { value: 'PhD', label: 'PhD' },
  ];

  const yearOptions = [];
  for (let year = 2012; year <= 2026; year++) {
    yearOptions.push({ value: year.toString(), label: year.toString() });
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Education Information</h2>
      <Select
        label="Highest Qualification"
        value={formData.highestQualification}
        onChange={(e) => handleChange('highestQualification', e.target.value)}
        options={qualificationOptions}
        error={errors.highestQualification}
        required
      />
      <Input
        label="College Name"
        value={formData.collegeName}
        onChange={(e) => handleChange('collegeName', e.target.value)}
        error={errors.collegeName}
        required
      />
      <Input
        label="Grade"
        value={formData.grade}
        onChange={(e) => handleChange('grade', e.target.value)}
        error={errors.grade}
        required
      />
      <Select
        label="Passing Year *"
        value={formData.passingYear}
        onChange={(e) => handleChange('passingYear', e.target.value)}
        options={yearOptions}
        error={errors.passingYear}
        required
      />
    </div>
  );
};

export default EducationInfo;