import React, { useEffect, useState } from 'react';
import { studentApi } from '../../api/studentApi';
import { Student } from '../../types/student';
import { ProfileCard } from '../../components/student/ProfileCard';
import { FormField } from '../../components/common/FormField';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { validatePhone } from '../../utils/validators';
import toast from 'react-hot-toast';

export const StudentProfile: React.FC = () => {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    year: 1,
    phone: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await studentApi.getProfile();
      setStudent(res.data);
      setFormData({
        name: res.data.name,
        department: res.data.department,
        year: res.data.year,
        phone: res.data.phone
      });
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (student) {
      setFormData({
        name: student.name,
        department: student.department,
        year: student.year,
        phone: student.phone
      });
      setErrors({});
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'year' ? parseInt(value) : value }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!validatePhone(formData.phone)) newErrors.phone = 'Invalid phone number';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    try {
      setSubmitting(true);
      const res = await studentApi.updateProfile(formData);
      setStudent(res.data);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="py-12"><LoadingSpinner size="lg" /></div>;
  if (!student) return <div className="py-12 text-center text-gray-500">Profile not found</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
      </div>
      
      {!isEditing ? (
        <ProfileCard student={student} onEdit={handleEditToggle} />
      ) : (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Edit Profile</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              label="Full Name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
            />
            <FormField
              label="Department"
              name="department"
              required
              value={formData.department}
              onChange={handleChange}
              error={errors.department}
            />
            <FormField
              as="select"
              label="Year"
              name="year"
              required
              options={[
                { label: '1st Year', value: 1 },
                { label: '2nd Year', value: 2 },
                { label: '3rd Year', value: 3 },
                { label: '4th Year', value: 4 },
              ]}
              value={formData.year}
              onChange={handleChange}
            />
            <FormField
              label="Phone Number"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
            />
            
            <div className="pt-4 flex justify-end space-x-3 border-t border-gray-200">
              <button
                type="button"
                onClick={handleEditToggle}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default StudentProfile;
