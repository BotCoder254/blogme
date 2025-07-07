import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import FormInput from '../ui/FormInput';
import Button from '../ui/Button';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { resetPassword } = useAuth();

  const handleChange = (e) => {
    setEmail(e.target.value);
    setError('');
  };

  const validateForm = () => {
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      setError('Invalid email address');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      await resetPassword(email);
      setIsSuccess(true);
    } catch (error) {
      setError(error.message || 'Failed to send password reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto p-6"
    >
      <div className="card">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-dark-700">Reset Password</h2>
          <p className="text-dark-400 mt-2">
            Enter your email and we'll send you a link to reset your password
          </p>
        </div>

        {isSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="bg-primary-50 text-primary-700 p-4 rounded-lg mb-6">
              <svg
                className="mx-auto h-12 w-12 text-primary-500 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <h3 className="text-lg font-medium text-primary-800 mb-2">Check your email</h3>
              <p className="text-primary-600">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
            </div>
            <p className="text-dark-500 mb-4">
              Didn't receive the email? Check your spam folder or try again.
            </p>
            <div className="flex space-x-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsSuccess(false)}
              >
                Try Again
              </Button>
              <Link to="/login" className="flex-1">
                <Button variant="primary" className="w-full">
                  Back to Login
                </Button>
              </Link>
            </div>
          </motion.div>
        ) : (
          <>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit}>
              <FormInput
                id="email"
                label="Email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={handleChange}
                error={error}
                required
                autoComplete="email"
                icon={FiMail}
              />

              <div className="mt-6">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  isLoading={isLoading}
                >
                  Send Reset Link
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                <FiArrowLeft className="mr-1" />
                Back to login
              </Link>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default ForgotPassword; 