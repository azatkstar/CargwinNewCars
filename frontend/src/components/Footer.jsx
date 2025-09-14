import React from 'react';
import { Car, Mail, Phone, MapPin, Instagram, Facebook, Twitter } from 'lucide-react';

const Footer = ({ hiddenVin = null }) => {
  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

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
              <span className="text-xl font-bold">CargwinNewCar</span>
            </div>
            
            <p className="text-gray-300 leading-relaxed mb-6">
              Закрытые fleet-предложения для жителей Лос-Анджелеса. 
              Без торгов, без допов, без обзвонов.
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-300">
                <MapPin className="w-4 h-4 text-red-400" />
                <span className="text-sm">Лос-Анджелес, Калифорния</span>
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
            <h3 className="text-lg font-semibold mb-6">Навигация</h3>
            <ul className="space-y-3">
              {[
                { label: 'Предложения', id: 'offers' },
                { label: 'Дроп недели', id: 'drop' },
                { label: 'Покрытие', id: 'coverage' },
                { label: 'Как работает', id: 'how-it-works' },
                { label: 'Отзывы', id: 'reviews' },
                { label: 'FAQ', id: 'faq' }
              ].map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => scrollToSection(item.id)}
                    className="text-gray-300 hover:text-white transition-colors duration-200"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Услуги</h3>
            <ul className="space-y-3 text-gray-300">
              <li>Fleet-предложения</li>
              <li>Кредитная проверка</li>
              <li>Консультации по финансированию</li>
              <li>Помощь в выборе авто</li>
              <li>Поддержка 24/7</li>
            </ul>
          </div>

          {/* Legal & Social */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Правовая информация</h3>
            <ul className="space-y-3 text-gray-300 mb-6">
              <li>
                <a href="#" className="hover:text-white transition-colors duration-200">
                  Политика конфиденциальности
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors duration-200">
                  Условия использования
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors duration-200">
                  Отказ от ответственности
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors duration-200">
                  CCPA Rights
                </a>
              </li>
            </ul>

            {/* Social Links */}
            <div>
              <h4 className="font-semibold mb-4">Мы в соцсетях</h4>
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
              © 2025 CargwinNewCar. Все права защищены.
            </div>
            
            <div className="text-gray-400 text-sm text-center md:text-right">
              <p>Лицензированный дилер автомобилей в Калифорнии</p>
              <p>DRE# 12345678 | Dealer License# ABC123</p>
            </div>
          </div>
          
          <div className="mt-6 text-xs text-gray-500 leading-relaxed">
            <p>
              <strong>Важные примечания:</strong> Все цены и платежи являются приблизительными и зависят от кредитной истории, 
              первоначального взноса, срока финансирования и других факторов. Предложения действительны для квалифицированных покупателей. 
              Мы не гарантируем одобрение кредита. Финальные условия определяются кредитором. 
              Изображения автомобилей могут не отражать точную комплектацию. 
              Мы не передаём ваши персональные данные третьим лицам без вашего согласия.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;