import React from 'react';
import { TrendingDown } from 'lucide-react';

const PaymentTrendSimple = ({ monthlyPayment = 310 }) => {
  const marketAverage = Math.round(monthlyPayment * 1.15);
  const savings = marketAverage - monthlyPayment;

  return (
    <div className="bg-gradient-to-br from-green-50 to-white border-2 border-green-200 rounded-xl p-6">
      <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
        <TrendingDown className="w-6 h-6 text-green-600" />
        Avg Monthly Payment Trend
      </h3>
      
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-sm text-gray-600 mb-1">Current Best</div>
          <div className="text-4xl font-bold text-green-600">${monthlyPayment}/mo</div>
          <div className="text-sm text-green-700 mt-1">Below market average</div>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-gray-600 mb-1">Market Avg</div>
          <div className="text-2xl font-bold text-gray-400 line-through">${marketAverage}/mo</div>
          <div className="text-sm text-green-700 mt-1">Save ${savings}/mo</div>
        </div>
      </div>
      
      {/* Mini visual bar */}
      <div className="relative h-12 bg-gray-200 rounded-lg overflow-hidden">
        <div 
          className="absolute left-0 top-0 h-full bg-green-600 flex items-center justify-center text-white font-bold"
          style={{ width: `${(monthlyPayment / marketAverage) * 100}%` }}
        >
          Your Price
        </div>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-600">
          Market
        </div>
      </div>
      
      <p className="text-xs text-gray-600 mt-4 text-center">
        Based on 700+ credit, 10k mi/yr, 36-month lease
      </p>
    </div>
  );
};

export default PaymentTrendSimple;
