import React from 'react';
import Input from './Input';
import Select from './Select';
import { validateEmail, validatePhone } from '../../utils/helpers';

const PersonalInfo = ({ formData, setFormData, errors, setErrors }) => {
  const handleChange = (field, value) => {
    // Phone: only allow digits, max 10
    if (field === 'contactNumber') {
      value = value.replace(/\D/g, '').slice(0, 10);
    }
    // Full name: only allow letters and spaces
    if (field === 'fullName') {
      value = value.replace(/[^a-zA-Z\s]/g, '');
    }
    // City: only allow letters and spaces
    if (field === 'city') {
      value = value.replace(/[^a-zA-Z\s]/g, '');
    }

    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    else if (formData.fullName.trim().length < 2) newErrors.fullName = 'Name must be at least 2 characters';

    if (!formData.contactNumber) newErrors.contactNumber = 'Contact number is required';
    else if (formData.contactNumber.length !== 10) newErrors.contactNumber = 'Must be exactly 10 digits';
    else if (!/^[6-9]/.test(formData.contactNumber)) newErrors.contactNumber = 'Must start with 6, 7, 8 or 9';
    else if (!validatePhone(formData.contactNumber)) newErrors.contactNumber = 'Invalid phone number';

    if (!formData.email) newErrors.email = 'Email is required';
    else if (!validateEmail(formData.email)) newErrors.email = 'Enter a valid email (e.g. name@example.com)';

    if (!formData.gender) newErrors.gender = 'Gender is required';

    if (!formData.dob) newErrors.dob = 'Date of birth is required';
    else {
      const birthDate = new Date(formData.dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
      if (birthDate > today) newErrors.dob = 'Date of birth cannot be in the future';
      else if (age < 16) newErrors.dob = 'You must be at least 16 years old';
      else if (age > 65) newErrors.dob = 'Age cannot exceed 65 years';
    }

    if (!formData.address.trim()) newErrors.address = 'Address is required';
    else if (formData.address.trim().length < 10) newErrors.address = 'Address must be at least 10 characters';

    if (!formData.city.trim()) newErrors.city = 'City is required';
    else if (formData.city.trim().length < 2) newErrors.city = 'City must be at least 2 characters';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Expose validate to parent
  React.useEffect(() => {
    window.validatePersonal = validate;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, errors]);

  const genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Other', label: 'Other' },
  ];

  return (
    <div className="space-y-3 sm:space-y-4">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Personal Information</h2>
      <Input
        label="Full Name"
        value={formData.fullName}
        onChange={(e) => handleChange('fullName', e.target.value)}
        error={errors.fullName}
        required
      />
      <Input
        label="Contact Number"
        type="tel"
        value={formData.contactNumber}
        onChange={(e) => handleChange('contactNumber', e.target.value)}
        error={errors.contactNumber}
        required
        maxLength="10"
        inputMode="numeric"
        pattern="[0-9]*"
        placeholder="10-digit mobile number"
      />
      <Input
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => handleChange('email', e.target.value)}
        error={errors.email}
        required
        placeholder="name@example.com"
      />
      <Select
        label="Gender"
        value={formData.gender}
        onChange={(e) => handleChange('gender', e.target.value)}
        options={genderOptions}
        error={errors.gender}
        required
      />
      <Input
        label="Date of Birth"
        type="date"
        value={formData.dob}
        onChange={(e) => handleChange('dob', e.target.value)}
        error={errors.dob}
        required
        max={new Date().toISOString().split('T')[0]}
      />
      <Input
        label="Address"
        value={formData.address}
        onChange={(e) => handleChange('address', e.target.value)}
        error={errors.address}
        required
      />
      <Input
        label="City"
        value={formData.city}
        onChange={(e) => handleChange('city', e.target.value)}
        error={errors.city}
        required
      />
    </div>
  );
};

export default PersonalInfo;