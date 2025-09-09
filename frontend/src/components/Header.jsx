import React, { useState } from 'react';
import { Button } from './ui/button';
import { Menu, X, Car } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  const navItems = [
    { label: 'Предложения', id: 'offers' },
    { label: 'Дроп', id: 'drop' },
    { label: 'Покрытие', id: 'coverage' },
    { label: 'Как работает', id: 'how-it-works' },
    { label: 'Доверие', id: 'trust' },
    { label: 'Отзывы', id: 'reviews' },
    { label: 'Кредит', id: 'credit' },
    { label: 'FAQ', id: 'faq' }
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

          {/* Desktop CTA */}
          <div className="hidden lg:block">
            <Button 
              onClick={() => scrollToSection('offers')}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300"
            >
              Смотреть предложения
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
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
                Смотреть предложения
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;