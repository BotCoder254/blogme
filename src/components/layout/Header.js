import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiUser, FiLogOut, FiSettings, FiEdit } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { currentUser, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (isUserMenuOpen) setIsUserMenuOpen(false);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
    if (isMenuOpen) setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-2xl font-bold text-gradient"
            >
              BlogMe
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-dark-600 hover:text-primary-500 transition-colors">
              Home
            </Link>
            <Link to="/blogs" className="text-dark-600 hover:text-primary-500 transition-colors">
              Blogs
            </Link>
            <Link to="/about" className="text-dark-600 hover:text-primary-500 transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-dark-600 hover:text-primary-500 transition-colors">
              Contact
            </Link>
          </nav>

          {/* Auth Buttons or User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                    {currentUser.get('username').charAt(0).toUpperCase()}
                  </div>
                  <span className="text-dark-600 font-medium">
                    {currentUser.get('username')}
                  </span>
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50"
                    >
                      <Link
                        to="/dashboard"
                        className="block px-4 py-2 text-dark-600 hover:bg-primary-50 hover:text-primary-600"
                      >
                        <div className="flex items-center">
                          <FiUser className="mr-2" />
                          Dashboard
                        </div>
                      </Link>
                      <Link
                        to="/new-post"
                        className="block px-4 py-2 text-dark-600 hover:bg-primary-50 hover:text-primary-600"
                      >
                        <div className="flex items-center">
                          <FiEdit className="mr-2" />
                          New Post
                        </div>
                      </Link>
                      <Link
                        to="/settings"
                        className="block px-4 py-2 text-dark-600 hover:bg-primary-50 hover:text-primary-600"
                      >
                        <div className="flex items-center">
                          <FiSettings className="mr-2" />
                          Settings
                        </div>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-dark-600 hover:bg-primary-50 hover:text-primary-600"
                      >
                        <div className="flex items-center">
                          <FiLogOut className="mr-2" />
                          Logout
                        </div>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-dark-600 hover:text-primary-500 font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-dark-600 focus:outline-none"
            onClick={toggleMenu}
          >
            {isMenuOpen ? (
              <FiX className="h-6 w-6" />
            ) : (
              <FiMenu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden mt-4"
            >
              <nav className="flex flex-col space-y-4 py-4">
                <Link
                  to="/"
                  className="text-dark-600 hover:text-primary-500 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  to="/blogs"
                  className="text-dark-600 hover:text-primary-500 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Blogs
                </Link>
                <Link
                  to="/about"
                  className="text-dark-600 hover:text-primary-500 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  to="/contact"
                  className="text-dark-600 hover:text-primary-500 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                </Link>

                {isAuthenticated ? (
                  <>
                    <hr className="border-gray-200" />
                    <Link
                      to="/dashboard"
                      className="text-dark-600 hover:text-primary-500 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/new-post"
                      className="text-dark-600 hover:text-primary-500 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      New Post
                    </Link>
                    <Link
                      to="/settings"
                      className="text-dark-600 hover:text-primary-500 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="text-left text-dark-600 hover:text-primary-500 transition-colors"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <hr className="border-gray-200" />
                    <Link
                      to="/login"
                      className="text-dark-600 hover:text-primary-500 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="btn btn-primary inline-block text-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;