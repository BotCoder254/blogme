import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiLock } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import FormInput from '../ui/FormInput';
import Button from '../ui/Button';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing again
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      await login(formData.username, formData.password);
      navigate('/dashboard');
    } catch (error) {
      setErrors({
        general: error.message || 'Login failed. Please check your credentials.',
      });
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
          <h2 className="text-3xl font-bold text-dark-700">Welcome Back</h2>
          <p className="text-dark-400 mt-2">Sign in to continue to your account</p>
        </div>

        {errors.general && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm"
          >
            {errors.general}
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          <FormInput
            id="username"
            label="Username"
            type="text"
            placeholder="Enter your username"
            value={formData.username}
            onChange={handleChange}
            error={errors.username}
            required
            autoComplete="username"
            icon={FiUser}
          />

          <FormInput
            id="password"
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            required
            autoComplete="current-password"
            icon={FiLock}
          />

          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-dark-500">
                Remember me
              </label>
            </div>
            
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-primary-600 hover:text-primary-500"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={isLoading}
          >
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-dark-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default Login; 