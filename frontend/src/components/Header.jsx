import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Menu, X, Car, LogIn, User, LogOut } from 'lucide-react';
import { useI18n } from '../hooks/useI18n';
import { useAuth } from '../hooks/useAuth';
import LanguageSwitcher from './LanguageSwitcher';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useI18n();

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
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
          <div className="flex items-center gap-2">
            <div className="bg-red-600 p-2 rounded-lg">
              <Car className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">CargwinNewCar</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-gray-600 hover:text-red-600 font-medium transition-colors duration-200"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Desktop CTA + Language Switcher */}
          <div className="hidden lg:flex items-center gap-3">
            <LanguageSwitcher />
            <Button 
              onClick={() => scrollToSection('offers')}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300"
            >
              {t('navigation.view_offers')}
            </Button>
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
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="text-left text-gray-600 hover:text-red-600 font-medium transition-colors duration-200"
                >
                  {item.label}
                </button>
              ))}
              <Button 
                onClick={() => scrollToSection('offers')}
                className="bg-red-600 hover:bg-red-700 text-white mt-4 rounded-lg font-medium"
                size="sm"
              >
                {t('navigation.view_offers')}
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;