import React from 'react';
import Input from './Input';
import Select from './Select';
import { validateEmail, validatePhone } from '../../utils/helpers';

const PersonalInfo = ({ formData, setFormData, errors, setErrors }) => {
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.contactNumber) newErrors.contactNumber = 'Contact number is required';
    else if (!validatePhone(formData.contactNumber)) newErrors.contactNumber = 'Invalid phone number';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!validateEmail(formData.email)) newErrors.email = 'Invalid email address';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.dob) newErrors.dob = 'Date of birth is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Expose validate to parent
  React.useEffect(() => {
    if (window.validatePersonal) window.validatePersonal = validate;
  }, [formData, errors]);

  const genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Other', label: 'Other' },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Personal Information</h2>
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
      />
      <Input
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => handleChange('email', e.target.value)}
        error={errors.email}
        required
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