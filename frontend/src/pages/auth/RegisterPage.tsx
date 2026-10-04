import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FormField } from '../../components/common/FormField';
import useAuth from '../../hooks/useAuth';
import { validateEmail, validatePassword, validatePhone, validateRegisterNumber } from '../../utils/validators';
import { User, Camera } from 'lucide-react';

const DEPARTMENT_OPTIONS = [
  { label: 'Select Department', value: '' },
  { label: 'CSE - Computer Science and Engineering', value: 'CSE' },
  { label: 'IT - Information Technology', value: 'IT' },
  { label: 'AIDS - AI and Data Science', value: 'AIDS' },
  { label: 'AIML - AI and Machine Learning', value: 'AIML' },
  { label: 'Medical Electronics', value: 'Medical Electronics' },
  { label: 'Biomedical Engineering', value: 'Biomedical' },
  { label: 'ECE - Electronics and Communication Engineering', value: 'ECE' },
  { label: 'EEE - Electrical and Electronics Engineering', value: 'EEE' },
  { label: 'Civil Engineering', value: 'Civil' },
  { label: 'CSE - Cyber Security', value: 'CSE - Cyber Security' },
  { label: 'IoT - Internet of Things', value: 'IoT' },
  { label: 'Agriculture Engineering', value: 'Agriculture' },
  { label: 'MBA - Master of Business Administration', value: 'MBA' }
];

export const RegisterPage: React.FC = () => {
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const portal = searchParams.get('portal');

  const initialGender = portal === 'girls' ? 'FEMALE' : 'MALE';

  const [formData, setFormData] = useState({
    name: '',
    registerNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    year: 1,
    phone: '',
    gender: initialGender
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' ? parseInt(value) : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!validateRegisterNumber(formData.registerNumber)) newErrors.registerNumber = 'Invalid register number';
    if (!validateEmail(formData.email)) newErrors.email = 'Invalid email address';
    if (!validatePassword(formData.password)) newErrors.password = 'Password must be 8+ chars with upper, lower, and number';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!validatePhone(formData.phone)) newErrors.phone = 'Invalid phone number';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const success = await register(formData);
    if (success) {
      navigate(portal ? `/login?portal=${portal}` : '/login');
    }
  };

  const isGirls = portal === 'girls' || formData.gender === 'FEMALE';

  return (
    <div>
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {portal === 'boys' ? 'Boys Hostel Registration' : portal === 'girls' ? 'Girls Hostel Registration' : 'Student Registration'}
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          {portal === 'boys' ? 'Registering for SEC Boys Hostel Portal' : portal === 'girls' ? 'Registering for SEC Girls Hostel Portal' : 'Register your account for SEC Hostel Allocation'}
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Photo Upload Component */}
        <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
          <div className="w-14 h-14 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg border border-indigo-200 flex-shrink-0">
            {photoPreview ? (
              <img src={photoPreview} alt="Student Preview" className="w-full h-full object-cover" />
            ) : (
              formData.name ? formData.name.charAt(0).toUpperCase() : <User className="w-6 h-6 text-gray-400" />
            )}
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-700 flex items-center gap-1">
              <Camera className="w-3.5 h-3.5 text-gray-500" /> Student Photo (Optional)
            </label>
            <p className="text-[11px] text-gray-400 mb-1">Passport-size image for hostel ID records.</p>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="text-xs text-gray-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
            />
          </div>
        </div>

        <FormField
          label="Full Name"
          name="name"
          required
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Register Number"
            name="registerNumber"
            required
            value={formData.registerNumber}
            onChange={handleChange}
            error={errors.registerNumber}
          />
          <FormField
            label="Email Address"
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Password"
            type="password"
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
          />
          <FormField
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            as="select"
            label="Department"
            name="department"
            required
            options={DEPARTMENT_OPTIONS}
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
            as="select"
            label="Gender"
            name="gender"
            required
            options={[
              { label: 'Male (Boys Hostel)', value: 'MALE' },
              { label: 'Female (Girls Hostel)', value: 'FEMALE' },
            ]}
            value={formData.gender}
            onChange={handleChange}
          />
        </div>

        <FormField
          label="Phone Number"
          name="phone"
          required
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone}
        />

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${
              isGirls
                ? 'bg-fuchsia-600 hover:bg-fuchsia-700 focus:ring-fuchsia-500'
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
            }`}
          >
            {isLoading ? 'Registering...' : `Complete ${portal === 'girls' ? 'Girls' : portal === 'boys' ? 'Boys' : ''} Registration`}
          </button>
        </div>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            to={portal ? `/login?portal=${portal}` : '/login'}
            className={`font-semibold ${isGirls ? 'text-fuchsia-600 hover:text-fuchsia-500' : 'text-blue-600 hover:text-blue-500'}`}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
