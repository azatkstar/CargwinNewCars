import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { ArrowRight, Eye, TrendingUp, Clock, Package } from 'lucide-react';

const Hero = () => {
  const [fomoStats, setFomoStats] = useState({
    viewing: 182,
    expiring: 27,
    unitsLeft: 2,
    timeLeft: { hours: 3, minutes: 22 }
  });
  const navigate = useNavigate();

  return (
    <section className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden">
      {/* Full-Screen Car Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.pexels.com/photos/3972755/pexels-photo-3972755.jpeg?auto=compress&cs=tinysrgb&w=1920')",
        }}
      >
        {/* Dark overlay 20% */}
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Content - Centered */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center text-white">
        
        {/* Headline - КРУПНЫЙ */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Fleet Pricing on New Cars<br />
          <span className="text-red-500">Save $5,000 to $30,000</span>
        </h1>

        {/* Subheadline */}
        <p className="text-xl md:text-2xl mb-10 text-gray-100">
          Verified corporate fleet deals. No dealer fees. Full transparency.
        </p>

        {/* BIG CTA */}
        <Button
          onClick={() => navigate('/offers')}
          className="bg-red-600 hover:bg-red-700 text-white px-12 py-8 text-2xl font-bold rounded-2xl shadow-2xl transform hover:scale-105 transition-transform mb-8"
        >
          Find My Perfect Deal <ArrowRight className="w-8 h-8 inline ml-2" />
        </Button>

        {/* Trust Icons */}
        <div className="flex items-center justify-center gap-8 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span>Same prices rental companies pay</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span>All credit tiers welcome</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span>Free delivery</span>
          </div>
        </div>
      </div>

      {/* FOMO Block - Right */}
      <div className="absolute top-8 right-8 bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl max-w-xs">
        <div className="space-y-4 text-gray-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Eye className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{fomoStats.viewing}</div>
              <div className="text-xs text-gray-600">people viewing now</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{fomoStats.expiring}</div>
              <div className="text-xs text-gray-600">deals expiring today</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <Package className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{fomoStats.unitsLeft}</div>
              <div className="text-xs text-gray-600">fleet units left</div>
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-gray-600" />
              <div className="text-xs text-gray-600 font-semibold">Deal cycle ends:</div>
            </div>
            <div className="text-3xl font-bold text-red-600">
              {fomoStats.timeLeft.hours}h {fomoStats.timeLeft.minutes}m
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;