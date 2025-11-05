import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Clock, Shield, Eye, TrendingUp } from 'lucide-react';
import { formatPrice, getNextMondayMidnight, formatTimeRemaining } from '../../utils/timer';
import { getFOMOCounters } from '../../mock';

const CarHero = ({ car }) => {
  const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [fomoCounters, setFomoCounters] = useState({ viewers: 0, confirmed: 0 });

  useEffect(() => {
    const updateTimer = () => {
      if (car.isDrop) {
        const nextDrop = getNextMondayMidnight();
        const remaining = formatTimeRemaining(nextDrop);
        setTimeRemaining(remaining);
      }
    };

    const updateFOMO = () => {
      const counters = getFOMOCounters(car.id);
      setFomoCounters(counters);
    };

    updateTimer();
    updateFOMO();
    
    const timerInterval = setInterval(updateTimer, 1000);
    const fomoInterval = setInterval(updateFOMO, 90000 + Math.random() * 90000);

    return () => {
      clearInterval(timerInterval);
      clearInterval(fomoInterval);
    };
  }, [car.id, car.isDrop]);

  const scrollToForm = () => {
    document.getElementById('car-forms')?.scrollIntoView({ behavior: 'smooth' });
  };

  const otdPrice = car.fleet + (car.fleet * 0.08); // Add taxes/fees estimate

  return (
    <section className="bg-gradient-to-br from-gray-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left - Image */}
          <div className="relative">
            <img 
              src={car.image}
              alt={`${car.title} — вид спереди`}
              className="w-full h-auto rounded-2xl shadow-2xl"
              loading="eager"
            />
            
            {/* Badges */}
            <div className="absolute top-6 left-6 space-y-2">
              <Badge className="bg-green-600 text-white text-sm px-3 py-1">
                Verified Fleet Deal
              </Badge>
              {car.isDrop && (
                <Badge className="bg-red-600 text-white text-sm px-3 py-1">
                  Дроп недели
                </Badge>
              )}
            </div>

            {/* FOMO Counters */}
            <div className="absolute bottom-6 left-6 right-6">
              <div className="bg-white/95 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-blue-600">
                    <Eye className="w-4 h-4" />
                    <span>Смотрят: {fomoCounters.viewers}</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <TrendingUp className="w-4 h-4" />
                    <span>Confirmed: {fomoCounters.confirmed}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Info */}
          <div className="space-y-8">
            {/* Title */}
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                {car.title}
              </h1>
            </div>

            {/* Pricing */}
            <div className="space-y-4">
              <div className="flex items-baseline gap-4">
                <span className="text-sm text-gray-500 line-through">
                  MSRP {formatPrice(car.msrp)}
                </span>
                <Badge className="bg-red-100 text-red-800">
                  Скидка {formatPrice(car.savings)}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="text-2xl font-semibold text-gray-900">
                  Fleet-цена: {formatPrice(car.fleet)}
                </div>
                <div className="text-3xl font-bold text-red-600">
                  OTD цена: {formatPrice(otdPrice)}
                </div>
                <p className="text-sm text-gray-600">
                  * Включает налоги и сборы для CA
                </p>
              </div>
            </div>

            {/* Timer for Drop */}
            {car.isDrop && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-red-600" />
                  <span className="font-semibold text-red-900">До конца дропа:</span>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{timeRemaining.days}</div>
                    <div className="text-xs text-red-700">дней</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{timeRemaining.hours}</div>
                    <div className="text-xs text-red-700">часов</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{timeRemaining.minutes}</div>
                    <div className="text-xs text-red-700">минут</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{timeRemaining.seconds}</div>
                    <div className="text-xs text-red-700">секунд</div>
                  </div>
                </div>
              </div>
            )}

            {/* Trust Elements */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-green-700 bg-green-50 p-3 rounded-lg">
                <Shield className="w-5 h-5" />
                <span>
                  <strong>Без навязанных допов:</strong> обычно добавляют {formatPrice(car.addonsAvg)} — у нас $0
                </span>
              </div>
              
              <div className="text-sm text-gray-600">
                ✓ Цена зафиксирована без торгов<br/>
                ✓ Данные не передаём дилерам для обзвонов<br/>
                ✓ Контакт только после 100% согласования условий
              </div>
            </div>

            {/* CTA Button */}
            <Button 
              onClick={scrollToForm}
              size="lg"
              className="w-full bg-red-600 hover:bg-red-700 text-white py-4 text-xl font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Получить предложение
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CarHero;