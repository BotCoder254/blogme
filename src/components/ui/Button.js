import React from 'react';
import { Link } from 'react-router-dom';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  isLoading = false, 
  disabled = false, 
  type = 'button',
  href = null,
  to = null,
  onClick = null,
  ...props 
}) => {
  // Base classes
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };
  
  // Variant classes
  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 disabled:bg-primary-300',
    secondary: 'bg-dark-600 text-white hover:bg-dark-700 focus:ring-dark-500 disabled:bg-dark-300',
    outline: 'border border-gray-300 text-dark-700 bg-white hover:bg-gray-50 focus:ring-primary-500 disabled:bg-gray-100 disabled:text-gray-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300',
    ghost: 'bg-transparent text-dark-600 hover:bg-gray-100 focus:ring-primary-500 disabled:text-gray-400'
  };
  
  // Combined classes
  const classes = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className} ${disabled || isLoading ? 'cursor-not-allowed' : ''}`;
  
  // Loading spinner
  const LoadingSpinner = () => (
    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
  
  // Render as Link if 'to' prop is provided
  if (to) {
    return (
      <Link
        to={to}
        className={classes}
        {...props}
      >
        {isLoading && <LoadingSpinner />}
        {children}
      </Link>
    );
  }
  
  // Render as anchor tag if 'href' prop is provided
  if (href) {
    return (
      <a
        href={href}
        className={classes}
        {...props}
      >
        {isLoading && <LoadingSpinner />}
        {children}
      </a>
    );
  }
  
  // Render as button by default
  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...props}
    >
      {isLoading && <LoadingSpinner />}
      {children}
    </button>
  );
};

export default Button; 