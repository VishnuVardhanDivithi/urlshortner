import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, User, Link as LinkIcon } from 'lucide-react';
import { AuthContext } from '../App';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, setUser, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('user');
    
    // Update auth context
    setUser(null);
    
    // Close user menu
    setIsUserMenuOpen(false);
  };

  const scrollToSection = (id: string) => {
    // Navigate to home page first if not already there
    if (window.location.pathname !== '/') {
      navigate('/');
      // Need to wait for navigation to complete before scrolling
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      // Already on home page, just scroll
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    
    // Close mobile menu if open
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-teal-700 flex items-center justify-center mr-2">
              <LinkIcon className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Link<span className="text-indigo-600">Shrink</span></span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-600 hover:text-indigo-600 font-bold">
              Home
            </Link>
            <button 
              onClick={() => scrollToSection('features')} 
              className="text-gray-600 hover:text-indigo-600 font-bold"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection('analytics')} 
              className="text-gray-600 hover:text-indigo-600 font-bold"
            >
              Analytics
            </button>
            <button 
              onClick={() => scrollToSection('faq')} 
              className="text-gray-600 hover:text-indigo-600 font-bold"
            >
              FAQ
            </button>
            
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center text-gray-600 hover:text-indigo-600 font-medium focus:outline-none"
                >
                  <span className="mr-1 font-bold text-lg">{user?.email?.split('@')[0] || 'User'}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-bold"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Your Profile
                    </Link>
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-bold"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-bold"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-bold"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/signin"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-md font-medium hover:from-indigo-700 hover:to-purple-700"
              >
                Sign In
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-600 hover:text-indigo-600 focus:outline-none"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4">
              <Link
                to="/"
                className="text-gray-600 hover:text-indigo-600 font-bold"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <button
                onClick={() => scrollToSection('features')}
                className="text-gray-600 hover:text-indigo-600 font-bold text-left"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('analytics')}
                className="text-gray-600 hover:text-indigo-600 font-bold text-left"
              >
                Analytics
              </button>
              <button
                onClick={() => scrollToSection('faq')}
                className="text-gray-600 hover:text-indigo-600 font-bold text-left"
              >
                FAQ
              </button>
              
              {isAuthenticated ? (
                <div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center mb-4">
                      <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
                        <User className="h-4 w-4 text-indigo-600" />
                      </div>
                      <span className="font-bold text-lg">{user?.email || 'User'}</span>
                    </div>
                    <div className="space-y-2">
                      <Link
                        to="/profile"
                        className="block text-gray-600 hover:text-indigo-600 font-bold"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Your Profile
                      </Link>
                      <Link
                        to="/dashboard"
                        className="block text-gray-600 hover:text-indigo-600 font-bold"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/settings"
                        className="block text-gray-600 hover:text-indigo-600 font-bold"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block text-gray-600 hover:text-indigo-600 font-bold text-left"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  to="/signin"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-md font-medium hover:from-indigo-700 hover:to-purple-700 inline-block"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;