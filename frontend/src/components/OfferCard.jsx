import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Clock, Eye, TrendingUp, Car, DollarSign } from 'lucide-react';
import { formatPrice, formatTimeRemaining, calculateMonthlyPayment } from '../utils/timer';
import { getFOMOCounters } from '../mock';

const OfferCard = ({ offer }) => {
  const [paymentMode, setPaymentMode] = useState('lease');
  const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [fomoCounters, setFomoCounters] = useState({ viewers: 0, confirmed: 0 });

  useEffect(() => {
    const updateTimer = () => {
      const remaining = formatTimeRemaining(offer.endsAt);
      setTimeRemaining(remaining);
    };

    const updateFOMO = () => {
      const counters = getFOMOCounters(offer.id);
      setFomoCounters(counters);
    };

    updateTimer();
    updateFOMO();
    
    const timerInterval = setInterval(updateTimer, 1000);
    const fomoInterval = setInterval(updateFOMO, 90000 + Math.random() * 90000); // 1.5-3 min

    return () => {
      clearInterval(timerInterval);
      clearInterval(fomoInterval);
    };
  }, [offer.endsAt, offer.id]);

  const stockPercentage = (offer.stockLeft / 5) * 100; // Assuming max 5 cars
  const savingsPercentage = Math.round((offer.savings / offer.msrp) * 100);

  const financeMonthly = calculateMonthlyPayment(
    offer.fleet - offer.finance.downPayment,
    offer.finance.apr,
    offer.finance.termMonths
  );

  const handleReserve = () => {
    // Mock form submission
    console.log('Reserving offer:', offer.id);
    alert('Форма бронирования будет добавлена на следующем этапе');
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Image and Badge */}
      <div className="relative">
        <img 
          src={offer.image} 
          alt={`${offer.title} — вид спереди`}
          className="w-full h-48 object-cover"
          loading="lazy"
        />
        <Badge className="absolute top-4 left-4 bg-green-600 text-white">
          Verified Fleet Deal
        </Badge>
        
        {/* Timer */}
        <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
          <Clock className="w-4 h-4 inline mr-1" />
          {timeRemaining.days}д {timeRemaining.hours}ч {timeRemaining.minutes}м
        </div>
      </div>

      <div className="p-6">
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-4">{offer.title}</h3>

        {/* Payment Mode Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          <button
            onClick={() => setPaymentMode('lease')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              paymentMode === 'lease' 
                ? 'bg-white text-red-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Lease
          </button>
          <button
            onClick={() => setPaymentMode('finance')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              paymentMode === 'finance' 
                ? 'bg-white text-red-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Finance
          </button>
          <button
            onClick={() => setPaymentMode('cash')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              paymentMode === 'cash' 
                ? 'bg-white text-red-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Cash
          </button>
        </div>

        {/* Payment Info */}
        {paymentMode === 'lease' && (
          <div className="mb-6">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {formatPrice(offer.lease.monthly)}/мес
            </div>
            <div className="text-sm text-gray-600 mb-3">
              +{formatPrice(offer.lease.dueAtSigning)} первый взнос • {offer.lease.termMonths} мес / {offer.lease.milesPerYear.toLocaleString()} миль
            </div>
            {offer.lease.incentives > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                <div className="text-sm font-medium text-green-800">
                  Скидки и льготы: {formatPrice(offer.lease.incentives)}
                </div>
              </div>
            )}
          </div>
        )}

        {paymentMode === 'finance' && (
          <div className="mb-6">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {formatPrice(financeMonthly)}/мес
            </div>
            <div className="text-sm text-gray-600">
              {offer.finance.apr}% APR • {offer.finance.termMonths} мес • Первый взнос {formatPrice(offer.finance.downPayment)}
            </div>
          </div>
        )}

        {paymentMode === 'cash' && (
          <div className="mb-6">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              Cash: {formatPrice(offer.fleet)}
            </div>
            <div className="space-y-1">
              <div className="text-sm text-gray-500 line-through">
                MSRP {formatPrice(offer.msrp)}
              </div>
              <div className="text-sm font-medium text-green-600">
                Экономия: {formatPrice(offer.savings)} ({savingsPercentage}%)
              </div>
            </div>
          </div>
        )}

        {/* Trust Elements */}
        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-2 text-sm text-orange-700 bg-orange-50 p-3 rounded-lg border border-orange-200">
            <DollarSign className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>
              По этой модели дилеры в ЛА обычно навешивают допов на {formatPrice(offer.addonsAvg)}. У нас — $0.
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Eye className="w-4 h-4 text-blue-500" />
            <span data-fomo-viewers>Сейчас просматривают: {fomoCounters.viewers} человек</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1">
                <Car className="w-4 h-4 text-red-500" />
                Осталось: {offer.stockLeft} шт
              </span>
              <span className="text-gray-500">{stockPercentage}%</span>
            </div>
            <Progress value={stockPercentage} className="h-2" />
          </div>

          <div className="flex items-center gap-2 text-sm text-green-600">
            <TrendingUp className="w-4 h-4" />
            <span data-fomo-confirms>За 15 минут зафиксировали цену: {fomoCounters.confirmed}</span>
          </div>
        </div>

        {/* CTA Button */}
        <Button 
          onClick={handleReserve}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          size="lg"
        >
          Забронировать цену
        </Button>

        {/* Disclaimer */}
        <div className="mt-4 text-xs text-gray-500 leading-relaxed">
          <p className="mb-2">
            * <strong>Мы не передаём ваши данные дилерам для обзвонов.</strong> Контакт — только с одним дилером после 100% согласования сделки без торгов.
          </p>
          <p>
            * Вы приезжаете и забираете полностью готовый автомобиль. Важно: при условии подходящей кредитной истории.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OfferCard;