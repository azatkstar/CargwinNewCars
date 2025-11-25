import React from 'react';
import { TrendingDown } from 'lucide-react';

const DealerVsOurPriceBig = ({ msrp, ourPrice, savings }) => {
  const typicalAddons = 5500;
  const dealerTotal = msrp + typicalAddons;
  const totalSavings = savings + typicalAddons;

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-8">
      <h3 className="font-bold text-2xl mb-6 flex items-center gap-3">
        <TrendingDown className="w-8 h-8 text-green-600" />
        Dealer Price vs Our Price
      </h3>
      
      {/* Visual comparison */}
      <div className="flex items-center gap-6 mb-8">
        {/* Dealer */}
        <div className="flex-1 bg-gray-100 rounded-xl p-6 text-center">
          <div className="text-sm text-gray-600 mb-2">Typical Dealer</div>
          <div className="text-4xl font-bold text-gray-900 mb-3">
            ${dealerTotal.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 space-y-1">
            <div>MSRP: ${msrp?.toLocaleString()}</div>
            <div>Add-ons: +${typicalAddons.toLocaleString()}</div>
          </div>
        </div>
        
        <div className="text-4xl font-bold text-gray-400">→</div>
        
        {/* Our Price */}
        <div className="flex-1 bg-blue-50 border-2 border-blue-400 rounded-xl p-6 text-center">
          <div className="text-sm text-blue-700 font-semibold mb-2">Hunter.Lease Price</div>
          <div className="text-4xl font-bold text-blue-600 mb-3">
            ${ourPrice?.toLocaleString()}
          </div>
          <div className="text-xs text-blue-700 space-y-1">
            <div>Fleet discount: ${savings?.toLocaleString()}</div>
            <div>Add-ons: $0</div>
          </div>
        </div>
      </div>
      
      {/* Big savings highlight */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl p-8 text-center">
        <div className="text-lg mb-2">YOU SAVE</div>
        <div className="text-6xl font-bold">${totalSavings.toLocaleString()}</div>
        <div className="text-sm mt-3 opacity-90">vs typical dealer pricing with add-ons</div>
      </div>
    </div>
  );
};

export default DealerVsOurPriceBig;
