import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Mail, Phone, MapPin, Instagram, Facebook, Twitter } from 'lucide-react';
import { useI18n } from '../hooks/useI18n';

const Footer = ({ hiddenVin = null }) => {
  const { t } = useI18n();
  
  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  const navigationItems = [
    { label: t('navigation.offers'), id: 'offers' },
    { label: t('hero.weekly_drop'), id: 'drop' },
    { label: t('navigation.coverage'), id: 'coverage' },
    { label: t('navigation.how_it_works'), id: 'how-it-works' },
    { label: t('navigation.reviews'), id: 'reviews' },
    { label: t('navigation.faq'), id: 'faq' }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-red-600 p-2 rounded-lg">
                <Car className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">hunter.lease</span>
            </div>
            
            <p className="text-gray-300 leading-relaxed mb-6">
              {t('footer.description')}
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-300">
                <MapPin className="w-4 h-4 text-red-400" />
                <span className="text-sm">2855 Michelle Dr, Office 180, Irvine, CA 92606</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Phone className="w-4 h-4 text-red-400" />
                <span className="text-sm">+1 (747) CARGWIN</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Mail className="w-4 h-4 text-red-400" />
                <span className="text-sm">info@cargwin.com</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/what-to-expect" className="text-gray-300 hover:text-white transition-colors">
                  What to Expect
                </Link>
              </li>
              <li>
                <Link to="/deals" className="text-gray-300 hover:text-white transition-colors">
                  Deals
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-gray-300 hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/coverage" className="text-gray-300 hover:text-white transition-colors">
                  Coverage
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Services</h3>
            <ul className="space-y-3 text-gray-300">
              <li>
                <Link to="/broker-application" className="hover:text-white transition-colors">
                  🔗 Broker Credit Application
                </Link>
              </li>
              <li>Fleet Offers</li>
              <li>Credit Check</li>
              <li>Financing Consultation</li>
              <li>Car Selection Help</li>
              <li>24/7 Support</li>
            </ul>
          </div>

          {/* Legal & Social */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Legal Information</h3>
            <ul className="space-y-3 text-gray-300 mb-6">
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors duration-200">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors duration-200">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/disclaimer" className="hover:text-white transition-colors duration-200">
                  Disclaimer
                </Link>
              </li>
              <li>
                <Link to="/ccpa-rights" className="hover:text-white transition-colors duration-200">
                  CCPA Rights
                </Link>
              </li>
            </ul>

            {/* Social Links */}
            <div>
              <h4 className="font-semibold mb-4">Follow Us</h4>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-red-600 transition-colors duration-200">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-red-600 transition-colors duration-200">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-red-600 transition-colors duration-200">
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-400 text-sm">
              {t('footer.copyright')}
            </div>
            
            <div className="text-gray-400 text-sm text-center md:text-right">
              <p>Licensed car dealer in California</p>
              <p>DRE# 12345678 | Dealer License# ABC123</p>
            </div>
          </div>
          
          <div className="mt-6 text-xs text-gray-500 leading-relaxed">
            <p>
              <strong>Important notes:</strong> All prices and payments are approximate and depend on credit history, 
              down payment, financing term and other factors. Offers valid for qualified buyers. 
              We do not guarantee credit approval. Final terms are determined by the lender. 
              Car images may not reflect exact configuration. 
              We do not share your personal data with third parties without your consent.
            </p>
            {/* Hidden VIN for SEO/compliance purposes */}
            {hiddenVin && (
              <div className="text-gray-900 bg-gray-900 opacity-0 select-none text-xs mt-2" style={{color: 'rgb(17, 24, 39)', backgroundColor: 'rgb(17, 24, 39)'}}>
                Vehicle Identification Number: {hiddenVin}
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;