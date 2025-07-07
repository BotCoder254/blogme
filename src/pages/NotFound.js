import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiHome } from 'react-icons/fi';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="container mx-auto px-4 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-lg mx-auto"
        >
          <div className="mb-8">
            <motion.h1 
              className="text-8xl font-bold text-primary-500 mb-4"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              404
            </motion.h1>
            <h2 className="text-3xl font-bold mb-4">Page Not Found</h2>
            <p className="text-dark-500 mb-8">
              The page you are looking for doesn't exist or has been moved.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link 
              to="/" 
              className="btn btn-primary flex items-center justify-center w-full sm:w-auto"
            >
              <FiHome className="mr-2" /> Go to Home
            </Link>
            <button 
              onClick={() => window.history.back()} 
              className="btn btn-outline flex items-center justify-center w-full sm:w-auto"
            >
              <FiArrowLeft className="mr-2" /> Go Back
            </button>
          </div>
          
          <div className="mt-12">
            <h3 className="text-lg font-semibold mb-4">Looking for something else?</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/blogs" className="text-primary-600 hover:text-primary-700">
                Browse Blogs
              </Link>
              <Link to="/dashboard" className="text-primary-600 hover:text-primary-700">
                Dashboard
              </Link>
              <Link to="/new-post" className="text-primary-600 hover:text-primary-700">
                Create New Post
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound; 