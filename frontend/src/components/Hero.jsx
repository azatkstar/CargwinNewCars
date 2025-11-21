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
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center text-white">
        
        {/* Headline */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-4 leading-tight">
          Drive away with your dream car
        </h1>

        {/* Subheadline */}
        <p className="text-xl md:text-2xl mb-12 text-gray-100">
          Vehicle Leasing and Financing Simplified
        </p>

        {/* Search Form - AutoBandit Style */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-3xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Monthly Budget */}
            <div className="text-left">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Budget
              </label>
              <select
                value={searchParams.budget}
                onChange={(e) => setSearchParams({...searchParams, budget: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="all">Any Budget</option>
                <option value="300">Up to $300/mo</option>
                <option value="400">Up to $400/mo</option>
                <option value="500">Up to $500/mo</option>
                <option value="600">Up to $600/mo</option>
                <option value="800">Up to $800/mo</option>
                <option value="1000">$1000+/mo</option>
              </select>
            </div>

            {/* Body Style */}
            <div className="text-left">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Body Style
              </label>
              <select
                value={searchParams.bodyStyle}
                onChange={(e) => setSearchParams({...searchParams, bodyStyle: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="all">All Styles</option>
                <option value="sedan">Sedan</option>
                <option value="suv">SUV</option>
                <option value="truck">Truck</option>
                <option value="coupe">Coupe</option>
                <option value="hatchback">Hatchback</option>
                <option value="van">Van/Minivan</option>
              </select>
            </div>

            {/* Zip Code */}
            <div className="text-left">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Zip Code
              </label>
              <input
                type="text"
                maxLength="5"
                placeholder="90210"
                value={searchParams.zipCode}
                onChange={(e) => setSearchParams({...searchParams, zipCode: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Search Button */}
          <Button
            onClick={handleSearch}
            className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white py-6 text-lg font-bold rounded-xl shadow-lg"
            size="lg"
          >
            Find My Perfect Deal
          </Button>

          {/* AI Badge */}
          <div className="mt-4 text-center">
            <span className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              AI-Powered Search with CargwinGPT
            </span>
          </div>
        </div>

        {/* Trust Line */}
        <p className="text-sm text-gray-200 mt-8">
          ✓ Fleet Pricing • ✓ All Fees Included • ✓ 24/7 AI Assistant
        </p>
      </div>
    </section>
  );
};

export default Hero;