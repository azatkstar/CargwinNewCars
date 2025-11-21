import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { ChevronDown, Shield, Clock, MapPin, DollarSign, Users, TrendingUp } from 'lucide-react';
import { getNextMondayMidnight, formatTimeRemaining } from '../utils/timer';
import { useI18n } from '../hooks/useI18n';

const Hero = () => {
  const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [abVariant, setAbVariant] = useState(null);
  const [searchParams, setSearchParams] = useState({
    budget: 'all',
    bodyStyle: 'all',
    zipCode: ''
  });
  const { t } = useI18n();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch A/B test variant
    const userId = localStorage.getItem('user_id') || 'anonymous';
    fetchABVariant(userId);
  }, []);

  const fetchABVariant = async (userId) => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
      const endpoint = BACKEND_URL.endsWith('/api')
        ? `${BACKEND_URL}/ab-test/hero_headline?user_id=${userId}`
        : `${BACKEND_URL}/api/ab-test/hero_headline?user_id=${userId}`;
      
      const response = await fetch(endpoint, { timeout: 3000 });
      
      if (response.ok) {
        const data = await response.json();
        setAbVariant(data.config);
      } else {
        throw new Error('Fallback to default');
      }
    } catch (error) {
      console.warn('A/B test failed, using default:', error.message);
      // Fallback to default variant
      setAbVariant({
        headline: "New Cars. Fleet Pricing. Huge Savings.",
        subheadline: "Get the same low prices big rental and logistics companies pay for their fleets. No dealer add-ons. No haggling. No BS."
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
    const offersSection = document.getElementById('offers');
    offersSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSearch = () => {
    // Navigate to offers with filters
    const params = new URLSearchParams();
    if (searchParams.budget !== 'all') params.append('budget', searchParams.budget);
    if (searchParams.bodyStyle !== 'all') params.append('body', searchParams.bodyStyle);
    if (searchParams.zipCode) params.append('zip', searchParams.zipCode);
    
    navigate(`/offers?${params.toString()}`);
  };

  return (
    <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image - Full Screen */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://images.pexels.com/photos/3972755/pexels-photo-3972755.jpeg?auto=compress&cs=tinysrgb&w=1920')",
        }}
      >
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Content - Centered */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center text-white">
        
        {/* Compact Philosophy Badge */}
        <div className="inline-flex items-center gap-2 bg-green-600/90 text-white px-4 py-2 rounded-full text-xs font-bold mb-4 backdrop-blur-sm">
          California Fleet Pricing • All Credit Tiers Welcome
        </div>
        
        {/* Compact Headline */}
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-3 leading-tight">
          New Cars. <span className="text-red-500">Fleet Pricing.</span>
        </h1>

        {/* Compact Subheadline */}
        <p className="text-base md:text-lg mb-6 text-gray-100 max-w-2xl mx-auto">
          Same prices rental companies pay. No dealer games. No BS.
        </p>
        
        {/* Compact Benefits - 2 cards only */}
        <div className="grid grid-cols-2 gap-3 mb-6 max-w-md mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/20">
            <div className="text-xl font-bold text-white">$5K-$15K</div>
            <div className="text-xs text-gray-200">Avg Savings</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/20">
            <div className="text-xl font-bold text-white">24/7 AI</div>
            <div className="text-xs text-gray-200">Assistant</div>
          </div>
        </div>

        {/* Compact Search Form */}
        <div className="bg-white rounded-xl shadow-2xl p-4 max-w-2xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            
            {/* Budget */}
            <select
              value={searchParams.budget}
              onChange={(e) => setSearchParams({...searchParams, budget: e.target.value})}
              className="w-full p-2 text-sm border border-gray-300 rounded-lg text-gray-900"
            >
              <option value="all">Any Budget</option>
              <option value="300">$300/mo</option>
              <option value="500">$500/mo</option>
              <option value="800">$800/mo</option>
            </select>

            {/* Body */}
            <select
              value={searchParams.bodyStyle}
              onChange={(e) => setSearchParams({...searchParams, bodyStyle: e.target.value})}
              className="w-full p-2 text-sm border border-gray-300 rounded-lg text-gray-900"
            >
              <option value="all">All Styles</option>
              <option value="sedan">Sedan</option>
              <option value="suv">SUV</option>
              <option value="truck">Truck</option>
            </select>

            {/* Zip */}
            <input
              type="text"
              maxLength="5"
              placeholder="90210"
              value={searchParams.zipCode}
              onChange={(e) => setSearchParams({...searchParams, zipCode: e.target.value})}
              className="w-full p-2 text-sm border border-gray-300 rounded-lg text-gray-900"
            />
          </div>

          {/* Compact Button */}
          <Button
            onClick={handleSearch}
            className="w-full mt-3 bg-red-600 hover:bg-red-700 text-white py-3 text-base font-bold rounded-lg"
          >
            Find My Perfect Deal
          </Button>
        </div>

        {/* Compact Trust Line */}
        <p className="text-xs text-gray-200 mt-4">
          ✓ Fleet Pricing • ✓ AI Assistant • ✓ Free Delivery
        </p>
      </div>
    </section>
  );
};

export default Hero;