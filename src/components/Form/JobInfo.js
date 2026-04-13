import React from 'react';
import Input from './Input';
import Select from './Select';


const JobInfo = ({ formData, setFormData, errors, setErrors }) => {
  const handleChange = (field, value) => {
    let filteredValue = value;

    // Input filtering
    if (field === 'yearsOfExperience') {
      // Only allow digits
      filteredValue = value.replace(/[^0-9]/g, '');
    } else if (field === 'expectedSalary') {
      // Only allow digits
      filteredValue = value.replace(/[^0-9]/g, '');
    } else if (field === 'lastCompanyName') {
      // Only allow letters, spaces, and dots
      filteredValue = value.replace(/[^a-zA-Z\s.]/g, '');
    }

    const updatedData = { ...formData, [field]: filteredValue };

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

    // applicationType: must be selected
    if (!formData.applicationType) {
      newErrors.applicationType = 'Please select application type';
    }

    // preferredRole: must be selected (not just trimmed)
    if (!formData.preferredRole || !formData.preferredRole.trim()) {
      newErrors.preferredRole = 'Preferred role is required';
    }

    if (formData.applicationType === 'Internship') {
      // paymentOption must be selected
      if (!formData.paymentOption) {
        newErrors.paymentOption = 'Please select free or paid internship';
      }
    }

    if (formData.applicationType === 'Job') {
      // fresherOrExperienced must be selected
      if (!formData.fresherOrExperienced) {
        newErrors.fresherOrExperienced = 'Please select fresher or experienced';
      }

      if (formData.fresherOrExperienced === 'Experienced') {
        // yearsOfExperience: must be a number between 0-50
        const years = Number(formData.yearsOfExperience);
        if (!formData.yearsOfExperience || formData.yearsOfExperience === '') {
          newErrors.yearsOfExperience = 'Years of experience is required';
        } else if (isNaN(years) || years < 0 || years > 50) {
          newErrors.yearsOfExperience = 'Years of experience must be between 0 and 50';
        }

        // lastCompanyName: at least 2 chars, only letters/spaces/dots
        const companyName = formData.lastCompanyName || '';
        if (!companyName.trim()) {
          newErrors.lastCompanyName = 'Last company name is required';
        } else if (companyName.trim().length < 2) {
          newErrors.lastCompanyName = 'Last company name must be at least 2 characters';
        } else if (!/^[a-zA-Z\s.]+$/.test(companyName)) {
          newErrors.lastCompanyName = 'Last company name can only contain letters, spaces, and dots';
        }
      }

      // expectedSalary: must be a positive number, reasonable range (10000 to 10000000)
      const salary = Number(formData.expectedSalary);
      if (!formData.expectedSalary || formData.expectedSalary === '') {
        newErrors.expectedSalary = 'Expected salary is required';
      } else if (isNaN(salary) || salary <= 0) {
        newErrors.expectedSalary = 'Expected salary must be a positive number';
      } else if (salary < 10000 || salary > 10000000) {
        newErrors.expectedSalary = 'Expected salary must be between 10,000 and 1,00,00,000';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  React.useEffect(() => {
    window.validateJob = validate;
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div className="space-y-3 sm:space-y-4">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Job / Interview Information</h2>
      
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