import React, { memo, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Auth from '../../hooks/auth';

const Navbar = memo(() => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, [location]);

  const checkAuthStatus = () => {
    const auth = new Auth();
    const authenticated = auth.isAuthenticated();
    const role = localStorage.getItem('role');
    const profileStatus = localStorage.getItem('has_profile');
    
    setIsAuthenticated(authenticated);
    setUserRole(role);
    setHasProfile(profileStatus === 'true');
  };

  const handleLogout = () => {
    const auth = new Auth();
    auth.logout();
    setIsAuthenticated(false);
    setUserRole(null);
    setHasProfile(false);
    setMobileMenuOpen(false);
    navigate('/');
    window.location.reload();
  };

  const isActive = (path) => location.pathname === path;

  const NavLink = ({ to, children, mobile = false }) => (
    <Link 
      to={to}
      onClick={() => setMobileMenuOpen(false)}
      className={`transition-colors duration-200 font-medium ${
        isActive(to) 
          ? 'text-indigo-200 border-b-2 border-indigo-200 pb-1' 
          : 'text-white hover:text-indigo-200'
      } ${mobile ? 'block py-2 text-base' : ''}`}
    >
      {children}
    </Link>
  );

  const NavButton = ({ onClick, children, mobile = false }) => (
    <button 
      onClick={onClick}
      className={`transition-colors duration-200 font-medium text-white hover:text-indigo-200 ${
        mobile ? 'block w-full text-left py-2 text-base' : ''
      }`}
    >
      {children}
    </button>
  );

  // Clean role for display
  const cleanRole = userRole ? userRole.replace(/"/g, '').trim() : '';
  const isStudent = cleanRole === 'STUDENT';
  const isAlumni = cleanRole === 'ALUMNI';

  return (
    <div className="bg-indigo-600 shadow-lg sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-white rounded-lg p-1">
                <svg 
                  className="h-6 w-6 text-indigo-600" 
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
              </div>
              <span className="text-white font-bold text-xl">EduConnect</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-6 items-center">
            <NavLink to="/">Home</NavLink>
            
            {isAuthenticated ? (
              <>
                {/* Common Links for All Authenticated Users */}
                <NavLink to="/search">Browse Jobs</NavLink>

                {/* Student Specific Navigation */}
                {isStudent && (
                  <>
                    <NavLink to="/my-applications">My Applications</NavLink>
                    {hasProfile ? (
                      <NavLink to="/profile">My Profile</NavLink>
                    ) : (
                      <Link 
                        to="/profile/create" 
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        Complete Profile
                      </Link>
                    )}
                  </>
                )}

                {/* Alumni Specific Navigation */}
                {isAlumni && (
                  <>
                    <div className="flex items-center space-x-4">
                      <Link 
                        to="/jobs/create" 
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Post Job</span>
                      </Link>
                      <NavLink to="/my-jobs">My Jobs</NavLink>
                    </div>
                    {hasProfile ? (
                      <NavLink to="/profile">My Profile</NavLink>
                    ) : (
                      <Link 
                        to="/profile/create" 
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        Complete Profile
                      </Link>
                    )}
                  </>
                )}

                {/* User Info & Logout */}
                <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-indigo-500">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      isStudent ? 'bg-green-400' : 'bg-blue-400'
                    }`}></div>
                    <span className="text-indigo-200 text-sm capitalize">
                      {cleanRole?.toLowerCase()}
                    </span>
                  </div>
                  <NavButton onClick={handleLogout}>Logout</NavButton>
                </div>
              </>
            ) : (
              <>
                <NavLink to="/login">Login</NavLink>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white focus:outline-none p-2"
            >
              <svg 
                className="h-6 w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                ) : (
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 6h16M4 12h16M4 18h16" 
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-indigo-700 border-t border-indigo-500 py-4">
            <div className="flex flex-col space-y-3 px-4">
              <NavLink to="/" mobile>Home</NavLink>
              
              {isAuthenticated ? (
                <>
                  <NavLink to="/search" mobile>Browse Jobs</NavLink>

                  {/* Student Specific Mobile Navigation */}
                  {isStudent && (
                    <>
                      <NavLink to="/my-applications" mobile>My Applications</NavLink>
                      {hasProfile ? (
                        <NavLink to="/profile" mobile>My Profile</NavLink>
                      ) : (
                        <Link 
                          to="/profile/create" 
                          onClick={() => setMobileMenuOpen(false)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md text-sm font-medium text-center transition-colors"
                        >
                          Complete Profile
                        </Link>
                      )}
                    </>
                  )}

                  {/* Alumni Specific Mobile Navigation */}
                  {isAlumni && (
                    <>
                      <Link 
                        to="/jobs/create" 
                        onClick={() => setMobileMenuOpen(false)}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium text-center transition-colors flex items-center justify-center space-x-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Post Job</span>
                      </Link>
                      <NavLink to="/my-jobs" mobile>My Jobs</NavLink>
                      {hasProfile ? (
                        <NavLink to="/profile" mobile>My Profile</NavLink>
                      ) : (
                        <Link 
                          to="/profile/create" 
                          onClick={() => setMobileMenuOpen(false)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md text-sm font-medium text-center transition-colors"
                        >
                          Complete Profile
                        </Link>
                      )}
                    </>
                  )}

                  <div className="pt-3 border-t border-indigo-500">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className={`w-2 h-2 rounded-full ${
                        isStudent ? 'bg-green-400' : 'bg-blue-400'
                      }`}></div>
                      <div className="text-indigo-200 text-sm">
                        Role: {cleanRole?.toLowerCase()}
                      </div>
                    </div>
                    <NavButton onClick={handleLogout} mobile>Logout</NavButton>
                  </div>
                </>
              ) : (
                <>
                  <NavLink to="/login" mobile>Login</NavLink>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </div>
  );
});

Navbar.displayName = "Navbar";

export default Navbar;