import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Menu, X, Car, LogIn, User, LogOut, Heart } from 'lucide-react';
import { useI18n } from '../hooks/useI18n';
import { useAuth } from '../hooks/useAuth';
import LanguageSwitcher from './LanguageSwitcher';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { t } = useI18n();
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const scrollToSection = (sectionId) => {
    // If not on homepage, navigate there first
    if (window.location.pathname !== '/') {
      navigate('/');
      // Wait for navigation and scroll
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    navigate('/');
  };

  const navItems = [
    { label: t('navigation.offers'), id: 'offers' },
    { label: t('navigation.drop'), id: 'drop' },
    { label: t('navigation.coverage'), id: 'coverage' },
    { label: t('navigation.how_it_works'), id: 'how-it-works' },
    { label: t('navigation.trust'), id: 'trust' },
    { label: t('navigation.reviews'), id: 'reviews' },
    { label: t('navigation.credit'), id: 'credit' },
    { label: t('navigation.faq'), id: 'faq' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-red-600 p-2 rounded-lg">
              <Car className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">hunter.lease</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            <Link to="/deals" className="text-gray-600 hover:text-red-600 font-medium transition-colors">
              Deals
            </Link>
            <Link to="/my-favorites" className="text-gray-600 hover:text-red-600 font-medium transition-colors">
              My Favorites
            </Link>
            <Link to="/about" className="text-gray-600 hover:text-red-600 font-medium transition-colors">
              About
            </Link>
            <Link to="/services" className="text-gray-600 hover:text-red-600 font-medium transition-colors">
              Services
            </Link>
            <Link to="/reviews" className="text-gray-600 hover:text-red-600 font-medium transition-colors">
              Reviews
            </Link>
            <Link to="/contact" className="text-gray-600 hover:text-red-600 font-medium transition-colors">
              Contact
            </Link>
          </nav>

          {/* Desktop CTA + Language Switcher + Auth */}
          <div className="hidden lg:flex items-center gap-3">
            <LanguageSwitcher />
            
            {isAuthenticated ? (
              <div className="relative">
                <Button
                  variant="outline"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  {user?.name || user?.email}
                </Button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <Link
                      to={isAdmin ? "/admin" : "/dashboard"}
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      {isAdmin ? 'Admin Panel' : 'My Dashboard'}
                    </Link>
                    <Link
                      to="/my-favorites"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Heart className="w-4 h-4" />
                      My Favorites
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/auth">
                <Button 
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Button>
              </Link>
            )}
            
            <Link to="/deals">
              <Button 
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300"
              >
                View Deals
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            <LanguageSwitcher className="mr-2" />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-2 px-4">
              <Link 
                to="/deals" 
                className="py-3 px-4 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Deals
              </Link>
              <Link 
                to="/about"
                className="py-3 px-4 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                to="/services"
                className="py-3 px-4 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Services
              </Link>
              <Link 
                to="/reviews"
                className="py-3 px-4 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Reviews
              </Link>
              <Link 
                to="/contact"
                className="py-3 px-4 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              
              {/* Auth Section - Mobile */}
              <div className="pt-4 mt-4 border-t border-gray-200">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <Link
                      to={isAdmin ? "/admin" : "/dashboard"}
                      className="flex items-center gap-2 py-3 px-4 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      {user?.name || user?.email}
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 py-3 px-4 text-red-600 hover:bg-red-50 rounded-lg font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/auth"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Button
                      variant="default"
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-4 flex items-center justify-center gap-2"
                    >
                      <LogIn className="w-5 h-5" />
                      Login / Sign Up
                    </Button>
                  </Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;