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

const OfferCard = ({ offer }) => {
  const [paymentMode, setPaymentMode] = useState('lease');
  const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [fomoCounters, setFomoCounters] = useState({ viewers: 0, confirmed: 0 });
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [showPriceBreakdown, setShowPriceBreakdown] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { t } = useI18n();
  const { socket, connected } = useWebSocket();

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
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Image and Badge - Clickable */}
      <Link to={`/car/${offer.id}`} className="relative block group">
        <img 
          src={offer.image || 'https://via.placeholder.com/600x400?text=No+Image'} 
          alt={`${offer.title} — front view`}
          className="w-full h-48 object-cover cursor-pointer group-hover:opacity-95 transition-opacity"
          loading="lazy"
          onError={(e) => {
            console.error('Offer card image failed:', offer.image);
            e.target.src = 'https://via.placeholder.com/600x400?text=Image+Error';
          }}
        />
        <Badge className="absolute top-4 left-4 bg-green-600 text-white">
          Verified Fleet Deal
        </Badge>
        
        {/* Save Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleSaved();
          }}
          className="absolute top-4 right-14 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all z-10"
          title={isSaved ? "Remove from Saved" : "Save for later"}
        >
          <Heart 
            className={`w-5 h-5 ${isSaved ? 'fill-red-600 text-red-600' : 'text-gray-600'}`}
          />
        </button>
        
        {/* Timer */}
        <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
          <Clock className="w-4 h-4 inline mr-1" />
          {timeRemaining.days}d {timeRemaining.hours}h {timeRemaining.minutes}m
        </div>
      </Link>

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