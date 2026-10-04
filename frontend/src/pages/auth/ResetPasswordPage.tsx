import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { FormField } from '../../components/common/FormField';
import { authApi } from '../../api/authApi';
import { validatePassword } from '../../utils/validators';
import toast from 'react-hot-toast';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!token) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-bold text-red-600 mb-4">Invalid Reset Link</h2>
        <p className="text-gray-600 mb-6">The password reset link is missing or invalid.</p>
        <Link to="/forgot-password" className="text-indigo-600 font-medium hover:text-indigo-500">
          Request a new link
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters with upper, lower, and number');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setIsLoading(true);
      await authApi.resetPassword(token, password);
      toast.success('Password has been successfully reset');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password. The token may be expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-6">
        <h2 className="text-center text-2xl font-bold text-gray-900">Choose a new password</h2>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm border border-red-200 mb-4">
            {error}
          </div>
        )}

        <FormField
          label="New Password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        
        <FormField
          label="Confirm New Password"
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
