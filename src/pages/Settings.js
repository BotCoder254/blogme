import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { FiUser, FiMail, FiLock, FiImage, FiX, FiLoader } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import Parse from '../services/parseConfig';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Button from '../components/ui/Button';
import FormInput from '../components/ui/FormInput';

const Settings = () => {
  const { currentUser, updateProfile } = useAuth();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    username: currentUser ? currentUser.get('username') || '' : '',
    email: currentUser ? currentUser.get('email') || '' : '',
    fullName: currentUser ? currentUser.get('fullName') || '' : '',
    bio: currentUser ? currentUser.get('bio') || '' : '',
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(
    currentUser && currentUser.get('profileImage') 
      ? currentUser.get('profileImage').url() 
      : ''
  );
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('profile');

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Handle password form input changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (passwordErrors[name]) {
      setPasswordErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Handle image drop
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setProfileImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Clear error if exists
      if (errors.profileImage) {
        setErrors((prev) => ({ ...prev, profileImage: '' }));
      }
    }
  }, [errors]);

  // Configure dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/gif': [],
    },
    maxSize: 5242880, // 5MB
    multiple: false,
  });

  // Validate profile form
  const validateProfileForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate password form
  const validatePasswordForm = () => {
    const newErrors = {};
    
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (userData) => {
      const user = Parse.User.current();
      
      // Update user properties
      user.set('username', userData.username);
      user.set('email', userData.email);
      user.set('fullName', userData.fullName);
      user.set('bio', userData.bio);
      
      // Upload profile image if exists
      if (userData.profileImage) {
        const parseFile = new Parse.File(userData.profileImage.name, userData.profileImage);
        
        // Upload the file with progress tracking
        await parseFile.save({
          progress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
        });
        
        user.set('profileImage', parseFile);
      }
      
      // Save the user
      return await user.save();
    },
    onSuccess: (data) => {
      // Update the auth context
      updateProfile(data);
      
      // Invalidate queries that might use the user data
      queryClient.invalidateQueries(['currentUser']);
      
      setErrors({
        success: 'Profile updated successfully',
      });
    },
    onError: (error) => {
      setErrors({
        general: error.message || 'Failed to update profile. Please try again.',
      });
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (passwordData) => {
      const user = Parse.User.current();
      
      // First verify the current password
      try {
        await Parse.User.logIn(user.get('username'), passwordData.currentPassword);
      } catch (error) {
        throw new Error('Current password is incorrect');
      }
      
      // Set the new password
      user.set('password', passwordData.newPassword);
      
      // Save the user
      return await user.save();
    },
    onSuccess: () => {
      setPasswordErrors({
        success: 'Password changed successfully',
      });
      
      // Clear password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    },
    onError: (error) => {
      setPasswordErrors({
        general: error.message || 'Failed to change password. Please try again.',
      });
    },
  });

  // Handle profile form submission
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateProfileForm()) return;
    
    await updateProfileMutation.mutate({
      ...formData,
      profileImage,
    });
  };

  // Handle password form submission
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) return;
    
    await changePasswordMutation.mutate(passwordData);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FiLoader className="animate-spin h-12 w-12 text-primary-500 mx-auto mb-4" />
          <p className="text-dark-500">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-dark-700 mb-2">Account Settings</h1>
            <p className="text-dark-500">Manage your account preferences and profile information</p>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-soft overflow-hidden">
            <div className="flex border-b border-gray-200">
              <button
                className={`px-6 py-4 font-medium ${
                  activeTab === 'profile'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-dark-500 hover:text-dark-700'
                }`}
                onClick={() => setActiveTab('profile')}
              >
                Profile
              </button>
              <button
                className={`px-6 py-4 font-medium ${
                  activeTab === 'password'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-dark-500 hover:text-dark-700'
                }`}
                onClick={() => setActiveTab('password')}
              >
                Password
              </button>
            </div>

            <div className="p-6">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <>
                  {errors.success && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-green-50 text-green-600 p-4 rounded-lg mb-6"
                    >
                      {errors.success}
                    </motion.div>
                  )}

                  {errors.general && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-50 text-red-600 p-4 rounded-lg mb-6"
                    >
                      {errors.general}
                    </motion.div>
                  )}

                  <form onSubmit={handleProfileSubmit}>
                    {/* Profile Image */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-dark-600 mb-2">
                        Profile Picture
                      </label>
                      <div className="flex items-center">
                        <div className="mr-6">
                          {profileImagePreview ? (
                            <img
                              src={profileImagePreview}
                              alt="Profile"
                              className="w-24 h-24 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-2xl font-semibold">
                              {formData.username.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="flex-grow">
                          <div
                            {...getRootProps()}
                            className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                              isDragActive ? 'border-primary-400 bg-primary-50' : 'border-gray-300 hover:border-primary-400'
                            }`}
                          >
                            <input {...getInputProps()} />
                            <div className="space-y-1">
                              <FiImage className="mx-auto h-8 w-8 text-gray-400" />
                              <p className="text-dark-500 text-sm">
                                {isDragActive
                                  ? 'Drop the image here'
                                  : 'Drag & drop an image here, or click to select'}
                              </p>
                              <p className="text-xs text-dark-400">
                                PNG, JPG, GIF up to 5MB
                              </p>
                            </div>
                          </div>

                          {/* Upload Progress */}
                          {updateProfileMutation.isLoading && uploadProgress > 0 && (
                            <div className="mt-2">
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <motion.div
                                  className="bg-primary-500 h-2.5 rounded-full"
                                  initial={{ width: '0%' }}
                                  animate={{ width: `${uploadProgress}%` }}
                                ></motion.div>
                              </div>
                              <p className="text-xs text-dark-500 mt-1">
                                Uploading: {uploadProgress}%
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Username */}
                    <FormInput
                      id="username"
                      label="Username"
                      type="text"
                      placeholder="Your username"
                      value={formData.username}
                      onChange={handleChange}
                      error={errors.username}
                      required
                      icon={FiUser}
                    />

                    {/* Email */}
                    <FormInput
                      id="email"
                      label="Email"
                      type="email"
                      placeholder="Your email address"
                      value={formData.email}
                      onChange={handleChange}
                      error={errors.email}
                      required
                      icon={FiMail}
                    />

                    {/* Full Name */}
                    <FormInput
                      id="fullName"
                      label="Full Name"
                      type="text"
                      placeholder="Your full name"
                      value={formData.fullName}
                      onChange={handleChange}
                      error={errors.fullName}
                    />

                    {/* Bio */}
                    <div className="mb-6">
                      <label htmlFor="bio" className="block text-sm font-medium text-dark-600 mb-1">
                        Bio
                      </label>
                      <textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        rows="4"
                        className="input resize-none"
                        placeholder="Tell us about yourself"
                      ></textarea>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        variant="primary"
                        isLoading={updateProfileMutation.isLoading}
                      >
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </>
              )}

              {/* Password Tab */}
              {activeTab === 'password' && (
                <>
                  {passwordErrors.success && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-green-50 text-green-600 p-4 rounded-lg mb-6"
                    >
                      {passwordErrors.success}
                    </motion.div>
                  )}

                  {passwordErrors.general && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-50 text-red-600 p-4 rounded-lg mb-6"
                    >
                      {passwordErrors.general}
                    </motion.div>
                  )}

                  <form onSubmit={handlePasswordSubmit}>
                    <FormInput
                      id="currentPassword"
                      label="Current Password"
                      type="password"
                      placeholder="Enter your current password"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      error={passwordErrors.currentPassword}
                      required
                      icon={FiLock}
                    />

                    <FormInput
                      id="newPassword"
                      label="New Password"
                      type="password"
                      placeholder="Enter your new password"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      error={passwordErrors.newPassword}
                      required
                      icon={FiLock}
                    />

                    <FormInput
                      id="confirmPassword"
                      label="Confirm New Password"
                      type="password"
                      placeholder="Confirm your new password"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      error={passwordErrors.confirmPassword}
                      required
                      icon={FiLock}
                    />

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        variant="primary"
                        isLoading={changePasswordMutation.isLoading}
                      >
                        Change Password
                      </Button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 