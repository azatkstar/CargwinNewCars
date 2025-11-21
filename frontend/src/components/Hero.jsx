import React, { useState, useEffect } from 'react';
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
    document.getElementById('offers')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToDrop = () => {
    document.getElementById('drop')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative bg-white overflow-hidden">
      {/* Hero Grid Layout */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-[600px]">
          
          {/* Left - Content */}
          <div className="flex flex-col justify-center px-6 py-16 lg:px-12 lg:py-24">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-bold mb-6 w-fit">
              <MapPin className="w-4 h-4" />
              California Statewide
            </div>

            {/* Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              New Cars.<br />
              <span className="text-red-600">Fleet Pricing.</span><br />
              Huge Savings.
            </h1>

            {/* Subheading */}
            <p className="text-lg md:text-xl text-gray-700 mb-8 leading-relaxed">
              Get the same low prices big rental and logistics companies pay for their fleets.
              <strong className="text-gray-900"> No dealer add-ons. No haggling. No BS.</strong>
            </p>

            {/* Key Benefits - Icons */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-5 h-5 text-green-700" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">$5K - $15K Off</div>
                  <div className="text-sm text-gray-600">Fleet-level savings</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-blue-700" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">Soft Check Only</div>
                  <div className="text-sm text-gray-600">No score impact</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-purple-700" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">All Credit Tiers</div>
                  <div className="text-sm text-gray-600">680+ welcome</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-orange-700" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">CA Statewide</div>
                  <div className="text-sm text-gray-600">Free delivery</div>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={scrollToOffers}
                size="lg" 
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-lg font-bold rounded-xl shadow-lg"
              >
                See Current Deals
              </Button>
              <Button 
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                size="lg" 
                variant="outline"
                className="border-2 border-gray-900 text-gray-900 px-8 py-6 text-lg font-semibold rounded-xl hover:bg-gray-50"
              >
                How It Works
              </Button>
            </div>

            {/* Trust Line */}
            <p className="text-sm text-gray-500 mt-6">
              ✓ Real fleet pricing • ✓ All fees included • ✓ Updated monthly
            </p>
          </div>

          {/* Right - Visual */}
          <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-8">
            {/* Car Image - Premium */}
            <div className="relative">
              <img 
                src="https://images.pexels.com/photos/34549770/pexels-photo-34549770.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="New car - fleet pricing available"
                className="w-full h-auto max-w-2xl drop-shadow-2xl"
              />
              
              {/* Floating Savings Badge */}
              <div className="absolute -top-4 -right-4 bg-green-600 text-white rounded-2xl shadow-2xl p-6 transform rotate-3">
                <div className="text-sm font-semibold">Average Savings</div>
                <div className="text-4xl font-bold">$8,500</div>
                <div className="text-xs">vs retail pricing</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Instant Understanding Strip - Above the fold */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border-y border-green-200 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-sm text-gray-600 mb-4 font-medium">
            Real Savings - Verified Deals
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Example 1 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-bold text-gray-900">2025 Toyota Camry</div>
                  <div className="text-sm text-gray-600">SE Hybrid</div>
                </div>
                <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                  -$6,200
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Retail:</span>
                <span className="line-through text-gray-400">$35,200</span>
              </div>
              <div className="flex justify-between text-sm font-bold">
                <span>Fleet Price:</span>
                <span className="text-green-700">$29,000</span>
              </div>
            </div>

            {/* Example 2 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-bold text-gray-900">2025 Honda CR-V</div>
                  <div className="text-sm text-gray-600">EX-L AWD</div>
                </div>
                <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                  -$8,400
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Retail:</span>
                <span className="line-through text-gray-400">$38,400</span>
              </div>
              <div className="flex justify-between text-sm font-bold">
                <span>Fleet Price:</span>
                <span className="text-green-700">$30,000</span>
              </div>
            </div>

            {/* Example 3 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-bold text-gray-900">2025 Lexus RX</div>
                  <div className="text-sm text-gray-600">350 Premium</div>
                </div>
                <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                  -$12,800
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Retail:</span>
                <span className="line-through text-gray-400">$52,000</span>
              </div>
              <div className="flex justify-between text-sm font-bold">
                <span>Fleet Price:</span>
                <span className="text-green-700">$39,200</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;