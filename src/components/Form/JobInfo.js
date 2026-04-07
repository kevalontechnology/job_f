import React from 'react';
import Input from './Input';
import Select from './Select';
import Textarea from './Textarea';

const JobInfo = ({ formData, setFormData, errors, setErrors }) => {
  const handleChange = (field, value) => {
    const updatedData = { ...formData, [field]: value };

    if (field === 'applicationType' && value === 'Internship') {
      updatedData.fresherOrExperienced = '';
      updatedData.yearsOfExperience = '';
      updatedData.lastCompanyName = '';
      updatedData.expectedSalary = 0;
      updatedData.paymentOption = '';
    }

    if (field === 'applicationType' && value === 'Job') {
      updatedData.paymentOption = '';
      updatedData.expectedSalary = '';
    }

    if (field === 'paymentOption') {
      updatedData.expectedSalary = value === 'Paid' ? 0 : 0;
    }

    setFormData(updatedData);
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.applicationType) newErrors.applicationType = 'Please select application type';
    if (!formData.preferredRole.trim()) newErrors.preferredRole = 'Preferred role is required';

    if (formData.applicationType === 'Internship') {
      if (!formData.paymentOption) newErrors.paymentOption = 'Please select free or paid internship';
    }

    if (formData.applicationType === 'Job') {
      if (!formData.fresherOrExperienced) newErrors.fresherOrExperienced = 'Please select fresher or experienced';
      if (formData.fresherOrExperienced === 'Experienced') {
        if (!formData.yearsOfExperience) newErrors.yearsOfExperience = 'Years of experience is required';
        if (!formData.lastCompanyName.trim()) newErrors.lastCompanyName = 'Last company name is required';
      }
      if (!formData.expectedSalary) newErrors.expectedSalary = 'Expected salary is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  React.useEffect(() => {
    if (window.validateJob) window.validateJob = validate;
  }, [formData, errors]);

  const roleOptions = [
    { value: 'Full Stack', label: 'Full Stack' },
    { value: 'MERN Stack', label: 'MERN Stack' },
    { value: 'Web Development', label: 'Web Development' },
    { value: 'Graphic Design', label: 'Graphic Design' },
    { value: 'UI/UX', label: 'UI/UX' },
    { value: 'Digital Marketing', label: 'Digital Marketing' },
    { value: 'Other', label: 'Other' },
  ];

  const experienceOptions = [
    { value: 'Fresher', label: 'Fresher' },
    { value: 'Experienced', label: 'Experienced' },
  ];

  const applicationTypeOptions = [
    { value: 'Job', label: 'Job' },
    { value: 'Internship', label: 'Internship' },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Job / Interview Information</h2>
      
      <Select
        label="Application Type"
        value={formData.applicationType}
        onChange={(e) => handleChange('applicationType', e.target.value)}
        options={applicationTypeOptions}
        error={errors.applicationType}
        required
      />
      
      <Select
        label="Preferred Role"
        value={formData.preferredRole}
        onChange={(e) => handleChange('preferredRole', e.target.value)}
        options={roleOptions}
        error={errors.preferredRole}
        required
      />
      
      {formData.applicationType === 'Internship' && (
        <>
          <Select
            label="Payment Option"
            value={formData.paymentOption}
            onChange={(e) => handleChange('paymentOption', e.target.value)}
            options={[
              { value: 'Free', label: 'Free' },
              { value: 'Paid', label: 'Paid' },
            ]}
            error={errors.paymentOption}
            required
          />
        </>
      )}

      {formData.applicationType === 'Job' && (
        <>
          <Select
            label="Fresher / Experienced"
            value={formData.fresherOrExperienced}
            onChange={(e) => handleChange('fresherOrExperienced', e.target.value)}
            options={experienceOptions}
            error={errors.fresherOrExperienced}
            required
          />
          {formData.fresherOrExperienced === 'Experienced' && (
            <>
              <Input
                label="Years of Experience"
                type="number"
                value={formData.yearsOfExperience}
                onChange={(e) => handleChange('yearsOfExperience', e.target.value)}
                error={errors.yearsOfExperience}
                required
                min="0"
              />
              <Input
                label="Last Company Name"
                value={formData.lastCompanyName}
                onChange={(e) => handleChange('lastCompanyName', e.target.value)}
                error={errors.lastCompanyName}
                required
              />
            </>
          )}
          <Input
            label="Expected Salary (per annum)"
            type="number"
            value={formData.expectedSalary}
            onChange={(e) => handleChange('expectedSalary', e.target.value)}
            error={errors.expectedSalary}
            required
            min="0"
          />
        </>
      )}
    </div>
  );
};

export default JobInfo;