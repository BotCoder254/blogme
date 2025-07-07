import React from 'react';
import { Link } from 'react-router-dom';
import { FiGithub, FiTwitter, FiLinkedin, FiFacebook } from 'react-icons/fi';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="inline-block">
              <h2 className="text-2xl font-bold text-gradient">BlogMe</h2>
            </Link>
            <p className="mt-4 text-dark-500 max-w-md">
              A modern, open-source, self-hosted blog platform. Create and share your thoughts with the world using our beautiful and responsive platform.
            </p>
            <div className="mt-6 flex space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-dark-400 hover:text-primary-500 transition-colors"
                aria-label="GitHub"
              >
                <FiGithub className="h-6 w-6" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-dark-400 hover:text-primary-500 transition-colors"
                aria-label="Twitter"
              >
                <FiTwitter className="h-6 w-6" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-dark-400 hover:text-primary-500 transition-colors"
                aria-label="LinkedIn"
              >
                <FiLinkedin className="h-6 w-6" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-dark-400 hover:text-primary-500 transition-colors"
                aria-label="Facebook"
              >
                <FiFacebook className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-dark-700 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-dark-500 hover:text-primary-500 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/blogs" className="text-dark-500 hover:text-primary-500 transition-colors">
                  Blogs
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-dark-500 hover:text-primary-500 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-dark-500 hover:text-primary-500 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold text-dark-700 mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy" className="text-dark-500 hover:text-primary-500 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-dark-500 hover:text-primary-500 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-dark-500 hover:text-primary-500 transition-colors">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-dark-500 text-sm">
              &copy; {currentYear} BlogMe. All rights reserved.
            </p>
            <p className="text-dark-500 text-sm mt-2 md:mt-0">
              Made with ❤️ by <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:underline">Your Name</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;