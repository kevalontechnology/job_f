import React from 'react';
import Input from './Input';
import Select from './Select';

const EducationInfo = ({ formData, setFormData, errors, setErrors }) => {
  const handleChange = (field, value) => {
    let filteredValue = value;

    // Apply input filtering based on field
    if (field === 'collegeName') {
      // Allow only letters, spaces, dots, and commas
      filteredValue = value.replace(/[^a-zA-Z\s.,]/g, '');
    } else if (field === 'grade') {
      // Allow letters, numbers, dots, %, and spaces
      filteredValue = value.replace(/[^a-zA-Z0-9.\s%]/g, '');
    }

    setFormData({ ...formData, [field]: filteredValue });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};
    const currentYear = new Date().getFullYear();

    // Highest Qualification: must be selected (not empty)
    if (!formData.highestQualification || !formData.highestQualification.trim()) {
      newErrors.highestQualification = 'Highest qualification is required';
    }

    // College Name: must be at least 3 characters, only letters/spaces/dots/commas
    if (!formData.collegeName || !formData.collegeName.trim()) {
      newErrors.collegeName = 'College name is required';
    } else if (formData.collegeName.trim().length < 3) {
      newErrors.collegeName = 'College name must be at least 3 characters';
    } else if (!/^[a-zA-Z\s.,]+$/.test(formData.collegeName.trim())) {
      newErrors.collegeName = 'College name can only contain letters, spaces, dots, and commas';
    }

    // Grade: must be valid (allow formats like "8.5 CGPA", "85%", "A+", "First Class")
    if (!formData.grade || !formData.grade.trim()) {
      newErrors.grade = 'Grade is required';
    } else if (!/^[a-zA-Z0-9.\s%]+$/.test(formData.grade.trim())) {
      newErrors.grade = 'Grade format is invalid (e.g., "8.5 CGPA", "85%", "A+", "First Class")';
    }

    // Passing Year: must be selected and not a future year beyond current year
    if (!formData.passingYear) {
      newErrors.passingYear = 'Passing year is required';
    } else if (parseInt(formData.passingYear) > currentYear) {
      newErrors.passingYear = `Passing year cannot be beyond ${currentYear}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  React.useEffect(() => {
    window.validateEducation = validate;
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div className="space-y-3 sm:space-y-4">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Education Information</h2>
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