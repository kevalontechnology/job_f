import React from 'react';
import Input from './Input';
import Textarea from './Textarea';
import { validatePhone } from '../../utils/helpers';

const ReferenceInfo = ({ formData, setFormData, errors, setErrors }) => {
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.referencePersonName.trim()) newErrors.referencePersonName = 'Reference person name is required';
    if (!formData.referenceMobile) newErrors.referenceMobile = 'Reference mobile is required';
    else if (!validatePhone(formData.referenceMobile)) newErrors.referenceMobile = 'Invalid phone number';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  React.useEffect(() => {
    if (window.validateReference) window.validateReference = validate;
  }, [formData, errors]);

  return (
    <div className="space-y-3 sm:space-y-4">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Reference Information</h2>
      <Input
        label="Reference Person Name"
        value={formData.referencePersonName}
        onChange={(e) => handleChange('referencePersonName', e.target.value)}
        error={errors.referencePersonName}
        required
        className="text-base"
      />
      <Input
        label="Reference Mobile"
        type="tel"
        value={formData.referenceMobile}
        onChange={(e) => handleChange('referenceMobile', e.target.value)}
        error={errors.referenceMobile}
        required
        className="text-base"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength="10"
      />
      <Textarea
        label="Notes"
        value={formData.notes}
        onChange={(e) => handleChange('notes', e.target.value)}
        rows={4}
      />
    </div>
  );
};

export default ReferenceInfo;