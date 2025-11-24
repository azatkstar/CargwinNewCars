import React from 'react';
import { TrendingDown } from 'lucide-react';

const DealerVsOurPrice = ({ msrp, ourPrice, savings }) => {
  const dealerPrice = msrp;  // Dealer sells at MSRP typically
  const typicalDealerAddons = 5500;
  const dealerTotal = dealerPrice + typicalDealerAddons;
  const totalSavings = savings + typicalDealerAddons;
  
  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
      <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
        <TrendingDown className="w-6 h-6 text-green-600" />
        Dealer Price vs Our Price
      </h3>
      
      <div className="grid grid-cols-2 gap-6">
        {/* Dealer */}
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-sm text-gray-600 mb-2">Typical Dealer</div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            ${dealerTotal.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 space-y-1">
            <div>MSRP: ${msrp.toLocaleString()}</div>
            <div>Add-ons: +${typicalDealerAddons.toLocaleString()}</div>
          </div>
        </div>
        
        {/* Our Price */}
        <div className="bg-green-50 border-2 border-green-600 rounded-lg p-4 text-center">
          <div className="text-sm text-green-700 font-semibold mb-2">hunter.lease Price</div>
          <div className="text-3xl font-bold text-green-600 mb-2">
            ${ourPrice.toLocaleString()}
          </div>
          <div className="text-xs text-green-700 space-y-1">
            <div>Fleet discount: ${savings.toLocaleString()}</div>
            <div>Add-ons: $0</div>
          </div>
        </div>
      </div>
      
      {/* Savings highlight */}
      <div className="mt-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg p-4 text-center">
        <div className="text-sm mb-1">YOU SAVE</div>
        <div className="text-4xl font-bold">${totalSavings.toLocaleString()}</div>
      </div>
    </div>
  );
};

export default DealerVsOurPrice;