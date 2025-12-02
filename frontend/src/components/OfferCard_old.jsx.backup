import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Clock, Eye, TrendingUp, Car, DollarSign, ArrowRight, FileText, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPrice, formatTimeRemaining, calculateMonthlyPayment } from '../utils/timer';
import { getFOMOCounters } from '../mock';
import { useI18n } from '../hooks/useI18n';
import useWebSocket from '../hooks/useWebSocket';
import ReserveModal from './ReserveModal';
import PriceBreakdownModal from './PriceBreakdownModal';

const OfferCard = ({ offer, userZip }) => {
  const [paymentMode, setPaymentMode] = useState('lease');
  const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [fomoCounters, setFomoCounters] = useState({ viewers: 0, confirmed: 0 });
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [showPriceBreakdown, setShowPriceBreakdown] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isNearby, setIsNearby] = useState(false);
  const { t } = useI18n();
  const { socket, connected } = useWebSocket();

  // Check if nearby
  useEffect(() => {
    if (userZip && offer.dealerZip) {
      const { getDistanceFromZip } = require('../utils/geolocation');
      const distance = getDistanceFromZip(userZip, offer.dealerZip);
      setIsNearby(distance < 50); // Within 50 miles
    } else if (userZip) {
      // Если нет dealer zip, считаем nearby для CA zips
      setIsNearby(true);
    }
  }, [userZip, offer.dealerZip]);

  // Check if car is saved
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('hunter_saved_cars') || '[]');
    setIsSaved(saved.includes(offer.id));
  }, [offer.id]);

  const toggleSaved = () => {
    const saved = JSON.parse(localStorage.getItem('hunter_saved_cars') || '[]');
    
    if (isSaved) {
      // Remove from saved
      const updated = saved.filter(id => id !== offer.id);
      localStorage.setItem('hunter_saved_cars', JSON.stringify(updated));
      setIsSaved(false);
    } else {
      // Add to saved
      saved.push(offer.id);
      localStorage.setItem('hunter_saved_cars', JSON.stringify(saved));
      setIsSaved(true);
    }
  };

  // Subscribe to offer updates via WebSocket
  useEffect(() => {
    if (socket && connected && offer.id) {
      socket.emit('subscribe_to_offer', { offer_id: offer.id });
      
      // Listen for FOMO updates
      socket.on('fomo_update', (data) => {
        if (data.offer_id === offer.id) {
          setFomoCounters({ viewers: data.viewers, confirmed: data.confirmed });
        }
      });
      
      return () => {
        socket.off('fomo_update');
      };
    }
  }, [socket, connected, offer.id]);

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

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-2xl transition-all duration-300">
      {/* TIMER НАД КАРТОЧКОЙ - КЛЮЧЕВОЙ ЭЛЕМЕНТ */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span className="text-xs font-bold">ENDS IN:</span>
        </div>
        <div className="text-base font-bold">
          {timeRemaining.days}d {timeRemaining.hours}h {timeRemaining.minutes}m
        </div>
      </div>

      {/* Image - КРУПНОЕ */}
      <Link to={`/car/${offer.id}`} className="relative block group">
        <img 
          src={offer.image || 'https://via.placeholder.com/600x400?text=No+Image'} 
          alt={`${offer.title} — front view`}
          className="w-full h-56 object-cover cursor-pointer group-hover:opacity-95 transition-opacity"
          loading="lazy"
          onError={(e) => {
            console.error('Offer card image failed:', offer.image);
            e.target.src = 'https://via.placeholder.com/600x400?text=Image+Error';
          }}
        />
        
        {/* VERIFIED BADGE */}
        <div className="absolute top-3 left-3 bg-orange-600 text-white px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-xs font-bold">VERIFIED</span>
        </div>
        
        {/* Near You + Save Heart */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {isNearby && (
            <div className="bg-blue-600 text-white px-3 py-1.5 rounded-lg shadow-lg text-xs font-bold">
              📍 NEAR YOU
            </div>
          )}
          
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleSaved();
            }}
            className="bg-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform"
          >
            <Heart 
              className={`w-5 h-5 ${isSaved ? 'fill-red-600 text-red-600' : 'text-gray-600'}`}
            />
          </button>
        </div>
      </Link>

      <div className="p-5 space-y-4">
        
        {/* Title - КРУПНЕЕ */}
        <h3 className="font-bold text-lg text-gray-900 hover:text-red-600 transition-colors">
          <Link to={`/car/${offer.id}`}>{offer.title}</Link>
        </h3>

        {/* SAVINGS BLOCK - AMAZON STYLE (КРИТИЧНО!) */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-600 rounded-xl p-4">
          <div className="text-center">
            <div className="text-xs text-gray-600 mb-1">YOU SAVE</div>
            <div className="text-4xl font-bold text-green-600 mb-1">
              ${offer.savings?.toLocaleString()}
            </div>
            <div className="text-lg font-bold text-red-600">
              {((offer.savings / offer.msrp) * 100).toFixed(1)}% OFF
            </div>
          </div>
        </div>

        {/* Payment Info - Компактно */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">MSRP:</span>
            <span className="line-through text-gray-400">${offer.msrp?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm font-bold">
            <span>Your Price:</span>
            <span className="text-gray-900">${offer.fleet?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Monthly:</span>
            <span className="text-2xl font-bold text-gray-900">${offer.lease?.monthly || 0}/mo</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>{offer.lease?.termMonths}mo</span>
            <span>{offer.lease?.milesPerYear?.toLocaleString()} mi/yr</span>
          </div>
        </div>

        {/* FOMO - Selling Fast */}
        <div className="bg-red-50 border border-red-300 rounded-lg p-2">
          <div className="text-xs text-red-900 font-semibold text-center">
            🔥 Selling Fast — {Math.floor(Math.random() * 20 + 70)}% Claimed
          </div>
        </div>

        {/* CTA Buttons - КРУПНЫЕ */}
        <div className="space-y-2">
          <Link to={`/car/${offer.id}`} className="block">
            <Button className="w-full bg-gray-900 hover:bg-black text-white py-4 font-bold rounded-lg">
              View Deal Details →
            </Button>
          </Link>
          
          <Button
            onClick={() => setShowReserveModal(true)}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-4 font-bold rounded-lg"
          >
            Reserve at Fleet Price
          </Button>
        </div>

        {/* Dealer Add-ons - МЕЛКО */}
        <p className="text-xs text-gray-500 text-center">
          Zero dealer add-ons (save ${offer.dealer_addons?.toLocaleString() || '5,500'})
        </p>

        {/* Payment Mode Toggle - MOVED DOWN */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setPaymentMode('lease')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              paymentMode === 'lease' 
                ? 'bg-white text-red-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t('offers.lease_options')}
          </button>
          <button
            onClick={() => setPaymentMode('finance')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              paymentMode === 'finance' 
                ? 'bg-white text-red-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t('offers.finance_options')}
          </button>
          <button
            onClick={() => setPaymentMode('cash')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              paymentMode === 'cash' 
                ? 'bg-white text-red-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t('offers.cash_options')}
          </button>
        </div>

        {/* Payment Info */}
        {paymentMode === 'lease' && (
          <div className="mb-6">
            {/* Monthly Payment - Large and Clear */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="text-sm text-gray-600 mb-1">Your Monthly Payment</div>
              <div className="text-4xl font-bold text-gray-900">
                ${offer.lease.monthly}<span className="text-xl text-gray-600">/mo</span>
              </div>
            </div>
            
            {/* Deal Structure - Honest breakdown */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">MSRP:</span>
                <span className="line-through text-gray-400">${offer.msrp.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Dealer Discount:</span>
                <span className="text-green-600 font-semibold">-${offer.savings.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-medium">Your Price:</span>
                <span className="font-bold">${offer.fleet.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Due at Signing:</span>
                <span className="font-medium">${offer.lease.dueAtSigning.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{offer.lease.termMonths} months</span>
                <span>{offer.lease.milesPerYear.toLocaleString()} mi/year</span>
              </div>
            </div>
            
            {offer.lease.incentives > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                <div className="text-sm font-medium text-green-800">
                  Discounts & incentives: {formatPrice(offer.lease.incentives)}
                </div>
              </div>
            )}
          </div>
        )}

        {paymentMode === 'finance' && (
          <div className="mb-6">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {formatPrice(financeMonthly)}/{t('offers.monthly')}
            </div>
            <div className="text-sm text-gray-600">
              {offer.finance.apr}% APR • {offer.finance.termMonths} months • {t('offers.down_payment')} {formatPrice(offer.finance.downPayment)}
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
                {t('offers.msrp')} {formatPrice(offer.msrp)}
              </div>
              <div className="text-sm font-medium text-green-600">
                {t('offers.savings')}: {formatPrice(offer.savings)} ({savingsPercentage}%)
              </div>
            </div>
          </div>
        )}

        {/* Trust Elements */}
        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-2 text-sm text-orange-700 bg-orange-50 p-3 rounded-lg border border-orange-200">
            <DollarSign className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>
              For this model, LA dealers usually add ${(offer.dealer_addons || 0).toLocaleString()} in add-ons. With us — $0.
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Eye className="w-4 h-4 text-blue-500" />
            <span data-fomo-viewers>Currently viewing: {fomoCounters.viewers} people</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-green-600">
            <TrendingUp className="w-4 h-4" />
            <span data-fomo-confirms>Price locked in 15 min: {fomoCounters.confirmed}</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3">
          <Button 
            asChild
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            size="lg"
          >
            <Link to={`/car/${offer.id}`}>
              {t('offers.view_details')}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
          
          <Button 
            variant="outline"
            className="w-full border-green-600 text-green-700 hover:bg-green-50 flex items-center justify-center gap-2"
            onClick={() => setShowPriceBreakdown(true)}
          >
            <FileText className="w-4 h-4" />
            See Full Price Breakdown
          </Button>
          
          <Button 
            variant="outline"
            className="w-full border-red-600 text-red-600 hover:bg-red-50"
            onClick={() => setShowReserveModal(true)}
          >
            Reserve Price
          </Button>
        </div>

        {/* Price Breakdown Modal */}
        <PriceBreakdownModal
          isOpen={showPriceBreakdown}
          onClose={() => setShowPriceBreakdown(false)}
          car={offer}
        />

        {/* Reserve Modal */}
        <ReserveModal
          isOpen={showReserveModal}
          onClose={() => setShowReserveModal(false)}
          offer={offer}
          paymentMode={paymentMode}
        />
      </div>
    </div>
  );
};

export default OfferCard;