import React from 'react';

const DealInsightsMinimal = ({ msrp, discount, finalPrice }) => {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
      <h3 className="font-bold text-xl mb-6">Deal Insights</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <span className="text-gray-700 font-medium">MSRP</span>
          <span className="text-xl font-bold text-gray-900">${msrp?.toLocaleString()}</span>
        </div>
        
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <span className="text-gray-700 font-medium">Discount</span>
          <span className="text-xl font-bold text-green-600">
            ${discount?.toLocaleString()} ({((discount / msrp) * 100).toFixed(1)}%)
          </span>
        </div>
        
        <div className="flex items-center justify-between pt-2">
          <span className="text-gray-900 font-bold text-lg">Final Price</span>
          <span className="text-3xl font-bold text-gray-900">${finalPrice?.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default DealInsightsMinimal;
