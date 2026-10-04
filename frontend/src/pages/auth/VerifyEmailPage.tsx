import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { CheckCircle, XCircle } from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Verification token is missing.');
        return;
      }
      try {
        await authApi.verifyEmail(token);
        setStatus('success');
        setMessage('Your email has been successfully verified! You can now log in.');
      } catch (error: any) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Email verification failed. The token might be invalid or expired.');
      }
    };
    verify();
  }, [token]);

  return (
    <div className="text-center py-8">
      {status === 'loading' && (
        <>
          <LoadingSpinner size="lg" className="mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Verifying your email...</h3>
        </>
      )}
      
      {status === 'success' && (
        <>
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Verification Successful!</h3>
          <p className="text-gray-600 mb-6">{message}</p>
          <Link
            to="/login"
            className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Go to Login
          </Link>
        </>
      )}

      {status === 'error' && (
        <>
          <XCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Verification Failed</h3>
          <p className="text-gray-600 mb-6">{message}</p>
          <Link
            to="/login"
            className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Return to Login
          </Link>
        </>
      )}
    </div>
  );
};

export default VerifyEmailPage;
