import React, { memo } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = memo(() => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="bg-indigo-600 shadow-md">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <svg 
                className="h-8 w-8 text-white" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
                />
              </svg>
              <span className="ml-2 text-white font-bold text-xl">EduConnect</span>
            </Link>
          </div>

          {/* Navigation links on the right */}
          <div className="hidden md:flex space-x-8">
            <Link 
              to="/" 
              className={`transition-colors duration-200 font-medium ${
                isActive('/') 
                  ? 'text-indigo-200 border-b-2 border-indigo-200 pb-1' 
                  : 'text-white hover:text-indigo-200'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/student" 
              className={`transition-colors duration-200 font-medium ${
                isActive('/student') 
                  ? 'text-indigo-200 border-b-2 border-indigo-200 pb-1' 
                  : 'text-white hover:text-indigo-200'
              }`}
            >
              Student
            </Link>
            <Link 
              to="/alumni" 
              className={`transition-colors duration-200 font-medium ${
                isActive('/alumni') 
                  ? 'text-indigo-200 border-b-2 border-indigo-200 pb-1' 
                  : 'text-white hover:text-indigo-200'
              }`}
            >
              Alumni
            </Link>
          </div>

          {/* Mobile menu button (optional) */}
          <div className="md:hidden">
            <button className="text-white focus:outline-none">
              <svg 
                className="h-6 w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 6h16M4 12h16M4 18h16" 
                />
              </svg>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
});

Navbar.displayName = "Navbar";

export default Navbar;