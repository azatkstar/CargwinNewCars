import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { ChevronDown, Shield, Clock, MapPin } from 'lucide-react';
import { getNextMondayMidnight, formatTimeRemaining } from '../utils/timer';
import { useI18n } from '../hooks/useI18n';

const Hero = () => {
  const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [abVariant, setAbVariant] = useState(null);
  const { t } = useI18n();

  useEffect(() => {
    // Fetch A/B test variant
    const userId = localStorage.getItem('user_id') || 'anonymous';
    fetchABVariant(userId);
  }, []);

  const fetchABVariant = async (userId) => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${BACKEND_URL}/api/ab-test/hero_headline?user_id=${userId}`);
      const data = await response.json();
      setAbVariant(data.config);
    } catch (error) {
      // Fallback to default
      setAbVariant({
        headline: "Real Dealer Dump Offers. No BS.",
        subheadline: "We hunt down the best lease deals in LA so you don't have to."
      });
    }
  };

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
            <MapPin className="w-4 h-4" />
            Los Angeles & Southern California
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            {abVariant?.headline || "Real Dealer Dump Offers. No BS."}
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            {abVariant?.subheadline || "We hunt down the best lease deals in LA so you don't have to. Only real offers. Only transparent pricing."}
          </p>

          {/* Why Dealers Work With Us */}
          <div className="max-w-4xl mx-auto bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
            <h3 className="font-bold text-lg text-blue-900 mb-3">
              Why Dealers Give Us Their Best Prices
            </h3>
            <p className="text-gray-700 text-left">
              Dealers need to move inventory fast - especially end-of-month, overstocked models, and last year's stock.
              We help them sell quickly to qualified buyers. You get dump pricing. They clear their lot.
              Everyone wins. <strong>That's why our prices beat regular retail by $5K-$15K.</strong>
            </p>
          </div>

          {/* Key Benefits - Honest & Direct */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="text-3xl mb-3">✓</div>
              <h3 className="font-bold mb-2">Real Prices</h3>
              <p className="text-sm text-gray-600">
                No "starting at" games. You see the actual monthly payment with your credit score.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="text-3xl mb-3">🔒</div>
              <h3 className="font-bold mb-2">Your Data Is Safe</h3>
              <p className="text-sm text-gray-600">
                Soft check only. We don't share your SSN with dealers until you approve the deal.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="font-bold mb-2">Fast & Easy</h3>
              <p className="text-sm text-gray-600">
                Book in minutes. Pick up in 0-2 days. Everything online. No dealer visits until delivery.
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={scrollToOffers}
              size="lg" 
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg"
            >
              🔥 See Current Deals
            </Button>
            <Button 
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              size="lg" 
              variant="outline"
              className="border-2 border-gray-300 px-8 py-6 text-lg font-semibold rounded-xl"
            >
              How It Works
            </Button>
          </div>
          
          {/* Trust Line */}
          <p className="text-sm text-gray-500 mt-8">
            Updated monthly with fresh dealer inventory. Verified offers only.
          </p>
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