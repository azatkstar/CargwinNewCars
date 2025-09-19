import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { ChevronDown, Shield, Clock, MapPin } from 'lucide-react';
import { getNextMondayMidnight, formatTimeRemaining } from '../utils/timer';
import { useI18n } from '../hooks/useI18n';

const Hero = () => {
  const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const { t } = useI18n();

  useEffect(() => {
    const updateTimer = () => {
      const nextDrop = getNextMondayMidnight();
      const remaining = formatTimeRemaining(nextDrop);
      setTimeRemaining(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const scrollToOffers = () => {
    document.getElementById('offers')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToDrop = () => {
    document.getElementById('drop')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative bg-gradient-to-br from-slate-50 to-white py-20 md:py-32 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-red-100">
            <Shield className="w-4 h-4" />
            Los Angeles Only
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            {t('hero.title')}
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            {t('hero.subtitle')}
          </p>
          {/* Savings Highlight */}
          <div className="text-2xl md:text-3xl font-semibold text-green-600 mb-8">
            Save up to $7,000
          </div>

          {/* Key Benefits */}
          <div className="max-w-4xl mx-auto space-y-4 mb-8">
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
              <strong>New exclusive drops every week.</strong> First come, first served.
            </p>
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
              <Shield className="w-5 h-5 inline mr-2 text-blue-600" />
              <strong>We don't share your data with dealers for cold calls.</strong> Contact only with one dealer after 100% deal confirmation.
            </p>
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
              <MapPin className="w-5 h-5 inline mr-2 text-green-600" />
              <strong>LA local expertise:</strong> clear terms, no forced add-ons.
            </p>
          </div>

          {/* Next Drop Timer */}
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-red-600" />
              <span className="text-sm font-medium text-gray-600">{t('hero.ending_in')}:</span>
            </div>
            <div className="grid grid-cols-4 gap-4" data-countdown="weekly-drop">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-red-600">
                  {timeRemaining.days}
                </div>
                <div className="text-xs text-gray-500">дней</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-red-600">
                  {timeRemaining.hours}
                </div>
                <div className="text-xs text-gray-500">часов</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-red-600">
                  {timeRemaining.minutes}
                </div>
                <div className="text-xs text-gray-500">минут</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-red-600">
                  {timeRemaining.seconds}
                </div>
                <div className="text-xs text-gray-500">секунд</div>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button 
              onClick={scrollToOffers}
              size="lg" 
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              Смотреть текущие дропы
              <ChevronDown className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              onClick={scrollToDrop}
              variant="outline" 
              size="lg"
              className="border-2 border-gray-300 text-gray-700 hover:border-red-600 hover:text-red-600 px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300"
            >
              Узнать о следующем дропе
            </Button>
          </div>

          {/* Important Notice */}
          <div className="max-w-2xl mx-auto">
            <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-4 border border-gray-200">
              <strong>Важно:</strong> оформление при условии подходящей кредитной истории.
            </p>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <ChevronDown className="w-6 h-6 text-gray-400" />
      </div>
    </section>
  );
};

export default Hero;