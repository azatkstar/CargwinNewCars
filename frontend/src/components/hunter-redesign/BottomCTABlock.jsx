import React from 'react';
import { Clock } from 'lucide-react';

const BottomCTABlock = ({ car, timeRemaining, onReserve }) => {
  return (
    <div className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl p-8 shadow-2xl">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left - Car info */}
        <div className="flex items-center gap-4">
          <img 
            src={car?.image} 
            alt={car?.title}
            className="w-24 h-24 rounded-lg object-cover shadow-lg"
          />
          <div>
            <h3 className="text-2xl font-bold mb-1">{car?.title}</h3>
            <div className="text-lg">
              ${car?.lease?.monthly || 310}/mo <span className="text-sm opacity-80">estimated</span>
            </div>
          </div>
        </div>
        
        {/* Middle - Timer */}
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-lg">
          <Clock className="w-6 h-6" />
          <div>
            <div className="text-xs opacity-80">Deal ends in</div>
            <div className="text-xl font-bold">
              {timeRemaining?.days}d {timeRemaining?.hours}h
            </div>
          </div>
        </div>
        
        {/* Right - CTA */}
        <button 
          onClick={onReserve}
          className="bg-white text-red-600 hover:bg-gray-100 px-12 py-5 rounded-xl font-bold text-2xl shadow-lg transform hover:scale-105 transition-transform"
        >
          RESERVE NOW
        </button>
      </div>
      
      {/* Footer text */}
      <div className="text-center mt-4 text-sm opacity-90">
        Price Match Guarantee • No hidden fees • Cancel anytime before final contract
      </div>
    </div>
  );
};

export default BottomCTABlock;
