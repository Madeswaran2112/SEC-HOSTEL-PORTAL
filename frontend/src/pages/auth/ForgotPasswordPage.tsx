import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FormField } from '../../components/common/FormField';
import { authApi } from '../../api/authApi';
import toast from 'react-hot-toast';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setIsLoading(true);
      await authApi.forgotPassword(email);
      setIsSuccess(true);
      toast.success('Password reset link sent to your email');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send reset link');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-6">
        <h2 className="text-center text-2xl font-bold text-gray-900">Reset your password</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      {isSuccess ? (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 text-center">
          <p className="text-green-800 font-medium mb-4">
            Check your email for a link to reset your password. If it doesn't appear within a few minutes, check your spam folder.
          </p>
          <Link to="/login" className="text-indigo-600 font-medium hover:text-indigo-500">
            Return to login
          </Link>
        </div>
      ) : (
        <form className="space-y-6" onSubmit={handleSubmit}>
          <FormField
            label="Email address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Sending...' : 'Send reset link'}
            </button>
          </div>
          
          <div className="text-center mt-4">
            <Link to="/login" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              Back to login
            </Link>
          </div>
        </form>
      )}
    </div>
  );
};

export default ForgotPasswordPage;
